import { Server, Socket } from "socket.io";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { Poll } from "../entities/Poll";
import { ApolloServer, BaseContext } from "@apollo/server";
import { GraphQLResponse } from "@apollo/server";
import { getMessagesByChatId, createMessage, createPollWithMessage } from "../queries/message";
import { removeUserVote, removeVotePoll, votePoll } from "../queries/poll";

function getDataFromServerReponse<T extends Record<string, any>, K extends keyof T>(response: GraphQLResponse<T>, queryName: K) {
  //TODO: Deal with errors if there are any
  if (response.body.kind === "single" && !response.body.singleResult.errors) {
    const data = response.body.singleResult.data?.[queryName];
    return data;
  }
}

// /!\ Warning : READ BEFORE ADDING NEW MIDDLEWARE //
// socket.emit() will send information ONLY to the user connected to the socket
// socket.to().emit() will send information to all users connected to the room EXEPT the user sending the data
// io.to().emit() will send information to all users connected the the romm INCLUDING the user sending the data
// ex : - a new message should be shared to all users in the room => io.to().emit()
// - a message history request is only for the user making the request => socket.emit()

export class SocketMiddleWares {
  socket;
  io;
  user;
  chatId?: number;
  server: ApolloServer;
  constructor(socket: Socket, io: Server, apolloServer: ApolloServer<BaseContext>) {
    this.socket = socket;
    this.io = io;
    this.user = (this.socket.request as any).user as User;
    this.server = apolloServer;
  }

  //TODO: Check if user is part of the chatroom;
  joinRoom = (chatId: string) => {
    this.chatId = Number(chatId);
    this.socket.join(chatId);
  };
  leaveRoom = (chatId: string) => {
    this.chatId = undefined;
    this.socket.leave(chatId);
  }

  getMessages = async (options?: { skip?: number; take?: number }) => {
    const response = await this.server.executeOperation<{
      getMessagesByChatId: Message[]
    }>({
      query: getMessagesByChatId,
      variables: {
        chatId: this.chatId,
        skip: options?.skip,
        take: options?.take
      }
    });
    const messages = getDataFromServerReponse(response, 'getMessagesByChatId');
    if (messages) {
      if (!options) {
        this.socket.emit("messages-history", messages.reverse());
      } else {
        this.socket.emit("more-messages-response", messages.reverse());
      }
    }
  };

  createMessage = async ({ content }: { content: string }) => {
    const response = await this.server.executeOperation<{ createMessage: Message }>({
      query: createMessage,
      variables: {
        chatId: this.chatId,
        content
      }
    }, { contextValue: { user: this.user } });
    const newMessage = getDataFromServerReponse(response, 'createMessage');
    this.io.to(String(this.chatId)).emit("new-message", newMessage);
  };

  createPollWithMessage = async (pollData: {
    question: string;
    options: string[];
    allowMultiple: boolean;
  }) => {
    try {
      const response = await this.server.executeOperation<{ createPollWithMessage: Message }>({
        query: createPollWithMessage,
        variables: {
          data: { ...pollData, chatId: this.chatId }
        }
      }, { contextValue: { user: this.user } });
      const messageWithPoll = getDataFromServerReponse(response, "createPollWithMessage");
      this.io.to(String(this.chatId)).emit("new-message", messageWithPoll);
    } catch (error) {
      console.error("Erreur lors de la création du sondage:", error);
    }
  }

  votePoll = async (voteData: { pollId: number; optionId: number }) => {
    try {
      const response = await this.server.executeOperation<{ votePoll: Poll }>({
        query: votePoll,
        variables: {
          pollId: voteData.pollId,
          optionId: voteData.optionId
        }
      });
      const updatedPoll = getDataFromServerReponse(response, 'votePoll');
      if (updatedPoll) {
        this.io.to(String(this.chatId)).emit("poll-updated", {
          pollId: voteData.pollId,
          poll: updatedPoll,
        });
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    }
  }

  removeVotePoll = async (voteData: { pollId: number; optionId: number }) => {
    try {
      const reponse = await this.server.executeOperation<{ removeVotePoll: Boolean }>({
        query: removeVotePoll,
        variables: {
          pollId: voteData.pollId,
          optionId: voteData.optionId
        }
      });
      const hasBeenDeleted = getDataFromServerReponse(reponse, "removeVotePoll");
      if (hasBeenDeleted) {
        this.io.to(String(this.chatId)).emit("poll-updated", hasBeenDeleted);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du vote:", error);
    }
  }

  removeUserVote = async (voteData: { pollId: number }) => {
    try {
      const response = await this.server.executeOperation<{ removeUserVote: Boolean }>({
        query: removeUserVote,
        variables: {
          pollId: voteData.pollId
        }
      });
      const hasBeenDeleted = getDataFromServerReponse(response, 'removeUserVote');
      if (hasBeenDeleted) {
        this.io.to(String(this.chatId)).emit("poll-updated", hasBeenDeleted);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des votes:", error);
    }
  }
}

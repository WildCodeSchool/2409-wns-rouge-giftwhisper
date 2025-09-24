import { Server, Socket } from "socket.io";
import { Message } from "../entities/Message";
import { User } from "../entities/User";
import { Poll } from "../entities/Poll";
import { ApolloServer, BaseContext } from "@apollo/server";
import { GraphQLResponse } from "@apollo/server";
import { getMessagesByChatId, createMessage, createPollWithMessage } from "../queries/message";
import { removeUserVote, removeVotePoll, votePoll } from "../queries/poll";
import { saveLastConnection } from "../queries/chatLastConnection";

function getDataFromServerGQLReponse<T extends Record<string, any>, K extends keyof T>(response: GraphQLResponse<T>, queryName: K) {
  //TODO: Deal with errors if there are any
  if (response.body.kind === "single") {
    const errors = response.body.singleResult.errors;
    console.log(errors);
  }
  if (response.body.kind === "single" && !response.body.singleResult.errors) {
    const data = response.body.singleResult.data?.[queryName];
    return data;
  }
}

// /!\ Warning : READ BEFORE ADDING NEW MIDDLEWARE //
// socket.emit() will send information ONLY to the user connected to the socket
// socket.to().emit() will send information to all users connected to the room EXEPT the user sending the data
// io.to().emit() will send information to all users connected the the room INCLUDING the user sending the data
// ex : - a new message should be shared to all users in the room => io.to().emit()
// - a message history request is only for the user making the request => socket.emit()

export class SocketMiddleWares {
  socket;
  io;
  user;
  groupId: string;
  groupRoomId: string;
  chatId?: string;
  chatRoomId?: string;
  server: ApolloServer;
  constructor(socket: Socket, io: Server, apolloServer: ApolloServer<BaseContext>) {
    this.socket = socket;
    this.io = io;
    this.user = (this.socket.request as any).user as User;
    this.groupId = (this.socket.request as any).groupId as string;
    this.server = apolloServer;
    this.groupRoomId = `group-${this.groupId}`;
    //Automatically join the group room on class creation
    this.socket.join(this.groupRoomId);
  }

  debugging = () => {
    console.log(this.socket.rooms);
  };

  //TODO: Check if user is part of the chatroom;
  joinRoom = (chatId: string) => {
    this.chatId = chatId;
    this.chatRoomId = `chat-${chatId}`;
    this.socket.join(this.chatRoomId);
  };

  leaveRoom = async () => {
    if (this.chatId) {
      //We first store then delete this.chatId in order to execute sync operations before calling the gql api
      //in order to avoid problems with the orders of execution with joinRoom in case of the user switching rooms
      const chatId = this.chatId;
      this.chatId = undefined;
      this.socket.leave(`chat-${chatId}`);
      await this.server.executeOperation<{
        saveLastConnection: boolean
      }>({
        query: saveLastConnection,
        variables: {
          chatId: chatId,
        }
      }, { contextValue: { user: this.user } });
    }
  }

  disconnetSocket = async () => {
    this.socket.leave(this.groupRoomId);
  };

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
    const messages = getDataFromServerGQLReponse(response, 'getMessagesByChatId');
    if (messages) {
      if (!options) {
        this.socket.emit("messages-history", messages.reverse());
      } else {
        this.socket.emit("more-messages-response", messages.reverse());
      }
    }
  };

  createMessage = async ({ content }: { content: string }) => {
    if (!this.chatRoomId) throw new Error("Not chatroom id detected");
    const response = await this.server.executeOperation<{ createMessage: Message }>({
      query: createMessage,
      variables: {
        chatId: this.chatId,
        content
      }
    }, { contextValue: { user: this.user } });
    const newMessage = getDataFromServerGQLReponse(response, 'createMessage');
    this.io.to(this.chatRoomId).emit("new-message", newMessage);
    this.io.to(this.groupRoomId).emit("unread-count", this.chatId);
  };

  createPollWithMessage = async (pollData: {
    question: string;
    options: string[];
    allowMultipleVotes: boolean;
  }) => {
    try {
      if (!this.chatRoomId) throw new Error("Not chatroom id detected");
      const response = await this.server.executeOperation<{ createPollWithMessage: Message }>({
        query: createPollWithMessage,
        variables: {
          data: { ...pollData, chatId: this.chatId }
        }
      }, { contextValue: { user: this.user } });
      const messageWithPoll = getDataFromServerGQLReponse(response, "createPollWithMessage");
      this.io.to(this.chatRoomId).emit("new-message", messageWithPoll);
    } catch (error) {
      console.error("Erreur lors de la création du sondage:", error);
    }
  };

  votePoll = async (voteData: { pollId: number; optionId: number }) => {
    try {
      if (!this.chatRoomId) throw new Error("Not chatroom id detected");
      const response = await this.server.executeOperation<{ votePoll: Poll }>({
        query: votePoll,
        variables: {
          pollId: voteData.pollId,
          optionId: voteData.optionId
        }
      }, { contextValue: { user: this.user } });
      const updatedPoll = getDataFromServerGQLReponse(response, 'votePoll');
      if (updatedPoll) {
        this.io.to(this.chatRoomId).emit("poll-updated", {
          pollId: voteData.pollId,
          poll: updatedPoll,
        });
      }
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    }
  };

  removeVotePoll = async (voteData: { pollId: number; optionId: number }) => {
    try {
      if (!this.chatRoomId) throw new Error("Not chatroom id detected");
      const reponse = await this.server.executeOperation<{ removeVotePoll: Boolean }>({
        query: removeVotePoll,
        variables: {
          pollId: voteData.pollId,
          optionId: voteData.optionId
        }
      }, { contextValue: { user: this.user } });
      const hasBeenDeleted = getDataFromServerGQLReponse(reponse, "removeVotePoll");
      if (hasBeenDeleted) {
        this.io.to(this.chatRoomId).emit("poll-updated", hasBeenDeleted);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du vote:", error);
    }
  };

  removeUserVote = async (voteData: { pollId: number }) => {
    try {
      if (!this.chatRoomId) throw new Error("Not chatroom id detected");
      const response = await this.server.executeOperation<{ removeUserVote: Boolean }>({
        query: removeUserVote,
        variables: {
          pollId: voteData.pollId
        }
      }, { contextValue: { user: this.user } });
      const hasBeenDeleted = getDataFromServerGQLReponse(response, 'removeUserVote');
      if (hasBeenDeleted) {
        this.io.to(this.chatRoomId).emit("poll-updated", hasBeenDeleted);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression des votes:", error);
    }
  };
}

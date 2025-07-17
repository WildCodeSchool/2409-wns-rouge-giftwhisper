//TODO: Update the poll data that is sent back, it's currently missing informations
export const getMessagesByChatId = `#graphql
  query getMessagesByChatId($chatId: ID!, $skip: Int, $take: Int) {
    getMessagesByChatId(chatId: $chatId, skip: $skip, take: $take) {
      id
      content
      createdBy {
        id
        first_name
      }
      createdAt
      messageType
      poll {
        id
      }
      chat {
        id
      }
    }
  }
`;

export const createMessage = `#graphql
  mutation createMessage($chatId: ID!, $content: String!) {
    createMessage(chatId: $chatId, content: $content) {
      id
      content
      createdBy {
        id
        first_name
      }
      createdAt
      messageType
      chat {
        id
      }
    }
  }
`;

export const createPollWithMessage = `#graphql
  mutation createPollWithMessage($data: CreatePollInput!) {
    createPollWithMessage(data: $data) {
      id
      content
      messageType
      createdBy {
        id
      }
      poll {
        id
        question
        isActive
        createdAt
        endDate
        allowMultipleVotes
        createdBy {
          id
          first_name
        }
        chat {
          id
        }
        options {
          id
          text
          votes {
            id
            user {
              id
              first_name
            }
          }
        }
      }
    }
  }
`;
export const saveLastConnection = `#graphql
  mutation saveLastConnection($chatId: ID!) {
    saveLastConnection(chatId: $chatId)
  }
`
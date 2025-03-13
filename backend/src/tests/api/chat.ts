export const mutationCreateChat = `#graphql
  mutation createChat($data: ChatCreateInput!) {
    createChat(data: $data) {
      id
    }
  }
`;

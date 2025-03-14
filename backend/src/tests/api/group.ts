export const queryGroup = `#graphql
  query group($id: ID!) {
    group(id: $id) {
      id
      userGroups {
        user {
          id
          first_name
          last_name
        }
      }
    }
  }
`;

export const mutationCreateGroup = `#graphql
  mutation createGroup($data: GroupCreateInput!) {
    createGroup(data: $data) {
      id
    }
  }
`;

export const mutationUpdateGroup = `#graphql
  mutation updateGroup($id: ID!, $data: GroupUpdateInput!) {
    updateGroup(id: $id, data: $data) {
      id
    }
  }
`;

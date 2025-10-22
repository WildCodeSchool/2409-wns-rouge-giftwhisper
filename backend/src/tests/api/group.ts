export const queryGroup = `#graphql
  query group($id: ID!) {
    group(id: $id) {
      id
      users {
        id
        first_name
        last_name
      }
    }
  }
`;

export const queryGroupAdmin = `#graphql
  query GetGroupDetails($id: ID!) {
    groupDetails(id: $id) {
      id
      name
      end_date
      is_secret_santa
      is_active
      created_by_id
      users {
        id
        first_name
        last_name
        email
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

export const mutationActivateGroup = `#graphql
  mutation activateGroup($id: ID!) {
    activateGroup(id: $id)
  }
`;

export const mutationAddUsersToGroupByEmail = `#graphql
  mutation AddUsersToGroupByEmail($emails: [String!]!, $groupId: ID!) {
    addUsersToGroupByEmail(emails: $emails, groupId: $groupId) {
      id
      users {
        id
        email
      }
    }
  }
`;

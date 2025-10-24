import { gql } from "@apollo/client";

export const GET_GROUP = gql`
  query GetGroup($id: ID!) {
    group(id: $id) {
      id
      name
      end_date
      is_secret_santa
      is_active
      created_by_id
    }
  }
`;

export const GET_GROUP_ADMIN = gql`
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

export const GET_USER_GROUPS = gql`
  query GetUserGroups {
    getUserGroups {
      id
      name
      end_date
      is_secret_santa
      is_active
      created_at
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

export const CREATE_GROUP = gql`
  mutation CreateGroup($data: GroupCreateInput!) {
    createGroup(data: $data) {
      id
      name
      end_date
      is_secret_santa
      created_at
    }
  }
`;

export const UPDATE_GROUP = gql`
  mutation UpdateGroup($data: GroupUpdateInput!, $updateGroupId: ID!) {
    updateGroup(data: $data, id: $updateGroupId) {
      id
      name
      end_date
      is_secret_santa
      created_at
      updated_at
    }
  }
`;

export const ADD_USERS_TO_GROUP = gql`
  mutation AddUsersToGroupByEmail($emails: [String!]!, $groupId: ID!) {
    addUsersToGroupByEmail(emails: $emails, groupId: $groupId) {
      id
      name
      users {
        id
        email
      }
    }
  }
`;

export const REMOVE_USER_FROM_GROUP = gql`
  mutation RemoveUserFromGroup($groupId: ID!, $userId: ID!) {
    removeUserFromGroup(groupId: $groupId, userId: $userId)
  }
`;

export const ACTIVATE_GROUP = gql`
  mutation ActivateGroup($id: ID!) {
    activateGroup(id: $id)
  }
`;

export const DELETE_GROUP = gql`
  mutation DeleteGroup($id: ID!) {
    deleteGroup(id: $id)
  }
`;

import { gql } from "@apollo/client";

export const WHOAMI = gql`
  #graphql
  query whoami {
    whoami {
      id
      first_name
      last_name
      email
      date_of_birth
      is_verified
      last_login
      created_at
      updated_at
    }
  }
`;

export const CREATE_USER = gql`
  mutation CreateUser($data: UserCreateInput!) {
    createUser(data: $data) {
      id
      email
      first_name
      last_name
    }
  }
`;

export const UPDATE_USER = gql`
  mutation UpdateUser($data: UserUpdateInput!) {
    updateUser(data: $data) {
      id
      email
      first_name
      last_name
      date_of_birth
    }
  }
`;

export const DELETE_ACCOUNT = gql`
  mutation DeleteAccount {
    deleteUser
  }
`;

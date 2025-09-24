import { gql } from "@apollo/client";

export const LOGIN = gql`
  mutation Login($data: UserLoginInput!) {
    login(data: $data) {
      id
      email
      first_name
      last_name
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

import { gql } from "@apollo/client";

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($data: InvitationAcceptInput!) {
    acceptInvitation(data: $data)
  }
`;

export const VALIDATE_INVITATION_TOKEN = gql`
  query ValidateInvitationToken($token: String!) {
    validateInvitationToken(token: $token) {
      id
      name
    }
  }
`;
import { gql } from "@apollo/client";

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($data: InvitationAcceptInput!) {
    acceptInvitation(data: $data)
  }
`;

export const VALIDATE_INVITATION_TOKEN = gql`
  query ValidateInvitationToken($token: String!) {
    validateInvitationToken(token: $token) {
      group {
        id
        name
      }
      invitationEmail
    }
  }
`;

export const GET_INVITATIONS_BY_GROUP = gql`
  query GetInvitationsByGroup($groupId: ID!) {
    getInvitationsByGroup(groupId: $groupId) {
      id
      email
      token
      created_at
      group {
        id
        name
      }
    }
  }
`;
import { gql } from "@apollo/client";

export const ACCEPT_INVITATION = gql`
  mutation AcceptInvitation($token: String!) {
    acceptInvitation(token: $token)
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

export const DELETE_INVITATION = gql`
  mutation DeleteInvitation($invitationId: Int!) {
    deleteInvitation(invitationId: $invitationId)
  }
`;

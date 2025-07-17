export const mutationAcceptInvitation = `#graphql
  mutation AcceptInvitation($data: InvitationAcceptInput!) {
    acceptInvitation(data: $data)
  }
`;

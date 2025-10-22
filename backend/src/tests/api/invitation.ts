export const mutationAcceptInvitation = `#graphql
  mutation AcceptInvitation($token: String!) {
    acceptInvitation(token: $token)
  }
`;

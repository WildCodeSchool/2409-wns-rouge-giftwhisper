export const votePoll = `#graphql
  mutation votePoll($pollId: ID!, $optionId: ID!) {
    votePoll(pollId: $pollId, optionId: $optionId) {
      id
      question
      allowMultipleVotes;
      isActive     
      endDate     
      createdBy {
        id
      }
      chat {
        id
      }
      options {
        id
        text
      }
      votes {
        id
        user {
          id
          option {
            id
            text
          }
        }
      }
    }
  }
`;

export const removeVotePoll = `#graphql
  mutation removeVotePoll($pollId: ID!, $optionId: ID!) {
    removeVotePoll(pollId: $pollId, optionId: $optionId)
  }
`;

export const removeUserVote = `#graphql
  mutation removeUserVote($pollId: ID!) {
    removeUserVote(pollId: $pollId)
  }
`;
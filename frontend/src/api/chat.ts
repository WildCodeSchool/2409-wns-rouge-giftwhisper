import { gql } from "@apollo/client";

export const GET_CHAT_BY_GROUP_ID = gql`
  query getChatsByGroup($groupId: ID!) {
    getChatsByGroup(groupId: $groupId) {
      id
      name
      lastMessageDate
    }
  }
`;
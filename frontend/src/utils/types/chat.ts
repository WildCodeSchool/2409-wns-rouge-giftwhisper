export interface Message {
  id?: number;
  content: string;
  createdBy: { first_name: string; id: number };
  messageType?: string;
  poll?: Poll;
}

export interface Poll {
  id: number;
  question: string;
  allowMultipleVotes: boolean;
  isActive: boolean;
  createdBy: { id: number; first_name: string };
  createdAt: string;
  endDate?: string;
  options: PollOptions[];
};

export interface PollOptions {
  id: number;
  text: string;
  votes: { id: number; user: { id: number; first_name: string } }[];
}

export interface Chat {
  id: number;
  name: string;
  messages: number;
  lastMessageDate?: string;
}
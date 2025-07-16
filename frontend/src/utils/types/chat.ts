export interface Message {
  id?: number;
  content: string;
  createdBy: { first_name: string; id: number };
  messageType?: string;
  poll?: {
    id: number;
    question: string;
    options: {
      id: number;
      text: string;
      votes: { id: number; user: { first_name: string; id: number } }[];
    }[];
    allowMultipleVotes: boolean;
    isActive: boolean;
    createdBy: { first_name: string; id: number };
    createdAt: string;
    endDate?: string;
  };
}

export interface Poll {
  id: number;
  question: string;
  allowMultipleVotes: boolean;
  isActive: boolean;
  createdBy: { id: number; first_name: string };
  createdAt: string;
  endDate?: string;
  options: {
    id: number;
    text: string;
    votes: { id: number; user: { id: number; first_name: string } }[];
  }[];
};
import { User } from "./user";

export type UserSignIn = {
  email: string;
  password: string;
}

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  tokenInvitation: string | null;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  login: (userInfo: UserSignIn) => Promise<boolean>;
  logout: () => Promise<boolean | void>;
  handleInvitationToken: (token: string) => void;
  clearInvitationToken: () => void;
};
import { AuthContextType, UserSignIn } from "@/utils/types/auth";
import { User } from "@/utils/types/user";
import { createContext, useCallback, useMemo, useState } from "react";
import { useMutation } from "@apollo/client";
import { LOGIN, LOGOUT } from "@/api/auth";

const AuthContext = createContext<AuthContextType | undefined> (undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [loginMutation] = useMutation(LOGIN);
  const [logoutMutation] = useMutation(LOGOUT);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [tokenInvitation, setTokenInvitation] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const login = useCallback(async (userInfo: UserSignIn) => {
    setIsLoggingIn(true);
    try {
      const response = await loginMutation({
        variables: {
          data: {
            email: userInfo.email,
            password: userInfo.password,
          },
        },
      });

      if (response.data.login) {
        setIsAuthenticated(true);
        setUser(response.data.login);
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, [loginMutation]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await logoutMutation();
      if (response.data.logout) {
        setIsAuthenticated(false);
        setUser(null);
      }
      return response.data.logout;
    } catch (error) {
      return false;
    } finally {
      setIsLoggingOut(false);
    }
  }, [logoutMutation]);

  const handleInvitationToken = (token: string) => {
    setTokenInvitation(token);
  }

  const clearInvitationToken = () => {
    setTokenInvitation(null);
  }

  const contextValue = useMemo(
    () => ({
      user,
      isAuthenticated,
      tokenInvitation,
      login,
      logout,
      handleInvitationToken,
      clearInvitationToken,
      isLoggingIn,
      isLoggingOut,
    }),
    [
      user, 
      isAuthenticated, 
      tokenInvitation, 
      login, 
      logout, 
      handleInvitationToken, 
      clearInvitationToken,
      isLoggingIn,
      isLoggingOut,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
import { AuthContextType, UserSignIn } from "@/utils/types/auth";
import { createContext, useCallback, useMemo, useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { LOGIN, LOGOUT } from "@/api/auth";
import { useCurrentUser } from "@/hooks/currentUser";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const client = useApolloClient(); 
  const [loginMutation] = useMutation(LOGIN);
  const [logoutMutation] = useMutation(LOGOUT);
  const [tokenInvitation, setTokenInvitation] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Utilise whoami pour récupérer l'utilisateur au démarrage
  const { user: currentUser, loading: whoamiLoading } = useCurrentUser();
  const isAuthenticated = !!currentUser;
  const isInitializing = whoamiLoading;

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
        await client.resetStore(); // synchronise currentUser
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    } finally {
      setIsLoggingIn(false);
    }
  }, [loginMutation, client]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const response = await logoutMutation();
      if (response.data.logout) {;
        await client.resetStore(); // purge user
        return true
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
  };

  const clearInvitationToken = () => {
    setTokenInvitation(null);
  };

  const contextValue = useMemo(
    () => ({
      user: currentUser,
      isAuthenticated,
      tokenInvitation,
      login,
      logout,
      handleInvitationToken,
      clearInvitationToken,
      isLoggingIn,
      isLoggingOut,
      isInitializing,
    }),
    [
      currentUser, 
      isAuthenticated, 
      tokenInvitation, 
      login, 
      logout, 
      handleInvitationToken, 
      clearInvitationToken,
      isLoggingIn,
      isLoggingOut,
      isInitializing,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
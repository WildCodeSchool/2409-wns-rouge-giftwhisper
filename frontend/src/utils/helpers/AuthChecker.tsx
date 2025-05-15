import { AuthState } from "../types/auth";
import { FC } from "react";
import { useCurrentUser } from "@/hooks/currentUser";
import { Navigate, Outlet } from "react-router-dom";

type ProtectedRouteProps = {
  authState: AuthState[],
  redirectPath?: string;
}

type CheckAuthProps = ProtectedRouteProps & {
  Component: FC
}

export function ProtectedRoute({ authState, redirectPath = '/' }: ProtectedRouteProps) {
  const { user } = useCurrentUser();
  if (user === undefined) return undefined;
  const isAuthorized =
    (user === null && authState.includes(AuthState.unauthenticated)) ||
    (user && authState.includes(AuthState.authenticated))
  return isAuthorized ? <Outlet /> : <Navigate to={redirectPath} replace />
}

export function checkAuth({ authState, redirectPath = '/', Component }: CheckAuthProps) {
  const { user } = useCurrentUser();
  if (user === undefined) return undefined;
  const isAuthorized =
    (user === null && authState.includes(AuthState.unauthenticated)) ||
    (user && authState.includes(AuthState.authenticated))
  return isAuthorized ? <Component /> : <Navigate to={redirectPath} replace />
}
import { AuthState } from "../types/auth";
import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/hooks/currentUser";
import { FC } from "react";

type ProtectedNestedRoutesProps = {
  authState: AuthState[],
  redirectPath?: string;
}

type ProtectedSingleRouteProps = ProtectedNestedRoutesProps & {
  Component: FC;
}

function useAuthorized(authState: AuthState[]) {
  const { user, loading } = useCurrentUser();
  //TODO: Create a loading component / page
  if (loading) return <p>Loading ...</p>;
  const isAuthorized =
    (user === null && authState.includes(AuthState.unauthenticated)) ||
    (user && authState.includes(AuthState.authenticated))
  return isAuthorized;
}

export function ProtectedNestedRoutes({ authState, redirectPath = '/' }: ProtectedNestedRoutesProps) {
  const isAuthorized = useAuthorized(authState);
  return isAuthorized ? <Outlet /> : <Navigate to={redirectPath} replace />
}

export function ProtectedSingleRoute({ authState, Component, redirectPath = '/', }: ProtectedSingleRouteProps) {
  const isAuthorized = useAuthorized(authState);
  return isAuthorized ? <Component /> : <Navigate to={redirectPath} replace />;
}
import { AuthState } from "../types/auth";
import { useCurrentUser } from "@/hooks/currentUser";
import { FC } from "react";
import { Navigate, Outlet } from "react-router-dom";

type ProtectedRouteProps = {
  authState: AuthState[],
  nestedRoute: boolean;
  redirectPath?: string;
  Component?: FC
}

export function AuthChecker({ authState, redirectPath = '/', nestedRoute, Component }: ProtectedRouteProps) {
  const { user, loading } = useCurrentUser();
  //TODO: Create loading component/page
  if (loading) return null;
  const isAuthorized = (
    (user === null && authState.includes(AuthState.unauthenticated)) ||
    (user && authState.includes(AuthState.authenticated))
  )
  //TODO: Create "you need to be connected page"
  let authorizedRoute;
  if (nestedRoute) {
    authorizedRoute = <Outlet />
  } else {
    if (!Component) throw new Error("You need to provide a component if not using nested checker");
    authorizedRoute = <Component />
  }
  return isAuthorized ? authorizedRoute : <Navigate to={redirectPath} replace />
}
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { PageLayout } from "./components/PageLayout";
import { HomePage } from "./pages/Home";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import ChatWindow from "./pages/ChatWindow";
import Group from "./pages/Group";
import GroupCreation from "./pages/GroupCreation";
import GroupSettings from "./pages/GroupSettings";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
import InvitationHandler from "./components/InvitationHandler";
import { Toaster } from "./components/ui/sonner";
import { MobileChatSelect } from "./utils/helpers/MobileChatSelect";
import { ProtectedNestedRoutes } from "./utils/helpers/AuthChecker";
import { AuthState } from "./utils/types/auth";
import { ResetPassword } from "./pages/ResetPassword";
import { ForgotPassword } from "./pages/ForgotPassword";

const client = new ApolloClient({
  uri: "/api",
  cache: new InMemoryCache(),
  credentials: "same-origin",
});

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Toaster richColors />
        <Routes>
          <Route Component={PageLayout}>
            <Route path="/" Component={HomePage} />
            <Route path="/about" Component={About} />
            <Route path="/sign-in" Component={SignIn} />
            <Route path="/sign-up" Component={SignUp} />
            <Route path="/reset-password" Component={ResetPassword} />
            <Route path="/forgot-password" Component={ForgotPassword} />
            <Route path="/invitation/:token" Component={InvitationHandler} />
            <Route
              Component={() => (
                <ProtectedNestedRoutes authState={[AuthState.authenticated]} />
              )}
            >
              <Route path="/chat-window" Component={ChatWindow} />
              <Route path="/dashboard" Component={Dashboard} />
              <Route path="/profile" Component={Profile} />
              <Route path="/settings" Component={Settings} />
              <Route path="/group" Component={Group} />
              <Route path="/group-creation" Component={GroupCreation} />
              <Route path="/group-settings" Component={GroupSettings} />
              <Route path="/chat-select" Component={MobileChatSelect} />
            </Route>
            <Route path="*" Component={() => <Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;

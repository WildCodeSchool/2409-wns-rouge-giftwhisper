import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { PageLayout } from "./components/PageLayout";
import { HomePage } from "./pages/Home";
import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import ChatLayout from "./pages/ChatLayout";
import Group from "./pages/Group";
import GroupCreation from "./pages/GroupCreation";
import GroupSettings from "./pages/GroupSettings";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SignUp from "./pages/SignUp";
import InvitationHandler from "./components/InvitationHandler";
import { Toaster } from "./components/ui/sonner";
import {
  ProtectedLayout,
  PublicOnlyLayout,
} from "./components/auth/RouteGuard";
import { AuthProvider } from "./components/auth/AuthContext";
import { ResetPassword } from "./pages/ResetPassword";
import { ForgotPassword } from "./pages/ForgotPassword";
import ChatWindow from "./components/chat/ChatWindow";
import Wishlist from "./pages/Wishlist";

const client = new ApolloClient({
  uri: "/api",
  cache: new InMemoryCache(),
  credentials: "same-origin",
});

function App() {
  return (
    <ApolloProvider client={client}>
      <AuthProvider>
        <BrowserRouter>
          <Toaster richColors />
          <Routes>
            <Route Component={PageLayout}>
              <Route path="/" Component={HomePage} />
              <Route path="/about" Component={About} />

              {/* Routes publiques (uniquement accessibles si NON authentifié) */}
              <Route element={<PublicOnlyLayout />}>
                <Route path="/sign-in" Component={SignIn} />
                <Route path="/sign-up" Component={SignUp} />
                <Route path="/reset-password" Component={ResetPassword} />
                <Route path="/forgot-password" Component={ForgotPassword} />
              </Route>

              <Route path="/invitation/:token" Component={InvitationHandler} />

              {/* Routes protégées */}
              <Route element={<ProtectedLayout />}>
                <Route
                  path="/:groupName/:groupId/chat-window"
                  Component={ChatLayout}
                >
                  <Route path=":chatId" Component={ChatWindow} />
                </Route>
                <Route path="/dashboard" Component={Dashboard} />
                <Route path="/profile" Component={Profile} />
                <Route path="/settings" Component={Settings} />
                <Route path="/group" Component={Group} />
                <Route path="/group/:id/settings" Component={GroupSettings} />
                <Route path="/group-creation" Component={GroupCreation} />
                <Route path="/wishlist" Component={Wishlist} />
              </Route>

              <Route path="*" Component={() => <Navigate to="/" />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ApolloProvider>
  );
}

export default App;

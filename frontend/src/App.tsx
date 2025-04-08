import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./App.css";
import { PageLayout } from "./components/Layout";
import { HomePage } from "./pages/Home";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
} from "@apollo/client";
import Dashboard from "./pages/Dashboard";
import SignIn from "./pages/SignIn";
import About from "./pages/About";
import ChatWindow from "./pages/ChatWindow";
import Group from "./pages/Group";
import GroupCreation from "./pages/GroupCreation";
import GroupSettings from "./pages/GroupSettings";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";

const client = new ApolloClient({
  uri: "/api",
  cache: new InMemoryCache(),
  credentials: "same-origin",
});

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Routes>
          <Route Component={PageLayout}>
            <Route path="/" Component={HomePage} />
            <Route path="/sign-in" Component={SignIn} />
            <Route path="/dashboard" Component={Dashboard} />
            <Route path="/about" Component={About} />
            <Route path="/profile" Component={Profile} />
            <Route path="/settings" Component={Settings} />
            <Route path="/group" Component={Group} />
            <Route path="/group-creation" Component={GroupCreation} />
            <Route path="/group-settings" Component={GroupSettings} />
            <Route path="/chat-window" Component={ChatWindow} />
            <Route path="*" Component={() => <Navigate to="/" />} />
            //More routes here 🔥
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;

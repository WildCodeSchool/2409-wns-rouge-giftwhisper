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
import ChatSelect from "./pages/ChatSelect";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";

const client = new ApolloClient({
  uri: "/api",
  cache: new InMemoryCache(),
  credentials: "same-origin",
});

// On veut créer une page qui n'est visible que sur téléphone
function MobileChatSelect() {
  // On prépare la navigation
  const navigate = useNavigate();

  // On prévoit des actions à faire quand la page s'affiche
  useEffect(() => {
    // On crée une fonction qui vérifie la taille de l'écran
    const checkScreenSize = () => {
      // Si la largeur de l'écran est supérieure à 768px, on navigue vers la page de chat
      if (window.innerWidth >= 768) {
        navigate("/chat-window");
      }
    };

    // On vérifie la taille de l'écran
    checkScreenSize();

    // On surveille la taille de la fenêtre à chaque redimensionnement
    window.addEventListener("resize", checkScreenSize);

    // Quand l'utilisateur quitte cette page, on arrête de surveiller la taille de la fenêtre
    return () => window.removeEventListener("resize", checkScreenSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si l'écran est à moins de 768 pixels, on montre la page de sélection de conversation
  // Sinon, on ne montre rien car l'utilisateur a déjà été redirigé vers une autre page
  return window.innerWidth < 768 ? <ChatSelect /> : null;
}

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Toaster richColors />
        <Routes>
          <Route Component={PageLayout}>
            <Route path="/" Component={HomePage} />
            <Route path="/sign-in" Component={SignIn} />
            <Route path="/sign-up" Component={SignUp} />
            <Route path="/dashboard" Component={Dashboard} />
            <Route path="/about" Component={About} />
            <Route path="/profile" Component={Profile} />
            <Route path="/settings" Component={Settings} />
            <Route path="/group" Component={Group} />
            <Route path="/group-creation" Component={GroupCreation} />
            <Route path="/group-settings" Component={GroupSettings} />
            <Route path="/chat-window" Component={ChatWindow} />
            <Route path="/chat-select" Component={MobileChatSelect} />
            <Route path="*" Component={() => <Navigate to="/" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;

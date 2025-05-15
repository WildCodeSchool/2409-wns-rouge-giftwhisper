import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatSelect from "@/pages/ChatSelect";

// On veut créer une page qui n'est visible que sur téléphone
export function MobileChatSelect() {
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
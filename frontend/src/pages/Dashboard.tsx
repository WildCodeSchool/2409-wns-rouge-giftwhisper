import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

// Remplacez cette fonction simulée par votre vraie API
const validateInvitation = async (token: string) => {
  // Simulation d'un appel API
  console.log("Validation du token:", token);
  // Simulons une réponse d'API
  return {
    success: true,
    groupName: "Groupe d'Amis",
    groupId: "123"
  };
};

function Dashboard() {
  const [giftMode, setGiftMode] = useState<"classic" | "secret">("classic");
  const navigate = useNavigate();
  const location = useLocation();
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<{
    groupName: string;
    groupId: string;
  } | null>(null);

  // Vérifions s'il y a une invitation en attente
  useEffect(() => {
    const hasPendingInvitation = new URLSearchParams(location.search).get('invitation') === 'pending';
    
    if (hasPendingInvitation) {
      // On récupère le token d'invitation depuis le localStorage
      const token = localStorage.getItem('invitationToken');
      
      if (token) {
        // Validations du token d'invitation
        validateInvitation(token)
          .then((response) => {
            if (response.success) {
              // Si la validation est réussie, on ouvre la boîte de dialogue
              setInvitationDetails({
                groupName: response.groupName,
                groupId: response.groupId
              });
              setInvitationDialogOpen(true);
            }
          })
          .catch((error) => {
            console.error("Erreur lors de la validation de l'invitation:", error);
          });
      }
      
      // On nettoie l'URL pour supprimer le paramètre d'invitation
      // Cela empêche de retraiter l'invitation lors des rafraîchissements
      navigate('/dashboard', { replace: true });
    }
  }, [location.search, navigate]);

  // Fonction pour accepter l'invitation
  const acceptInvitation = async () => {
    if (!invitationDetails) return;
    
    try {

      // Todo:  On appelle la méthode back pour ajouter le user au groupe en question
      console.log(`Acceptation de l'invitation pour rejoindre le groupe ${invitationDetails.groupId}`);
      
      // Si réussi on supprimer l'invitation de la table des inviations ou on la marque comme utilisée

      // On ferme la dialog
      setInvitationDialogOpen(false);
      
      // On nettoie le token d'invitation
      localStorage.removeItem('invitationToken');
      
      // On redirige vers la page du groupe
      navigate(`/group?id=${invitationDetails.groupId}`);
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error);
    }
  };

  // Fonction pour refuser l'invitation
  const declineInvitation = () => {
    // On ferme la dialog
    setInvitationDialogOpen(false);
    
    // On supprime l'invitation de la table des inviations ou on la marque comme refusée
    
    // On nettoie le token d'invitation
    localStorage.removeItem('invitationToken');
  };

  return (
    <>
      <section className="w-full px-6 md:px-14 lg:px-20 xl:px-16 py-12">
        <div className="flex border-b mb-8">
          {/* Selection of a mode (classic or secret)*/}
          <button
            onClick={() => setGiftMode("classic")}
            className={`mr-6 pb-1 text-lg font-medium cursor-pointer ${
              giftMode === "classic"
                ? "border-b-2 border-[#D36567] text-gray-900"
                : "text-gray-500"
            }`}
          >
            Classique
          </button>
          <button
            onClick={() => setGiftMode("secret")}
            className={`pb-1 text-lg font-medium cursor-pointer ${
              giftMode === "secret"
                ? "border-b-2 border-[#D36567] text-gray-900"
                : "text-gray-500"
            }`}
          >
            Secret
          </button>
        </div>

        {/* If  "classic" mode is selected*/}
        {giftMode === "classic" && (
          <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-12">
            {/* Option + (to create a new group) */}
            <Card className="bg-[#D36567] rounded-xl h-32 flex items-center justify-center cursor-pointer hover:opacity-90">
              <CardContent
                onClick={() => navigate("/group-creation")}
                className="text-white text-5xl font-bold"
              >
                +
              </CardContent>
            </Card>

            {/* Other groups */}
            {[
              {
                title: "Amis",
                color: "from-[#FF8177] via-[#CF556C] to-[#B12A5B]",
                route: "/friends",
              },
              {
                title: "Travail",
                color: "from-[#BAC8E0] to-[#6A85B6]",
                route: "/work",
              },
              {
                title: "Famille",
                color: "from-[#8DDAD5] to-[#00CDAC]",
                route: "/family",
              },
            ].map((card) => (
              <Card
                key={card.title}
                className={`relative bg-gradient-to-br ${card.color} rounded-xl h-32 p-4 text-white flex-col justify-center items-center cursor-pointer hover:opacity-90`}
                onClick={() => navigate(card.route)}
              >
                <Settings className="absolute top-2 right-2 w-5 h-5 opacity-80" />
                <CardContent className="flex-1 text-center text-lg font-semibold mt-8">
                  {card.title}
                </CardContent>
              </Card>
            ))}
          </section>
        )}

        {/* If  "secret" mode is selected*/}
        {giftMode === "secret" && (
          <section className="text-gray-500 text-center mt-10">
            <p>Prochainement un mode "Secret Santa" à venir ! (dans la v12)</p>
          </section>
        )}
      </section>

      {/* Boîte de dialogue d'invitation */}
      <Dialog open={invitationDialogOpen} onOpenChange={setInvitationDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation à rejoindre un groupe</DialogTitle>
            <DialogDescription>
              Vous avez été invité(e) à rejoindre le groupe "{invitationDetails?.groupName}".
              Souhaitez-vous accepter cette invitation ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={declineInvitation}>
              Refuser
            </Button>
            <Button onClick={acceptInvitation}>
              Accepter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Dashboard;

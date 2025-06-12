import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useLazyQuery } from "@apollo/client";
import { toast } from "sonner";
import { ACCEPT_INVITATION, VALIDATE_INVITATION_TOKEN } from "@/api/invitation";
import { useAuth } from "@/hooks/useAuth";
import SecretGroupTab from "@/components/SecretGroupTab";

function Dashboard() {
  const [giftMode, setGiftMode] = useState<"classic" | "secret">("classic");
  const navigate = useNavigate();
  const { tokenInvitation, clearInvitationToken, isAuthenticated, user } = useAuth();
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<{
    groupName: string;
    groupId: string;
    token: string;
  } | null>(null);
  const [validateInvitationToken] = useLazyQuery(VALIDATE_INVITATION_TOKEN);
  const [acceptInvitationMutation] = useMutation(ACCEPT_INVITATION);

  // On check si on a une invitation à un groupe en attente
  useEffect(() => {
    if (tokenInvitation) {
      // Validation du token d'invitation via GraphQL
      validateInvitationToken({
        variables: { token: tokenInvitation },
      })
      .then(response => {
        if (response.data?.validateInvitationToken) {
          const group = response.data.validateInvitationToken;
          setInvitationDetails({
            groupName: group.name,
            groupId: group.id,
            token: tokenInvitation
          });
          setInvitationDialogOpen(true);
        } else {
          toast.error("L'invitation n'est plus valide ou a expiré");
          clearInvitationToken();
        }
      })
      .catch(error => {
        console.error("Erreur lors de la validation de l'invitation:", error);
        toast.error("Erreur lors de la validation de l'invitation");
      });
    }
  }, [tokenInvitation]);


  // Fonction pour accepter l'invitation
  const handleAcceptInvitation = async () => {
    if (!invitationDetails || !isAuthenticated || !user) return;
    
    try {
      const { data } = await acceptInvitationMutation({
        variables: { 
          data: {
            token: invitationDetails.token, 
            userId: parseInt(user.id.toString(), 10)
          }
        }
      });

      if (data?.acceptInvitation) {
        toast.success("Vous avez rejoint le groupe avec succès!");
        
        // On ferme la dialog
        setInvitationDialogOpen(false);
        
        // On nettoie le token d'invitation
        clearInvitationToken();
      } else {
        toast.error("Erreur lors de l'acceptation de l'invitation");
      }
    } catch (error) {
      console.error("Erreur lors de l'acceptation de l'invitation:", error);
      toast.error("Erreur lors de l'acceptation de l'invitation");
    }
  };

  // Fonction pour refuser l'invitation
  const declineInvitation = () => {
    // On ferme la dialog
    setInvitationDialogOpen(false);
    
    // On nettoie le token d'invitation
    clearInvitationToken();
    
    toast.info("Vous avez refusé l'invitation");
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
          <SecretGroupTab />
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
            <Button onClick={handleAcceptInvitation}>
              Accepter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Dashboard;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useLazyQuery } from "@apollo/client";
import { toast } from "sonner";
import { ACCEPT_INVITATION, VALIDATE_INVITATION_TOKEN } from "@/api/invitation";
import { useAuth } from "@/hooks/useAuth";
import SecretGroupTab from "@/components/SecretGroupTab";
import {
  CreateGroupCard,
  HowItWorksSection,
  GroupGrid,
  GroupCardDisplay,
} from "@/components/dashboard";
import { useQuery } from "@apollo/client";
import { GET_USER_GROUPS } from "@/api/group";

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

  const { data, loading, error } = useQuery(GET_USER_GROUPS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  // Palette de couleurs pour les cards de groupes
  const groupColors = [
    "from-[#FF8177] via-[#CF556C] to-[#B12A5B]",
    "from-[#BAC8E0] to-[#6A85B6]",
    "from-[#8DDAD5] to-[#00CDAC]",
    "from-[#F7971E] via-[#FFD200] to-[#F7971E]",
    "from-[#F953C6] to-[#B91D73]",
    "from-[#43CEA2] to-[#185A9D]",
    "from-[#FF6E7F] to-[#BFE9FF]",
    "from-[#C33764] to-[#1D2671]",
  ];

  const classicGroups = data?.getUserGroups?.filter((group: any) => !group.is_secret_santa) || [];
  const secretSantaGroups = data?.getUserGroups?.filter((group: any) => group.is_secret_santa) || [];

  // On trie les groupes classiques : actifs d'abord
  const sortedClassicGroups = [...classicGroups].sort((a, b) => Number(b.is_active) - Number(a.is_active));

  // On check si on a une invitation à un groupe en attente
  useEffect(() => {
    if (tokenInvitation) {
      // Validation du token d'invitation via GraphQL
      validateInvitationToken({
        variables: { token: tokenInvitation },
      })
        .then((response) => {
          if (response.data?.validateInvitationToken) {
            const validationResult = response.data.validateInvitationToken;
            const group = validationResult.group;
            const invitationEmail = validationResult.invitationEmail;

            // VÉRIFICATION DE SÉCURITÉ : On vérifie que l'email de l'utilisateur correspond à l'invitation
            if (user?.email !== invitationEmail) {
              toast.error("Cette invitation ne vous est pas destinée");
              clearInvitationToken();
              return;
            }

            setInvitationDetails({
              groupName: group.name,
              groupId: group.id,
              token: tokenInvitation,
            });
            setInvitationDialogOpen(true);
          } else {
            toast.error("L'invitation n'est plus valide ou a expiré");
            clearInvitationToken();
          }
        })
        .catch((error) => {
          console.error("Erreur lors de la validation de l'invitation :", error);
          toast.error("Erreur lors de la validation de l'invitation");
        });
    }
  }, [tokenInvitation, user?.email]);

  // Fonction pour accepter l'invitation
  const handleAcceptInvitation = async () => {
    if (!invitationDetails || !isAuthenticated || !user) return;

    try {
      const { data } = await acceptInvitationMutation({
        variables: {
          data: {
            token: invitationDetails.token,
            userId: parseInt(user.id.toString(), 10),
          },
        },
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
      console.error("Erreur lors de l'acceptation de l'invitation :", error);
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

  //TODO: Switch id of UUIDs;
  const howItWorksSteps = [
    {
      number: 1,
      title: "Créez un groupe",
      description: "Ajoutez vos amis, famille ou collègues",
    },
    {
      number: 2,
      title: "Partagez vos envies",
      description: "Discutez et partagez vos listes de souhaits",
    },
    {
      number: 3,
      title: "Échangez des cadeaux",
      description: "Organisez vos échanges en toute simplicité",
    },
  ];

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
        {/* Header avec titre de bienvenue */}
        <div className="px-6 md:px-14 lg:px-20 xl:px-16 pt-8 pb-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Bienvenue {user?.first_name ? `${user.first_name}` : ""} ! 🎁
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Organisez vos échanges de cadeaux avec vos proches et découvrez la
              magie des surprises
            </p>
          </div>
        </div>

        <section className="px-6 md:px-14 lg:px-20 xl:px-16 pb-12">
          {/* Navigation entre modes avec animation satisfaisante */}
          <div className="flex justify-center mb-12">
            <div className="relative bg-white rounded-full p-2 shadow-lg border border-gray-200 overflow-hidden">
              {/* Indicateur animé avec effet élastique satisfaisant */}
              <div
                className={`absolute top-2 bottom-2 rounded-full bg-gradient-to-r from-[#D36567] to-[#B12A5B] shadow-lg transition-all duration-700 ease-out transform-gpu ${
                  giftMode === "classic"
                    ? "left-2 w-[calc(50%-4px)]"
                    : "left-[calc(50%)] w-[calc(50%-8px)]"
                }`}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              ></div>

              {/* Boutons avec déplacement fluide */}
              <div className="relative flex">
                <button
                  onClick={() => setGiftMode("classic")}
                  className={`relative z-10 px-8 py-3 cursor-pointer rounded-full text-base font-semibold transition-all duration-500 flex-1 transform ${
                    giftMode === "classic"
                      ? "text-white translate-y-0"
                      : "text-gray-600 hover:text-gray-900 hover:-translate-y-0.5"
                  }`}
                  style={{
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Mode Classique
                </button>
                <button
                  onClick={() => setGiftMode("secret")}
                  className={`relative z-10 px-8 py-3 cursor-pointer rounded-full text-base font-semibold transition-all duration-500 flex-1 transform ${
                    giftMode === "secret"
                      ? "text-white translate-y-0"
                      : "text-gray-600 hover:text-gray-900 hover:-translate-y-0.5"
                  }`}
                  style={{
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Mode Secret
                </button>
              </div>
            </div>
          </div>
          {/* Mode classique avec design amélioré */}
          {giftMode === "classic" && (
            <>
              {loading && <div>Chargement des groupes...</div>}
              {error && <div>Erreur lors du chargement des groupes</div>}
              {classicGroups.length > 0 ? (
                <GroupGrid title="Vos groupes d'échange">
                  <CreateGroupCard
                    onClick={() => navigate("/group-creation")}
                  />
                  <GroupCardDisplay groups={sortedClassicGroups} user={user} groupColors={groupColors} />
                </GroupGrid>
              ) : (
                <HowItWorksSection
                  title="Comment ça marche ?"
                  steps={howItWorksSteps}
                  icon={Users}
                  onCreateGroup={() => navigate("/group-creation")}
                />
              )}
            </>
          )}

          {/* Mode secret */}
          {giftMode === "secret" && (
            <div className="max-w-7xl mx-auto">
              <SecretGroupTab groups={secretSantaGroups} user={user} groupColors={groupColors} />
            </div>
          )}
        </section>
      </div>

      {/* Dialog d'invitation avec style amélioré */}
      <Dialog
        open={invitationDialogOpen}
        onOpenChange={setInvitationDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="w-16 h-16 bg-[#D36567] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold">
              Invitation à rejoindre un groupe
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Vous avez été invité(e) à rejoindre le groupe{" "}
              <span className="font-semibold text-[#D36567]">
                "{invitationDetails?.groupName}"
              </span>
              . Souhaitez-vous accepter cette invitation ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={declineInvitation}
              className="flex-1"
            >
              Refuser
            </Button>
            <Button
              onClick={handleAcceptInvitation}
              className="flex-1 bg-[#D36567] hover:bg-[#B12A5B]"
            >
              Accepter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Dashboard;

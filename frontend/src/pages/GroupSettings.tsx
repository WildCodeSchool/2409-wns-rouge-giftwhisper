import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Plus, Users, Settings } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  REMOVE_USER_FROM_GROUP,
  UPDATE_GROUP,
  ADD_USERS_TO_GROUP,
  ACTIVATE_GROUP,
  GET_GROUP_ADMIN,
  DELETE_GROUP,
} from "@/api/group";
import { DELETE_INVITATION, GET_INVITATIONS_BY_GROUP } from "@/api/invitation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Composant réutilisable pour l'alerte d'activation du groupe
interface GroupActivationAlertProps {
  isSecretSanta: boolean;
  onActivate: () => void;
  className?: string;
  userCount: number;
}

function GroupActivationAlert({
  isSecretSanta,
  onActivate,
  className = "",
  userCount,
}: GroupActivationAlertProps) {
  return (
    <Card className={`border-orange-200 bg-orange-50 p-4 sm:p-6 ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="text-orange-800 text-base sm:text-lg">
          Activer le groupe
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-orange-700 text-sm mb-4">
          Une fois activé, les chats seront générés et le groupe sera
          verrouillé. Assurez-vous que tous les membres sont présents.
        </p>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed cursor-pointer"
              disabled={userCount < 3}
            >
              {userCount < 3 ? (
                <>
                  <span className="hidden sm:inline">
                    Il faut au moins 3 membres (actuellement {userCount})
                  </span>
                  <span className="sm:hidden">Il faut min 3 membres</span>
                </>
              ) : (
                "Activer le groupe"
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Activer le groupe ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action va :
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {isSecretSanta ? (
                    <>
                      <li>
                        Créer les chats de Secret Santa (tirage au sort anonyme)
                      </li>
                      <li>Verrouiller l'ajout de nouveaux membres</li>
                    </>
                  ) : (
                    <li>
                      Créer les chats de groupe pour chaque membre (excluant le
                      membre lui-même)
                    </li>
                  )}
                </ul>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={onActivate}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Activer le groupe
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}

export default function GroupSettings() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error, refetch } = useQuery(GET_GROUP_ADMIN, {
    variables: { id },
  });

  const { data: invitationsData, refetch: refetchInvitations } = useQuery(
    GET_INVITATIONS_BY_GROUP,
    {
      variables: { groupId: id },
    }
  );

  const [removeUserFromGroup] = useMutation(REMOVE_USER_FROM_GROUP);
  const [updateGroup] = useMutation(UPDATE_GROUP);
  const [addUsersToGroup] = useMutation(ADD_USERS_TO_GROUP);
  const [activateGroup] = useMutation(ACTIVATE_GROUP);
  const [deleteGroup] = useMutation(DELETE_GROUP);

  const [groupName, setGroupName] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSecretSanta, setIsSecretSanta] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

  const [deleteInvitation] = useMutation(DELETE_INVITATION);

  // États pour l'ajout de membres
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [memberEmails, setMemberEmails] = useState<string[]>([]);
  const [isAddingMembers, setIsAddingMembers] = useState(false);

  // État pour les onglets
  const [activeTab, setActiveTab] = useState("members");

  // Track if form has been modified
  const [hasChanges, setHasChanges] = useState(false);
  const [originalData, setOriginalData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  // État pour le chargement de l'activation
  const [isActivating, setIsActivating] = useState(false);

  useEffect(() => {
    if (data?.groupDetails) {
      const groupData = {
        name: data.groupDetails.name,
        end_date: data.groupDetails.end_date
          ? new Date(data.groupDetails.end_date)
          : null,
        is_secret_santa: data.groupDetails.is_secret_santa,
        is_active: data.groupDetails.is_active,
      };

      setGroupName(data.groupDetails.name);
      setEndDate(
        data.groupDetails.end_date ? new Date(data.groupDetails.end_date) : null
      );
      setIsSecretSanta(data.groupDetails.is_secret_santa);
      setIsActive(data.groupDetails.is_active);
      setOriginalData(groupData);
    }
  }, [data]);

  // Check for changes
  useEffect(() => {
    if (originalData) {
      const currentData = {
        name: groupName,
        end_date: endDate,
        is_secret_santa: isSecretSanta,
      };

      const hasFormChanges =
        currentData.name !== originalData.name ||
        currentData.end_date?.toISOString() !==
          originalData.end_date?.toISOString() ||
        currentData.is_secret_santa !== originalData.is_secret_santa;

      setHasChanges(hasFormChanges);
    }
  }, [groupName, endDate, isSecretSanta, originalData]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement du groupe</div>;
  if (!data?.groupDetails) return <div>Groupe non trouvé</div>;

  const handleSubmit = async () => {
    try {
      const groupData = {
        name: groupName,
        end_date: endDate,
        is_secret_santa: isSecretSanta,
      };

      // Filtrer les champs undefined pour ne pas les envoyer
      const filteredData = Object.fromEntries(
        Object.entries(groupData).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      );

      await updateGroup({
        variables: {
          updateGroupId: id,
          data: filteredData,
        },
      });

      // Rafraîchir les données du groupe
      await refetch();
      await refetchInvitations();

      toast.success("Modifications enregistrées", {
        description: "Les paramètres ont bien été mis à jour.",
      });

      // Reset changes flag and exit edit mode
      setHasChanges(false);
      setIsEditing(false);
      setOriginalData({
        name: groupName,
        end_date: endDate,
        is_secret_santa: isSecretSanta,
      });
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du groupe:", error);

      // Rollback: remettre les valeurs originales
      if (originalData) {
        setGroupName(originalData.name);
        setEndDate(originalData.end_date);
        setIsSecretSanta(originalData.is_secret_santa);
      }

      // Afficher le message d'erreur
      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        "Une erreur est survenue lors de la mise à jour du groupe";

      toast.error("Erreur lors de la mise à jour", {
        description: errorMessage,
      });
    }
  };

  const handleDeleteInvitation = async (invitationId: number) => {
    try {
      await deleteInvitation({
        variables: { invitationId },
      });
      await refetchInvitations();
      toast.success("Invitation supprimée");
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'invitation:", error);
      const errorMessage =
        error?.graphQLErrors?.[0]?.message ||
        error?.message ||
        "Une erreur est survenue lors de la suppression de l'invitation";
      toast.error("Erreur lors de la suppression", {
        description: errorMessage,
      });
    }
  };

  const handleCancel = () => {
    // Reset to original values
    if (originalData) {
      setGroupName(originalData.name);
      setEndDate(originalData.end_date);
      setIsSecretSanta(originalData.is_secret_santa);
    }
    setHasChanges(false);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const handleActivateGroup = async () => {
    try {
      // Activer l'état de chargement visuel
      setIsActivating(true);

      await activateGroup({
        variables: {
          id: id,
        },
      });

      // Afficher le succès
      // Rafraîchir les données du groupe
      await refetch();
      await refetchInvitations();

      toast.success("Groupe activé", {
        description:
          "Les chats ont été générés et le groupe est maintenant actif.",
        duration: 1000,
      });

      // Rediriger vers le dashboard après un court délai
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 2000);
    } catch (error: any) {
      console.error("Erreur lors de l'activation du groupe:", error);

      // Désactiver l'état de chargement en cas d'erreur
      setIsActivating(false);

      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        "Une erreur est survenue lors de l'activation du groupe";

      toast.error("Erreur lors de l'activation", {
        description: errorMessage,
      });
    }
  };

  const handleDeleteGroup = async () => {
    try {
      await deleteGroup({
        variables: {
          id: id,
        },
      });

      toast.success("Groupe supprimé", {
        description: "Le groupe a été supprimé avec succès.",
      });

      // Rediriger vers le dashboard
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Erreur lors de la suppression du groupe:", error);

      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        "Une erreur est survenue lors de la suppression du groupe";

      toast.error("Erreur lors de la suppression", {
        description: errorMessage,
      });
    }
  };

  const removeMember = async (userId: number) => {
    try {
      await removeUserFromGroup({
        variables: {
          groupId: id,
          userId: userId,
        },
      });

      toast.success("Membre supprimé", {
        description: `${memberToDelete?.first_name} ${memberToDelete?.last_name} a été retiré du groupe.`,
      });

      // Rafraîchir les données du groupe
      await refetch();
      await refetchInvitations();
      setMemberToDelete(null);
    } catch (error: any) {
      console.error("Erreur lors de la suppression du membre:", error);

      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        "Une erreur est survenue lors de la suppression du membre";

      toast.error("Erreur lors de la suppression", {
        description: errorMessage,
      });
    }
  };

  // Fonctions pour l'ajout de membres
  const addEmail = () => {
    if (newMemberEmail && !memberEmails.includes(newMemberEmail)) {
      setMemberEmails([...memberEmails, newMemberEmail]);
      setNewMemberEmail("");
    }
  };

  const removeEmail = (index: number) => {
    setMemberEmails(memberEmails.filter((_, i) => i !== index));
  };

  const handleAddMembers = async () => {
    if (memberEmails.length === 0) {
      toast.error("Veuillez ajouter au moins un email");
      return;
    }

    setIsAddingMembers(true);
    try {
      await addUsersToGroup({
        variables: {
          emails: memberEmails,
          groupId: id,
        },
      });

      // Rafraîchir les données du groupe
      await refetch();
      await refetchInvitations();

      toast.success("Invitations envoyées", {
        description: `Les invitations ont été envoyées à ${
          memberEmails.length
        } membre${memberEmails.length > 1 ? "s" : ""}.`,
      });

      // Reset modal state
      setMemberEmails([]);
      setNewMemberEmail("");
      setIsAddMemberModalOpen(false);
    } catch (error: any) {
      console.error("Erreur lors de l'ajout des membres:", error);

      const errorMessage =
        error.graphQLErrors?.[0]?.message ||
        error.message ||
        "Une erreur est survenue lors de l'envoi des invitations";

      toast.error("Erreur lors de l'envoi des invitations", {
        description: errorMessage,
      });
    } finally {
      setIsAddingMembers(false);
    }
  };

  const handleOpenAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
    setMemberEmails([]);
    setNewMemberEmail("");
  };

  // Fonction pour déterminer si un email a une invitation en attente
  const getMemberStatus = (email: string) => {
    if (!invitationsData?.getInvitationsByGroup) return "member";

    const hasInvitation = invitationsData.getInvitationsByGroup.some(
      (invitation: any) => invitation.email === email
    );

    return hasInvitation ? "pending" : "member";
  };

  // Fonction pour obtenir la date d'invitation
  const getInvitationDate = (email: string) => {
    if (!invitationsData?.getInvitationsByGroup) return null;

    const invitation = invitationsData.getInvitationsByGroup.find(
      (invitation: any) => invitation.email === email
    );

    return invitation ? new Date(invitation.created_at) : null;
  };

  // Affichage du loader pendant l'activation
  if (isActivating) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-6 bg-gray-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-primary">
              Activation du groupe en cours...
            </h2>
            <p className="text-gray-600">
              Génération des chats et configuration du groupe
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col px-4 py-6 bg-gray-50">
      <header className="flex flex-col items-center gap-4 py-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary">
          Paramètres du groupe
        </h1>
        <p className="text-sm sm:text-base text-gray-600 text-center max-w-2xl px-4">
          Configurez les paramètres de votre groupe et gérez les membres
        </p>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 w-full max-w-7xl mx-auto px-4">
        {/* Left Column - Group Settings */}
        <div className="flex-1 space-y-4 sm:space-y-6">
          <Card className="p-4 sm:p-6">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Settings className="w-5 h-5" />
                  Paramètres du groupe
                </CardTitle>
                {!isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStartEditing}
                    className="flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Modifier
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 pt-0">
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Nom du groupe
                </label>
                {isEditing ? (
                  <Input
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Nom du groupe"
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">
                    {groupName || "Non défini"}
                  </p>
                )}
              </div>

              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Date de fin
                </label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={
                      endDate ? endDate.toISOString().substring(0, 10) : ""
                    }
                    onChange={(e) => setEndDate(new Date(e.target.value))}
                    className="w-full"
                  />
                ) : (
                  <p className="text-gray-900 text-base sm:text-lg">
                    {endDate
                      ? endDate.toLocaleDateString("fr-FR")
                      : "Non définie"}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="secret-santa-switch"
                    className="text-base sm:text-lg font-medium text-gray-700 cursor-pointer"
                  >
                    Mode Secret Santa
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer focus:outline-none" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg text-md px-4 py-2 max-w-xs">
                        <p>
                          Les participants sont tirés au sort pour s'offrir un
                          cadeau anonymement.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Switch
                          id="secret-santa-switch"
                          checked={isSecretSanta}
                          onCheckedChange={setIsSecretSanta}
                          disabled={!isEditing || isActive}
                          className="scale-125"
                        />
                      </div>
                    </TooltipTrigger>
                    {isActive && (
                      <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg text-md px-4 py-2 max-w-xs">
                        <p>
                          Impossible de changer de type de groupe après la
                          génération des chats.
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-base sm:text-lg font-medium text-gray-700">
                    État du groupe
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer focus:outline-none" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg text-md px-4 py-2 max-w-xs">
                        <p>Un groupe actif a ses chats générés</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="flex items-center gap-2">
                  {isActive ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-800 rounded-full border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Actif</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Inactif</span>
                    </div>
                  )}
                </div>
              </div>

              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="flex-1"
                    disabled={!hasChanges}
                  >
                    Enregistrer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Group Activation Section - Desktop Only */}
          {!isActive && (
            <GroupActivationAlert
              isSecretSanta={isSecretSanta}
              onActivate={handleActivateGroup}
              className="lg:block hidden"
              userCount={data.groupDetails.users.length}
            />
          )}

          {/* Suppression du groupe */}
          <Card className="border-red-200 bg-red-50 p-4 sm:p-6">
            <CardHeader className="pb-4">
              <CardTitle className="text-red-800 text-base sm:text-lg">
                Suppression du groupe
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-red-700 text-sm mb-4">
                La suppression du groupe est irréversible. Tous les chats,
                messages et données associés seront définitivement perdus.
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer le groupe
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Supprimer le groupe ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible et supprimera définitivement
                      :
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Le groupe "{groupName}"</li>
                        <li>Tous les chats et messages associés</li>
                        <li>Toutes les wishlists et cadeaux</li>
                        <li>Toutes les invitations en attente</li>
                      </ul>
                      <p className="mt-3 font-semibold text-red-600">
                        Cette opération ne peut pas être annulée.
                      </p>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteGroup}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Supprimer définitivement
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Members Management */}
        <div className="flex-1">
          <Card className="p-4 sm:p-6">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Users className="w-5 h-5" />
                Membres du groupe
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  {invitationsData?.getInvitationsByGroup?.length > 0 ? (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      <p className="text-sm font-medium text-yellow-600">
                        {invitationsData.getInvitationsByGroup.length}{" "}
                        invitation
                        {invitationsData.getInvitationsByGroup.length > 1
                          ? "s"
                          : ""}{" "}
                        en attente
                      </p>
                    </div>
                  ) : (
                    <p className="text-base text-gray-600">
                      {data.groupDetails.users.length} membre
                      {data.groupDetails.users.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <Button
                          className="flex items-center gap-2"
                          disabled={isActive && isSecretSanta}
                          onClick={handleOpenAddMemberModal}
                        >
                          <Plus className="w-4 h-4" />
                          Ajouter un membre
                        </Button>
                      </div>
                    </TooltipTrigger>
                    {isActive && isSecretSanta && (
                      <TooltipContent className="bg-white text-black border border-gray-200 shadow-lg text-md px-4 py-2 max-w-xs">
                        <p>
                          Impossible d'ajouter de nouveaux membres car le groupe
                          est actif et en mode Secret Santa.
                        </p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="members">
                    Membres ({data.groupDetails.users.length})
                  </TabsTrigger>
                  <TabsTrigger value="invitations">
                    Invitations (
                    {invitationsData?.getInvitationsByGroup?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="members" className="space-y-3 mt-4">
                  {data.groupDetails.users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Aucun membre pour le moment</p>
                      <p className="text-sm">
                        Ajoutez des membres pour commencer
                      </p>
                    </div>
                  ) : (
                    data.groupDetails.users.map((member: any) => {
                      const status = getMemberStatus(member.email);
                      const invitationDate = getInvitationDate(member.email);

                      return (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-gray-900 text-base">
                                {member.first_name} {member.last_name}
                              </p>
                              {status === "pending" && (
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full border border-orange-200">
                                  En attente
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {member.email}
                            </p>
                            {invitationDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                Invitation envoyée le{" "}
                                {invitationDate.toLocaleDateString("fr-FR")}
                              </p>
                            )}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                onClick={() => setMemberToDelete(member)}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Supprimer ce membre ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le membre
                                  suivant sera supprimé du groupe :
                                  <span className="block mt-2 font-medium">
                                    {memberToDelete?.first_name}{" "}
                                    {memberToDelete?.last_name} (
                                    {memberToDelete?.email})
                                  </span>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => {
                                    if (memberToDelete !== null) {
                                      removeMember(memberToDelete.id);
                                      setMemberToDelete(null);
                                    }
                                  }}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Confirmer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      );
                    })
                  )}
                </TabsContent>

                <TabsContent value="invitations" className="space-y-3 mt-4">
                  {!invitationsData?.getInvitationsByGroup ||
                  invitationsData.getInvitationsByGroup.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>Aucune invitation en attente</p>
                      <p className="text-sm">
                        Toutes les invitations ont été acceptées
                      </p>
                    </div>
                  ) : (
                    invitationsData.getInvitationsByGroup.map(
                      (invitation: any) => (
                        <div
                          key={invitation.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 text-base">
                              {invitation.email}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Invitation envoyée le{" "}
                              {new Date(
                                invitation.created_at
                              ).toLocaleDateString("fr-FR")}
                            </p>
                          </div>
                          {/* <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full border border-yellow-200">
                            En attente
                          </span> */}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                aria-label={`Supprimer l'invitation ${invitation.email}`}
                                title="Supprimer l'invitation"
                              >
                                <Trash2 className="w-5 h-5" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Supprimer cette invitation ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. L'invitation
                                  sera supprimée.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    handleDeleteInvitation(
                                      Number(invitation.id)
                                    )
                                  }
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Confirmer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      )
                    )
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Group Activation Section - Mobile Only (at bottom) */}
      {!isActive && (
        <div className="lg:hidden mt-8 sm:mt-8 w-full max-w-7xl mx-auto px-4">
          <GroupActivationAlert
            isSecretSanta={isSecretSanta}
            onActivate={handleActivateGroup}
            userCount={data.groupDetails.users.length}
          />
        </div>
      )}

      {/* Modal pour ajouter des membres */}
      <Dialog
        open={isAddMemberModalOpen}
        onOpenChange={setIsAddMemberModalOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter des membres</DialogTitle>
            <DialogDescription>
              Ajoutez les emails des membres que vous souhaitez inviter au
              groupe.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email du membre</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addEmail()}
                />
                <Button
                  type="button"
                  onClick={addEmail}
                  disabled={!newMemberEmail}
                >
                  Ajouter
                </Button>
              </div>
            </div>

            {memberEmails.length > 0 && (
              <div className="space-y-2">
                <Label>Emails à inviter ({memberEmails.length})</Label>
                <div className="flex flex-col gap-2 max-h-32 overflow-y-auto">
                  {memberEmails.map((email, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-2 bg-muted px-3 py-2 rounded-lg text-sm"
                    >
                      <span className="truncate">{email}</span>
                      <button
                        onClick={() => removeEmail(index)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddMemberModalOpen(false)}
              disabled={isAddingMembers}
            >
              Annuler
            </Button>
            <Button
              onClick={handleAddMembers}
              disabled={memberEmails.length === 0 || isAddingMembers}
            >
              {isAddingMembers
                ? "Envoi en cours..."
                : `Envoyer ${memberEmails.length} invitation${
                    memberEmails.length > 1 ? "s" : ""
                  }`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

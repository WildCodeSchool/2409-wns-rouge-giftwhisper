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
import { Trash2 } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import { GET_GROUP, REMOVE_USER_FROM_GROUP } from "@/api/group";

export default function GroupSettings() {
  const { id } = useParams();
  const { data, loading, error, refetch } = useQuery(GET_GROUP, {
    variables: { id },
  });

  const [removeUserFromGroup] = useMutation(REMOVE_USER_FROM_GROUP);

  const [groupName, setGroupName] = useState("");
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSecretSanta, setIsSecretSanta] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [memberToDelete, setMemberToDelete] = useState<any | null>(null);

  useEffect(() => {
    if (data?.group) {
      setGroupName(data.group.name);
      setEndDate(data.group.end_date ? new Date(data.group.end_date) : null);
      setIsSecretSanta(data.group.is_secret_santa);
      setIsActive(data.group.is_active);
    }
  }, [data]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur lors du chargement du groupe</div>;
  if (!data?.group) return <div>Groupe non trouvé</div>;

  const handleSubmit = () => {
    const groupData = {
      name: groupName,
      end_date: endDate,
      is_secret_santa: isSecretSanta,
      is_active: isActive,
    };

    console.log("Groupe modifié :", groupData);
    toast("Modifications enregistrées", {
      description: "Les paramètres ont bien été mis à jour.",
    });
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
      refetch();
    } catch (error) {
      toast.error("Erreur lors de la suppression du membre");
    }
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <header className="flex flex-col items-center gap-4 py-4">
        <h1 className="text-3xl text-primary">PARAMÈTRES DU GROUPE</h1>
      </header>

      <section className="flex flex-col items-center mt-8 space-y-6 w-full max-w-4xl px-4 mx-auto">
        <div className="w-full max-w-md">
          <label className="block mb-1 font-medium">Nom du groupe</label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nom du groupe"
          />
        </div>

        <div className="w-full max-w-md">
          <label className="block mb-1 font-medium">Date de fin</label>
          <Input
            type="date"
            value={endDate ? endDate.toISOString().substring(0, 10) : ""}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </div>

        <div className="w-full max-w-md flex items-center justify-between">
          <label htmlFor="is-actif-switch" className="cursor-pointer">
            Groupe actif
          </label>
          <Switch id="is-actif-switch" className="cursor-pointer" checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="w-full max-w-md flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="secret-santa-switch" className="cursor-pointer">
              Mode Secret Santa
            </label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="w-4 h-4 text-gray-500 cursor-pointer" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Les participants sont tirés au sort pour s'offrir un cadeau anonymement.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Switch id="secret-santa-switch" className="cursor-pointer" checked={isSecretSanta} onCheckedChange={setIsSecretSanta} />
        </div>

        <div className="w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">Membres du groupe</h2>
          <div className="flex justify-end mb-4">
            <Button className="cursor-pointer" size="sm">
              Ajouter un membre
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full sm:min-w-[500px] md:min-w-[600px] lg:min-w-[700px] border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100 text-center text-sm text-gray-600">
                  <th className="px-1 py-1 border">Prénom</th>
                  <th className="px-1 py-1 border">Nom</th>
                  <th className="px-1 py-1 border">Email</th>
                  <th className="px-1 py-1 border"></th>
                </tr>
              </thead>
              <tbody>
                {data.group.users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-4">
                      Aucun membre pour le moment.
                    </td>
                  </tr>
                )}
                {data.group.users.map((member: any) => (
                  <tr key={member.id} className="text-sm">
                    <td className="px-2 sm:px-4 py-1 sm:py-2 border">{member.first_name}</td>
                    <td className="px-2 sm:px-4 py-1 sm:py-2 border">{member.last_name}</td>
                    <td className="px-2 sm:px-4 py-1 sm:py-2 border">{member.email}</td>
                    <td className="px-2 sm:px-4 py-1 sm:py-2 border text-center flex justify-center items-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="cursor-pointer justify-center"
                            variant="outline"
                            size="sm"
                            onClick={() => setMemberToDelete(member)}
                          >
                            <span className="hidden sm:inline">Supprimer</span>
                            <Trash2 className="sm:hidden w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce membre ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le membre suivant sera supprimé :
                              <span className="block mt-2 font-medium">
                                {memberToDelete?.first_name} {memberToDelete?.last_name} ({memberToDelete?.email})
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer normal-case">Annuler</AlertDialogCancel>
                            <AlertDialogAction 
                              className="cursor-pointer"
                              onClick={() => {
                                if (memberToDelete !== null) {
                                  removeMember(memberToDelete.id);
                                  setMemberToDelete(null);
                                }
                              }}
                            >
                              Confirmer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Button onClick={handleSubmit} className="px-8 cursor-pointer mb-6">
          Enregistrer
        </Button>
      </section>
    </div>
  );
}

import { useState } from "react";
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
} from "@/components/ui/alert-dialog"

const membersList = [
  { id: 1, firstName: "Murielle", lastName: "Dupont", email: "murielle@gmail.com" },
  { id: 2, firstName: "Axel", lastName: "Dupont", email: "axel@gmail.com" },
  { id: 3, firstName: "Isil", lastName: "Dupont", email: "isil@gmail.com" },
  { id: 4, firstName: "Jeremy", lastName: "Dupont", email: "jeremy@gmail.com" },
  { id: 5, firstName: "Priscilla", lastName: "Dupont", email: "axel@gmail.com" },
  { id: 6, firstName: "Sten", lastName: "Dupont", email: "sten@gmail.com" },
]

export default function GroupSettings() {
  const [groupName, setGroupName] = useState("Pour Jean-Claude");
  const [endDate, setEndDate] = useState(new Date("2025-12-25T00:00:00.545Z"));
  const [isSecretSanta, setIsSecretSanta] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [members, setMembers] = useState(membersList);
  const [memberToDelete, setMemberToDelete] = useState<typeof membersList[0] | null>(null);

  const handleSubmit = () => {
    const groupData = {
      name: groupName,
      end_date: endDate,
      is_secret_santa: isSecretSanta,
      is_active: isActive,
    };

    console.log("Groupe modifié :", groupData);
  };

  const removeMember = (id: number) => {
    setMembers((prev) => prev.filter((member) => member.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col px-4 py-6">
      <header className="flex flex-col items-center gap-4 py-4">
        <h1 className="text-3xl text-primary">PARAMÈTRES DU GROUPE</h1>
      </header>

      <section className="flex flex-col items-center mt-8 space-y-6 w-full max-w-sm mx-auto">
        <div className="w-full">
          <label className="block mb-1 font-medium">Nom du groupe</label>
          <Input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Nom du groupe"
          />
        </div>

        <div className="w-full">
          <label className="block mb-1 font-medium">Date de fin</label>
          <Input
            type="date"
            value={endDate.toISOString().substring(0, 10)}
            onChange={(e) => setEndDate(new Date(e.target.value))}
          />
        </div>

        <div className="w-full flex items-center justify-between">
          <label htmlFor="is-actif-switch" className="cursor-pointer">
            Groupe actif
          </label>
          <Switch id="is-actif-switch" className="cursor-pointer" checked={isActive} onCheckedChange={setIsActive} />
        </div>

        <div className="w-full flex items-center justify-between">
          <label htmlFor="secret-santa-switch" className="cursor-pointer">
            Mode Secret Santa
          </label>
          <Switch id="secret-santa-switch" className="cursor-pointer" checked={isSecretSanta} onCheckedChange={setIsSecretSanta} />
        </div>

        <section className="mt-10 max-w-5xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-center">Membres du groupe</h2>
          <div className="flex justify-end mb-4">
            <Button className="cursor-pointer" size="sm">
              Ajouter un membre
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100 text-left text-sm text-gray-600">
                  <th className="px-4 py-2 border">Prénom</th>
                  <th className="px-4 py-2 border">Nom</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border"></th>
                </tr>
              </thead>
              <tbody>
                {members.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-center text-gray-500 py-4">
                      Aucun membre pour le moment.
                    </td>
                  </tr>
                )}
                {members.map((member) => (
                  <tr key={member.id} className="text-sm">
                    <td className="px-4 py-2 border">{member.firstName}</td>
                    <td className="px-4 py-2 border">{member.lastName}</td>
                    <td className="px-4 py-2 border">{member.email}</td>
                    <td className="px-4 py-2 border text-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            className="cursor-pointer"
                            variant="outline"
                            size="sm"
                            onClick={() => setMemberToDelete(member)}
                          >
                            Supprimer
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer ce membre ?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Cette action est irréversible. Le membre suivant sera supprimé :
                              <div className="mt-2 font-medium">
                                {memberToDelete?.firstName} {memberToDelete?.lastName} ({memberToDelete?.email})
                              </div>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer normal-case">Annuler</AlertDialogCancel>
                            <AlertDialogAction className="cursor-pointer"
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
        </section>

        <Button onClick={handleSubmit} className="px-8 cursor-pointer" size="xl">
          Enregistrer
        </Button>
      </section>
    </div>
  );
}

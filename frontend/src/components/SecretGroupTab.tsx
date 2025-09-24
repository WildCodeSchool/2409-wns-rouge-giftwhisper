import { useNavigate } from "react-router-dom";
import { Gift } from "lucide-react";
import {
  CreateGroupCard,
  HowItWorksSection,
  GroupGrid,
  GroupCardDisplay,
} from "@/components/dashboard";

interface Group {
  id: string;
  name: string;
  end_date?: string;
  is_secret_santa: boolean;
  is_active: boolean;
  created_at: string;
  users: {
    id: string;
    first_name: string;
    last_name: string;
  }[];
}

interface SecretGroupTabProps {
  groups: Group[];
  user: any;
  groupColors: string[];
}

function SecretGroupTab({ groups: secretSantaGroups, user, groupColors }: SecretGroupTabProps) {
  const navigate = useNavigate();

  // Sort Secret Santa groups: active ones first
  const sortedSecretSantaGroups = [...secretSantaGroups].sort((a, b) => Number(b.is_active) - Number(a.is_active));

  const secretSantaSteps = [
    {
      number: 1,
      title: "Créez un groupe",
      description: "Ajoutez vos participants et définissez une date limite",
    },
    {
      number: 2,
      title: "Tirage au sort",
      description: "Chaque participant tire secrètement le nom d'une personne",
    },
    {
      number: 3,
      title: "Surprise !",
      description: "Offrez un cadeau à votre personne mystère",
    },
  ];

  return (
    <>
      {secretSantaGroups.length > 0 ? (
        <GroupGrid title="Vos groupes Secret Santa">
          <CreateGroupCard onClick={() => navigate("/group-creation")} />
          <GroupCardDisplay groups={sortedSecretSantaGroups} user={user} groupColors={groupColors} />
        </GroupGrid>
      ) : (
        <HowItWorksSection
          title="Qu'est-ce qu'un Secret Santa ?"
          steps={secretSantaSteps}
          icon={Gift}
          onCreateGroup={() => navigate("/group-creation")}
        />
      )}
    </>
  );
}

export default SecretGroupTab;

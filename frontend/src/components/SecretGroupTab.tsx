import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Calendar, Gift } from "lucide-react";
import { GET_USER_GROUPS } from "@/api/group";
import { useAuth } from "@/hooks/useAuth";
import {
  CreateGroupCard,
  GroupCard,
  LoadingState,
  ErrorState,
  HowItWorksSection,
  GroupGrid,
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

function SecretGroupTab() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, loading, error } = useQuery(GET_USER_GROUPS, {
    variables: { userId: user?.id },
    skip: !user?.id,
  });

  if (loading) {
    return <LoadingState message="Chargement de vos groupes Secret Santa..." />;
  }

  if (error) {
    return (
      <ErrorState
        message="Erreur lors du chargement de vos groupes Secret Santa"
        icon={Gift}
      />
    );
  }

  const secretSantaGroups =
    data?.getUserGroups?.filter((group: Group) => group.is_secret_santa) || [];

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

          {secretSantaGroups.map((group: Group) => (
            <GroupCard
              key={group.id}
              title={group.name}
              color="from-[#FF6B6B] via-[#FF8E53] to-[#FF6B35]"
              route=""
              id={group.id}
              memberCount={group.users.length}
              onSettingsClick={(e) => {
                e.stopPropagation();
                navigate(`/group/${group.id}/settings`);
              }}
            >
              {/* Informations supplémentaires pour Secret Santa */}
              <div className="text-center space-y-1">
                {group.end_date && (
                  <div className="flex items-center justify-center gap-1 text-xs opacity-90">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(group.end_date).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-center">
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-medium ${
                      group.is_active
                        ? "bg-green-400/30 text-green-100"
                        : "bg-yellow-400/30 text-yellow-100"
                    }`}
                  >
                    {group.is_active ? "Actif" : "En attente"}
                  </span>
                </div>
              </div>
            </GroupCard>
          ))}
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

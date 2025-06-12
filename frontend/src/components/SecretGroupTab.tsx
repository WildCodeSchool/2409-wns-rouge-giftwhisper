import { useQuery } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Settings, Users, Calendar } from "lucide-react";
import { GET_USER_GROUPS } from "@/api/group";
import { useAuth } from "@/hooks/useAuth";

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

  if (loading) return (
    <section className="text-gray-500 text-center mt-10">
      <p>Chargement de vos groupes Secret Santa...</p>
    </section>
  );

  if (error) return (
    <section className="text-gray-500 italic text-center mt-10">
      <p>Aucun groupe Secret Santa trouvé</p>
    </section>
  );

  // Filtrer pour ne garder que les groupes Secret Santa
  const secretSantaGroups = data?.getUserGroups?.filter((group: Group) => group.is_secret_santa) || [];

  if (secretSantaGroups.length === 0) {
    return (
      <section className="text-center mt-10">
        <div className="space-y-4">
          <p className="text-gray-500">Vous n'êtes membre d'aucun groupe Secret Santa pour le moment.</p>
          <section className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-12 justify-center">
            <Card 
              className="bg-[#D36567] rounded-xl h-32 flex items-center justify-center cursor-pointer hover:opacity-90"
              onClick={() => navigate("/group-creation")}
            >
              <CardContent className="text-white text-5xl font-bold">
                +
              </CardContent>
            </Card>
          </section>
          <p className="text-sm text-gray-500">Créer un nouveau groupe Secret Santa</p>
        </div>
      </section>
    );
  }

  return (
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

      {/* Secret Santa Groups */}
      {secretSantaGroups.map((group: Group) => (
        <Card
          key={group.id}
          className="relative bg-gradient-to-br from-[#FF8177] via-[#CF556C] to-[#B12A5B] rounded-xl h-32 p-4 text-white cursor-pointer hover:opacity-90 transition-opacity flex flex-col justify-center items-center"
          onClick={() => navigate(`/group/${group.id}`)}
        >
          <Settings 
            className="absolute top-2 right-2 w-5 h-5 opacity-80 hover:opacity-100 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/group/${group.id}/settings`);
            }}
          />
          
          <CardContent className="text-center p-0">
            <h3 className="text-lg font-semibold mb-1 truncate">{group.name}</h3>
            <div className="text-xs opacity-90 space-y-1">
              <div className="flex items-center justify-center gap-1">
                <Users className="w-3 h-3" />
                <span>{group.users.length} membre{group.users.length > 1 ? 's' : ''}</span>
              </div>
              {group.end_date && (
                <div className="flex items-center justify-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(group.end_date).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-center mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                group.is_active 
                  ? 'bg-green-500 bg-opacity-30' 
                  : 'bg-yellow-500 bg-opacity-30'
              }`}>
                {group.is_active ? 'Actif' : 'En attente'}
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}

export default SecretGroupTab; 
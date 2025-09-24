import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import { Link } from "react-router-dom";

interface GroupCardProps {
  title: string;
  color: string;
  route: string;
  id: number;
  memberCount: number;
  onSettingsClick?: (e: React.MouseEvent) => void;
  settingsRoute?: string;
  children?: React.ReactNode;
}

function GroupCard({
  title,
  color,
  route,
  id,
  memberCount,
  children,
}: GroupCardProps) {
  const cardContent = (
    <Card
      className={`group relative bg-gradient-to-br ${color} rounded-2xl h-48 flex flex-col cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-0 overflow-hidden`}
    >

      <CardContent className="flex flex-col items-center justify-center text-white p-6 h-full">
        {/* Compteur du nombre de membres amélioré */}
        <div className="relative w-20 h-20 mb-4">
          {/* Cercle principal avec gradient */}
          <div className="w-full h-full bg-gradient-to-br from-white/30 to-white/10 rounded-full flex items-center justify-center group-hover:from-white/40 group-hover:to-white/20 transition-all duration-300 border border-white/20 backdrop-blur-sm shadow-lg">
            <div className="flex items-center gap-2 px-2">
              <Users className="w-5 h-5 text-white/90" />
              <div className="text-2xl font-semibold text-white drop-shadow-sm">
                {memberCount}
              </div>
            </div>
          </div>
          {/* Anneau de progression décoratif */}
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent bg-gradient-to-r from-white/20 via-transparent to-white/20 group-hover:from-white/30 group-hover:to-white/30 transition-all duration-500"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.2) ${
                (memberCount / 10) * 360
              }deg, transparent ${(memberCount / 10) * 360}deg)`,
            }}
          />
        </div>

        <h3 className="text-xl font-bold mb-2 text-center">{title}</h3>

        {/* Contenu supplémentaire (pour les groupes Secret Santa) */}
        {children}
      </CardContent>

      {/* Effet de brillance au survol */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -skew-x-12 group-hover:animate-pulse"></div>
    </Card>
  );

  // Si on a une route, on wrappe avec Link
  if (route) {
    return <Link to={`/${title}/${id}/chat-window`}>{cardContent}</Link>;
  }

  return cardContent;
}

export default GroupCard;

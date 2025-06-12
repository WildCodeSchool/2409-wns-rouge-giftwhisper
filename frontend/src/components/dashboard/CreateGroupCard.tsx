import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";

interface CreateGroupCardProps {
  onClick: () => void;
}

function CreateGroupCard({ onClick }: CreateGroupCardProps) {
  return (
    <Card
      className="group relative bg-gradient-to-br from-[#D36567] to-[#B12A5B] rounded-2xl h-48 flex flex-col items-center justify-center cursor-pointer hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl border-0"
      onClick={onClick}
    >
      <CardContent className="flex flex-col items-center justify-center text-white p-6">
        <div className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:bg-white/30 transition-all duration-300 border border-white/30 shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/10 to-transparent rounded-full" />
          <div className="absolute top-1 left-1 right-1 h-1/3 bg-gradient-to-b from-white/50 to-transparent rounded-t-full" />
          <Plus className="relative z-10 w-8 h-8 drop-shadow-sm" />
        </div>
        <h3 className="text-lg font-semibold mb-1">Nouveau groupe</h3>
        <p className="text-sm text-white/80 text-center">
          Créez un nouveau groupe d'échange
        </p>
      </CardContent>
    </Card>
  );
}

export default CreateGroupCard;

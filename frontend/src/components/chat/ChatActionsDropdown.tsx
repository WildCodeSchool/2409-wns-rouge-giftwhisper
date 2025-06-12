import { useState } from "react";
import { FaPlus } from "react-icons/fa6";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatActionsDropdownProps {
  onCreatePoll: () => void;
}

export function ChatActionsDropdown({
  onCreatePoll,
}: ChatActionsDropdownProps) {
  const [isButtonRotating, setIsButtonRotating] = useState(false);

  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          setIsButtonRotating(true);
          setTimeout(() => setIsButtonRotating(false), 200);
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`w-8 h-8 rounded-full bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] flex items-center justify-center hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#A18CD1] ${
            isButtonRotating ? "rotate-90" : ""
          }`}
          style={{
            transition: "transform 0.2s ease-out",
          }}
        >
          <FaPlus
            size={18}
            color="white"
            className={`transition-transform duration-200 ${
              isButtonRotating ? "rotate-90" : ""
            }`}
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="top"
        align="start"
        className="w-60 p-2 focus:outline-none"
        sideOffset={8}
      >
        <DropdownMenuItem
          onClick={onCreatePoll}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-50 rounded-lg focus:outline-none focus:bg-[#A18CD1]/10 focus:ring-2 focus:ring-[#A18CD1]/50 transition-all duration-200"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] flex items-center justify-center text-white">
            📊
          </div>
          <div>
            <div className="font-medium text-sm text-slate-900">
              Créer un sondage
            </div>
            <div className="text-xs text-slate-500">
              Demandez l'avis de vos amis
            </div>
          </div>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          disabled
          className="flex items-center gap-3 p-3 opacity-50 rounded-lg focus:outline-none"
        >
          <div className="w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-white">
            🎁
          </div>
          <div>
            <div className="font-medium text-sm text-slate-900">
              Organisez vos cadeaux
            </div>
            <div className="text-xs text-slate-500">Bientôt disponible</div>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

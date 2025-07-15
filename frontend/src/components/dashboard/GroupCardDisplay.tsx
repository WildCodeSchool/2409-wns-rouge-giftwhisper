import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import GroupCard from "./GroupCard";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GroupCardDisplayProps {
  groups: any[];
  user: any;
  groupColors: string[];
}

// Displays a list of group cards with conditional rendering for active and inactive groups
export default function GroupCardDisplay({ groups, user, groupColors }: GroupCardDisplayProps) {
  const navigate = useNavigate();
  const [showTooltip, setShowTooltip] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!Object.values(showTooltip).some(Boolean)) return;
    const handleClickOutside = (event: MouseEvent) => {
      Object.keys(showTooltip).forEach((groupId) => {
        if (showTooltip[groupId]) {
          if (!(event.target as HTMLElement).closest(`#inactive-group-card-${groupId}`)) {
            setShowTooltip((prev) => ({ ...prev, [groupId]: false }));
          }
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showTooltip]);

  return (
    <>
      {groups.map((group, idx) => {
        const isAdmin = group.users?.[0]?.id === user?.id; // ici l'admin est le 1er membre du groupe, à modifier plus tard
        const inactiveClass = !group.is_active ? "opacity-50 bg-gray-200" : "";

        // Active Group: normal card
        if (group.is_active) {
          return (
            <GroupCard
              key={group.id}
              title={group.name}
              color={groupColors[idx % groupColors.length]}
              route={`/group/${group.id}/chat-window`}
              settingsRoute={`/group/${group.id}/settings`}
              id={group.id}
              memberCount={group.users.length}
            />
          );
        } else if (isAdmin) {
          // Inactive group & user is admin: clickable card to settings
          return (
            <div
              key={group.id}
              style={{ cursor: "pointer" }}
              className={inactiveClass}
              onClick={() => navigate(`/group/${group.id}/settings`)}
            >
              <GroupCard
                title={group.name}
                color={groupColors[idx % groupColors.length]}
                route=""
                settingsRoute={`/group/${group.id}/settings`}
                id={group.id}
                memberCount={group.users.length}
              >
                <span className="text-xs px-3 py-1 rounded-full font-medium bg-red-500/80 text-white-100">
                  En attente (admin)
                </span>
              </GroupCard>
            </div>
          );
        } else {
          // Inactive group & user is not admin: grayed card with tooltip
          const cardId = `inactive-group-card-${group.id}`;
          return (
            <TooltipProvider key={group.id}>
              <Tooltip open={!!showTooltip[group.id]}>
                <TooltipTrigger asChild>
                  <div
                    id={cardId}
                    className="opacity-50 bg-gray-200 cursor-not-allowed pointer-events-auto"
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowTooltip(prev => ({ ...prev, [group.id]: !prev[group.id] }));
                    }}
                    tabIndex={0}
                    role="button"
                  >
                    <GroupCard
                      title={group.name}
                      color={groupColors[idx % groupColors.length]}
                      route=""
                      settingsRoute={`/group/${group.id}/settings`}
                      id={parseInt(group.id, 10)}
                      memberCount={group.users.length}
                    >
                      <span className="text-xs px-3 py-1 rounded-full font-medium bg-yellow-500/80 text-yellow-900">
                        En attente
                      </span>
                    </GroupCard>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  Ce groupe est en attente d'acceptation de toutes les invitations du groupe, vous serez notifié lorsqu'il sera actif.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
      })}
    </>
  );
}

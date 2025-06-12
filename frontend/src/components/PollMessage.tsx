import { useState } from "react";

interface PollOption {
  id: number;
  text: string;
  votes: { id: number; user: { id: number; first_name: string } }[];
}

interface Poll {
  id: number;
  question: string;
  allowMultipleVotes: boolean;
  isActive: boolean;
  options: PollOption[];
  createdBy: { id: number; first_name: string };
}

interface PollMessageProps {
  poll: Poll;
  currentUserId: number;
  onVote: (pollId: number, optionId: number) => void;
  onRemoveVote?: (pollId: number, optionId: number) => void;
  onRemoveAllVotes?: (pollId: number) => void;
}

export function PollMessage({
  poll,
  currentUserId,
  onVote,
  onRemoveVote,
  onRemoveAllVotes,
}: PollMessageProps) {
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [isEditingVote, setIsEditingVote] = useState(false);

  const handleOptionToggle = (optionId: number) => {
    if (poll.allowMultipleVotes) {
      setSelectedOptions((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptions([optionId]);
    }
  };

  const handleVote = () => {
    selectedOptions.forEach((optionId) => {
      onVote(poll.id, optionId);
    });
    setSelectedOptions([]);
    setIsEditingVote(false);
  };

  const handleEditVote = () => {
    // Pré-sélectionner les options actuellement votées
    const currentVotes = poll.options
      .filter((option) =>
        option.votes.some((vote) => vote.user.id === currentUserId)
      )
      .map((option) => option.id);

    setSelectedOptions(currentVotes);
    setIsEditingVote(true);
  };

  const handleCancelEdit = () => {
    setSelectedOptions([]);
    setIsEditingVote(false);
  };

  const handleSaveEdit = () => {
    if (onRemoveAllVotes) {
      // Utiliser la méthode optimisée
      onRemoveAllVotes(poll.id);
      setTimeout(() => {
        selectedOptions.forEach((optionId) => {
          onVote(poll.id, optionId);
        });
      }, 100);
    } else {
      // Fallback : supprimer les votes un par un
      poll.options.forEach((option) => {
        const userVote = option.votes.find(
          (vote) => vote.user.id === currentUserId
        );
        if (userVote && onRemoveVote) {
          onRemoveVote(poll.id, option.id);
        }
      });

      selectedOptions.forEach((optionId) => {
        onVote(poll.id, optionId);
      });
    }

    setSelectedOptions([]);
    setIsEditingVote(false);
  };

  const getTotalVotes = () => {
    return poll.options.reduce(
      (total, option) => total + option.votes.length,
      0
    );
  };

  const hasUserVoted = () => {
    return poll.options.some((option) =>
      option.votes.some((vote) => vote.user.id === currentUserId)
    );
  };

  return (
    <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-2xl p-5 max-w-lg mt-3 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] rounded-full flex items-center justify-center shadow-sm">
          <span className="text-white text-lg">📊</span>
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-slate-600">
            Sondage créé par {poll.createdBy.first_name}
          </span>
          {poll.allowMultipleVotes && (
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              <span className="text-xs text-green-600 font-medium">
                Choix multiples
              </span>
            </div>
          )}
        </div>
        {!poll.isActive && (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full">
            Fermé
          </span>
        )}
      </div>

      <h3 className="font-semibold text-lg text-slate-800 mb-4 leading-6">
        {poll.question}
      </h3>

      <div className="space-y-3 mb-5">
        {poll.options.map((option) => {
          const voteCount = option.votes.length;
          const percentage =
            getTotalVotes() > 0 ? (voteCount / getTotalVotes()) * 100 : 0;
          const userVoted = option.votes.some(
            (vote) => vote.user.id === currentUserId
          );
          const isSelected = selectedOptions.includes(option.id);
          const canInteract =
            poll.isActive && (!hasUserVoted() || isEditingVote);

          return (
            <div key={option.id} className="relative">
              <button
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  userVoted && !isEditingVote
                    ? "bg-[#A18CD1]/20 border-[#A18CD1] ring-2 ring-[#A18CD1]/20"
                    : isSelected
                    ? "bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] border-[#A18CD1] ring-2 ring-[#A18CD1]/20 text-white"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                } ${
                  canInteract
                    ? "cursor-pointer hover:scale-[1.02] hover:shadow-md"
                    : "cursor-default"
                }`}
                onClick={() => canInteract && handleOptionToggle(option.id)}
                disabled={!canInteract}
              >
                <div className="flex justify-between items-center mb-2">
                  <span
                    className={`font-medium pr-4 ${
                      isSelected ? "text-white" : "text-slate-800"
                    }`}
                  >
                    {option.text}
                  </span>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {userVoted && !isEditingVote && (
                      <div className="w-2 h-2 bg-[#A18CD1] rounded-full"></div>
                    )}
                    {isSelected && isEditingVote && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                    <div className="text-right">
                      <div
                        className={`text-sm font-semibold ${
                          isSelected ? "text-white" : "text-slate-700"
                        }`}
                      >
                        {voteCount} vote{voteCount !== 1 ? "s" : ""}
                      </div>
                      <div
                        className={`text-xs ${
                          isSelected ? "text-white/80" : "text-slate-500"
                        }`}
                      >
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Barre de progression */}
                <div
                  className={`w-full rounded-full h-2 overflow-hidden ${
                    isSelected ? "bg-white/30" : "bg-slate-300"
                  }`}
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                      userVoted && !isEditingVote
                        ? "bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB]"
                        : isSelected
                        ? "bg-white"
                        : "bg-gradient-to-r from-slate-400 to-slate-500"
                    }`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Boutons d'action */}
      <div className="space-y-2">
        {/* Bouton de vote initial */}
        {!hasUserVoted() && poll.isActive && selectedOptions.length > 0 && (
          <button
            onClick={handleVote}
            className="w-full bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
          >
            ✓ Voter ({selectedOptions.length} option
            {selectedOptions.length > 1 ? "s" : ""})
          </button>
        )}

        {/* Boutons d'édition de vote */}
        {hasUserVoted() && poll.isActive && !isEditingVote && (
          <button
            onClick={handleEditVote}
            className="w-full bg-slate-100 text-slate-700 py-2 px-4 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            ✏️ Modifier mon vote
          </button>
        )}

        {/* Boutons de sauvegarde/annulation pendant l'édition */}
        {isEditingVote && (
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] text-white py-2 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200"
            >
              ✓ Sauvegarder
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 bg-slate-200 text-slate-700 py-2 px-4 rounded-xl font-medium hover:bg-slate-300 transition-all duration-200"
            >
              ✕ Annuler
            </button>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="mt-4 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            {getTotalVotes()} vote{getTotalVotes() !== 1 ? "s" : ""} au total
          </span>
          {isEditingVote && (
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
              Mode édition
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

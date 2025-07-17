import { useState } from "react";
import { FiCheck, FiEdit3, FiX, FiUsers } from "react-icons/fi";
import { IoBarChart } from "react-icons/io5";
import { Poll } from "@/utils/types/chat";

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
      onRemoveAllVotes(poll.id);
      setTimeout(() => {
        selectedOptions.forEach((optionId) => {
          onVote(poll.id, optionId);
        });
      }, 100);
    } else {
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
    <div className="bg-white border border-slate-200 rounded-2xl p-6 w-full shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] rounded-xl flex items-center justify-center shadow-sm">
            <IoBarChart size={18} className="text-white" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">Sondage</div>
            <div className="text-xs text-slate-500">
              par {poll.createdBy.first_name}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {poll.allowMultipleVotes && (
            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-md flex items-center gap-1">
              <FiCheck size={10} />
              Multi-choix
            </span>
          )}
          {!poll.isActive && (
            <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-md">
              Fermé
            </span>
          )}
          {isEditingVote && (
            <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-md flex items-center gap-1">
              <FiEdit3 size={10} />
              Édition
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <h3 className="font-semibold text-lg text-slate-900 mb-6 leading-6">
        {poll.question}
      </h3>

      {/* Options */}
      <div className="space-y-3 mb-6">
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
            <div key={option.id} className="relative group">
              <button
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 relative overflow-hidden ${userVoted && !isEditingVote
                    ? "bg-gradient-to-r from-[#A18CD1]/10 to-[#FBC2EB]/10 border-[#A18CD1]/30 ring-1 ring-[#A18CD1]/20"
                    : isSelected
                      ? "bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] border-[#A18CD1] text-white shadow-lg"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                  } ${canInteract
                    ? "cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                    : "cursor-default"
                  }`}
                onClick={() => canInteract && handleOptionToggle(option.id)}
                disabled={!canInteract}
              >
                {/* Background progress bar */}
                <div
                  className={`absolute inset-0 transition-all duration-700 ease-out ${userVoted && !isEditingVote
                      ? "bg-gradient-to-r from-[#A18CD1]/5 to-[#FBC2EB]/5"
                      : isSelected
                        ? "bg-white/10"
                        : "bg-slate-200/30"
                    }`}
                  style={{ width: `${percentage}%` }}
                />

                <div className="relative flex justify-between items-center">
                  <div className="flex items-center gap-3 flex-1">
                    {/* Checkbox/Radio indicator */}
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${userVoted && !isEditingVote
                          ? "border-[#A18CD1] bg-[#A18CD1]"
                          : isSelected
                            ? "border-white bg-white"
                            : "border-slate-300 group-hover:border-slate-400"
                        }`}
                    >
                      {(userVoted && !isEditingVote) || isSelected ? (
                        <FiCheck
                          size={12}
                          className={
                            isSelected ? "text-[#A18CD1]" : "text-white"
                          }
                        />
                      ) : null}
                    </div>

                    <span
                      className={`font-medium flex-1 ${isSelected ? "text-white" : "text-slate-800"
                        }`}
                    >
                      {option.text}
                    </span>
                  </div>

                  <div className="text-right ml-4">
                    <div
                      className={`text-sm font-semibold ${isSelected ? "text-white" : "text-slate-700"
                        }`}
                    >
                      {voteCount}
                    </div>
                    <div
                      className={`text-xs ${isSelected ? "text-white/80" : "text-slate-500"
                        }`}
                    >
                      {percentage.toFixed(0)}%
                    </div>
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Vote initial */}
        {!hasUserVoted() && poll.isActive && selectedOptions.length > 0 && (
          <button
            onClick={handleVote}
            className="w-full bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <FiCheck size={16} />
            Voter ({selectedOptions.length} choix)
          </button>
        )}

        {/* Modifier le vote */}
        {hasUserVoted() && poll.isActive && !isEditingVote && (
          <button
            onClick={handleEditVote}
            className="w-full bg-slate-100 text-slate-700 py-3 px-4 rounded-xl font-medium hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <FiEdit3 size={16} />
            Modifier mon vote
          </button>
        )}

        {/* Boutons d'édition */}
        {isEditingVote && (
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={handleSaveEdit}
              className="flex-1 bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] text-white py-3 px-3 sm:px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiCheck size={16} />
              <span className="truncate">Sauvegarder</span>
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex-1 bg-slate-200 text-slate-700 py-3 px-3 sm:px-4 rounded-xl font-medium hover:bg-slate-300 transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <FiX size={16} />
              <span className="truncate">Annuler</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <FiUsers size={14} />
            <span>
              {getTotalVotes()} vote{getTotalVotes() !== 1 ? "s" : ""}
            </span>
          </div>
          {hasUserVoted() && !isEditingVote && (
            <div className="flex items-center gap-1 text-[#A18CD1] font-medium">
              <div className="w-2 h-2 bg-[#A18CD1] rounded-full"></div>
              <span>Vous avez voté</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

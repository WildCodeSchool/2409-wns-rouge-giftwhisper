import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";

interface CreatePollModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePoll: (
    question: string,
    options: string[],
    allowMultiple: boolean
  ) => void;
}

export function CreatePollModal({
  isOpen,
  onClose,
  onCreatePoll,
}: CreatePollModalProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [allowMultiple, setAllowMultiple] = useState(false);

  if (!isOpen) return null;

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    const validOptions = options.filter((opt) => opt.trim() !== "");
    if (question.trim() && validOptions.length >= 2) {
      onCreatePoll(question.trim(), validOptions, allowMultiple);
      setQuestion("");
      setOptions(["", ""]);
      setAllowMultiple(false);
      onClose();
    }
  };

  const validOptions = options.filter((opt) => opt.trim() !== "");
  const canSubmit = question.trim() && validOptions.length >= 2;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Créer un sondage
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Posez une question à vos collègues
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Question */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              📝 Votre question
            </label>
            <div className="relative">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Exemple: Quel est votre plat préféré ?"
                className="w-full p-4 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-slate-50 hover:bg-white"
                maxLength={100}
              />
              <div className="absolute bottom-2 right-3 text-xs text-slate-400">
                {question.length}/100
              </div>
            </div>
          </div>

          {/* Options */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              📋 Options de réponse
            </label>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <span className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all bg-slate-50 hover:bg-white"
                    maxLength={50}
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => handleRemoveOption(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                      title="Supprimer cette option"
                    >
                      <Minus size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                onClick={handleAddOption}
                className="mt-3 flex items-center gap-2 text-primary hover:text-primary/80 font-medium text-sm hover:bg-primary/10 px-3 py-2 rounded-lg transition-colors"
              >
                <Plus size={16} />
                Ajouter une option ({options.length}/6)
              </button>
            )}
          </div>

          {/* Paramètres avancés */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h3 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              ⚙️ Paramètres du sondage
            </h3>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={allowMultiple}
                onChange={(e) => setAllowMultiple(e.target.checked)}
                className="mt-1 w-4 h-4 text-primary border-2 border-slate-300 rounded focus:ring-primary focus:ring-2"
              />
              <div>
                <span className="text-sm font-medium text-slate-700">
                  Autoriser les choix multiples
                </span>
                <p className="text-xs text-slate-500 mt-1">
                  Les participants pourront sélectionner plusieurs options
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-2xl">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-100 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`flex-1 py-3 px-4 rounded-xl font-semibold transition-all ${
                canSubmit
                  ? "bg-primary text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed"
              }`}
            >
              🚀 Créer le sondage
            </button>
          </div>

          {!canSubmit && (
            <p className="text-xs text-slate-500 mt-2 text-center">
              Ajoutez une question et au moins 2 options
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

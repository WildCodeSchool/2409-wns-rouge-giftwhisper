import { Plus } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  title: string;
  steps: Step[];
  icon?: React.ComponentType<{ className?: string }>;
  onCreateGroup?: () => void;
}

function HowItWorksSection({
  title,
  steps,
  icon: Icon,
  onCreateGroup,
}: HowItWorksSectionProps) {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Titre principal de la section */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Commencez votre aventure
        </h2>
        <p className="text-gray-600">
          Créez votre premier groupe et découvrez la magie des échanges de
          cadeaux
        </p>
      </div>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
        {Icon && <Icon className="w-16 h-16 text-[#D36567] mx-auto mb-6" />}
        <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          {title}
        </h3>

        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {steps.map((step) => (
            <div
              key={step.number}
              className="flex flex-col items-center text-center"
            >
              <div
                className={`w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 shadow-md`}
              >
                {step.number}
              </div>
              <h4 className="font-semibold mb-3 text-gray-900 text-lg">
                {step.title}
              </h4>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bouton de création de groupe */}
        {onCreateGroup && (
          <div className="text-center pt-4 border-t border-gray-100">
            <button
              onClick={onCreateGroup}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#D36567] to-[#B12A5B] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#D36567]/50 focus:ring-offset-2"
            >
              <Plus className="w-5 h-5" />
              Créer mon premier groupe
            </button>
            <p className="text-sm text-gray-500 mt-3">
              C'est gratuit et ça prend moins d'une minute !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HowItWorksSection;

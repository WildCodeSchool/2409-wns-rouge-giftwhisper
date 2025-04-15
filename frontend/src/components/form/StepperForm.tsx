type Step = {
  title: string;
};

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export default function Stepper({ steps, currentStep }: StepperProps) {
  const CIRCLE_WIDTH = 32; // taille d'un rond (w-8)
  const HALF_CIRCLE = CIRCLE_WIDTH / 2;
  const totalSegments = steps.length - 1;

  const progressWidth = `calc(${(currentStep / totalSegments) * 100}% + ${
    currentStep < steps.length - 1 ? HALF_CIRCLE : 0
  }px)`;

  return (
    <div className="relative mb-8">
      {/* Ligne continue */}
      <div className="absolute top-4 left-0 right-0 h-[2px] bg-gray-300 z-0" />

      {/* Remplissage progressif */}
      <div
        className="absolute top-4 left-0 h-[2px] bg-primary z-0 transition-all duration-300"
        style={{
          width: progressWidth,
        }}
      />

      {/* Ronds d'étapes */}
      <div className="flex justify-between items-center relative z-10">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
          ${
            index === currentStep || index < currentStep
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-600"
          }`}
            >
              {index + 1}
            </div>
            <div className="mt-2 text-sm text-center w-max">{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

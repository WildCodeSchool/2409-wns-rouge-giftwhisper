type Step = {
  title: string;
};

interface StepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  maxStepReached: number;
}

export default function Stepper({
  steps,
  currentStep,
  onStepClick,
  maxStepReached,
}: StepperProps) {
  const CIRCLE_WIDTH = 32; // taille d'un rond (w-8)
  const HALF_CIRCLE = CIRCLE_WIDTH / 2;
  const totalSegments = steps.length - 1;

  const progressWidth =
    currentStep === 0
      ? "0px"
      : `calc(${(currentStep / totalSegments) * 100}% - ${HALF_CIRCLE}px)`;

  return (
    <div className="relative mb-8">
      {/* Ligne continue grise */}
      <div
        className="absolute top-4 h-[1px] bg-gray-300 z-0"
        style={{
          left: HALF_CIRCLE,
          right: HALF_CIRCLE,
        }}
      />

      {/* Ronds d'étapes */}
      <div className="flex justify-between items-center relative z-10">
        {steps.map((step, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <button
              type="button"
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition
      ${
        index <= maxStepReached
          ? "cursor-pointer hover:opacity-80"
          : "cursor-default"
      }

      ${
        index === currentStep || index < currentStep
          ? "bg-primary text-white"
          : "bg-gray-200 text-gray-600"
      }
    `}
              onClick={() => {
                if (maxStepReached !== undefined && index <= maxStepReached) {
                  onStepClick?.(index);
                }
              }}
              disabled={maxStepReached !== undefined && index > maxStepReached}
              // désactive les étapes futures
            >
              {index + 1}
            </button>
            <div className="mt-2 text-sm text-center w-max">{step.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

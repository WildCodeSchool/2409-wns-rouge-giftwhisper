interface Step {
  number: number;
  title: string;
  description: string;
}

interface HowItWorksSectionProps {
  title: string;
  steps: Step[];
  icon?: React.ComponentType<{ className?: string }>;
  accentColor?: string;
}

function HowItWorksSection({
  title,
  steps,
  icon: Icon,
  accentColor = "bg-[#D36567]",
}: HowItWorksSectionProps) {
  return (
    <div className="mt-16 text-center">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-4xl mx-auto">
        {Icon && <Icon className="w-16 h-16 text-[#D36567] mx-auto mb-4" />}
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <div className="grid md:grid-cols-3 gap-6 text-gray-600">
          {steps.map((step) => (
            <div key={step.number} className="flex flex-col items-center">
              <div
                className={`w-12 h-12 ${accentColor} rounded-full flex items-center justify-center text-white font-bold text-lg mb-3`}
              >
                {step.number}
              </div>
              <h4 className="font-semibold mb-2">{step.title}</h4>
              <p className="text-sm">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HowItWorksSection;

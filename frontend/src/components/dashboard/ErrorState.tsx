import { Gift } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function ErrorState({
  message = "Une erreur est survenue",
  icon: Icon = Gift,
}: ErrorStateProps) {
  return (
    <div className="text-center mt-10">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md mx-auto">
        <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{message}</p>
      </div>
    </div>
  );
}

export default ErrorState;

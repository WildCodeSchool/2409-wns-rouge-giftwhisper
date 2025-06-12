interface LoadingStateProps {
  message?: string;
}

function LoadingState({ message = "Chargement..." }: LoadingStateProps) {
  return (
    <div className="text-center mt-10">
      <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D36567] mr-3"></div>
        <span className="text-gray-600">{message}</span>
      </div>
    </div>
  );
}

export default LoadingState;

interface LoadMoreButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export function LoadMoreButton({ onClick, isVisible }: LoadMoreButtonProps) {
  if (!isVisible) return null;

  return (
    <button
      onClick={onClick}
      className="py-2 px-4 text-sm text-[#A18CD1] hover:bg-slate-50 border-b border-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#A18CD1]/50 focus:bg-slate-50"
    >
      Charger plus de messages
    </button>
  );
}

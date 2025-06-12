import { IoArrowDownCircle } from "react-icons/io5";

interface ScrollToBottomButtonProps {
  onClick: () => void;
  isVisible: boolean;
}

export function ScrollToBottomButton({
  onClick,
  isVisible,
}: ScrollToBottomButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        absolute bottom-24 left-1/2 -translate-x-1/2 w-10 h-10 
        bg-white/90 backdrop-blur-sm border border-slate-200/60 rounded-full shadow-sm
        flex items-center justify-center transition-all duration-200 
        hover:bg-white hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-[#A18CD1]/50 focus:ring-offset-2
        ${
          isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-2 pointer-events-none"
        }
      `}
    >
      <IoArrowDownCircle size={22} className="text-[#A18CD1]" />
    </button>
  );
}

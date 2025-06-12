import { FaLocationArrow } from "react-icons/fa6";

interface SendButtonProps {
  disabled: boolean;
  isSending: boolean;
}

export function SendButton({ disabled, isSending }: SendButtonProps) {
  return (
    <div className="relative">
      {/* Effet de glow subtil */}
      {isSending && (
        <div className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] blur-sm animate-pulse opacity-60"></div>
      )}

      <button
        type="submit"
        disabled={disabled}
        className={`relative z-10 w-10 h-10 rounded-full bg-gradient-to-r from-[#A18CD1] via-[#CEA7DE] to-[#FBC2EB] flex items-center justify-center pr-0.5 shadow-sm transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#A18CD1]/50 focus:ring-offset-2 ${
          !isSending ? "hover:scale-105 hover:shadow-md" : ""
        } ${isSending ? "scale-110 shadow-lg" : ""}`}
      >
        <div className="relative flex items-center justify-center overflow-hidden">
          {/* Icône qui slide vers la droite */}
          <FaLocationArrow
            color="white"
            size={18}
            className={`drop-shadow-sm transition-all duration-300 ease-out ${
              isSending
                ? "translate-x-12 opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          />

          {/* Icône de check qui slide depuis la gauche */}
          <div
            className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ease-out ${
              isSending
                ? "translate-x-0 opacity-100"
                : "-translate-x-12 opacity-0"
            }`}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            >
              <polyline points="20,6 9,17 4,12"></polyline>
            </svg>
          </div>
        </div>
      </button>
    </div>
  );
}

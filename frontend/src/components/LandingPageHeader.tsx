import { Link } from "react-router-dom";

export function LandingPageHeader() {
    return (
        <div className="flex w-full items-center justify-center md:justify-between">
            <Link
                to="/"
                className="flex items-center gap-2 hover:text-primary transition-colors"
            >
                <img src="/giftwhisper-logo.svg" alt="Logo" className="w-[65.72px] h-[69.69px]" />
                <span className="text-[#FFFBFF] text-4xl">Giftwhisper</span>
            </Link>

            {/* Boutons d'inscription et de connexion en desktop */}
            <div className="hidden md:flex items-center gap-6">
                <Link
                    to="/sign-in"
                    className="text-[#FFFBFF] text-xl hover:text-[#FFFBFF]/80 transition-colors"
                >
                    Se connecter
                </Link>
                <Link
                    to="/sign-up"
                    className="bg-[#FFFBFF] text-[#D36567] px-5 py-2 rounded-lg text-xl font-medium hover:bg-[#FFFBFF]/90 transition-colors"
                >
                    S'inscrire
                </Link>
            </div>
        </div>
    );
}
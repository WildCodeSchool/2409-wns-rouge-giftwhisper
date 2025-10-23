import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-[#D36567] text-primary-foreground py-6 px-4 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="text-center md:text-left">
          <p className="text-sm">
            © {new Date().getFullYear()} <strong>GiftWhisper</strong>. Tous
            droits réservés.
          </p>
        </div>

        <nav className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
          <Link to="/about" className="hover:underline transition-all">
            À propos
          </Link>
          <Link to="/legal-notice" className="hover:underline transition-all">
            Mentions légales
          </Link>
          <Link to="/privacy-policy" className="hover:underline transition-all">
            Politique de confidentialité
          </Link>
        </nav>
      </div>
    </footer>
  );
}

import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGOUT } from "@/api/auth";
import { toast } from "sonner";

//TODO: AJOUTER LOGIQUE DECONNEXION

function Settings() {
  const navigate = useNavigate();
  const [logout, { loading }] = useMutation(LOGOUT);

  const handleLogout = async () => {
    try {
      const response = await logout();

      if (response.data?.logout) {
        toast.success("Vous êtes déconnecté");
        navigate("/sign-in");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la déconnexion", {
        description: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  return (
    <section className="flex flex-col min-h-screen">
      <header className="p-8 md:px-32 border-b bg-white">
        <h1 className="text-2xl md:text-3xl font-bold max-w-3xl mx-auto">
          Paramètres
        </h1>
      </header>

      <main className="flex-1 bg-gray-50">
        <article className="bg-white max-w-3xl mx-auto p-8 md:p-16 md:my-16 rounded-lg shadow-sm">
          <nav className="flex flex-col items-center gap-6">
            <Link
              to="/profile"
              className="w-full md:w-80 rounded-md bg-primary p-4 font-semibold text-white text-center hover:bg-primary/90 transition-colors"
            >
              Profil
            </Link>

            <hr className="w-full md:w-80 my-4" />

            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full md:w-80 rounded-md border border-destructive p-4 font-semibold text-destructive hover:bg-destructive/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Déconnexion en cours..." : "Déconnexion"}
            </button>
          </nav>
        </article>
      </main>
    </section>
  );
}

export default Settings;

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function About() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-6">
      <header className="flex flex-col items-center gap-4 py-12">
        <h1 className="text-3xl text-primary">À PROPOS DE GIFTWHISPER</h1>
        <p className="text-lg md:text-xl text-muted-foreground text-center">
          Offrir un cadeau, c'est du bonheur… mais l'organisation peut vite
          devenir un casse-tête ! 🎁
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start">
        <section className="flex flex-col gap-6 text-justify w-full max-w-6xl px-8 md:px-16 lg:px-24 xl:px-32">
          <p>
            <strong>GiftWhisper</strong> est une plateforme qui t'aide à organiser
            facilement des cadeaux à plusieurs. Que ce soit pour un anniversaire,
            un départ ou un Secret Santa, finis les galères de messagerie et
            d'organisation !
          </p>
          <p>
            En quelques clics, tu peux créer un groupe, inviter des participants,
            échanger des idées de cadeaux, et même tirer au sort les rôles si tu
            choisis le mode Secret Santa.
          </p>
          <p>
            Notre mission : rendre l'organisation de cadeaux simple, fluide, et
            agréable pour tout le monde.
          </p>
          <p>
            Et bien sûr, <strong>le respect de ta vie privée est une priorité</strong> :
            tes données sont utilisées uniquement pour t'offrir une meilleure
            expérience, jamais revendues (pour l'instant).
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-12">
            <Button variant="outline">
            <Link to={user ? "/dashboard" : "/"}>
                {user ? "Retour au tableau de bord" : "Retour à l'accueil"}
              </Link>
            </Button>
            {!user && (
              <Button variant="primary">
                <Link to="/sign-up">S'inscrire</Link>
              </Button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

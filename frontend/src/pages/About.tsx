import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export default function About() {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex flex-col items-center px-4 py-10 gap-8 md:px-20 xl:px-56 2xl:px-80">
      <header className="w-full text-center md:text-left">
        <h1 className="text-3xl font-bold text-primary mb-4">
          À propos de GiftWhisper
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Offrir un cadeau, c’est du bonheur… mais l’organisation peut vite
          devenir un casse-tête ! 🎁
        </p>
      </header>

      <section className="flex flex-col gap-6 text-justify">
        <p>
          <strong>GiftWhisper</strong> est une plateforme qui t’aide à organiser
          facilement des cadeaux à plusieurs. Que ce soit pour un anniversaire,
          un départ ou un Secret Santa, finis les galères de messagerie et
          d’organisation !
        </p>

        <p>
          En quelques clics, tu peux créer un groupe, inviter des participants,
          échanger des idées de cadeaux, et même tirer au sort les rôles si tu
          choisis le mode Secret Santa.
        </p>

        <p>
          Notre mission : rendre l’organisation de cadeaux simple, fluide, et
          agréable pour tout le monde.
        </p>

        <p>
          Et bien sûr, <strong>le respect de ta vie privée est une priorité</strong> :
          tes données sont utilisées uniquement pour t’offrir une meilleure
          expérience, jamais revendues (pour l'instant).
        </p>
      </section>

      <div className="flex flex-col md:flex-row gap-4 mt-8">

        {!isAuthenticated ? (
          <>
            <Button variant="outline">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
            <Button variant="primary">
              <Link to="/sign-up">S'inscrire</Link>
            </Button>
          </>
        ) : (
          <Button variant="outline">
            <Link to="/dashboard">Retour à l'accueil</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

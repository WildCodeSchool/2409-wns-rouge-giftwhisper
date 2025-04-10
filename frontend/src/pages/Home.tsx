import { StepCard } from "@/components/home/StepCards";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <>
      <header className="flex flex-col items-center gap-4 w-fit px-4 pb-10 bg-custom-gradient-dsktp md:w-full md:flex-row md:px-20 md:pb-0 md:mb-10 xl:px-56 2xl:px-80 md:pt-0">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <h1 className="text-3xl 2xl:text-4xl font-bold pt-10 text-primary md:pt-0 md:text-primary-foreground">
            Envie d'offrir le cadeau parfait sans prise de tête ?
          </h1>
          <p className="text-xl 2xl:text-2xl md:text-primary-foreground">
            <span className="font-bold text-primary md:text-primary-foreground">
              GiftWhisper
            </span>{" "}
            te permet de créer automatiquement des discussions pour organiser
            tes discussions cadeaux !
          </p>
        </div>
        <img
          src="/public/home/gift.svg"
          alt="Gift"
          className="hidden md:block"
        />
      </header>
      <StepCard />
      <section className="flex flex-col items-center gap-4 w-fit mx-auto pb-10">
        <p className="text-xl font-bold pb-4">Alors, rejoignez-nous !</p>
        <div className="flex flex-col items-center gap-4 md:flex-row">
          <Button variant="primary" size="xl">
            <Link to={"/sign-in"}>S'inscrire</Link>
          </Button>
          <div className="flex flex-row items-center gap-2 w-full md:flex-col md:items-center md:justify-center">
            <div className="h-[1px] w-full bg-primary md:h-3 md:w-[1px]" />
            <p className="whitespace-nowrap md:text-sm">ou</p>
            <div className="h-[1px] w-full bg-primary md:h-3 md:w-[1px]" />
          </div>
          <Button variant="outline" size="sm">
            <Link to={"/sign-up"}>Se connecter</Link>
          </Button>
        </div>
      </section>
    </>
  );
}

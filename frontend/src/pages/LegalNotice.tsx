import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function LegalNotice() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="flex flex-col items-center px-4 py-10 gap-8 md:px-20 xl:px-56 2xl:px-80">
      <header className="w-full text-center md:text-left">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Mentions Légales
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Informations légales concernant le site GiftWhisper
        </p>
      </header>

      <section className="flex flex-col gap-6 text-justify w-full">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            1. Éditeur du site
          </h2>
          <p className="mb-2">
            Le site <strong>GiftWhisper</strong> est édité par :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Nom de l'entreprise : GiftWhisper SAS</li>
            <li>Forme juridique : Société par Actions Simplifiée</li>
            <li>Adresse : 42 Avenue des Cadeaux, Pôle Nord</li>
            <li>Email : contact@giftwhisper.com</li>
            <li>Numéro de SIRET : 123 456 789 00012</li>
            <li>Capital social : 10 000 €</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            2. Directeur de la publication
          </h2>
          <p>
            Le directeur de la publication est : Santa Klaus, Président de
            GiftWhisper SAS
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            3. Hébergement
          </h2>
          <p className="mb-2">Le site est hébergé par :</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Nom de l'hébergeur : OVH SAS</li>
            <li>Adresse : 2 rue Kellermann, 59100 Roubaix, France</li>
            <li>Téléphone : +33 9 72 10 10 07</li>
            <li>Site web : www.ovh.com</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            4. Propriété intellectuelle
          </h2>
          <p>
            L'ensemble du contenu de ce site (textes, images, vidéos, logos,
            etc.) est la propriété exclusive de GiftWhisper, sauf mention
            contraire. Toute reproduction, distribution, modification,
            adaptation, retransmission ou publication de ces différents éléments
            est strictement interdite sans l'accord exprès par écrit de
            GiftWhisper.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            5. Données personnelles
          </h2>
          <p>
            Pour en savoir plus sur la collecte et le traitement de vos données
            personnelles, veuillez consulter notre{" "}
            <Link
              to="/privacy-policy"
              className="text-primary font-semibold hover:underline"
            >
              Politique de confidentialité
            </Link>
            .
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            6. Cookies
          </h2>
          <p>
            Le site GiftWhisper utilise des cookies pour améliorer votre
            expérience de navigation. En continuant à utiliser ce site, vous
            acceptez l'utilisation de cookies conformément à notre politique de
            confidentialité.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            7. Responsabilité
          </h2>
          <p>
            GiftWhisper s'efforce d'assurer l'exactitude et la mise à jour des
            informations diffusées sur ce site. Toutefois, GiftWhisper ne peut
            garantir l'exactitude, la précision ou l'exhaustivité des
            informations mises à disposition sur ce site. GiftWhisper ne saurait
            être tenue responsable des erreurs, d'une absence de disponibilité
            des informations ou de la présence de virus sur son site.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            8. Loi applicable
          </h2>
          <p>
            Les présentes mentions légales sont régies par le droit français. En
            cas de litige, les tribunaux français seront seuls compétents.
          </p>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <Button variant="outline">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
        <Button variant="outline">
          <Link to="/privacy-policy">Politique de confidentialité</Link>
        </Button>
      </div>
    </div>
  );
}

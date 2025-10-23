import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

export default function PrivacyPolicy() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return (
    <div className="flex flex-col items-center px-4 py-10 gap-8 md:px-20 xl:px-56 2xl:px-80">
      <header className="w-full text-center md:text-left">
        <h1 className="text-3xl font-bold text-primary mb-4">
          Politique de Confidentialité
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Comment nous protégeons et utilisons vos données personnelles
        </p>
      </header>

      <section className="flex flex-col gap-6 text-justify w-full">
        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            1. Introduction
          </h2>
          <p>
            Chez <strong>GiftWhisper</strong>, nous accordons une grande
            importance à la protection de votre vie privée et de vos données
            personnelles. Cette politique de confidentialité vous informe sur la
            manière dont nous collectons, utilisons, partageons et protégeons
            vos informations lorsque vous utilisez notre plateforme.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            2. Données collectées
          </h2>
          <p className="mb-2">
            Nous collectons différentes catégories de données pour vous offrir
            la meilleure expérience possible :
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Données d'identification :</strong> nom, prénom, adresse
              email, mot de passe (chiffré)
            </li>
            <li>
              <strong>Données d'utilisation :</strong> groupes créés, messages
              échangés, wishlists, participations aux votes
            </li>
            <li>
              <strong>Données techniques :</strong> adresse IP, type de
              navigateur, système d'exploitation, cookies
            </li>
            <li>
              <strong>Données de communication :</strong> messages dans les
              chats, invitations envoyées
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            3. Utilisation des données
          </h2>
          <p className="mb-2">Vos données sont utilisées pour :</p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>Créer et gérer votre compte utilisateur</li>
            <li>Permettre le fonctionnement des groupes et des chats</li>
            <li>Organiser les tirages au sort pour les Secret Santa</li>
            <li>Envoyer des notifications et des invitations</li>
            <li>Améliorer nos services et votre expérience utilisateur</li>
            <li>Assurer la sécurité de la plateforme</li>
            <li>Respecter nos obligations légales</li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            4. Partage des données
          </h2>
          <p>
            Nous ne vendons jamais vos données personnelles à des tiers. Vos
            données peuvent être partagées uniquement dans les cas suivants :
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4 mt-2">
            <li>
              <strong>Avec les membres de vos groupes :</strong> les
              informations que vous partagez dans un groupe sont visibles par
              les autres membres
            </li>
            <li>
              <strong>Avec nos prestataires de services :</strong> hébergement,
              envoi d'emails, etc. (sous contrat de confidentialité strict)
            </li>
            <li>
              <strong>En cas d'obligation légale :</strong> si la loi nous y
              oblige
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            5. Sécurité des données
          </h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et
            organisationnelles pour protéger vos données contre tout accès non
            autorisé, perte, destruction ou altération. Vos mots de passe sont
            chiffrés et nous utilisons des protocoles sécurisés (HTTPS) pour
            toutes les communications.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            6. Conservation des données
          </h2>
          <p>
            Nous conservons vos données personnelles aussi longtemps que votre
            compte est actif ou selon les durées nécessaires pour vous fournir
            nos services. Vous pouvez demander la suppression de votre compte à
            tout moment depuis vos paramètres.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            7. Vos droits (RGPD)
          </h2>
          <p className="mb-2">
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li>
              <strong>Droit d'accès :</strong> consulter vos données
            </li>
            <li>
              <strong>Droit de rectification :</strong> corriger vos données
            </li>
            <li>
              <strong>Droit à l'effacement :</strong> supprimer votre compte
            </li>
            <li>
              <strong>Droit à la portabilité :</strong> récupérer vos données
            </li>
            <li>
              <strong>Droit d'opposition :</strong> vous opposer au traitement
            </li>
            <li>
              <strong>Droit à la limitation :</strong> limiter le traitement
            </li>
          </ul>
          <p className="mt-2">
            Pour exercer ces droits, contactez-nous à :{" "}
            <strong>privacy@giftwhisper.com</strong>
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            8. Cookies
          </h2>
          <p>
            Nous utilisons des cookies pour améliorer votre expérience de
            navigation, mémoriser vos préférences et analyser l'utilisation de
            notre site. Vous pouvez gérer vos préférences de cookies via les
            paramètres de votre navigateur.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            9. Modifications de la politique
          </h2>
          <p>
            Nous nous réservons le droit de modifier cette politique de
            confidentialité à tout moment. Les modifications seront publiées sur
            cette page avec une date de mise à jour. Nous vous encourageons à
            consulter régulièrement cette page.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Dernière mise à jour : 23 octobre 2025
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-primary mb-3">
            10. Contact
          </h2>
          <p>
            Pour toute question concernant cette politique de confidentialité ou
            pour exercer vos droits, vous pouvez nous contacter :
          </p>
          <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
            <li>
              Par email : <strong>privacy@giftwhisper.com</strong>
            </li>
            <li>
              Par courrier : GiftWhisper SAS - Service Protection des Données,
              42 Avenue des Cadeaux, Pôle Nord
            </li>
          </ul>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <Button variant="outline">
          <Link to="/">Retour à l'accueil</Link>
        </Button>
        <Button variant="outline">
          <Link to="/legal-notice">Mentions légales</Link>
        </Button>
      </div>
    </div>
  );
}

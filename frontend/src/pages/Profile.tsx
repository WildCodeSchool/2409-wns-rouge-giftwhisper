import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

//TODO: Récupérer les données du profil depuis l'API
const profile = {
  firstname: "John",
  lastname: "Doe",
  phone: "06 06 06 06 06",
  email: "john.doe@example.com",
};

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(profile);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="flex flex-col min-h-screen">
      <header className="p-8 md:px-32 border-b bg-white">
        <nav className="max-w-3xl mx-auto w-full">
          <Link
            to="/settings"
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={20} />
            <span>Retour aux paramètres</span>
          </Link>
        </nav>
      </header>

      <main className="flex-1 bg-gray-50">
        <article className="bg-white max-w-3xl mx-auto p-8 md:p-16 md:my-16 rounded-lg shadow-sm">
          <header className="flex justify-between md:justify-start items-center gap-4">
            {!isEditing ? (
              <>
                <h1 className="text-4xl font-bold">
                  {profile.firstname} {profile.lastname}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-md bg-primary p-2 text-sm font-semibold text-white md:px-6"
                >
                  Modifier
                </button>
              </>
            ) : (
              <form className="flex flex-col md:flex-row items-center gap-4 w-full">
                <fieldset className="flex flex-col md:flex-row gap-4 w-full">
                  <input
                    type="text"
                    name="firstname"
                    value={formData.firstname}
                    onChange={handleChange}
                    className="rounded-md border p-2 text-4xl font-bold w-full md:w-48 md:border-2 md:border-primary/20 focus:border-primary/50 outline-none"
                    placeholder="Prénom"
                  />
                  <input
                    type="text"
                    name="lastname"
                    value={formData.lastname}
                    onChange={handleChange}
                    className="rounded-md border p-2 text-4xl font-bold w-full md:w-48 md:border-2 md:border-primary/20 focus:border-primary/50 outline-none"
                    placeholder="Nom"
                  />
                </fieldset>
                <button
                  onClick={() => setIsEditing(false)}
                  className="rounded-md bg-green-600 p-2 text-sm font-semibold text-white hidden md:block md:px-6 hover:bg-green-700 transition-colors"
                >
                  Sauvegarder
                </button>
              </form>
            )}
          </header>

          {!isEditing ? (
            <dl className="mt-8 space-y-8">
              <div>
                <dt className="text-sm text-muted-foreground md:text-base">
                  Email
                </dt>
                <dd className="md:text-lg">{profile.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground md:text-base">
                  Téléphone
                </dt>
                <dd className="md:text-lg">{profile.phone}</dd>
              </div>
            </dl>
          ) : (
            <form className="mt-8 space-y-8">
              <fieldset className="space-y-8">
                <label className="block">
                  <span className="text-sm text-muted-foreground md:text-base">
                    Email
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-2 block rounded-md border p-2 text-sm w-full md:w-96 md:border-2 md:border-primary/20 focus:border-primary/50 outline-none md:p-3"
                    placeholder="Email"
                  />
                </label>
                <label className="block">
                  <span className="text-sm text-muted-foreground md:text-base">
                    Téléphone
                  </span>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-2 block rounded-md border p-2 text-sm w-full md:w-96 md:border-2 md:border-primary/20 focus:border-primary/50 outline-none md:p-3"
                    placeholder="Téléphone"
                  />
                </label>
              </fieldset>
              <button
                onClick={() => setIsEditing(false)}
                className="rounded-md bg-green-600 p-2 text-sm font-semibold text-white md:hidden w-full"
              >
                Sauvegarder
              </button>
            </form>
          )}

          <footer className="mt-8 pt-8 border-t">
            <Dialog>
              <DialogTrigger asChild>
                <button className="rounded-md border border-destructive p-2 text-sm font-semibold text-destructive w-full md:w-fit md:px-6 hover:bg-destructive/5 transition-colors">
                  Supprimer mon compte
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Supprimer le compte</DialogTitle>
                  <DialogDescription>
                    Êtes-vous sûr de vouloir supprimer votre compte ? Cette
                    action est irréversible.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex gap-2 pt-4">
                  <button
                    className="rounded-md bg-gray-200 p-2 text-sm font-semibold"
                    onClick={() =>
                      (
                        document.querySelector(
                          'button[type="button"]'
                        ) as HTMLButtonElement
                      )?.click()
                    }
                  >
                    Annuler
                  </button>
                  <button
                    className="rounded-md bg-destructive p-2 text-sm font-semibold text-white"
                    onClick={() => {
                      // TODO: Ajouter la logique de suppression
                      console.log("Compte supprimé");
                    }}
                  >
                    Confirmer la suppression
                  </button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </footer>
        </article>
      </main>
    </section>
  );
}

export default Profile;

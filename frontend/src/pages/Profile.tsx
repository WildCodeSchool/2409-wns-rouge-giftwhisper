import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { WHOAMI, UPDATE_USER } from "@/api/user";
import { useQuery, useMutation } from "@apollo/client";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";

interface FormData {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
}

function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const {
    data: userData,
    loading,
    error,
  } = useQuery(WHOAMI, {
    fetchPolicy: "cache-and-network",
  });
  const [updateUser, { loading: updating }] = useMutation(UPDATE_USER);
  const { handleDeleteAccount, loading: deleteLoading } = useDeleteAccount();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<FormData>({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      date_of_birth: "",
    },
  });

  useEffect(() => {
    if (userData?.whoami) {
      form.reset({
        first_name: userData.whoami.first_name,
        last_name: userData.whoami.last_name,
        email: userData.whoami.email,
        date_of_birth: userData.whoami.date_of_birth.split("T")[0],
      });
    }
  }, [userData?.whoami, form]);

  const handleSave = async (formData: FormData) => {
    try {
      await updateUser({
        variables: {
          data: {
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            date_of_birth: new Date(formData.date_of_birth),
          },
        },
        refetchQueries: [WHOAMI],
      });

      setIsEditing(false);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour du profil");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Erreur de chargement du profil</p>
      </div>
    );
  }

  if (!userData?.whoami) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Utilisateur non connecté</p>
      </div>
    );
  }

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
          {!isEditing ? (
            <>
              <header className="flex justify-between items-center">
                <h1 className="text-4xl font-bold">
                  {userData.whoami.first_name} {userData.whoami.last_name}
                </h1>
                <button
                  onClick={() => setIsEditing(true)}
                  className="rounded-md bg-primary p-2 text-sm font-semibold text-white md:px-6"
                >
                  Modifier
                </button>
              </header>

              <dl className="mt-8 space-y-8">
                <div>
                  <dt className="text-sm text-muted-foreground">Email</dt>
                  <dd>{userData.whoami.email}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted-foreground">
                    Date de naissance
                  </dt>
                  <dd>
                    {new Date(
                      userData.whoami.date_of_birth
                    ).toLocaleDateString()}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSave)}
                className="space-y-6"
              >
                <div className="flex gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de naissance</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={updating}>
                    {updating ? "Sauvegarde..." : "Sauvegarder"}
                  </Button>
                </div>
              </form>
            </Form>
          )}

          <footer className="mt-8 pt-8 border-t">
            <Dialog
              open={isDeleteDialogOpen}
              onOpenChange={setIsDeleteDialogOpen}
            >
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
                    onClick={() => setIsDeleteDialogOpen(false)}
                  >
                    Annuler
                  </button>
                  <button
                    className="rounded-md bg-destructive p-2 text-sm font-semibold text-white"
                    onClick={async () => {
                      await handleDeleteAccount();
                      setIsDeleteDialogOpen(false);
                    }}
                    disabled={deleteLoading}
                  >
                    {deleteLoading
                      ? "Suppression..."
                      : "Confirmer la suppression"}
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

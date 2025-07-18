import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { RESET_PASSWORD } from "../api/resetPassword";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/form/PasswordInput";

export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const form = useForm<{ password: string }>({
    defaultValues: {
      password: "",
    },
  });

  const [resetPassword] = useMutation(RESET_PASSWORD);

  const onSubmit = async (data: { password: string }) => {
    console.log("submitted");
    console.log("token:", token);
    console.log("password:", data.password);

    if (!token) {
      alert("Lien invalide.");
      return;
    }

    try {
      const response = await resetPassword({
        variables: {
          token,
          newPassword: data.password,
        },
      });

      console.log("Apollo response:", response); // ✅ Ajout essentiel

      if (response?.data?.resetPassword) {
        alert("Mot de passe réinitialisé avec succès !");
        navigate("/sign-in");
      } else {
        alert("Une erreur est survenue : la mutation a échoué.");
      }
    } catch (err) {
      console.error("Apollo error (catch):", err);
      alert("Échec de la réinitialisation.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-6">
      <header className="flex flex-col items-center gap-4 py-12">
        <h1 className="text-3xl text-primary">
          RÉINITILISATION DE MOT DE PASSE
        </h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-sm space-y-6"
          >
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nouveau mot de passe</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg"
            >
              Réinitialiser
            </button>
          </form>
        </Form>
      </main>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { useMutation } from "@apollo/client";
import { REQUEST_PASSWORD_RESET } from "../api/resetPassword";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function ForgotPassword() {
  const form = useForm<{ email: string }>({
    defaultValues: {
      email: "",
    },
  });

  const [requestPasswordReset] = useMutation(REQUEST_PASSWORD_RESET);

  const onSubmit = async (data: { email: string }) => {
    try {
      const res = await requestPasswordReset({
        variables: { email: data.email },
      });

      if (res?.data?.requestPasswordReset) {
        alert("Un lien de réinitialisation a été envoyé si l'adresse existe.");
      } else {
        alert("Erreur : la demande n'a pas pu être envoyée.");
      }
    } catch (err) {
      console.error("Erreur Apollo:", err);
      alert("Erreur inattendue lors de la demande.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-6">
      <header className="flex flex-col items-center gap-4 py-12">
        <h1 className="text-3xl text-primary">MOT DE PASSE OUBLIÉ</h1>
      </header>
      <main className="flex-1 flex flex-col items-center justify-start">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-sm space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      required
                      placeholder="votre@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-lg"
            >
              Envoyer le lien de réinitialisation
            </button>
          </form>
        </Form>
      </main>
    </div>
  );
}

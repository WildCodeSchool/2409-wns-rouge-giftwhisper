import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { signInSchema } from "@/schemas/auth.schema";
import type { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PasswordInput } from "@/components/form/PasswordInput";

export default function SignIn() {
  const navigate = useNavigate();
  const { tokenInvitation, login, isLoggingIn } = useAuth();

  // On check si a un token d'invitation dans le sessionStorage
  const hasInvitation = !!tokenInvitation;

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // On affiche un message si on a une invitation en attente
  useEffect(() => {
    if (hasInvitation) {
      toast.info("Connectez-vous pour rejoindre le groupe", {
        id: "invitation-pending",
      });
    }
  }, [hasInvitation]);

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    try {
      const response = await login({
        email: data.email,
        password: data.password,
      });

      if (response) {
        toast.success("Connexion réussie !");
        navigate("/dashboard");
      } else {
        toast.error("Email ou mot de passe incorrect");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la connexion", {
        description: error instanceof Error ? error.message : "Erreur inconnue",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-6">
      <header className="flex flex-col items-center gap-4 py-12">
        <h1 className="text-3xl text-primary">CONNEXION</h1>
        {hasInvitation && (
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-md text-sm">
            Vous avez une invitation en attente. Connectez-vous pour la
            rejoindre.
          </div>
        )}
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
                      placeholder="votre@email.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordInput {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="flex justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex flex-col items-center gap-4 w-fit max-w-sm mx-auto">
              <Button
                type="submit"
                variant="primary"
                size="xl"
                disabled={isLoggingIn}
              >
                {isLoggingIn ? "Connexion..." : "Se connecter"}
              </Button>

              <div className="flex flex-row items-center gap-4 w-full">
                <div className="h-[1px] w-full bg-primary" />
                <p className="whitespace-nowrap text-sm">ou</p>
                <div className="h-[1px] w-full bg-primary" />
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link to="/sign-up">S'inscrire</Link>
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

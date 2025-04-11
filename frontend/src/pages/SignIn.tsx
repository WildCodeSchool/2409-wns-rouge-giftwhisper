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
import { Link } from "react-router-dom";

export default function SignIn() {
  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: any) => {
    console.log("form submitted:", data);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-6">
      {/* Titre */}
      <header className="flex flex-col items-center gap-4 py-12">
        <h1 className="text-3xl text-primary">CONNEXION</h1>
      </header>

      {/* Formulaire */}
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
                    <Input placeholder="votre@email.com" {...field} />
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
                    <Input type="password" placeholder="••••••••" {...field} />
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
              <Button type="submit" variant="primary" size="xl">
                Se connecter
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

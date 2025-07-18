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

interface SignUpFormData {
  firstName: string;
  lastName: string;
  birthdate: string;
  email: string;
  password: string;
}

export default function SignUp() {
  const form = useForm<SignUpFormData>({
    defaultValues: {
      firstName: "",
      lastName: "",
      birthdate: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: SignUpFormData) => {
    console.log("signup submitted:", data);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between px-4 py-6">
      <header className="flex flex-col items-center gap-4 p-8">
        <h1 className="text-3xl text-primary">INSCRIPTION</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-start">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full max-w-sm space-y-6"
          >
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Jean" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Dupont" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="birthdate"
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

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="exemple@email.com"
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
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col items-center gap-4 w-fit max-w-sm mx-auto">
              <Button type="submit" variant="primary" size="xl">
                S'inscrire
              </Button>

              <div className="flex flex-row items-center gap-4 w-full">
                <div className="h-[1px] w-full bg-primary" />
                <p className="whitespace-nowrap text-sm">ou</p>
                <div className="h-[1px] w-full bg-primary" />
              </div>

              <Button variant="outline" size="sm" asChild>
                <Link to="/sign-in">Se connecter</Link>
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}

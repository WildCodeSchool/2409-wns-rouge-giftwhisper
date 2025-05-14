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
import { useMutation } from "@apollo/client";
import { CREATE_USER } from "@/api/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/schemas/auth.schema";
import type { z } from "zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const navigate = useNavigate();
  const [createUser] = useMutation(CREATE_USER);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      birthdate: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignUpFormData) => {
    try {
      const response = await createUser({
        variables: {
          data: {
            email: data.email,
            password: data.password,
            first_name: data.firstName,
            last_name: data.lastName,
            date_of_birth: new Date(data.birthdate),
          },
        },
      });

      if (response.data?.createUser) {
        toast.success("Compte créé avec succès !");
        setTimeout(() => {
          navigate("/sign-in");
        }, 2000);
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes("duplicate")) {
          form.setError("email", {
            message: "Cette adresse email est déjà utilisée",
          });
          toast.error("Cette adresse email est déjà utilisée");
        } else {
          toast.error("Une erreur est survenue lors de la création du compte");
        }
      }
    }
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmer le mot de passe</FormLabel>
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

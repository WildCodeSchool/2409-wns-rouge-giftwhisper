import { WHOAMI } from "@/api/user";
import { User } from "@/utils/types/user";
import { useQuery } from "@apollo/client";

export function useCurrentUser() {
  const { data, loading, refetch } = useQuery<{ whoami: User }>(WHOAMI, {
    fetchPolicy: "network-only", // important pour ne pas lire un user du cache après un logout
    nextFetchPolicy: "cache-first", // optionnel : les requêtes suivantes peuvent réutiliser le cache
    errorPolicy: "ignore", // si la requête échoue (non connecté), on n'affiche pas d'erreur
  });
  return {user: data?.whoami, loading, refetch };
}
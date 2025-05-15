import { WHOAMI } from "@/api/user";
import { User } from "@/utils/types/user";
import { useQuery } from "@apollo/client";

export function useCurrentUser() {
  const { data, loading, refetch } = useQuery<{ whoami: User }>(WHOAMI);
  return {user: data?.whoami, loading, refetch };
}
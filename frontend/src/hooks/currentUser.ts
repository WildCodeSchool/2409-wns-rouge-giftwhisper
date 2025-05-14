import { WHOAMI } from "@/api/user";
import { User } from "@/utils/types/user";
import { useQuery } from "@apollo/client";

export function useCurrentUser() {
  const { data } = useQuery<{ whoami: User }>(WHOAMI);
  return data?.whoami;
}
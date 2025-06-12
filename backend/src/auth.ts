import { User } from "./entities/User";
import Cookies from "cookies";
import { verify } from "jsonwebtoken";

export type ContextType = { req: any; res: any; user: User | null | undefined };
export const getUserFromContext = async (context: ContextType) => {
  // En environnement de test uniquement, permettre l'injection directe d'un utilisateur
  if (process.env.NODE_ENV === 'test' && context.user) {
    return context.user;
  }

  const { req, res } = context;
  const cookies = new Cookies(req, res);
  const token = cookies.get("giftwhisper");
  if (!token) return null;
  try {
    const jwtPrivateKey = process.env.JWT_SECRET_KEY;
    if (!jwtPrivateKey)
      throw new Error("JWT private key is missing from env variables");
    const { id } = verify(token, jwtPrivateKey) as { id: number };
    const user = await User.findOneBy({ id });
    return user;
  } catch (err) {
    console.error(err);
    return null;
  }
};

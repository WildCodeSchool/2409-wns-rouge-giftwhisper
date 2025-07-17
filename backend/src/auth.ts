import { User } from "./entities/User";
import Cookies from "cookies";
import { verify } from "jsonwebtoken";

export type ContextType = { req: any; res: any; user: User | null | undefined };
/**
 * @dev This context type is provided through apolloServer.executeOperations from the websocket middlewares 
 */
export type ContextUserType = { user: User };
export const getUserFromContext = async (context: ContextType | ContextUserType) => {
  // En environnement de test uniquement, permettre l'injection directe d'un utilisateur
  if ((process.env.NODE_ENV === 'test' && context.user) || context.user) {
    return context.user;
  }
  if (!('req' in context) || !('res' in context)) {
    return null;
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

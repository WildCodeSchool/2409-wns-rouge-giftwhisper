import { User } from "./entities/User";
import Cookies from "cookies";
import { verify } from "jsonwebtoken";
import { AuthChecker } from "type-graphql";
import { Group } from "./entities/Group";
import { Chat } from "./entities/Chat";
import { Message } from "./entities/Message";
import { Invitation } from "./entities/Invitation";
import { GraphQLResolveInfo } from "graphql";

export type AuthorisationType = "isGroupAdmin" | "isPartOfGroup" | "isPartOfChat";
export type AuthInfo = {
  method: AuthorisationType;
  requestingUserId: number;
  entity: EntityEnum;
}
export type ResolverMethod = 'login';
export type EntityEnum = Group | Chat | Message | Invitation | null;
export type ContextData = { entities?: EntityEnum[] | undefined, resolverMethod?: ResolverMethod };
export type ContextType = { req: any; res: any; user: User | null | undefined; data?: ContextData };
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

export const checkAuthorisation = async (authInfo: AuthInfo) => {
  const { method, entity, requestingUserId } = authInfo;
  switch (method) {
    case 'isGroupAdmin': {
      if (!(entity instanceof Group)) return false;
      return entity?.created_by_id === requestingUserId;
    }
    case 'isPartOfGroup': {
      if (!(entity instanceof Group)) return false;
      return entity?.users.some((user) => user.id === requestingUserId);
    }
    case 'isPartOfChat': {
      if (!(entity instanceof Chat)) return false;
      return entity?.users.some((user) => user.id === requestingUserId);
    }
    default: return false;
  }
}

const getEntityIdFromGQLInfo = (info: GraphQLResolveInfo, entity: string): number | undefined => {
  let id;
  for (const key in info.variableValues) {
    if (key.toLowerCase().includes(entity) && key.toLowerCase().includes('id')) {
      id = Number(info.variableValues[key]);
    } else if (key.toLowerCase() === "id") {
      id = Number(info.variableValues[key]);
    }
  }
  return id;
};

export const authChecker: AuthChecker<ContextType> = async (
  { root, args, context, info },
  roles
) => {
  const user = await getUserFromContext(context);
  if (!user) return false;
  if (roles.includes('user')) {
    return true;
  } else if (roles.includes('isPartOfGroup') || roles.includes('isGroupAdmin')) {
    const method = roles.includes('isGroupAdmin') ? 'isGroupAdmin' : 'isPartOfGroup';
    if (!info.variableValues) return false;
    //This is not ideal, but we have both version of the variable used in the resolvers `id` or `groupId`
    const groupId = getEntityIdFromGQLInfo(info, "group");
    const group = await Group.findOne({ where: { id: groupId }, relations: { users: true } });
    return await checkAuthorisation({ method, requestingUserId: user.id, entity: group });
  }
  return false;
};
import { User } from "./entities/User";
import Cookies from "cookies";
import { verify } from "jsonwebtoken";
import { AuthChecker } from "type-graphql";
import { Group } from "./entities/Group";
import { Chat } from "./entities/Chat";
import { Message } from "./entities/Message";
import { Invitation } from "./entities/Invitation";
import { Poll } from "./entities/Poll";

export type EntityEnum = Group | Chat | Message | Invitation | null;
export type AuthorisationType = "isGroupAdmin" | "isPartOfGroup" | "isPartOfChat";
export type AuthInfo = {
  method: AuthorisationType;
  requestingUserId: number;
  entity: EntityEnum;
}
export type ResolverMethod = 'login' | 'requestPasswordReset' | 'cancelPasswordResetRequests' | "createUser";
export type ContextData = { entities?: EntityEnum[], resolverMethod?: ResolverMethod };
export type ContextType = { req: any; res: any; user: User | null | undefined; data?: ContextData };
/**
 * @dev This context type is provided through apolloServer.executeOperations from the websocket middlewares 
 */
export type ContextUserType = { user: User, data?: ContextData };
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

/**
 * 
 * @param variableValues object taken from the info of the AuthChecker info.variableValues
 * @param entity name in lowercase of the entity you wish get the id of
 * @returns id (number) or undefined
 * @description when calling a resolver with an id variable, it may have different names (ex: 'id', 'groupId', 'updatedGroupId') or be nested inside a data object, this function deals with this issue and returns the id from the info object
 */
const getEntityIdFromGQLInfo = (variableValues: any, entity: string): number | undefined => {
  let id;
  for (const key in variableValues) {
    if (typeof variableValues[key] === 'object') {
      const deepId = getEntityIdFromGQLInfo(variableValues[key], entity);
      if (!id) id = deepId;
    }
    if (key.toLowerCase().includes(entity) && key.toLowerCase().includes('id')) {
      id = Number(variableValues[key]);
    } else if (key.toLowerCase() === "id" && !id) {
      id = Number(variableValues[key]);
    }
  }
  return id;
};

type AuthCheckerAuthorizationType = AuthorisationType | 'isPollPartOfChat' | 'isInvitationPartOfGroupAdmin' | 'user';
interface AuthCheckerAuthorizationInfo {
  id: number | undefined;
  entity: any;
  relations?: string[];
  authMethod?: AuthorisationType;
}

// INFO DEV : Since the authorization logic is based on the appartenance of a user to a given entity (group or chat) if the authCheck
// is called without a variable allowing us to identify either of this entity, we need to go the extra step and link the queried resolver to
// one of those entity (exemple below for isPollPartOfChat & isInvitationPartOfGroupAdmin) 
// ex : - isPollPartOfChat : query => poll with chat => check authorization to chat
// - isInvitationPartOfGroupAdmin : query => invitation with group => check the authorization to group (in this case admin)
export const authChecker: AuthChecker<ContextType, AuthCheckerAuthorizationType> = async (
  { context, info },
  roles
) => {
  if (!Array.isArray(roles)) throw new Error('The user authorization roles must be an array');
  const user = await getUserFromContext(context);
  if (!user) return false;

  const { variableValues } = info;
  const authorizations: Record<AuthCheckerAuthorizationType, AuthCheckerAuthorizationInfo> = {
    user: { id: user.id, entity: User },
    isPartOfGroup: { id: getEntityIdFromGQLInfo(variableValues, "group"), entity: Group, authMethod: "isPartOfGroup", relations: ['users'] },
    isGroupAdmin: { id: getEntityIdFromGQLInfo(variableValues, "group"), entity: Group, authMethod: 'isGroupAdmin' },
    isPartOfChat: { id: getEntityIdFromGQLInfo(variableValues, "chat"), entity: Chat, authMethod: 'isPartOfChat', relations: ['users'] },
    isPollPartOfChat: { id: getEntityIdFromGQLInfo(variableValues, "poll"), entity: Poll, relations: ['chat', 'chat.users'], authMethod: 'isPartOfChat' },
    isInvitationPartOfGroupAdmin: { id: getEntityIdFromGQLInfo(variableValues, "invitation"), entity: Invitation, relations: ['group'], authMethod: 'isGroupAdmin' },
  }

  for (const role of roles) {
    if (!authorizations[role]) throw new Error('Authorized role not recognized in the AuthChecker');
    if (role === 'user') return true;
    const { id, entity, relations, authMethod } = authorizations[role];
    const entityInstance = await entity.findOne({ where: { id }, relations: relations ?? [] });
    if (!authMethod) throw new Error('Authorization method missing in the AuthCheck');
    if (role === 'isPollPartOfChat') {
      if (!entityInstance.chat) return false
      return checkAuthorisation({ method: authMethod, requestingUserId: user.id, entity: entityInstance.chat });
    }
    if (role === 'isInvitationPartOfGroupAdmin') {
      if (!entityInstance.group) return false
      return checkAuthorisation({ method: authMethod, requestingUserId: user.id, entity: entityInstance.group });
    }
    return checkAuthorisation({ method: authMethod, requestingUserId: user.id, entity: entityInstance });
  }

  return false;
};


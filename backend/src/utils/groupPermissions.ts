import { Group } from "../entities/Group";
import { getUserFromContext, ContextType } from "../auth";

export async function getGroupIfUserIsCreator(
  groupId: number,
  context: ContextType,
  relations: string[] = ["users"]
): Promise<Group> {
  const group = await Group.findOne({
    where: { id: groupId },
    relations,
  });

  if (!group) {
    throw new Error("Group not found");
  }

  const user = await getUserFromContext(context);
  if (!user) {
    throw new Error("Unauthorized");
  }

  if (group.created_by_id !== user.id) {
    throw new Error(
      "You are not authorized to perform this action on this group"
    );
  }

  return group;
}

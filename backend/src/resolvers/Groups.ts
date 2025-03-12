import { Resolver, Query, Arg, ID, Mutation} from "type-graphql";
import { Group, GroupCreateInput, GroupUpdateInput } from "../entities/Group";
import { validate } from "class-validator";
import { merge } from "../utils/secret_santa/merge";

@Resolver()
export class GroupsResolver {

    // Get all groups
    @Query(() => [Group])
    async groups(): Promise<Group[]> {
        const groups = await Group.find({
            relations: {
                userGroups: true,
            },
        });
        return groups;
    }

    // Get one group by id
    @Query(() => Group, { nullable: true })
    async group(@Arg("id", () => ID) id: number): Promise<Group | null> {
        const group = await Group.findOne({
            where: { id },
            relations: {
                userGroups: true,
            },
        });
        if (group) {
            return group;
        } else {
            return null;
        }
    }

    // Create a new group
    @Mutation(() => Group)
    async createGroup(
        @Arg("data", () => GroupCreateInput) data: 
        GroupCreateInput): Promise<Group> {
            const newGroup = new Group();
            Object.assign(newGroup, data);

            const errors = await validate(newGroup);
            if (errors.length > 0) {
                throw new Error(`Validation error: ${JSON.stringify(errors)}`);
            } else {
                await newGroup.save();
                return newGroup;
            }
    }

    // Update a group
    @Mutation(() => Group, { nullable: true })
    async updateGroup(
        @Arg("id", () => ID) id: number,
        @Arg("data", () => GroupUpdateInput) data: GroupUpdateInput
        ): Promise<Group | null> {
        const group = await Group.findOne({ where: { id }, relations: { userGroups: true } });
        if (group !== null) {
            merge(group, data);
            group.updated_at = new Date();
            
            const errors = await validate(group);

            if (errors.length > 0) {
                throw new Error(`Validation error: ${JSON.stringify(errors)}`);
            } else {
                console.log(group);
                await group.save();
                return group;
            }
        } else {
            return null;
        }
    }

    // Delete a group
    @Mutation(() => Group, { nullable: true })
    async deleteGroup(@Arg("id", () => ID) id: number): Promise<Group | null> {
        const group = await Group.findOneBy({ id });
        if (group !== null) {
            await group.remove();
            Object.assign(group, { id });
            return group;
        } else {
            return null;
        }
    }
}

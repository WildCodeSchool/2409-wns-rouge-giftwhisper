import { DataSource } from "typeorm";
import { seedUsers } from "./user.seed";

export async function seedAll(datasource: DataSource) {
    await seedUsers(datasource);
}
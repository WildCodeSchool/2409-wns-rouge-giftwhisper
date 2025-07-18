import { DataSource } from "typeorm";
import { User, UserCreateInput } from "../entities/User";
import { validate } from "class-validator";
import * as argon2 from "argon2";

const usersToSeed: UserCreateInput[] = [
    {
      email: "alice.dupont@example.com",
      password: "Password123!",
      first_name: "Alice",
      last_name: "Dupont",
      date_of_birth: new Date("1990-01-01"),
    },
    {
      email: "bob.martin@example.com",
      password: "Password456!",
      first_name: "Bob",
      last_name: "Martin",
      date_of_birth: new Date("1985-05-15"),
    },
    {
      email: "camille.leclerc@example.com",
      password: "Password789!",
      first_name: "Camille",
      last_name: "Leclerc",
      date_of_birth: new Date("1992-03-10"),
    },
    {
      email: "thomas.durand@example.com",
      password: "SecurePass1!",
      first_name: "Thomas",
      last_name: "Durand",
      date_of_birth: new Date("1988-07-24"),
    },
    {
      email: "lea.moreau@example.com",
      password: "StrongPass2!",
      first_name: "Léa",
      last_name: "Moreau",
      date_of_birth: new Date("1995-12-05"),
    },
    {
      email: "maxime.roux@example.com",
      password: "SafePass3!",
      first_name: "Maxime",
      last_name: "Roux",
      date_of_birth: new Date("1991-09-17"),
    },
    {
      email: "julie.garcia@example.com",
      password: "CoolPass4!",
      first_name: "Julie",
      last_name: "Garcia",
      date_of_birth: new Date("1989-04-22"),
    },
    {
      email: "antoine.bertrand@example.com",
      password: "CleanPass5!",
      first_name: "Antoine",
      last_name: "Bertrand",
      date_of_birth: new Date("1993-11-30"),
    },
    {
      email: "manon.laurent@example.com",
      password: "NicePass6!",
      first_name: "Manon",
      last_name: "Laurent",
      date_of_birth: new Date("1997-06-14"),
    },
    {
      email: "lucas.vincent@example.com",
      password: "TopPass7!",
      first_name: "Lucas",
      last_name: "Vincent",
      date_of_birth: new Date("1994-02-08"),
    },
  ];
  

export async function seedUsers(datasource: DataSource) {
    const userRepo = datasource.getRepository(User);
    const existingUsers = await userRepo.count();

    if (existingUsers > 0) {
        console.log("⚠️ Database already seeded, skipping.");
        return;
    }

    console.log("🌱 Starting DB seeding...");

    for (const data of usersToSeed) {
        const user = new User();
        user.email = data.email;
        user.first_name = data.first_name;
        user.last_name = data.last_name;
        user.date_of_birth = data.date_of_birth;
        user.hashedPassword = await argon2.hash(data.password);

        const errors = await validate(user);
        if (errors.length > 0) {
            console.error(`❌ Validation failed for ${data.email}`, errors);
            continue;
        }

        await userRepo.save(user);
        console.log(`✅ Created user: ${user.email}`);
    }

    console.log("🌱 Seeding Users finished");
}




import "dotenv/config";
import bcrypt from "bcrypt";
import { connectDatabase, disconnectDatabase } from "../lib/server/db-core";
import { Admin } from "../lib/server/models-core";

const main = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD are required");
  }

  if (password.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters");
  }

  await connectDatabase();

  const existingAdmin = await Admin.findOne({ email });

  if (existingAdmin) {
    throw new Error("An admin with this email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await Admin.create({
    email,
    passwordHash,
    role: "admin",
  });

  console.log("Admin created successfully");
};

main()
  .catch((error: unknown) => {
    console.error(
      error instanceof Error ? error.message : "Admin creation failed",
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDatabase();
  });

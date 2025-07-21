import { db } from ".";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { FindFirstUserOptions } from "@/types/db-types";

export async function createUser({
  clerkId,
  email,
  name,
}: {
  clerkId: string;
  email: string;
  name: string;
}) {
  return await db
    .insert(users)
    .values({
      clerkId,
      email,
      name,
    })
    .onConflictDoNothing({ target: users.email })
    .returning();
}

export async function getUserByClerkId(
  { clerkId }: { clerkId: string },
  options?: FindFirstUserOptions
) {
  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
    ...options,
  });

  if (!user) throw new Error("User not found");

  return user;
}

import { auth } from "@clerk/nextjs/server";
import { db } from ".";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import { FindFirstUserOptions } from "@/types/db-types";

export async function createUser({
  email,
  name,
}: {
  email: string;
  name: string;
}) {
  const { userId } = await auth();

  if (!userId) throw new Error("No session detected");

  const user = await getUserByClerkId({ clerkId: userId });

  if (user) return;

  await db.insert(users).values({
    clerkId: userId,
    email,
    name,
  });
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
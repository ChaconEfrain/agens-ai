import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "./user";
import { db } from ".";
import { files } from "./schema";

export async function createFile({
  businessId,
  chatbotId,
  fileUrl,
  title
}: {
  businessId: number;
  chatbotId: number;
  fileUrl: string;
  title: string;
}) {
  const { userId } = await auth();

  try {
    if (!userId) throw new Error("No session detected");

    const user = await getUserByClerkId({ clerkId: userId });

    return await db
      .insert(files)
      .values({
        userId: user.id,
        businessId,
        chatbotId,
        fileUrl,
        title
      })
      .returning();
  } catch (error) {
    if (error instanceof Error) {
      throw new Error("File", {
        cause: error.message,
      });
    }
  }
}
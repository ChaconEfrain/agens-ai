import { Transaction } from "@/types/db-transaction";
import { db } from ".";
import { FileInsert, files } from "./schema";

export async function createFile(
  { filesResult }: { filesResult: FileInsert[] },
  trx?: Transaction
) {
  const database = trx ?? db;
  return await database
    .insert(files)
    .values(
      filesResult.map(({ userId, businessId, chatbotId, fileUrl, title }) => ({
        userId,
        businessId,
        chatbotId,
        fileUrl,
        title,
      }))
    )
    .returning();
}

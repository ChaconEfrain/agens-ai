import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { db } from "@/db";
import { formWizardsProgress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function saveWizardProgress({
  userId,
  step,
  data,
  wizardId
}: {
  userId: number;
  step: number;
  data: Partial<FormWizardData>;
  wizardId: string;
}) {
  await db
    .insert(formWizardsProgress)
    .values({ userId, step, data, wizardId })
    .onConflictDoUpdate({
      target: formWizardsProgress.wizardId,
      set: { step, data },
    });
}

export async function loadWizardProgress({userId}: {userId: number}) {
  return await db.query.formWizardsProgress.findFirst({
    where: eq(formWizardsProgress.userId, userId),
  });
}
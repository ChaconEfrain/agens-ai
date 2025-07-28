'use server'

import {
  getCurrentDayMessagesPerChatbotByClerkId,
  getCurrentPeriodMessagesPerDayByClerkId,
} from "@/db/messages";

export async function getCurrentDayMessagesPerChatbotByClerkIdAction({clerkId, timezone}: {clerkId: string, timezone: string}) {
  try {
    const messages = await getCurrentDayMessagesPerChatbotByClerkId({clerkId, timezone});
    return messages;
  } catch (error) {
    console.error('Error on getCurrentDayMessagesPerChatbotByClerkIdAction --> ', error)
    return null;
  }
}

export async function getCurrentPeriodMessagesPerDayByClerkIdAction({clerkId}: {clerkId: string}) {
  try {
    const messages = await getCurrentPeriodMessagesPerDayByClerkId({ clerkId });
    return messages;
  } catch (error) {
    console.error(
      "Error on getCurrentPeriodMessagesPerDayByClerkIdAction --> ",
      error
    );
    return null;
  }
}
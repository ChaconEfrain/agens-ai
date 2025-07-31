'use server'

import {
  getConversationBySessionId,
  getPaginatedMessagesByClerkId,
} from "@/db/messages";

export async function getConversationBySessionIdAction({
  sessionId,
}: {
  sessionId: string;
}) {
  try {
    const conversation = await getConversationBySessionId({ sessionId });

    return { success: true, message: "", conversation };
  } catch (error) {
    console.error("Error on getConversationBySessionIdAction --> ", error);
    return {
      success: false,
      message:
        "Something went wrong getting the conversation. Please try again.",
      conversation: null,
    };
  }
}

export async function getPaginatedMessagesByClerkIdAction({
  clerkId,
  page,
  pageSize,
  aiResponseFilter,
  userMessageFilter,
  chatbotSlugFilter,
}: {
  clerkId: string;
  page: number;
  pageSize: number;
  aiResponseFilter?: string;
  userMessageFilter?: string;
  chatbotSlugFilter?: string;
}) {
  try {
    const { data, total } = await getPaginatedMessagesByClerkId({
      clerkId,
      page,
      pageSize,
      aiResponseFilter,
      userMessageFilter,
      chatbotSlugFilter,
    });

    return { data, total };
  } catch (error) {
    console.error("Error on getPaginatedMessagesByClerkIdAction --> ", error);
    return {};
  }
}
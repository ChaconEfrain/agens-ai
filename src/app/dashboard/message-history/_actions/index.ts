'use server'

import { getConversationBySessionId } from "@/db/messages"

export async function getConversationBySessionIdAction({sessionId}: {sessionId: string}) {
  try {
    const conversation = await getConversationBySessionId({sessionId});

    return {success: true, message: '', conversation};
  } catch (error) {
    console.error('Error on getConversationBySessionIdAction --> ', error);
    return {success: false, message: 'Something went wrong getting the conversation. Please try again.', conversation: null}
  }
}
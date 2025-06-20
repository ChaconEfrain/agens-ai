'use server'

import { deleteChatbot } from "@/db/chatbot"
import { revalidatePath } from "next/cache"

export async function deleteChatbotAction({chatbotId}: {chatbotId: number}) {
  try {
    await deleteChatbot({chatbotId})

    revalidatePath('/create-chatbot')
    return {success: true, message: 'Chatbot deleted succesfully'}
  } catch (error) {
    console.error('Error on deleteChatbotAction --> ', error)
    return {success: false, message: 'Something went wrong deleting your chatbot'}
  }
}
export async function safePostChatbotMessage({
    message,
    chatbotId,
    chatbotInstructions,
    sessionId,
  }: {
    message: string,
    chatbotId: number,
    chatbotInstructions: string,
    sessionId: string,
  }) {
  try {
    const res = await fetch("/api/chatbot-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        chatbotId,
        chatbotInstructions,
        sessionId,
      }),
    });
    
    if (!res.ok) return {message: 'error'};
    
    const data = await res.json() as {message: string};
    
    return data;
  } catch (error) {
    console.error('Something went wrong posting the chatbot message', error instanceof Error ? error.message : error)
    return {message: 'error'};
  }

}
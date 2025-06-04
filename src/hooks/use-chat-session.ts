import { useEffect, useState } from "react";

export function useChatSession(chatbotSlug: string) {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const key = `chat-session-${chatbotSlug}`;
    let id = localStorage.getItem(key);

    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(key, id);
    }

    console.log("Chat session ID:", id);

    setSessionId(id);
  }, [chatbotSlug]);

  return sessionId;
}

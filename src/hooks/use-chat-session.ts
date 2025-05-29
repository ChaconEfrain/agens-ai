import { useEffect, useState } from "react";

export function useChatSession(chatbotSlug: string) {
  const [sessionId, setSessionId] = useState('');

  useEffect(() => {
    const key = `chat-session-${chatbotSlug}`;
    const cookies = document.cookie.split("; ").reduce((acc: Record<string, string>, cookie) => {
      const [name, value] = cookie.split("=");
      acc[name] = value;
      return acc;
    }, {});
    let id = cookies[key];

    if (!id) {
      id = crypto.randomUUID();
      document.cookie = `${key}=${id}; path=/; max-age=604800`;
    }

    setSessionId(id);
  }, [chatbotSlug]);

  return sessionId;
}

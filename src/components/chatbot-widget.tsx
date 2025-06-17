'use client'

import { useEffect } from 'react';

export default function ChatbotWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'http://localhost:3000/embed.js';
    script.setAttribute('data-chatbot-slug', 'greenlife-2356ef');
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
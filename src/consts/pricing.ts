import { Bot, Crown, Zap } from "lucide-react";

export const susbcriptionPlans = [
  {
    plan: 'Free',
    label: 'Starter',
    price: '$0',
    description: 'Perfect for small businesses just getting started',
    includes: ['1 chatbot', '100 messages', '1 PDF upload', 'AgensAI branding'] as string[],
    Icon: Bot
  },
  {
    plan: 'Basic',
    label: 'Professional',
    price: '$5',
    description: 'Ideal for growing businesses with more needs',
    includes: ['3 chatbots', '3,000 messages per month', '3 PDF upload', 'Remove AgensAI branding'] as string[],
    Icon: Zap
  },
  {
    plan: 'Pro',
    label: 'Enterprise',
    price: '$15',
    description: 'For businesses requiring advanced features and support',
    includes: ['Unlimited chatbots', '10,000 messages per month', 'Unlimited PDF upload', 'Analytics'] as string[],
    Icon: Crown
  }
] as const;
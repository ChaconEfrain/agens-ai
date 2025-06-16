import { SubscriptionContext, SubscriptionContextProps } from "@/context/subscription-context";
import { useContext } from "react";

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);

  return context as SubscriptionContextProps;
}
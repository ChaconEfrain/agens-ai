'use client'

import { checkExistingSubscriptionAction } from "@/actions/stripe";
import { Subscription } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import { createContext, Dispatch, ReactNode, SetStateAction, useEffect, useState } from "react";

export interface SubscriptionContextProps {
  subscription: Subscription | undefined;
  setSubscription: Dispatch<SetStateAction<Subscription | undefined>>;
  loading: boolean;
}

export const SubscriptionContext = createContext<SubscriptionContextProps | null>(null);

export default function SubscriptionContextProvider({children}: {children: ReactNode}) {
  const [loading, setLoading] = useState(false);
  const [existingSub, setExistingSub] = useState<Subscription>();
  const { isLoaded, isSignedIn, user } = useUser();

  useEffect(() => {
    (async () => {
      if (isLoaded && isSignedIn) {
        setLoading(true);

        const existing = await checkExistingSubscriptionAction({
          clerkId: user.id,
        });

        if (existing) setExistingSub(existing);

        setLoading(false);
      }
    })();
  }, [isLoaded]);

  return (
    <SubscriptionContext.Provider value={{
      subscription: existingSub,
      setSubscription: setExistingSub,
      loading
    }}>
      {children}
    </SubscriptionContext.Provider>
  )
}
import React, { useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  createStripeSessionAction,
  updateSubscriptionAction,
} from "@/actions/stripe";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useSubscriptionContext } from "@/hooks/use-subscription-context";

interface Props {
  plan: string;
}

export default function SubscribeButton({ plan }: Props) {
  const router = useRouter();
  const {
    subscription,
    setSubscription,
    loading: checkingSub,
  } = useSubscriptionContext();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const redirectToStripeCheckout = async () => {
    setLoadingCheckout(true);
    if (subscription?.plan === plan && subscription.status === "active") return;
    const fromPage = window.location.href;
    const origin = window.location.origin;
    const result = await createStripeSessionAction({ fromPage, origin, plan });

    if (result.url) {
      router.push(result.url);
    } else {
      toast.error(result.message);
    }

    setLoadingCheckout(false);
  };

  const updateSubscription = async () => {
    setLoadingUpdate(true);
    if (subscription) {
      const result = await updateSubscriptionAction({
        newPlan: plan.toLowerCase(),
        subscriptionId: subscription.stripeSubscriptionId,
        subscriptionItemId: subscription.stripeItemId,
      });

      if (result.success && result.newSubPlan) {
        toast.success(result.message);
        const newSub = { ...subscription };
        newSub.plan = result.newSubPlan;
        setSubscription(newSub);
      } else {
        toast.error(result.message);
      }

      setLoadingUpdate(false);
      setOpenModal(false);
      return;
    }
    setLoadingUpdate(false);
    setOpenModal(false);
  };

  if (checkingSub) {
    return (
      <div
        aria-hidden
        className="animate-pulse bg-muted-foreground w-full h-[37.8px] rounded"
      />
    );
  }

  if (plan === "Free") {
    return (
      <Button asChild variant="outline" className="w-full">
        <Link href="/create-chatbot">Get Started</Link>
      </Button>
    );
  }

  if (
    subscription?.plan === plan.toLowerCase() &&
    subscription.status === "active"
  ) {
    return (
      <Button className="w-full" disabled>
        Current Plan
      </Button>
    );
  }

  if (
    subscription?.plan !== plan.toLowerCase() &&
    subscription?.status === "active"
  ) {
    return (
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <Button
          className="w-full cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          {subscription.plan === "basic"
            ? "Upgrade Subscription"
            : "Downgrade Subscription"}
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {subscription.plan === "basic"
                ? "Upgrade to Pro"
                : "Downgrade to Basic"}
            </DialogTitle>
            <DialogDescription>
              {subscription.plan === "basic"
                ? "Pay a prorated charge for the remaining days of the month"
                : "Pay a prorated charge for the remaining days of the month (any credit will be applied to your next invoice)"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex gap-2">
            <Button variant="outline" className="w-1/2" asChild>
              <DialogClose>Cancel</DialogClose>
            </Button>
            <Button
              className="w-1/2"
              onClick={updateSubscription}
              disabled={loadingUpdate}
            >
              {subscription.plan === "basic" ? (
                loadingUpdate ? (
                  <>
                    Confirm Update <LoaderCircle className="animate-spin" />
                  </>
                ) : (
                  "Confirm Update"
                )
              ) : loadingUpdate ? (
                <>
                  Confirm Downgrade <LoaderCircle className="animate-spin" />
                </>
              ) : (
                "Confirm Downgrade"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Button
      variant={plan === "Pro" ? "outline" : "default"}
      className="w-full"
      onClick={redirectToStripeCheckout}
      disabled={loadingCheckout}
    >
      {loadingCheckout ? (
        <>
          Subscribe Now <LoaderCircle className="animate-spin" />
        </>
      ) : (
        "Subscribe Now"
      )}
    </Button>
  );
}

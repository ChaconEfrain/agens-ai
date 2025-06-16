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
import { Subscription } from "@/db/schema";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface Props {
  plan: string;
  existingSub: Subscription | undefined;
  checkingSub: boolean;
}

export default function SubscribeButton({
  plan,
  existingSub,
  checkingSub,
}: Props) {
  const router = useRouter();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const redirectToStripeCheckout = async () => {
    setLoadingCheckout(true);
    if (existingSub?.plan === plan && existingSub.status === "active") return;
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
    if (existingSub) {
      const result = await updateSubscriptionAction({
        newPlan: plan.toLowerCase(),
        subscriptionId: existingSub.stripeSubscriptionId,
        subscriptionItemId: existingSub.stripeItemId,
      });

      if (result.success) {
        toast.success(result.message);
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
    existingSub?.plan === plan.toLowerCase() &&
    existingSub.status === "active"
  ) {
    return (
      <Button className="w-full" disabled>
        Current Plan
      </Button>
    );
  }

  if (
    existingSub?.plan !== plan.toLowerCase() &&
    existingSub?.status === "active"
  ) {
    return (
      <Dialog open={openModal}>
        <Button
          className="w-full cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          {existingSub.plan === "basic"
            ? "Upgrade Subscription"
            : "Downgrade Subscription"}
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {existingSub.plan === "basic"
                ? "Upgrade to Pro"
                : "Downgrade to Basic"}
            </DialogTitle>
            <DialogDescription>
              {existingSub.plan === "basic"
                ? "Pay a prorated charge for the remaining days of the month"
                : "Pay a prorated charge for the remaining days of the month (any credit will be applied to your next invoice)"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="w-full flex gap-2">
            <Button
              variant="outline"
              className="w-1/2"
              onClick={() => setOpenModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="w-1/2"
              onClick={updateSubscription}
              disabled={loadingUpdate}
            >
              {existingSub.plan === "basic" ? (
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

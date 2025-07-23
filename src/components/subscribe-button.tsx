import React, { Dispatch, SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  createStripeSessionAction,
  updateSubscriptionPlanAction,
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
import { Subscription } from "@/db/schema";
import { useUser } from "@clerk/nextjs";

interface Props {
  plan: string;
  checkingSub: boolean;
  sub: Subscription | undefined;
  setSub: Dispatch<SetStateAction<Subscription | undefined>>;
}

export default function SubscribeButton({
  plan,
  checkingSub,
  sub,
  setSub,
}: Props) {
  const router = useRouter();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { isSignedIn } = useUser();

  const redirectToStripeCheckout = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to continue");
    }
    setLoadingCheckout(true);
    if (sub?.plan === plan && sub.status === "active") return;
    const fromPage = window.location.href;
    const origin = window.location.origin;
    const result = await createStripeSessionAction({
      fromPage,
      origin,
      plan,
      customerId: sub?.stripeCustomerId,
    });

    if (result.url) {
      router.push(result.url);
    } else {
      toast.error(result.message);
    }

    setLoadingCheckout(false);
  };

  const updateSubscription = async () => {
    setLoadingUpdate(true);
    if (sub) {
      const result = await updateSubscriptionPlanAction({
        newPlan: plan.toLowerCase(),
        subscriptionId: sub.stripeSubscriptionId as string,
      });

      if (result.success && result.newSubPlan) {
        toast.success(result.message);
        const newSub = { ...sub };
        newSub.plan = result.newSubPlan;
        setSub(newSub);
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

  if (sub?.plan === plan.toLowerCase() && sub.status === "active") {
    return (
      <Button className="w-full" disabled>
        Current Plan
      </Button>
    );
  }

  if (sub?.plan !== plan.toLowerCase() && sub?.status === "active") {
    return (
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <Button
          className="w-full cursor-pointer"
          onClick={() => setOpenModal(true)}
        >
          {sub.plan === "basic"
            ? "Upgrade Subscription"
            : "Downgrade Subscription"}
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sub.plan === "basic" ? "Upgrade to Pro" : "Downgrade to Basic"}
            </DialogTitle>
            <DialogDescription>
              {sub.plan === "basic"
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
              {sub.plan === "basic" ? (
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

import React, {
  Dispatch,
  MouseEvent,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import {
  cancelSubscriptionAction,
  createStripeSessionAction,
  revertCancelSubscriptionAction,
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
import { Chatbot, Subscription } from "@/db/schema";
import { useUser } from "@clerk/nextjs";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Prettify } from "@/types/helpers";
import { ALLOWED_CHATBOTS } from "@/consts/subscription";

interface Props {
  plan: string;
  checkingSub: boolean;
  sub: Prettify<Subscription & { chatbots: Chatbot[] }> | undefined;
  setSub: Dispatch<
    SetStateAction<Prettify<Subscription & { chatbots: Chatbot[] }> | undefined>
  >;
}

const formSchema = z.object({
  activeChatbot: z
    .string()
    .min(1, "You have to choose one chatbot to keep active"),
});

export default function SubscribeButton({
  plan,
  checkingSub,
  sub,
  setSub,
}: Props) {
  const router = useRouter();
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const { isSignedIn } = useUser();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      activeChatbot: "",
    },
  });

  useEffect(() => {
    if (!openModal) {
      document.body.style.pointerEvents = "";
    }
    return () => {
      document.body.style.pointerEvents = "";
    };
  }, [openModal]);

  const redirectToStripeCheckout = async () => {
    if (!isSignedIn) {
      toast.info("Please, sign in to continue");
      return;
    }
    setLoadingCheckout(true);
    if (sub?.plan === plan && sub.status === "active") return;
    const fromPage = window.location.href;
    const origin = window.location.origin;
    const result = await createStripeSessionAction({
      fromPage,
      origin,
      plan,
    });

    if (result.url) {
      router.push(result.url);
    } else {
      toast.error(result.message);
    }

    setLoadingCheckout(false);
  };

  const updateSubscription = async (
    arg: z.infer<typeof formSchema> | MouseEvent<HTMLButtonElement>
  ) => {
    setLoadingModal(true);
    let activeChatbot;

    if ("activeChatbot" in arg) {
      activeChatbot = arg.activeChatbot;
    }

    if (sub) {
      const result = await updateSubscriptionPlanAction({
        newPlan: plan.toLowerCase(),
        stripeSubscriptionId: sub.stripeSubscriptionId as string,
        subscriptionId: sub?.id.toString()!,
        activeChatbot,
      });

      if (result.success && result.newSubPlan) {
        toast.success(result.message);
        const newSub = { ...sub };
        newSub.plan = result.newSubPlan;
        setSub(newSub);
      } else {
        toast.error(result.message);
      }

      setLoadingModal(false);
      setOpenModal(false);
      return;
    }
    setLoadingModal(false);
    setOpenModal(false);
  };

  const cancelSubscription = async (
    arg: z.infer<typeof formSchema> | MouseEvent<HTMLButtonElement>
  ) => {
    setLoadingModal(true);
    let activeChatbot;

    if ("activeChatbot" in arg) {
      activeChatbot = arg.activeChatbot;
    }

    const { message, success } = await cancelSubscriptionAction({
      stripeSubscriptionId: sub?.stripeSubscriptionId!,
      subscriptionId: sub?.id.toString()!,
      activeChatbot,
    });

    if (success) {
      toast.success(message);
      sub && setSub({ ...sub, cancelAtPeriodEnd: true });
    } else {
      toast.error(message);
    }

    setLoadingModal(false);
    setOpenModal(false);
  };

  const revertCancelSubscription = async () => {
    setLoadingModal(true);

    const { message, success } = await revertCancelSubscriptionAction({
      stripeSubscriptionId: sub?.stripeSubscriptionId!,
      subscriptionId: sub?.id.toString()!,
    });

    if (success) {
      toast.success(message);
      sub && setSub({ ...sub, cancelAtPeriodEnd: false });
    } else {
      toast.error(message);
    }

    setLoadingModal(false);
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

  if (sub?.plan === plan.toLocaleLowerCase() && sub.cancelAtPeriodEnd) {
    return (
      <div className="flex flex-col w-full gap-2">
        <p className="text-muted-foreground self-start text-sm">
          Will cancel at {new Date(sub.periodEnd!).toLocaleString()}
        </p>
        <Dialog open={openModal} onOpenChange={setOpenModal}>
          <Button
            className="w-full"
            variant="secondary"
            onClick={() => setOpenModal(true)}
          >
            Don't Cancel
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Revert Scheduled Cancelation</DialogTitle>
              <DialogDescription>
                {sub.periodEnd
                  ? `If you confirm, your subscription will no longer be canceled at ${new Date(
                      sub.periodEnd
                    ).toLocaleString()}, and your chatbots (if any) will remain active.`
                  : "If you confirm, your subscription will no longer be canceled at the end of the current period, and your chatbots (if any) will remain active."}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="w-full flex gap-2">
              <Button variant="outline" className="w-1/2" asChild>
                <DialogClose>Cancel</DialogClose>
              </Button>
              <Button
                className="w-1/2"
                onClick={revertCancelSubscription}
                disabled={loadingModal}
              >
                {loadingModal ? (
                  <>
                    Revert Cancelation <LoaderCircle className="animate-spin" />
                  </>
                ) : (
                  "Revert Cancelation"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (sub?.plan === plan.toLowerCase() && sub.status === "active") {
    return (
      <Dialog
        open={openModal}
        onOpenChange={(open) => {
          setOpenModal(open);
          form.reset();
        }}
      >
        <Button
          className="w-full text-red-500"
          variant="ghost"
          onClick={() => setOpenModal(true)}
        >
          Cancel Subscription
        </Button>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              {sub.periodEnd
                ? `If you confirm, your subscription will be canceled at ${new Date(
                    sub.periodEnd
                  ).toLocaleString()} and you'll be moved back to free tier`
                : "If you confirm, your subscription will be canceled at the end of the current period and you'll be moved back to free tier"}
            </DialogDescription>
          </DialogHeader>
          {sub.chatbots.filter((bot) => bot.isActive).length >
            ALLOWED_CHATBOTS["FREE"] && (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(cancelSubscription)}
                id="active-chatbot-form"
              >
                <FormField
                  control={form.control}
                  name="activeChatbot"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Choose the chatbot that will remain active
                      </FormLabel>
                      <FormControl>
                        <Select
                          {...field}
                          onValueChange={field.onChange}
                          onOpenChange={(open) => {
                            if (open) {
                              document.body.style.pointerEvents = "";
                            }
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select chatbot" />
                          </SelectTrigger>
                          <SelectContent>
                            {sub.chatbots.map((bot) => (
                              <SelectItem
                                key={bot.id}
                                value={bot.id.toString()}
                              >
                                {bot.slug}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </form>
            </Form>
          )}
          <DialogFooter className="w-full flex gap-2">
            <Button variant="outline" className="w-1/2" asChild>
              <DialogClose>Cancel</DialogClose>
            </Button>
            <Button
              className="w-1/2"
              onClick={sub.chatbots.length > 0 ? undefined : cancelSubscription}
              disabled={loadingModal}
              form={sub.chatbots.length > 0 ? "active-chatbot-form" : undefined}
            >
              {loadingModal ? (
                <>
                  Confirm Cancelation <LoaderCircle className="animate-spin" />
                </>
              ) : (
                "Confirm Cancelation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (sub?.plan !== plan.toLowerCase() && sub?.status === "active") {
    return (
      <Dialog
        open={openModal}
        onOpenChange={(open) => {
          setOpenModal(open);
          form.reset();
        }}
      >
        <Button
          className="w-full cursor-pointer"
          onClick={() => {
            if (sub?.cancelAtPeriodEnd) {
              toast.info(
                "Please, revert the scheduled cancelation to continue"
              );
              return;
            }
            setOpenModal(true);
          }}
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
              {sub.plan === "basic" ? (
                <>
                  Pay a prorated charge for the remaining days of the month, go
                  to <Link href="/dashboard">your dashboard</Link> to activate
                  or deactivate your chatbots
                </>
              ) : (
                "Pay a prorated charge for the remaining days of the month (any credit will be applied to your next invoice)"
              )}
            </DialogDescription>
          </DialogHeader>
          {sub.plan === "pro" &&
            sub.chatbots.filter((bot) => bot.isActive).length >
              ALLOWED_CHATBOTS["BASIC"] && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(updateSubscription)}
                  id="active-chatbot-form"
                >
                  <FormField
                    control={form.control}
                    name="activeChatbot"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Choose the chatbot that will remain active
                        </FormLabel>
                        <FormControl>
                          <Select
                            {...field}
                            onValueChange={field.onChange}
                            onOpenChange={(open) => {
                              if (open) {
                                document.body.style.pointerEvents = "";
                              }
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select chatbot" />
                            </SelectTrigger>
                            <SelectContent>
                              {sub.chatbots.map((bot) => (
                                <SelectItem
                                  key={bot.id}
                                  value={bot.id.toString()}
                                >
                                  {bot.slug}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            )}
          <DialogFooter className="w-full flex gap-2">
            <Button variant="outline" className="w-1/2" asChild>
              <DialogClose>Cancel</DialogClose>
            </Button>
            <Button
              className="w-1/2"
              onClick={
                sub.chatbots.filter((bot) => bot.isActive).length >
                  ALLOWED_CHATBOTS["BASIC"] && sub.plan === "pro"
                  ? undefined
                  : updateSubscription
              }
              disabled={loadingModal}
              form={sub.chatbots.length > 0 ? "active-chatbot-form" : undefined}
            >
              {sub.plan === "basic" ? (
                loadingModal ? (
                  <>
                    Confirm Upgrade <LoaderCircle className="animate-spin" />
                  </>
                ) : (
                  "Confirm Upgrade"
                )
              ) : loadingModal ? (
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

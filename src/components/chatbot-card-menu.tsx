"use client"

import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { EllipsisVertical, LoaderCircle, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import {
  deleteChatbotAndBusinessAction,
  toggleChatbotAction,
} from "@/actions/chatbot";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Prettify } from "@/types/helpers";
import { Chatbot, Subscription } from "@/db/schema";
import { ALLOWED_CHATBOTS } from "@/consts/subscription";

interface Props {
  businessId: number;
  chatbotSlug: string;
  isActive: boolean;
  sub: Prettify<Subscription & { chatbots: Chatbot[] }> | undefined;
}

export function ChatbotCardMenu({
  businessId,
  chatbotSlug,
  isActive,
  sub,
}: Props) {
  const [openModal, setOpenModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [action, setAction] = useState<
    "activate" | "deactivate" | "delete" | ""
  >("");
  const path = usePathname();

  useEffect(() => {
    if (!openDropdown) {
      document.body.style.pointerEvents = "";
    }
  }, [openDropdown]);

  const handleActivateChatbot = async () => {
    const loadingToast = toast.loading("Activating chatbot...");
    const { success } = await toggleChatbotAction({
      slug: chatbotSlug,
      path,
    });

    toast.dismiss(loadingToast);
    if (success) {
      toast.success("Chatbot activated successfully");
      setOpenModal(false);
    } else {
      toast.error("Something went wrong activating the chatbot");
    }
  };

  return (
    <>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[200px]"
          onEscapeKeyDown={() => setOpenModal(false)}
        >
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              <Link href={`/test-chatbot/${chatbotSlug}`} className="w-full">
                Test chatbot
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`/script/${chatbotSlug}`} className="w-full">
                Chatbot script
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              {isActive ? (
                <button
                  className="flex items-center gap-1 w-full cursor-pointer"
                  onClick={() => {
                    setAction("deactivate");
                    setOpenModal(true);
                  }}
                >
                  Deactivate chatbot
                </button>
              ) : (
                <button
                  className="flex items-center gap-1 w-full cursor-pointer"
                  onClick={() => {
                    if (
                      (sub?.chatbots.filter((bot) => bot.isActive).length ??
                        0) >=
                      ALLOWED_CHATBOTS[
                        sub?.plan.toUpperCase() as "BASIC" | "PRO" | "FREE"
                      ]
                    ) {
                      setAction("activate");
                      setOpenModal(true);
                      return;
                    }
                    handleActivateChatbot();
                  }}
                >
                  Activate
                </button>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <button
                className="flex items-center gap-1 w-full cursor-pointer"
                onClick={() => {
                  setAction("delete");
                  setOpenModal(true);
                }}
              >
                <Trash className="text-inherit" /> Delete
              </button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConfirmationModal
        openModal={openModal}
        setOpenModal={setOpenModal}
        businessId={businessId}
        action={action}
        slug={chatbotSlug}
        sub={sub}
        path={path}
      />
    </>
  );
}

interface ModalProps {
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  openModal: boolean;
  businessId: number;
  action: string;
  slug: string;
  sub: Prettify<Subscription & { chatbots: Chatbot[] }> | undefined;
  path: string;
}

function ConfirmationModal({
  setOpenModal,
  openModal,
  businessId,
  action,
  slug,
  sub,
  path,
}: ModalProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!openModal) {
      document.body.style.pointerEvents = "";
    }
    return () => {
      document.body.style.pointerEvents = "";
    };
  }, [openModal]);

  const handleDeleteChatbot = async () => {
    setLoading(true);
    const { success, message } = await deleteChatbotAndBusinessAction({
      businessId,
      path,
    });

    if (success) {
      toast.success(message);
      setOpenModal(false);
    } else {
      toast.error(message);
    }

    setLoading(false);
  };

  const handleDeactivateChatbot = async () => {
    setLoading(true);
    const { success } = await toggleChatbotAction({
      slug,
      path,
    });

    if (success) {
      toast.success("Chatbot deactivated successfully");
      setOpenModal(false);
    } else {
      toast.error("Something went wrong deactivating the chatbot");
    }

    setLoading(false);
  };

  if (action === "delete") {
    return (
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chatbot</DialogTitle>
            <DialogDescription>
              This action will permanently delete the chatbot and all associated
              messages. This operation cannot be undone.
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
              disabled={loading}
              onClick={handleDeleteChatbot}
            >
              {loading ? (
                <>
                  Deleting Chatbot <LoaderCircle className="animate-spin" />
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (action === "deactivate") {
    return (
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate chatbot</DialogTitle>
            <DialogDescription>
              This action will pause the chatbot and every ongoing chat until
              reactivation.
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
              disabled={loading}
              onClick={handleDeactivateChatbot}
            >
              {loading ? (
                <>
                  Deactivating Chatbot <LoaderCircle className="animate-spin" />
                </>
              ) : (
                "Confirm Deactivation"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  if (
    action === "activate" &&
    (sub?.chatbots.filter((bot) => bot.isActive).length ?? 0) >=
      ALLOWED_CHATBOTS[sub?.plan.toUpperCase() as "BASIC" | "PRO" | "FREE"]
  ) {
    return (
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chatbot limit reached</DialogTitle>
            <DialogDescription>
              You have reached the limit of allowed active chatbots for your
              current plan. Deactivate another chatbot to continue.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return null;
}
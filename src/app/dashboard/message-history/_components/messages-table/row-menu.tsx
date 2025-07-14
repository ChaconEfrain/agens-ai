import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { getConversationBySessionIdAction } from "../../_actions";
import { Chatbot, Message } from "@/db/schema";
import { toast } from "sonner";
import MockChat from "@/components/mock-chat";
import { exportConversationToExcel } from "@/lib/utils";

interface Props {
  sessionId: string;
  chatbot: Chatbot;
}

export default function RowMenu({ sessionId, chatbot }: Props) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    if (!openDropdown) {
      document.body.style.pointerEvents = "";
    }
  }, [openDropdown]);

  return (
    <>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => setOpenDrawer(true)}>
            View complete conversation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>View customer</DropdownMenuItem>
          <DropdownMenuItem>View payment details</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ConversationDrawer
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        sessionId={sessionId}
        chatbot={chatbot}
      />
    </>
  );
}

interface DrawerProps {
  setOpenDrawer: Dispatch<SetStateAction<boolean>>;
  openDrawer: boolean;
  sessionId: string;
  chatbot: Chatbot;
}

function ConversationDrawer({
  setOpenDrawer,
  openDrawer,
  sessionId,
  chatbot,
}: DrawerProps) {
  const [conversation, setConversation] = useState<Message[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getConversation = async () => {
      const { success, message, conversation } =
        await getConversationBySessionIdAction({ sessionId });

      if (!success) {
        toast.error(message, {
          position: "bottom-center",
        });
        setConversation([]);
        setLoading(false);
        return;
      }

      setConversation(conversation ?? []);
      setLoading(false);
    };

    if (!openDrawer) {
      document.body.style.pointerEvents = "";
    } else {
      getConversation();
    }

    return () => {
      document.body.style.pointerEvents = "";
    };
  }, [openDrawer]);
  return (
    <Drawer open={openDrawer} onOpenChange={setOpenDrawer} direction="right">
      <DrawerContent className="rounded-l-xl h-full overflow-hidden font-outfit">
        <DrawerHeader>
          <DrawerTitle>Chatbot {chatbot.slug}</DrawerTitle>
          <DrawerDescription>
            {loading ? (
              <span
                aria-hidden
                className="inline-block h-5 w-52 bg-muted-foreground animate-pulse"
              />
            ) : (
              `${new Intl.NumberFormat().format(
                conversation?.length ?? 0
              )} messages in this conversation`
            )}
          </DrawerDescription>
        </DrawerHeader>
        <div className="h-full max-h-10/12 mt-auto px-4 pb-4">
          <MockChat
            styles={chatbot.styles}
            conversation={conversation}
            loading={loading}
          />
        </div>
        <DrawerFooter>
          <Button
            disabled={loading || !conversation}
            onClick={() =>
              loading || !conversation
                ? null
                : exportConversationToExcel(conversation)
            }
          >
            Export Conversation Data
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

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
import { deleteChatbotAction } from "@/actions/chatbot"
import { toast } from "sonner"

export function ChatbotCardMenu({chatbotId}: {chatbotId: number}) {
  const [openModal, setOpenModal] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(false);

  useEffect(() => {
    if (!openDropdown) {
      document.body.style.pointerEvents = '';
    }
  }, [openDropdown])

  return (
    <>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <EllipsisVertical />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]" onEscapeKeyDown={() => setOpenModal(false)}>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuGroup>
            <DropdownMenuItem>Assign to...</DropdownMenuItem>
            <DropdownMenuItem>Set due date...</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <button className="flex items-center gap-1 w-full" onClick={() => setOpenModal(true)}>
                <Trash className="text-inherit" /> Delete
              </button>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteChatbotModal openModal={openModal} setOpenModal={setOpenModal} chatbotId={chatbotId} />
    </>
  )
}

interface ModalProps {
  setOpenModal: Dispatch<SetStateAction<boolean>>,
  openModal: boolean,
  chatbotId: number
}

function DeleteChatbotModal({setOpenModal, openModal, chatbotId}: ModalProps) {

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!openModal) {
      document.body.style.pointerEvents = '';
    }
    return () => {
      document.body.style.pointerEvents = '';
    }
  }, [openModal])

  const handleDeleteChatbot = async () => {
    setLoading(true);
    const { success, message } = await deleteChatbotAction({chatbotId});

    if (success) {
      toast.success(message)
      setOpenModal(false);
    } else {
      toast.error(message)
    }

    setLoading(false);
  }

  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Delete chatbot
          </DialogTitle>
          <DialogDescription>
            This action will permanently delete the chatbot and all associated messages. This operation cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full flex gap-2">
          <Button variant="outline" className="w-1/2" onClick={() => setOpenModal(false)}>
            Cancel
          </Button>
          <Button
            className="w-1/2"
            variant='destructive'
            disabled={loading}
            onClick={handleDeleteChatbot}
          >
            {loading ? (
              <>
                Deleting Chatbot <LoaderCircle className="animate-spin" />
              </>
            ) : (
              'Confirm Delete'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
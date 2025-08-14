'use client'

import React, { Dispatch, SetStateAction } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import Link from 'next/link';

export default function SubscriptionNeededModal({
  openModal,
  setOpenModal,
  message
}: {
  openModal: boolean;
  setOpenModal: Dispatch<SetStateAction<boolean>>;
  message: string;
}) {
  return (
    <Dialog open={openModal} onOpenChange={setOpenModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Subscription required</DialogTitle>
          <DialogDescription>
            {message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="w-full">
          <Button asChild className="w-full">
            <Link href="/pricing">Manage Subscription</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import React from 'react'
import DataTable from './_components/messages-table/data-table'
import { columns } from './_components/messages-table/columns'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import { getCurrentPeriodMessagesByClerkId } from '@/db/messages';

export default async function MessageHistoryPage() {

  const {userId} = await auth();

  if (!userId) {
    redirect('/');
  }

  const messages = await getCurrentPeriodMessagesByClerkId({clerkId: userId});

  return (
    <div>
      <DataTable columns={columns} data={messages} />
    </div>
  )
}

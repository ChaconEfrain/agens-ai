import React from 'react'
import UserPlan from './_components/user-plan'
import MessagesChart from './_components/messages-chart'
import UserChatbots from './_components/user-chatbots'

export default function DashboardPage() {
  return (
    <main className='h-screen'>
      <div className='grid grid-cols-3 grid-rows-[30fr_70fr] h-full max-h-[720px] gap-4'>
        <UserPlan />
        <MessagesChart />
        <UserChatbots />
      </div>
    </main>
  )
}

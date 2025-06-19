import { Card, CardContent, CardHeader } from '@/components/ui/card'
import React from 'react'

export default function OwnedChatbotsLoader() {
  return (
    <Card className='max-h-[80vh]'>
      <CardHeader>
        <h2 className='text-xl font-semibold'>Your Chatbots</h2>
      </CardHeader>
      <CardContent className='overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground space-y-4'>
        <Card className='h-[144px] w-full bg-muted-foreground animate-pulse'></Card>
        <Card className='h-[144px] w-full bg-muted-foreground animate-pulse'></Card>
        <Card className='h-[144px] w-full bg-muted-foreground animate-pulse'></Card>
      </CardContent>
    </Card>
  )
}

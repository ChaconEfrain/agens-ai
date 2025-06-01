'use client'

import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Code, Globe, Smartphone } from 'lucide-react'
import { ScriptDisplay } from './script-display'
import Customization from './customization'
import EmbedPreview from './embed-preview'

export interface ScriptStyles {
  position: "bottom-right" | "bottom-left" | "top-right" | "top-left"
  width: string
  height: string
  primaryColor: string
  showBranding: boolean
}

const defaultStyles: ScriptStyles = {
  position: "bottom-right",
  width: "350px",
  height: "500px",
  primaryColor: "#000000",
  showBranding: true,
}

export default function PageContainer({ slug }: { slug: string }) {
  const [styles, setStyles] = useState<ScriptStyles>(defaultStyles);

  const updateStyles = (updates: Partial<ScriptStyles>) => {
    setStyles({ ...styles, ...updates })
  }
  
  return (
    <>
      <div className='space-y-6'>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <h2>Chatbot Ready</h2>
                </CardTitle>
                <CardDescription><p>Your chatbot is live and ready to be embedded on your website</p></CardDescription>
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span>Web Compatible</span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <span>Mobile Responsive</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-4 w-4 text-muted-foreground" />
                <span>Easy Integration</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <ScriptDisplay slug={slug} />
      </div>
      <Customization styles={styles} updateStyles={updateStyles} />
      <EmbedPreview styles={styles} />
    </>
  )
}

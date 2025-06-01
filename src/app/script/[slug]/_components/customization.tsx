"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  Settings,
} from "lucide-react"
import { ScriptStyles } from "./page-container"
import { Button } from "@/components/ui/button"

interface Props {
  styles: ScriptStyles
  updateStyles: (updates: Partial<ScriptStyles>) => void
}

export default function Customization({styles, updateStyles}: Props) {

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Customization
        </CardTitle>
        <CardDescription>Customize how your chatbot appears on your website</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Select value={styles.position} onValueChange={(value: any) => updateStyles({ position: value })}>
            <SelectTrigger id="position" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bottom-right">Bottom Right</SelectItem>
              <SelectItem value="bottom-left">Bottom Left</SelectItem>
              <SelectItem value="top-right">Top Right</SelectItem>
              <SelectItem value="top-left">Top Left</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="width">Width</Label>
            <Input
              id="width"
              value={styles.width}
              onChange={(e) => updateStyles({ width: e.target.value })}
              placeholder="350px"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            <Input
              id="height"
              value={styles.height}
              onChange={(e) => updateStyles({ height: e.target.value })}
              placeholder="500px"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary Color</Label>
          <div className="flex gap-2">
            <Input
              id="primaryColor"
              type="color"
              value={styles.primaryColor}
              onChange={(e) => updateStyles({ primaryColor: e.target.value })}
              className="w-16 h-10 p-1 border rounded"
            />
            <Input
              value={styles.primaryColor}
              onChange={(e) => updateStyles({ primaryColor: e.target.value })}
              placeholder="#000000"
              className="flex-1"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="showBranding"
            checked={styles.showBranding}
            onCheckedChange={(checked) => updateStyles({ showBranding: checked })}
          />
          <Label htmlFor="showBranding">Show "Powered by AgensAI" branding</Label>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button className="w-full">Save styles</Button>
      </CardFooter>
    </Card>
  )
}

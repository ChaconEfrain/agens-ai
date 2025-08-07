import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from "@/lib/utils";
import { Code, Globe, Smartphone } from "lucide-react";
import React from "react";

export default function ChatbotReady({ isActive }: { isActive?: boolean }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <h2 className="text-2xl">Chatbot Ready</h2>
            </CardTitle>
            <CardDescription>
              <p>
                Your chatbot is live and ready to be embedded on your website
              </p>
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className={cn({
              "bg-green-50 text-green-700 border-green-200": isActive,
              "bg-red-50 text-red-700 border-red-200": !isActive,
            })}
          >
            {isActive ? "Active" : "Inactive"}
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
  );
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check } from "lucide-react"

interface ScriptDisplayProps {
  slug: string
}

export function ScriptDisplay({ slug }: ScriptDisplayProps) {
  const [copiedScript, setCopiedScript] = useState(false)
  const [copiedReact, setCopiedReact] = useState(false)

  const generateScript = () => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
    return `<script
  src="${baseUrl}/embed.js"
  data-chatbot-slug="${slug}"
></script>`;
  }

  const generateReactComponent = () => {
    return `import { useEffect } from 'react';

export default function ChatbotWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '${typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"}/embed.js';
    script.setAttribute('data-chatbot-slug', '${slug}');
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}`
  }

  const copyToClipboard = async (text: string, type: "script" | "react") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "script") {
        setCopiedScript(true)
        setTimeout(() => setCopiedScript(false), 2000)
      } else {
        setCopiedReact(true)
        setTimeout(() => setCopiedReact(false), 2000)
      }
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <Card className="grow">
      <CardHeader className="gap-0">
        <CardTitle>
          <h2 className="text-2xl">Embed Code</h2>
        </CardTitle>
        <CardDescription>
          <p>Copy and paste this code into your website to add the chatbot</p>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="html" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="html">HTML Script</TabsTrigger>
            <TabsTrigger value="react">React Component</TabsTrigger>
          </TabsList>
          <TabsContent value="html" className="space-y-4">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm h-96">
                <code>{generateScript()}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() => copyToClipboard(generateScript(), "script")}
              >
                {copiedScript ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedScript ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Instructions:</strong> Paste this script tag anywhere in
                your HTML, preferably before the closing {"</body>"} tag.
              </p>
            </div>
          </TabsContent>
          <TabsContent value="react" className="space-y-4">
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm h-96">
                <code>{generateReactComponent()}</code>
              </pre>
              <Button
                size="sm"
                variant="outline"
                className="absolute top-2 right-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                onClick={() =>
                  copyToClipboard(generateReactComponent(), "react")
                }
              >
                {copiedReact ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {copiedReact ? "Copied!" : "Copy"}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <p>
                <strong>Instructions:</strong> Import and use this component in
                your React application. The chatbot will automatically appear on
                your page.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

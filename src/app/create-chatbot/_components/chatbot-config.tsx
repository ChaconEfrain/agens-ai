import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { WizardStepProps } from "@/types/form-wizard";

export default function ChatbotConfig({ form }: WizardStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <h2>Chatbot Configuration</h2>
        </CardTitle>
        <CardDescription>
          <p>Customize how your AI chatbot will interact with customers.</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="chatbotConfig.objective"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chatbot Objective*</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="e.g., Help customers find products, answer FAQs, provide support..."
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chatbotConfig.tone"
          render={({ field }) => (
            <RadioGroup {...field} onValueChange={field.onChange}>
              <FormLabel>Tone of voice*</FormLabel>
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <RadioGroupItem value="formal" />
                </FormControl>
                <FormLabel>Formal</FormLabel>
              </FormItem>
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <RadioGroupItem value="casual" />
                </FormControl>
                <FormLabel>Casual</FormLabel>
              </FormItem>
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <RadioGroupItem value="friendly" />
                </FormControl>
                <FormLabel>Friendly</FormLabel>
              </FormItem>
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <RadioGroupItem value="professional" />
                </FormControl>
                <FormLabel>Professional</FormLabel>
              </FormItem>
            </RadioGroup>
          )}
        />
        <FormField
          control={form.control}
          name="chatbotConfig.style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Communication Style*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Friendly, Informative, Concise"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="chatbotConfig.personality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chatbot Personality*</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="e.g., Helpful and knowledgeable assistant who represents our brand values..."
                  className="resize-none"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import React, { useEffect } from 'react'
import { useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { WizardStepProps } from "@/types/form-wizard";

const contactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "socialMedia", label: "Social Media" },
  { value: "whatsapp", label: "WhatsApp" },
];

export default function CustomerService({ form, className }: WizardStepProps) {
  const contactMethodsSelected = form.watch("customerService.contactMethods");

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "customerService.commonQuestions",
  });

  const addNewQuestion = () => {
    const newQuestion = form.getValues("customerService.newQuestion");

    if (newQuestion?.question && newQuestion?.answer) {
      append(newQuestion);
      form.setValue("customerService.newQuestion", {
        question: "",
        answer: "",
      });
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <h2>Customer Service</h2>
        </CardTitle>
        <CardDescription>
          <p>
            Provide details about your customer support policies and common
            questions.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="customerService.supportHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Support Hours*</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Monday-Friday, 9 AM - 5 PM EST"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="customerService.contactMethods"
          render={() => (
            <FormItem>
              <FormLabel>Contact Methods*</FormLabel>
              {contactMethods.map((item) => (
                <FormField
                  key={item.value}
                  control={form.control}
                  name="customerService.contactMethods"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={item.value}
                        className="flex items-center gap-2"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(item.value)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, item.value])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== item.value
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel>{item.label}</FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage />
            </FormItem>
          )}
        />
        {contactMethodsSelected.length > 0 && (
          <div className="grid grid-cols-2 gap-4 items-start">
            {contactMethodsSelected.includes("email") && (
              <FormField
                control={form.control}
                name="customerService.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="mybusiness@abc.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {contactMethodsSelected.includes("phone") && (
              <FormField
                control={form.control}
                name="customerService.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (123) 456-7890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {contactMethodsSelected.includes("socialMedia") && (
              <FormField
                control={form.control}
                name="customerService.socialMedia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Social Media*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://mybusiness.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {contactMethodsSelected.includes("whatsapp") && (
              <FormField
                control={form.control}
                name="customerService.whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp*</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+1 (123) 456-7890" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        )}
        <FormField
          control={form.control}
          name="customerService.responseTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Response Time</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g., Within 24 hours, same business day"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <div>
            <h3 className="text-lg font-semibold">
              Common Questions & Answers
            </h3>
            <p className="text-sm text-muted-foreground">
              Add frequently asked questions that your chatbot should know how
              to answer.
            </p>
          </div>
          <FormField
            control={form.control}
            name="customerService.newQuestion.question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Question</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="e.g., What is your return policy?"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="customerService.newQuestion.answer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Answer</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="e.g., Our return policy is 30 days from the date of purchase."
                    className="resize-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button
            type="button"
            onClick={addNewQuestion}
            className="cursor-pointer"
          >
            Add Question
          </Button>
          {fields.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Added Questions</h3>
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={index} className="border rounded-md p-4 relative">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 cursor-pointer"
                      onClick={() => remove(index)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                    <div className="space-y-2">
                      <h4 className="font-medium">{item.question}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

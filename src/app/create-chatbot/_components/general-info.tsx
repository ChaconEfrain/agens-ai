import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useFieldArray } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Info, X } from "lucide-react";
import { WizardStepProps } from "@/types/form-wizard";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function GeneralInfo({ form }: WizardStepProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const { append, fields, remove } = useFieldArray({
    control: form.control,
    name: "generalInfo.allowedWebsites",
  });

  const addWebsite = () => {
    const website = form.getValues("generalInfo.website");
    try {
      new URL(website);
    } catch (error) {
      return;
    }
    const included = fields.some(({ url }) => url === website);

    if (included) {
      form.setError("generalInfo.website", {
        message: "You already included this website",
      });
      return;
    }

    if (website) {
      append({ url: website });
      form.setValue("generalInfo.website", "");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <h2>General Business Information</h2>
        </CardTitle>
        <CardDescription>
          <p>
            Tell us about your business to help create a personalized chatbot.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="generalInfo.businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name*</FormLabel>
              <FormControl>
                <Input placeholder="Enter your business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="generalInfo.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Description*</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Briefly describe your business and its offerings"
                  className="resize-none"
                  spellCheck={false}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col gap-2">
          <FormField
            control={form.control}
            name="generalInfo.website"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Websites that will use the chatbot*
                  <Tooltip>
                    <TooltipTrigger className="text-muted-foreground">
                      <Info className="size-5" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>
                        Make sure to spell the URL correctly, if it doesn't
                        match with your website's URL you won't be able to use
                        your chatbot.
                      </span>
                    </TooltipContent>
                  </Tooltip>
                </FormLabel>
                <div className="flex gap-2 items-center">
                  <FormControl>
                    <Input placeholder="https://yourbusiness.com" {...field} />
                  </FormControl>
                  <Button
                    type="button"
                    onClick={addWebsite}
                    disabled={
                      !!form.getFieldState("generalInfo.website").error ||
                      field.value === ""
                    }
                  >
                    Add website
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          {fields.length > 0 &&
            fields.map(({ url }, i) => (
              <div
                key={url}
                className="bg-muted px-2 py-1 relative rounded w-fit flex items-center justify-center"
              >
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferer"
                  className="text-sm hover:underline"
                >
                  {url}
                </a>
                <button
                  className="absolute cursor-pointer -top-2 -right-2"
                  type="button"
                  onClick={() => remove(i)}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          <FormField
            control={form.control}
            name="generalInfo.allowedWebsites"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="generalInfo.foundedYear"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Year Founded</FormLabel>
              <FormControl>
                <Select {...field} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}

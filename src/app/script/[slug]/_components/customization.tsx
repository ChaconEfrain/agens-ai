"use client"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { LoaderCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ChatbotStyles } from "@/types/embedded-chatbot";
import { updateStylesAction } from "../_actions";
import { toast } from "sonner";
import { cn, sanitizeSvg } from "@/lib/utils";

interface Props {
  styles: ChatbotStyles;
  slug: string;
  updateStyles: (updates: Partial<ChatbotStyles>) => void;
}

export const customizationSchema = z.object({
  position: z.enum(["bottom-right", "bottom-left", "top-right", "top-left"]),
  chat: z.object({
    width: z
      .number()
      .min(100, "Width must be at least 100px")
      .max(1000, "Width must be at most 1000px"),
    height: z
      .number()
      .min(100, "Height must be at least 100px")
      .max(1000, "Height must be at most 1000px"),
    userBgColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    userTextColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    botBgColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    botTextColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    showBranding: z.boolean(),
  }),
  button: z.object({
    width: z
      .number()
      .min(20, "Width must be at least 20px")
      .max(100, "Width must be at most 100px"),
    height: z
      .number()
      .min(20, "Height must be at least 20px")
      .max(50, "Height must be at most 50px"),
    bgColor: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
    icon: z.string().regex(/^<svg[^>]*>(.|\n)*?<\/svg>$/, "Invalid SVG icon"),
    borderRadius: z
      .number()
      .min(0)
      .max(30, "Border radius must be between 0 and 30px"),
  }),
});

export default function Customization({ styles, updateStyles, slug }: Props) {
  const form = useForm<z.infer<typeof customizationSchema>>({
    resolver: zodResolver(customizationSchema),
    defaultValues: styles,
    mode: "onChange",
  });

  const saveStyles = async (formData: z.infer<typeof customizationSchema>) => {
    if (!form.formState.isDirty) return;

    const { success, message } = await updateStylesAction({
      styles: formData,
      slug,
    });

    if (success) {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  return (
    <Card className="h-full row-start-1 col-start-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Customization
        </CardTitle>
        <CardDescription>Customize and preview below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(saveStyles)}
          >
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="position">Position</FormLabel>
                  <FormControl>
                    <Select
                      {...field}
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        updateStyles({
                          position: value as ChatbotStyles["position"],
                        });
                      }}
                    >
                      <SelectTrigger id="position" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bottom-right">
                          Bottom Right
                        </SelectItem>
                        <SelectItem value="bottom-left">Bottom Left</SelectItem>
                        <SelectItem value="top-right">Top Right</SelectItem>
                        <SelectItem value="top-left">Top Left</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 items-start gap-4">
              <FormField
                control={form.control}
                name="chat.width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="width">Chat width (px)</FormLabel>
                    <FormControl>
                      <Input
                        id="width"
                        type="number"
                        value={field.value}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(value);
                          updateStyles({
                            chat: { ...styles.chat, width: value },
                          });
                        }}
                        placeholder="350"
                        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chat.height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="height">Chat height (px)</FormLabel>
                    <FormControl>
                      <Input
                        id="height"
                        type="number"
                        value={field.value}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(value);
                          updateStyles({
                            chat: { ...styles.chat, height: value },
                          });
                        }}
                        placeholder="500"
                        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <FormField
                control={form.control}
                name="chat.userBgColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="userBgColor">User background</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="userBgColor"
                          type="color"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateStyles({
                              chat: {
                                ...styles.chat,
                                userBgColor: e.target.value,
                              },
                            });
                          }}
                          className="w-16 h-10 px-1 border rounded"
                        />
                        <Input
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateStyles({
                              chat: {
                                ...styles.chat,
                                userBgColor: e.target.value,
                              },
                            });
                          }}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chat.userTextColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="userTextColor">User text</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="userTextColor"
                          type="color"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateStyles({
                              chat: {
                                ...styles.chat,
                                userTextColor: e.target.value,
                              },
                            });
                          }}
                          className="w-16 h-10 px-1 border rounded"
                        />
                        <Input
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateStyles({
                              chat: {
                                ...styles.chat,
                                userTextColor: e.target.value,
                              },
                            });
                          }}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <FormField
                control={form.control}
                name="chat.botBgColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="botBgColor">Bot background</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="botBgColor"
                          type="color"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateStyles({
                              chat: {
                                ...styles.chat,
                                botBgColor: e.target.value,
                              },
                            });
                          }}
                          className="w-16 h-10 px-1 border rounded"
                        />
                        <Input
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateStyles({
                              chat: {
                                ...styles.chat,
                                botBgColor: e.target.value,
                              },
                            });
                          }}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chat.botTextColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="botTextColor">Bot text</FormLabel>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <Input
                          id="botTextColor"
                          type="color"
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateStyles({
                              chat: {
                                ...styles.chat,
                                botTextColor: e.target.value,
                              },
                            });
                          }}
                          className="w-16 h-10 px-1 border rounded"
                        />
                        <Input
                          value={field.value}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            updateStyles({
                              chat: {
                                ...styles.chat,
                                botTextColor: e.target.value,
                              },
                            });
                          }}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 items-start gap-4">
              <FormField
                control={form.control}
                name="button.width"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="buttonWidth">Button width</FormLabel>
                    <FormControl>
                      <Input
                        id="buttonWidth"
                        type="number"
                        value={field.value}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(value);
                          updateStyles({
                            button: {
                              ...styles.button,
                              width: value,
                            },
                          });
                        }}
                        placeholder="50"
                        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="button.height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="buttonHeight">Button height</FormLabel>
                    <FormControl>
                      <Input
                        id="buttonHeight"
                        type="number"
                        value={field.value}
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(value);
                          updateStyles({
                            button: {
                              ...styles.button,
                              height: value,
                            },
                          });
                        }}
                        placeholder="50"
                        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="button.bgColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="buttonBgColor">
                    Button background
                  </FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="buttonBgColor"
                        type="color"
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          updateStyles({
                            button: {
                              ...styles.button,
                              bgColor: e.target.value,
                            },
                          });
                        }}
                        className="w-16 h-10 px-1 border rounded"
                      />
                      <Input
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          updateStyles({
                            button: {
                              ...styles.button,
                              bgColor: e.target.value,
                            },
                          });
                        }}
                        placeholder="#000000"
                        className="flex-1"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="button.borderRadius"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="buttonRounded">
                    Button rounded (px)
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        id="buttonRounded"
                        value={field.value}
                        type="number"
                        onChange={(e) => {
                          const value = Number(e.target.value);
                          field.onChange(value);
                          updateStyles({
                            button: {
                              ...styles.button,
                              borderRadius: value,
                            },
                          });
                        }}
                        className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-16"
                      />
                      <Slider
                        defaultValue={[styles.button.borderRadius ?? 0]}
                        value={[styles.button.borderRadius ?? 0]}
                        min={0}
                        max={30}
                        step={1}
                        onValueChange={(value) => {
                          field.onChange(value[0]);
                          updateStyles({
                            button: {
                              ...styles.button,
                              borderRadius: value[0],
                            },
                          });
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="button.icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="buttonIcon">Button icon (SVG)</FormLabel>
                  <FormControl>
                    <Input
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const sanitizedSvg = sanitizeSvg(e.target.value);
                        field.onChange(sanitizedSvg);
                        updateStyles({
                          button: { ...styles.button, icon: sanitizedSvg },
                        });
                      }}
                      placeholder="Copy and paste your SVG icon here"
                      id="buttonIcon"
                      className="flex-1"
                    />
                  </FormControl>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
            <Button
              className={cn("w-full cursor-pointer", {
                "pointer-events-none": form.formState.isSubmitting,
              })}
              disabled={form.formState.isSubmitting || !form.formState.isDirty}
            >
              {form.formState.isSubmitting ? (
                <>
                  Saving Styles <LoaderCircle className="animate-spin" />
                </>
              ) : (
                "Save Styles"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

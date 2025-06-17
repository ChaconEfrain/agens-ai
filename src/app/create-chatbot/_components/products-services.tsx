import React, { useEffect, type ChangeEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useFieldArray } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Trash } from "lucide-react";
import { WizardStepProps } from "@/types/form-wizard";

export default function ProductsAndServices({ form }: WizardStepProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "productsServices.items",
  });

  const watchedValues = form.watch(); // observa todos los campos

  useEffect(() => {
    console.log("Form changed:", watchedValues);
  }, [watchedValues]);

  const type = form.watch("productsServices.type");

  const handleRadioChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (
      e.target.value === "services" &&
      form.getValues("hasPhysicalProducts")
    ) {
      form.setValue("hasPhysicalProducts", false);
    }
  };

  const addNewItem = () => {
    const newItem = form.getValues("productsServices.newItem");

    if (newItem?.name && newItem?.description && newItem?.price) {
      append(newItem);
      form.setValue("productsServices.newItem", {
        name: "",
        description: "",
        price: "",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <h2>Products & Services</h2>
        </CardTitle>
        <CardDescription>
          <p>Tell us about what your business offers to customers.</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="productsServices.type"
          render={({ field }) => (
            <RadioGroup
              {...field}
              onValueChange={field.onChange}
              onChange={handleRadioChange}
            >
              <FormLabel>What does your business offer?*</FormLabel>
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <RadioGroupItem value="products" />
                </FormControl>
                <FormLabel>Products</FormLabel>
              </FormItem>
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <RadioGroupItem value="services" />
                </FormControl>
                <FormLabel>Services</FormLabel>
              </FormItem>
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <RadioGroupItem value="both" />
                </FormControl>
                <FormLabel>Both Products & Services</FormLabel>
              </FormItem>
            </RadioGroup>
          )}
        />
        {type !== "services" && (
          <FormField
            control={form.control}
            name="hasPhysicalProducts"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>
                  We sell physical products that require shipping
                </FormLabel>
              </FormItem>
            )}
          />
        )}
        <div className="flex flex-col gap-4 border rounded-md p-4">
          <h3 className="text-lg font-semibold">
            Add{" "}
            {type === "both"
              ? "Products & Services"
              : `${type.charAt(0).toUpperCase()}${type.slice(1)}`}
          </h3>
          <FormField
            control={form.control}
            name="productsServices.newItem.name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={
                      type === "services" ? "Service name" : "Product name"
                    }
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productsServices.newItem.description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder={
                      type === "services"
                        ? "Describe this service"
                        : "Describe this product"
                    }
                    className="resize-none"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="productsServices.newItem.price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="$0.00 or pricing structure" />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="button" onClick={addNewItem} className="cursor-pointer">
            Add{" "}
            {type === "both"
              ? "Product/Service"
              : type.charAt(0).toUpperCase() + type.slice(1, -1)}
          </Button>
          {fields.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium">Added Items</h3>
              <div className="space-y-4">
                {fields.map((item, index) => (
                  <div key={item.id} className="border rounded-md p-4 relative">
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
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <p className="text-sm">Price: {item.price}</p>
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

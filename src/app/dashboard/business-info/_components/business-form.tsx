"use client";

import CustomerService from "@/app/create-chatbot/_components/customer-service";
import DocumentsStep from "@/app/create-chatbot/_components/documents";
import {
  formSchema,
  FormWizardData,
} from "@/app/create-chatbot/_components/form-wizard";
import GeneralInfo from "@/app/create-chatbot/_components/general-info";
import ProductsAndServices from "@/app/create-chatbot/_components/products-services";
import ShippingLogistics from "@/app/create-chatbot/_components/shipping-logistics";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Business, Chatbot, Subscription } from "@/db/schema";
import { Prettify } from "@/types/helpers";
import { zodResolver } from "@hookform/resolvers/zod";
import { SaveIcon } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateBusinessAction } from "../_actions";

interface Props {
  businessData: Business;
  userSub: Prettify<Subscription & { chatbots: Chatbot[] }> | undefined;
}

export default function BusinessForm({ businessData, userSub }: Props) {
  const form = useForm<FormWizardData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      generalInfo: {
        website: "",
        businessName: businessData.name,
        description: businessData.description,
        allowedWebsites: businessData.allowedWebsites.map((website) => ({
          url: website,
        })),
        foundedYear: businessData.foundedYear ?? '',
      },
      customerService: {
        email: businessData.email ?? '',
        phone: businessData.phone ?? '',
        whatsapp: businessData.whatsapp ?? '',
        socialMedia: businessData.socialMedia ?? '',
        commonQuestions: businessData.commonQuestions ?? [],
        contactMethods: businessData.contactMethods ?? [],
        responseTime: businessData.responseTime ?? '',
        supportHours: businessData.supportHours ?? '',
        newQuestion: {
          question: '',
          answer: '',
        }
      },
      productsServices: {
        items: businessData.items ?? [],
        type: businessData.productsOrServices,
        newItem: {
          name: '',
          description: '',
          price: '',
        }
      },
      hasPhysicalProducts: !!businessData.hasPhysicalProducts,
      shippingLogistics: {
        deliveryTimeframes: businessData.deliveryTimeframes ?? '',
        internationalShipping: !!businessData.internationalShipping,
        returnPolicy: businessData.returnPolicy ?? '',
        shippingMethods: businessData.shippingMethods ?? '',
        shippingRestrictions: businessData.shippingRestrictions ?? '',
      },
      documents: []
    },
    mode: "onChange",
  });

  const onSubmit = async (formData: FormWizardData) => {
    const result = await updateBusinessAction({
      form: formData,
      businessId: businessData.id,
    });

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-2 gap-4"
      >
        <GeneralInfo form={form} />
        <ShippingLogistics form={form} />
        <ProductsAndServices form={form} className="col-span-full" />
        <CustomerService form={form} className="col-span-full" />
        <DocumentsStep
          form={form}
          userSub={userSub}
          className="col-span-full"
        />
        <Button
          className="col-span-full flex items-center"
          disabled={
            form.formState.isSubmitting ||
            JSON.stringify(form.getValues()) ===
              JSON.stringify(form.formState.defaultValues)
          }
        >
          <SaveIcon /> Save Changes
        </Button>
      </form>
    </Form>
  );
}

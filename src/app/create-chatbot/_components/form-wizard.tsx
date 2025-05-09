'use client'

import React, { useState } from 'react'
import GeneralInfo from './general-info'
import { Bot, Box, ChevronLeft, ChevronRight, FileIcon, Info, ListChecks, Smile, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form } from '@/components/ui/form'
import { useForm, UseFormReturn } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import ProductsAndServices from "./products-services";
import CustomerService from "./customer-service";

export interface BusinessData {
  generalInfo: {
    businessName: string;
    description: string;
    website: string;
    foundedYear: string;
  };
  productsServices: {
    type: "products" | "services" | "both";
    items: {
      name: string;
      description: string;
      price: string;
    }[];
    newItem: {
      name: string;
      description: string;
      price: string;
    };
  };
  hasPhysicalProducts: boolean;
  shippingLogistics: {
    shippingMethods: string[];
    deliveryTimeframes: string;
    returnPolicy: string;
    internationalShipping: boolean;
    shippingRestrictions: string;
  };
  customerService: {
    supportHours: string;
    contactMethods: string[];
    responseTime: string;
    commonQuestions: {
      question: string;
      answer: string;
    }[];
    newQuestion: {
      question: string;
      answer: string;
    };
    email: string;
    phone: string;
    socialMedia: string;
    whatsapp: string;
  };
  chatbotConfig: {
    objective: string;
    tone: "formal" | "casual" | "friendly" | "professional";
    style: string;
    personality: string;
  };
  documents: File[];
}

const initialData: BusinessData = {
  generalInfo: {
    businessName: "",
    description: "",
    website: "",
    foundedYear: "",
  },
  productsServices: {
    type: "both",
    items: [],
    newItem: {
      name: "",
      description: "",
      price: "",
    },
  },
  hasPhysicalProducts: false,
  shippingLogistics: {
    shippingMethods: [],
    deliveryTimeframes: "",
    returnPolicy: "",
    internationalShipping: false,
    shippingRestrictions: "",
  },
  customerService: {
    supportHours: "",
    contactMethods: [],
    responseTime: "",
    commonQuestions: [],
    newQuestion: {
      question: "",
      answer: "",
    },
    email: "",
    phone: "",
    socialMedia: "",
    whatsapp: "",
  },
  chatbotConfig: {
    objective: "",
    tone: "professional",
    style: "",
    personality: "",
  },
  documents: [],
};

export const formSchema = z.object({
  generalInfo: z.object({
    businessName: z.string().min(1, "Business name is required"),
    description: z.string().min(1, "Description is required"),
    website: z.string().url("Invalid URL").or(z.literal("")).optional(),
    foundedYear: z.string().optional(),
  }),
  productsServices: z.object({
    type: z.enum(["products", "services", "both"]),
    items: z
      .array(
        z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
        })
      )
      .optional(),
    newItem: z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
      })
      .optional(),
  }),
  hasPhysicalProducts: z.boolean(),
  shippingLogistics: z
    .object({
      shippingMethods: z.array(z.string()).optional(),
      deliveryTimeframes: z.string().optional(),
      returnPolicy: z.string().optional(),
      internationalShipping: z.boolean(),
      shippingRestrictions: z.string().optional(),
    })
    .optional(),
  customerService: z.object({
    supportHours: z.string().min(1, "Support hours are required"),
    contactMethods: z
      .array(z.string())
      .refine((value) => value.some((item) => item), {
        message: "You have to select at least one item.",
      }),
    email: z.string().email("Invalid email").or(z.literal("")).optional(),
    phone: z.string().optional(),
    socialMedia: z.string().url("Invalid URL").or(z.literal("")).optional(),
    whatsapp: z.string().optional(),
    responseTime: z.string().optional(),
    commonQuestions: z.array(
      z.object({
        question: z.string().optional(),
        answer: z.string().optional(),
      })
    ),
    newQuestion: z.object({
      question: z.string().optional(),
      answer: z.string().optional(),
    }),
  }),
  chatbotConfig: z.object({
    objective: z.string().min(1, "Objective is required"),
    tone: z.enum(["formal", "casual", "friendly", "professional"]),
    style: z.string().optional(),
    personality: z.string().optional(),
  }),
  documents: z.array(z.instanceof(File)).optional(),
});

export default function FormWizard() {
  const [currentStep, setCurrentStep] = useState(2);
  const [businessData, setBusinessData] = useState<BusinessData>(initialData);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const steps = [
    {
      label: "General Information",
      Icon: <Info />,
    },
    {
      label: "Products & Services",
      Icon: <Box />,
    },
    ...(form.watch("productsServices.type") !== "services" &&
    form.watch("hasPhysicalProducts")
      ? [
          {
            label: "Shipping & Logistics",
            Icon: <Truck />,
          },
        ]
      : []),
    {
      label: "Customer Service",
      Icon: <Smile />,
    },
    {
      label: "Chatbot Configuration",
      Icon: <Bot />,
    },
    {
      label: "Aditional Documents",
      Icon: <FileIcon />,
    },
    {
      label: "Summary",
      Icon: <ListChecks />,
    },
  ];

  const handleNextStep = () => {
    // form.trigger("generalInfo").then((isValid) => {
    //   if (isValid) {
    setCurrentStep(currentStep + 1);
    // }
    // });
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Configure your chatbot</h1>
      <div>
        <div className="flex justify-between items-center mb-4 gap-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={cn(
                "flex flex-col items-center antialiased bg-white z-10",
                {
                  "text-muted-foreground": index !== currentStep,
                  "text-primary font-bold": index === currentStep,
                  "self-start": step.label === "Summary",
                }
              )}
            >
              <div className="flex items-center justify-center w-8 h-8">
                {step.Icon}
              </div>
              <span className="text-center text-sm">{step.label}</span>
            </div>
          ))}
        </div>
        <Progress
          value={((currentStep + 1) / steps.length) * 100}
          className="w-full"
        />
      </div>
      <Form {...form}>
        <form action="">
          <FormWizardStep step={currentStep} form={form} />
        </form>
      </Form>
      <div className="flex justify-between items-center mt-4">
        <Button
          variant="secondary"
          className="cursor-pointer"
          onClick={handlePreviousStep}
          disabled={currentStep === 0}
        >
          <ChevronLeft />
          Previous
        </Button>
        <Button className="cursor-pointer" onClick={handleNextStep}>
          {currentStep === steps.length - 1 ? "Finish" : "Next"}
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

interface FormWizardStepProps {
  step: number;
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

function FormWizardStep({ step, form }: FormWizardStepProps) {
  const baseStepIndex = form.getValues("hasPhysicalProducts")
    ? step
    : step >= 3
    ? step + 1
    : step;

  switch (baseStepIndex) {
    case 0:
      return <GeneralInfo form={form} />;
    case 1:
      return <ProductsAndServices form={form} />;
    case 2:
      return <CustomerService form={form} />;
    case 3:
      return <div>Step 4: Customer Service</div>;
    case 4:
      return <div>Step 5: Chatbot Configuration</div>;
    case 5:
      return <div>Step 6: Upload Documents</div>;
    case 6:
      return <div>Step 7: Summary</div>;
    default:
      return null;
  }
}

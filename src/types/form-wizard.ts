import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { UseFormReturn } from "react-hook-form";
import { Prettify } from "./helpers";
import { Chatbot, Subscription } from "@/db/schema";

export interface WizardStepProps {
  form: UseFormReturn<FormWizardData>;
  className?: string;
  userSub?: Prettify<Subscription & { chatbots: Chatbot[] }> | undefined;
}

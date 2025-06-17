import { FormWizardData } from "@/app/create-chatbot/_components/form-wizard";
import { FormWizardProgress } from "@/db/schema";
import { UseFormReturn } from "react-hook-form";

export interface WizardStepProps {
  form: UseFormReturn<FormWizardData>;
}
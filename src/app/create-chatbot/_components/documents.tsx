import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DragAndDrop from "@/components/drag-and-drop";
import { WizardStepProps } from "@/types/form-wizard";
import { ALLOWED_PDF } from "@/consts/subscription";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DocumentsStep({
  form,
  userSub,
  className,
}: WizardStepProps) {
  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );

    const currentDocuments = form.getValues("documents") ?? [];

    if (
      (userSub?.plan === "free" &&
        ((form.getValues("documents")?.length ?? 0) >= ALLOWED_PDF["FREE"] ||
          validFiles.length > ALLOWED_PDF["FREE"])) ||
      (userSub?.plan === "basic" &&
        ((form.getValues("documents")?.length ?? 0) >= ALLOWED_PDF["BASIC"] ||
          validFiles.length > ALLOWED_PDF["BASIC"]))
    ) {
      toast.error(() => {
        return (
          <div className="flex items-center">
            <p>
              Your current subscription plan only allows{" "}
              {ALLOWED_PDF[userSub.plan.toUpperCase() as "FREE" | "BASIC"]} PDF
              upload
            </p>
            <Button asChild size="sm">
              <Link href="/pricing">Manage plan</Link>
            </Button>
          </div>
        );
      });
      return;
    }

    form.setValue("documents", [...currentDocuments, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    const currentDocuments = form.getValues("documents") || [];
    const updatedDocuments = currentDocuments.filter((_, i) => i !== index);
    form.setValue("documents", updatedDocuments);
  };

  const documents = form.watch("documents");

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <h2>Additional Documents</h2>
        </CardTitle>
        <CardDescription>
          <p>
            If you have documents with business information, upload them to
            increase your chatbot's knowledge.
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DragAndDrop
          handleFilesCallback={handleFiles}
          documents={documents ?? []}
          removeDocumentsCallback={removeDocument}
        />
        <div className="bg-muted/50 rounded-md p-4">
          <h3 className="font-medium mb-2">What to include?</h3>
          <ul className="text-sm space-y-1 list-disc pl-5">
            <li>Product catalogs or service descriptions</li>
            <li>Company policies (returns, privacy, terms of service)</li>
            <li>Pricing guides or rate cards</li>
            <li>Frequently asked questions documents</li>
            <li>Training materials or knowledge base articles</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

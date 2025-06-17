import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import DragAndDrop from "@/components/drag-and-drop";
import { WizardStepProps } from "@/types/form-wizard";

export default function DocumentsStep({ form }: WizardStepProps) {
  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(
      (file) => file.type === "application/pdf"
    );

    const currentDocuments = form.getValues("documents") ?? [];

    form.setValue("documents", [...currentDocuments, ...validFiles]);
  };

  const removeDocument = (index: number) => {
    const currentDocuments = form.getValues("documents") || [];
    const updatedDocuments = currentDocuments.filter((_, i) => i !== index);
    form.setValue("documents", updatedDocuments);
  };

  const documents = form.watch("documents");

  useEffect(() => {
    console.log("documents --> ", documents);
  }, [documents]);

  return (
    <Card>
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

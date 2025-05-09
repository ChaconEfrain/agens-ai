import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash, Upload } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { formSchema } from "./form-wizard";
import { z } from "zod";

interface DocumentsProps {
  form: UseFormReturn<z.infer<typeof formSchema>>;
}

export default function DocumentsStep({ form }: DocumentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const validFiles = Array.from(files).filter(
      (file) =>
        file.type === "application/pdf"
    );

    const currentDocuments = form.getValues("documents") ?? [];

    form.setValue("documents", [...currentDocuments, ...validFiles]);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  const removeDocument = (index: number) => {
    const currentDocuments = form.getValues("documents") || [];
    const updatedDocuments = currentDocuments.filter((_, i) => i !== index);
    form.setValue("documents", updatedDocuments);
  };

  const documents = form.watch('documents');

  useEffect(() => {
    console.log('documents --> ', documents)
  }, [documents])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          <h2>Additional Documents</h2>
        </CardTitle>
        <CardDescription>
          <p>If you have documents with business information, upload them to increase your chatbot's knowledge.</p>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center ${
            dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleChange}
            accept=".pdf"
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="rounded-full bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium">Drag and drop files or click to upload</p>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF (max 10MB per file)
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              Select Files
            </Button>
          </div>
        </div>

        {(documents ?? []).length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Uploaded Documents</h3>
            <div className="space-y-3">
              {documents?.map((doc, index) => (
                <div key={index} className="flex items-center justify-between border rounded-md p-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[200px] md:max-w-[300px]">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  <Button type='button' variant="ghost" size="icon" onClick={() => removeDocument(index)} className="cursor-pointer">
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

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
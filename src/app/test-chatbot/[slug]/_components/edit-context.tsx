'use client'

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DragAndDrop from "@/components/drag-and-drop";
import { updateChatbotFilesAction } from "../_actions";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

interface Props {
  chatbotId: number;
  businessId: number;
}

export default function EditContext({ chatbotId, businessId }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const handleFiles = (files: FileList) => {
    setFiles((prev) => [...prev, ...Array.from(files)]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setLoading(true);
    const result = await updateChatbotFilesAction({
      files,
      chatbotId,
      businessId,
    });

    if (result?.success) {
      toast.success(result.message);
      setFiles([]);
    } else {
      toast.error(result?.message);
    }

    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload files</CardTitle>
        <CardDescription>
          Upload files to extend your chatbot's context
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-scroll [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-accent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground">
        <DragAndDrop
          documents={files}
          handleFilesCallback={handleFiles}
          removeDocumentsCallback={removeFile}
        />
      </CardContent>
      <CardFooter>
        <Button
          className="w-full cursor-pointer"
          onClick={handleUpload}
          disabled={files.length === 0 || loading}
        >
          {loading ? (
            <>
              Uploading <LoaderCircle className="animate-spin" />
            </>
          ) : (
            "Upload"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

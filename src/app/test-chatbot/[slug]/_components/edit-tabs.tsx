'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import DragAndDrop from '@/components/drag-and-drop';
import { updateChatbotFilesAction } from "../_actions";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

interface Props {
  chatbotId: number;
  businessId: number;
}

export default function EditTabs({ chatbotId, businessId }: Props) {
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
    <Tabs defaultValue="form">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="form">Form</TabsTrigger>
        <TabsTrigger value="files">Files</TabsTrigger>
      </TabsList>
      {/* TODO: Allow user to input more context manually via form */}
      <TabsContent value="form">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Pedro Duarte" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@peduarte" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="files">
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
      </TabsContent>
    </Tabs>
  );
}

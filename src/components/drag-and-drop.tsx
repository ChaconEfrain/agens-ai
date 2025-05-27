'use client'

import { FileText, Trash, Upload } from 'lucide-react';
import React, { useRef, useState } from 'react'
import { Button } from './ui/button';

interface Props {
  handleFilesCallback: (files: FileList) => void;
  removeDocumentsCallback: (index: number) => void;
  documents: File[]
}

export default function DragAndDrop({ handleFilesCallback, documents, removeDocumentsCallback }: Props) {
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
      handleFilesCallback(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFilesCallback(e.target.files);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " bytes";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(1) + " MB";
  };

  return (
    <>
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
              Supported formats: PDF (max 8MB per file)
            </p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
            Select Files
          </Button>
        </div>
      </div>
      {documents.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-medium">Uploaded Documents</h3>
          <div className="space-y-3">
            {documents.map((doc, index) => (
              <div
                key={doc.name + doc.size}
                className="flex items-center justify-between border rounded-md p-3"
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium truncate max-w-[200px] md:max-w-[300px]">
                      {doc.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeDocumentsCallback(index)}
                  className="cursor-pointer"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

"use client";

import { useFormContext } from "react-hook-form";
import { UploadCloud, File as FileIcon, X } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  name: string;
  label: string;
}

// Function to format bytes into a readable string (KB, MB, etc.)
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const FileUpload = ({ name, label }: FileUploadProps) => {
  const form = useFormContext();
  const file = form.watch(name);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      // We only want to handle one file
      if (acceptedFiles.length > 0) {
        form.setValue(name, acceptedFiles[0], { shouldValidate: true });
      }
    },
    [form, name]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: false,
  });

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {file ? (
              // --- View after file is selected ---
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <FileIcon className="h-6 w-6 text-gray-500" />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{file.name}</span>
                    <span className="text-xs text-gray-400">
                      {formatBytes(file.size)}
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => form.setValue(name, null, { shouldValidate: true })}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              // --- Dropzone view ---
              <div
                {...getRootProps()}
                className={cn(
                  "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center",
                  isDragActive ? "border-primary bg-primary/10" : "border-gray-300"
                )}
              >
                <input {...getInputProps()} />
                <UploadCloud className="h-10 w-10 text-gray-400" />
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400">PDF, DOC, DOCX (Max 5MB)</p>
              </div>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
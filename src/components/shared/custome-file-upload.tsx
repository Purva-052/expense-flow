"use client";

import { useFormContext } from "react-hook-form";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
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
  onFileSelect?: (file: File) => Promise<void>;
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const FileUpload = ({ name, label, onFileSelect }: FileUploadProps) => {
  const form = useFormContext();
  const file = form.watch(name);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];

        // Clear any previous errors
        setUploadError(null);

        // Set the file in form immediately
        form.setValue(name, selectedFile, { shouldValidate: true });

        // If onFileSelect callback is provided, call it (for upload)
        if (onFileSelect) {
          setIsUploading(true);
          try {
            await onFileSelect(selectedFile);
          } catch (error: any) {
            // Handle upload error
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to upload file";
            setUploadError(errorMessage);

            // Clear the file from form if upload failed
            form.setValue(name, null, { shouldValidate: true });
          } finally {
            setIsUploading(false);
          }
        }
      }
    },
    [form, name, onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
    multiple: false,
    disabled: isUploading,
  });

  const handleRemove = () => {
    form.setValue(name, null, { shouldValidate: true });
    setUploadError(null);
  };

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
              <div className="space-y-2">
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <FileIcon className="h-6 w-6 text-gray-500" />
                    )}
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{file.name}</span>
                      <span className="text-xs text-gray-400">
                        {formatBytes(file.size)}
                        {isUploading && " - Uploading..."}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}
              </div>
            ) : (
              // --- Dropzone view ---
              <div>
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-gray-300",
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <input {...getInputProps()} />
                  {isUploading ? (
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  ) : (
                    <UploadCloud className="h-10 w-10 text-gray-400" />
                  )}
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500 mt-2">{uploadError}</p>
                )}
              </div>
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

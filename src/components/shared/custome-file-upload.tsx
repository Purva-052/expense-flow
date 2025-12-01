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
  // FormMessage,
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

  // 1. Form state se errors nikalein
  const { formState } = form;

  // 2. Error detection logic
  // Hum check kar rahe hain:
  // - Direct field error (e.g. "resume")
  // - OR agar field "resume" hai, toh "resumeS3Key" ka error bhi check karein (kyunki schema wahan validation laga raha hai)
  const fieldError =
    formState.errors[name] ||
    (name === "resume" ? formState.errors.resumeS3Key : undefined);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const selectedFile = acceptedFiles[0];
        setUploadError(null);

        // Error clear karein jab user file drop kare
        form.clearErrors(name);
        if (name === "resume") form.clearErrors("resumeS3Key");

        form.setValue(name, selectedFile, { shouldValidate: true });

        if (onFileSelect) {
          setIsUploading(true);
          try {
            await onFileSelect(selectedFile);
          } catch (error: any) {
            const errorMessage =
              error?.response?.data?.message ||
              error?.message ||
              "Failed to upload file";
            setUploadError(errorMessage);
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
    // Remove par key bhi hatana zaroori hai
    if (name === "resume")
      form.setValue("resumeS3Key", "", { shouldValidate: true });
    setUploadError(null);
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={() => (
        <FormItem>
          {/* Label color bhi Red karein agar error hai */}
          <FormLabel className={fieldError ? "text-red-500" : ""}>
            {label}
          </FormLabel>
          <FormControl>
            {file ? (
              // --- View after file is selected ---
              <div className="space-y-2">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-md border p-3",
                    // Error hone par Red border, nahi toh normal logic
                    fieldError ? "border-red-500 bg-red-50" : "border-gray-200"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="h-6 w-6 text-primary animate-spin" />
                    ) : (
                      <FileIcon
                        className={cn(
                          "h-6 w-6",
                          fieldError ? "text-red-500" : "text-gray-500"
                        )}
                      />
                    )}
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "font-medium text-sm",
                          fieldError ? "text-red-700" : ""
                        )}
                      >
                        {file.name}
                      </span>
                      <span
                        className={cn(
                          "text-xs",
                          fieldError ? "text-red-400" : "text-gray-400"
                        )}
                      >
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
                {/* Custom Upload Error (Network fail etc) */}
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
                    // Priority Logic:
                    // 1. Drag Active -> Primary Color
                    // 2. Error -> Red Color & Red Background
                    // 3. Default -> Gray Color
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : fieldError
                        ? "border-red-500 bg-red-50 hover:bg-red-100/50" // Red Style
                        : "border-gray-300 hover:bg-gray-50", // Default Style
                    isUploading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <input {...getInputProps()} />
                  {isUploading ? (
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                  ) : (
                    <UploadCloud
                      className={cn(
                        "h-10 w-10",
                        fieldError ? "text-red-500" : "text-gray-400"
                      )}
                    />
                  )}
                  <p className="text-sm text-muted-foreground">
                    <span
                      className={cn(
                        "font-semibold",
                        fieldError ? "text-red-600" : "text-primary"
                      )}
                    >
                      Click to upload
                    </span>{" "}
                    or drag and drop
                  </p>
                  <p
                    className={cn(
                      "text-xs",
                      fieldError ? "text-red-400" : "text-gray-400"
                    )}
                  >
                    PDF, DOC, DOCX (Max 5MB)
                  </p>
                </div>
                {/* Zod Validation Error Message */}
                {(fieldError || uploadError) && (
                  <p className="text-sm text-red-500 mt-2 font-medium">
                    {String(fieldError?.message || uploadError)}
                  </p>
                )}
              </div>
            )}
          </FormControl>
        </FormItem>
      )}
    />
  );
};

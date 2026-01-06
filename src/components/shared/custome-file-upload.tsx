"use client";

import { useFormContext } from "react-hook-form";
import { UploadCloud, File as FileIcon, X, Loader2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone, FileRejection } from "react-dropzone";

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
  fileLabel?: string;
  onFileSelect?: (file: File) => Promise<void>;
  onFileRemove?: () => void; // Callback when file is removed
  existingFileUrl?: string; // URL or S3 key of existing file
  existingFileName?: string; // Optional display name for existing file
  acceptedFormats?: Record<string, string[]>; // Custom accepted file formats
}

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export const FileUpload = ({
  name,
  label,
  fileLabel,
  onFileSelect,
  onFileRemove,
  existingFileUrl,
  existingFileName,
  acceptedFormats,
}: FileUploadProps) => {
  const form = useFormContext();
  const file = form.watch(name);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form state se errors nikalein
  const { formState } = form;

  // Error detection logic
  const fieldError =
    formState.errors[name] ||
    (name === "resume" ? formState.errors.resumeS3Key : undefined);

  // Default accept formats - for PDFs, DOCs, DOCXs
  const defaultFormats = {
    "application/pdf": [".pdf"],
    "application/msword": [".doc"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
  };

  const accept = acceptedFormats || defaultFormats;

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

  const onDropRejected = useCallback(
    (rejectedFiles: FileRejection[]) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        const firstRejection = rejectedFiles[0];
        const err = firstRejection.errors && firstRejection.errors[0];

        // Build a short, friendly message
        const getAllowedExts = (acceptObj: Record<string, string[]>) => {
          try {
            const all = Object.values(acceptObj).flat();
            const uniq = Array.from(
              new Set(all.map((e) => e.replace(/^\./, "").toUpperCase()))
            );
            return uniq;
          } catch (e) {
            return [] as string[];
          }
        };

        const code = err?.code;
        let message = err?.message || "File not supported";

        if (code === "file-too-large") {
          message = "File is too large";
        } else if (code === "file-invalid-type") {
          const allowed = getAllowedExts(accept);
          if (allowed.length > 0) {
            message = `Only ${allowed.join(", ")} files allowed`;
          } else {
            message = "File format not supported";
          }
        } else if (err?.message) {
          // Fallback to the underlying message but keep it short
          message = err.message;
        }

        setUploadError(message);

        // Set form-level error so the UI shows validation message
        form.setError(name, {
          type: "manual",
          message,
        });
        if (name === "resume") {
          form.setError("resumeS3Key", {
            type: "manual",
            message,
          });
        }
      }
    },
    [form, name, accept]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept,
    multiple: false,
    disabled: isUploading,
  });

  const handleRemove = () => {
    // Clear form values
    form.setValue(name, null, { shouldValidate: true });
    if (name === "resume") {
      form.setValue("resumeS3Key", "", { shouldValidate: true });
    }

    // Clear errors
    form.clearErrors(name);
    if (name === "resume") {
      form.clearErrors("resumeS3Key");
    }

    setUploadError(null);

    // Notify parent component that file was removed
    if (onFileRemove) {
      onFileRemove();
    }
  };

  // Check if we have an existing file (when no new file is selected)
  const hasExistingFile = !file && existingFileUrl;
  const displayFileName = existingFileName || "Uploaded Resume";

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
              // --- View after NEW file is selected ---
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
                {/* Zod Validation Error Message */}
                {fieldError && (
                  <p className="text-sm text-red-500 font-medium">
                    {String(fieldError?.message)}
                  </p>
                )}
                {/* Custom Upload Error (Network fail etc) */}
                {uploadError && (
                  <p className="text-sm text-red-500">{uploadError}</p>
                )}
              </div>
            ) : hasExistingFile ? (
              // --- View for EXISTING file (edit mode) ---
              <div className="space-y-2">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-md border p-3",
                    fieldError
                      ? "border-red-500 bg-red-50"
                      : "border-green-100 bg-green-50"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <FileIcon
                      className={cn(
                        "h-6 w-6",
                        fieldError ? "text-red-500" : "text-green-600"
                      )}
                    />
                    <div className="flex flex-col">
                      <span
                        className={cn(
                          "font-medium text-sm",
                          fieldError ? "text-red-700" : "text-green-700"
                        )}
                      >
                        {displayFileName}
                      </span>
                      <a
                        href={existingFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        View/Download
                      </a>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600"
                    onClick={handleRemove}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {/* Zod Validation Error Message */}
                {fieldError && (
                  <p className="text-sm text-red-500 font-medium">
                    {String(fieldError?.message)}
                  </p>
                )}
              </div>
            ) : (
              // --- Dropzone view (no file) ---
              <div>
                <div
                  {...getRootProps()}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : fieldError
                        ? "border-red-500 bg-red-50 hover:bg-red-100/50"
                        : "border-gray-300 hover:bg-gray-50",
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
                    {fileLabel}
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

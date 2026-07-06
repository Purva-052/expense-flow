/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { HRPolicySchema, THRPolicySchema } from "../schema";
import { Input } from "@/components/ui/input";
import { FileUpload } from "@/components/shared/custome-file-upload";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: THRPolicySchema) => void;
}

export function HRPolicyActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<THRPolicySchema>({
    resolver: zodResolver(HRPolicySchema) as any,
    defaultValues: {
      title: currentRow?.title ?? "",
      fileS3Key: currentRow?.fileS3Key ?? "",
      file: null,
    },
  });

  const watchedFile = useWatch({
    control: form.control,
    name: "file",
  });

  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (watchedFile instanceof File) {
      const url = URL.createObjectURL(watchedFile);
      setLocalPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLocalPreviewUrl(null);
    }
  }, [watchedFile]);

  useEffect(() => {
    if (open) {
      form.reset({
        title: currentRow?.title ?? "",
        fileS3Key: currentRow?.fileS3Key ?? "",
        file: null,
      });
      setLocalPreviewUrl(null);
    }
  }, [open, currentRow, form]);

  const handleFileRemove = () => {
    form.setValue("file", null, { shouldValidate: true });
    form.setValue("fileS3Key", "", { shouldValidate: true });
    form.clearErrors("file");
    form.clearErrors("fileS3Key");
    setLocalPreviewUrl(null);
  };

  const onSubmit: SubmitHandler<THRPolicySchema> = (values) => {
    onSubmitValues(values);
  };

  const previewUrl = localPreviewUrl || (form.watch("fileS3Key") ? currentRow?.fileUrl : null);

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="text-left">
          <DialogTitle>
            {isEdit ? "Edit HR Policy" : "Add HR Policy"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 py-1 space-y-4">
          <Form {...form}>
            <form
              id="hr-policy-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Policy Title <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Policy Title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>
                  PDF Document <span className="text-red-500">*</span>
                </FormLabel>
                <FileUpload
                  name="file"
                  label=""
                  fileLabel="Only PDF documents are allowed (Max 10MB)"
                  onFileRemove={handleFileRemove}
                  existingFileUrl={form.watch("fileS3Key") ? currentRow?.fileUrl : undefined}
                  existingFileName={currentRow?.title ? `${currentRow.title}.pdf` : undefined}
                  acceptedFormats={{
                    "application/pdf": [".pdf"],
                  }}
                />
              </div>

              {previewUrl && (
                <div className="mt-4 space-y-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Document Preview
                  </span>
                  <div className="border border-border rounded-lg overflow-hidden h-[300px] w-full bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
                    <iframe
                      src={`${previewUrl}#toolbar=0`}
                      className="w-full h-full border-0"
                      title="PDF Preview"
                    />
                  </div>
                </div>
              )}
            </form>
          </Form>
        </div>

        <DialogFooter className="pt-4 border-t border-border">
          <CustomButton
            type="submit"
            loading={loading}
            form="hr-policy-form"
          >
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

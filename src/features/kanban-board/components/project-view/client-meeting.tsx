import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useForm, Controller } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/shared/custom-button";
import { z } from "zod";

// Schema validation
const ClientMeetingSchema = z.object({
  dateTime: z.string().min(1, "Date and time is required"),
  description: z.string().min(1, "Description is required"),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
});

type TClientMeetingSchema = z.infer<typeof ClientMeetingSchema>;

interface ClientMeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: TClientMeetingSchema) => void;
  loading?: boolean;
  currentData?: TClientMeetingSchema;
  title?: string;
  description?: string;
}

export function ClientMeetingDialog({
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading = false,
  currentData,
  title = "Client Meeting Details",
  description = "Description or Discussion Points",
}: ClientMeetingDialogProps) {
  const [editorReady, setEditorReady] = useState(false);

  const form = useForm<TClientMeetingSchema>({
    resolver: zodResolver(ClientMeetingSchema),
    defaultValues: {
      dateTime: currentData?.dateTime ?? "",
      description: currentData?.description ?? "",
      link: currentData?.link ?? "",
    },
  });

  const onSubmit = (values: TClientMeetingSchema) => {
    onSubmitValues(values);
    form.reset();
  };

  const handleDialogOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      form.reset();
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent className="max-h-screen max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Date & Time Field */}
            <FormField
              control={form.control}
              name="dateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      disabled={loading}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field with CKEditor */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{description}</FormLabel>
                  <FormControl>
                    <div className="rounded-md border border-input bg-background">
                      <CKEditor
                        editor={ClassicEditor}
                        data={field.value}
                        onChange={(event, editor) => {
                          const data = editor.getData();
                          field.onChange(data);
                        }}
                        onReady={() => {
                          setEditorReady(true);
                        }}
                        disabled={loading || !editorReady}
                        config={{
                          toolbar: [
                            "heading",
                            "|",
                            "bold",
                            "italic",
                            "link",
                            "|",
                            "bulletedList",
                            "numberedList",
                            "todoList",
                            "|",
                            "blockQuote",
                            "codeBlock",
                            "|",
                            "undo",
                            "redo",
                          ],
                          heading: {
                            options: [
                              {
                                model: "paragraph",
                                title: "Paragraph",
                                class: "ck-heading_paragraph",
                              },
                              {
                                model: "heading1",
                                view: "h1",
                                title: "Heading 1",
                                class: "ck-heading_heading1",
                              },
                              {
                                model: "heading2",
                                view: "h2",
                                title: "Heading 2",
                                class: "ck-heading_heading2",
                              },
                            ],
                          },
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Link Field */}
            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      {...field}
                      disabled={loading}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dialog Footer */}
            <DialogFooter>
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => handleDialogOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </CustomButton>
              <CustomButton
                type="submit"
                disabled={loading}
                isLoading={loading}
              >
                {loading ? "Saving..." : "Save Meeting"}
              </CustomButton>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

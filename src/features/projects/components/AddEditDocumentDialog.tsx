/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { _documentListSchema, TProjectDocumentSchema } from "../schema";
import { useProjectDocumentStore } from "../stores/useProjectDocumentStore";
import {
  useCreateProjectDocument,
  useUpdateProjectsDocument,
} from "../services";
import { useEffect } from "react";

export default function AddEditDocumentDialog({ ProjectId }: any) {
  const { open, setOpen, currentRow } = useProjectDocumentStore();

  const {
    mutateAsync: createProjectDocument,
    isPending: isCreateDocumentLoading,
  } = useCreateProjectDocument();
  const {
    mutateAsync: updateProjectDocument,
    isPending: isUpdateDocumentLoading,
  } = useUpdateProjectsDocument(currentRow?.id);
  const isEdit = !!currentRow;

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TProjectDocumentSchema>({
    resolver: zodResolver(_documentListSchema),
    defaultValues: {
      documents: [
        {
          documentName: "",
          notes: "",
          link: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "documents",
  });

  const handleFormSubmit = async (data: any) => {
    if (isEdit) {
      const payload = {
        documentName: data?.documents?.[0]?.documentName,
        notes: data?.documents?.[0]?.notes,
        link: data?.documents?.[0]?.link,
        projectId: ProjectId,
      };
      await updateProjectDocument(payload);
    } else {
      const payload = { documents: data?.documents, projectId: ProjectId };
      await createProjectDocument(payload);
    }
  };
  const onCloseModal = () => {
    setOpen(false);
    reset({
      documents: [
        {
          documentName: "",
          notes: "",
          link: "",
        },
      ],
    });
  };

  useEffect(() => {
    if (open === "edit" && currentRow) {
      reset({
        documents: [
          {
            documentName: currentRow.documentName ?? "",
            notes: currentRow.notes ?? "",
            link: currentRow.link ?? "",
          },
        ],
      });
    }

    if (open === "add") {
      reset({
        documents: [
          {
            documentName: "",
            notes: "",
            link: "",
          },
        ],
      });
    }
  }, [open, currentRow, reset]);

  return (
    <Dialog
      open={open === "add" || open === "edit" ? true : false}
      onOpenChange={onCloseModal}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Documents" : "Add Documents"}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="w-full overflow-hidden"
        >
          <div className="overflow-y-auto overflow-x-hidden max-h-[60vh] space-y-6 py-2 mb-3 w-full">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="border rounded-lg p-4 space-y-3 relative w-full min-w-0"
              >
                {/* Document Number Header */}
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-semibold text-sm">
                    Document {index + 1}
                  </h3>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </div>

                {/* Document Name */}
                <div className="w-full min-w-0">
                  <label className="text-sm font-medium">Name</label>
                  <Controller
                    name={`documents.${index}.documentName`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        placeholder="Enter document name..."
                        {...field}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.documents?.[index]?.documentName?.message && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.documents[index]?.documentName?.message}
                    </p>
                  )}
                </div>

                {/* Notes */}
                <div className="w-full min-w-0">
                  <label className="text-sm font-medium">Notes</label>
                  <Controller
                    name={`documents.${index}.notes`}
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        placeholder="Enter notes..."
                        rows={3}
                        {...field}
                        className="w-full"
                      />
                    )}
                  />
                </div>

                {/* Link */}
                <div className="w-full min-w-0">
                  <label className="text-sm font-medium">Link</label>
                  <Controller
                    name={`documents.${index}.link`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        type="url"
                        placeholder="https://example.com"
                        {...field}
                        className="w-full"
                      />
                    )}
                  />
                  {errors.documents?.[index]?.link && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.documents[index]?.link?.message}
                    </p>
                  )}
                </div>

                {/* Object-level error (Either Notes or Link) */}
                {errors.documents?.[index]?.message && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.documents[index]?.message}
                  </p>
                )}
              </div>
            ))}
          </div>

          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ documentName: "", notes: "", link: "" })}
              className="w-full flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Add Another Document
            </Button>
          )}

          {/* Submit & Cancel */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreateDocumentLoading || isUpdateDocumentLoading}
            >
              {isCreateDocumentLoading || isUpdateDocumentLoading
                ? "Saving..."
                : fields?.length > 1
                  ? "Save All"
                  : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

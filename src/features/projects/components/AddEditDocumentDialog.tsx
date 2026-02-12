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

  const handleFormSubmit = async (data: TProjectDocumentSchema) => {
    if (isEdit) {
      const payload = {
        documentName: data.documents[0].documentName,
        notes: data.documents[0].notes,
        link: data.documents[0].link,
        projectId: ProjectId,
      };
      await updateProjectDocument(payload);
    } else {
      await createProjectDocument({
        documents: data.documents,
        projectId: ProjectId,
      });
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
      open={open === "add" || open === "edit"}
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
          <div className="max-h-[60vh] overflow-y-auto space-y-6 py-2 mb-3">
            {fields.map((field, index) => {
              const objectError = errors.documents?.[index]?.message;

              return (
                <div
                  key={field.id}
                  className={`border rounded-lg p-4 space-y-3 relative ${
                    objectError ? "border-red-300 bg-red-50/30" : ""
                  }`}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-semibold">
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
                  <div>
                    <label className="text-sm font-medium">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name={`documents.${index}.documentName`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter document name..."
                        />
                      )}
                    />
                    {errors.documents?.[index]?.documentName && (
                      <p className="text-xs text-red-500 mt-1">
                        {
                          errors.documents[index]?.documentName
                            ?.message as string
                        }
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="text-sm font-medium">Notes</label>
                    <Textarea
                      placeholder="Enter notes..."
                      rows={3}
                      {...control.register(`documents.${index}.notes` as const)}
                    />
                  </div>

                  {/* Link */}
                  <div>
                    <label className="text-sm font-medium">
                      Link <span className="text-red-500">*</span>
                    </label>
                    <Controller
                      name={`documents.${index}.link`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          type="url"
                          placeholder="https://example.com"
                        />
                      )}
                    />
                    {errors.documents?.[index]?.link && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.documents[index]?.link?.message as string}
                      </p>
                    )}
                  </div>

                  {/* Object-level error */}
                  {objectError && (
                    <div className="mt-2 rounded-md border border-red-200 bg-red-50 px-3 py-2">
                      <p className="text-xs text-red-600">{objectError}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {!isEdit && (
            <Button
              type="button"
              variant="outline"
              className="w-full flex gap-2"
              onClick={() => append({ documentName: "", notes: "", link: "" })}
            >
              <Plus className="w-4 h-4" />
              Add Another Document
            </Button>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" type="button" onClick={onCloseModal}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreateDocumentLoading || isUpdateDocumentLoading}
            >
              {isCreateDocumentLoading || isUpdateDocumentLoading
                ? "Saving..."
                : fields.length > 1
                  ? "Save All"
                  : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

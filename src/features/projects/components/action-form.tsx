/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { TextInputField } from "@/components/shared/custom-input-field";
import { projectFormSchema, TProjectFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { roles } from "@/utils/constant";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TProjectFormSchema) => void;
  clientsList?: { id: number; name: string }[];
  clientListLoading?: boolean;
  projecthandler?: any;
  projecthandlerLoading?: boolean;
  projectTypes?: any;
  projectTypesLoading?: boolean;
  technologyList?: any;
  technologyListLoading?: boolean;
  userRole?: string;
}

export function ProjectActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
  clientsList,
  clientListLoading,
  projecthandler,
  projecthandlerLoading,
  projectTypes,
  projectTypesLoading,
  technologyList,
  technologyListLoading,
  userRole,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const canManageDocuments =
    userRole === roles.ADMIN || userRole === roles.PROJECT_MANAGER;

  const schema = isEdit
    ? projectFormSchema.omit({ status: true })
    : projectFormSchema;

  const form = useForm<TProjectFormSchema>({
    resolver: zodResolver(schema) as any,
    defaultValues: isEdit
      ? {
          name: currentRow.name ?? "",
          description: currentRow.description ?? "",
          clientId: currentRow.clientId ?? null,
          technologyId: currentRow.technologyId ?? null,
          startDate: currentRow.startDate ?? "",
          expectedCompletionDate: currentRow.expectedCompletionDate ?? "",
          handlerId: currentRow.projectHandler?.id ?? 0,
          percentageComplete: currentRow.percentageComplete ?? 0,
          priority: currentRow.priority ?? "",
          status: currentRow.status,
          projectTypeId: currentRow.projectTypeId ?? undefined,
          projectDocuments: currentRow.projectDocuments ?? [],
        }
      : {
          name: "",
          description: "",
          clientId: null,
          technologyId: null,
          startDate: "",
          expectedCompletionDate: "",
          handlerId: undefined,
          percentageComplete: 0,
          priority: "",
          status: undefined,
          projectTypeId: undefined,
          projectDocuments: [
            {
              link: "",
              note: "",
            },
          ],
        },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "projectDocuments",
  });

  const onSubmit: SubmitHandler<TProjectFormSchema> = (values) => {
    onSubmitValues(values);
  };

  return (
    <Dialog
      open={open}
      modal
      onOpenChange={(state) => {
        form.reset();
        onOpenChange(state);
      }}
    >
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Project" : "Add Project"}</DialogTitle>
        </DialogHeader>
        <div className="h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="project-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              {/* Project Name */}
              <TextInputField
                control={form.control}
                name="name"
                label="Project Name"
                placeholder="Enter project name"
              />

              {/* Description */}
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Enter project description"
                  rows={3}
                  className="resize-none"
                />
              </div>

              {!isEdit && (
                <CustomDropDownSearchable
                  form={form}
                  name="status"
                  label="Status"
                  options={[
                    { value: "active-discovery", label: "Active Discovery" },
                    { value: "running", label: "Running" },
                    { value: "slow", label: "Slow" },
                    { value: "stop", label: "Stop" },
                    { value: "completed", label: "Completed" },
                  ]}
                  placeholder="Select Status"
                  searchEnabled={false}
                />
              )}

              {/* Dropdowns */}
              <CustomDropDownSearchable
                form={form}
                name="clientId"
                label="Client"
                options={clientsList?.map((client) => ({
                  value: client.id,
                  label: client.name,
                }))}
                isLoading={clientListLoading}
                placeholder="Select Client"
              />
              <CustomDropDownSearchable
                form={form}
                name="projectTypeId"
                label="Project Type"
                options={projectTypes?.map((type: any) => ({
                  value: type.id,
                  label: type.name,
                }))}
                isLoading={projectTypesLoading}
                placeholder="Select Project Type"
              />
              <CustomDropDownSearchable
                form={form}
                name="technologyId"
                label="Project Technologies"
                options={technologyList?.data?.map((t: any) => ({
                  value: t.id,
                  label: t.name,
                }))}
                isLoading={technologyListLoading}
                placeholder="Select Technologies"
                multiple
              />
              <CustomDropDownSearchable
                form={form}
                name="handlerId"
                label="Project Coordinator"
                options={projecthandler?.data?.map((h: any) => ({
                  value: h.id,
                  label: h.fullName,
                }))}
                isLoading={projecthandlerLoading}
                placeholder="Select Coordinator"
              />

              {/* Dates */}
              <CustomDatePicker
                control={form.control}
                name="startDate"
                label="Start Date"
              />
              <CustomDatePicker
                control={form.control}
                name="expectedCompletionDate"
                label="Expected Completion Date"
              />

              {/* Progress */}
              <TextInputField
                control={form.control}
                name="percentageComplete"
                type="number"
                label="Progress (%)"
                min={0}
                max={100}
                placeholder="Enter progress percentage"
                valueAsNumber
              />

              {/* Priority */}
              <CustomDropDownSearchable
                form={form}
                name="priority"
                label="Priority"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
                placeholder="Select Priority"
                searchEnabled={false}
              />

              {canManageDocuments && (
                <div className="mt-4 space-y-2 border-t pt-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-gray-700">
                      Project Documents
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => append({ link: "", note: "" })}
                      className="flex items-center gap-1"
                    >
                      <PlusCircle className="h-4 w-4" /> Add
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex gap-3 items-center border p-3 rounded-lg"
                    >
                      <div className=" flex-1 gap-2 flex flex-col">
                        <div className="">
                          <TextInputField
                            control={form.control}
                            name={`projectDocuments.${index}.link`}
                            label="Link"
                            placeholder="Enter document link"
                          />
                        </div>
                        <div className="flex flex-col space-y-1">
                          <label className="text-sm font-medium text-gray-700">
                            Note
                          </label>
                          <Textarea
                            {...form.register(
                              `projectDocuments.${index}.note` as const
                            )}
                            placeholder="Enter note"
                            rows={3}
                            className="resize-none"
                          />
                        </div>
                      </div>

                      <div className="col-span-1 flex justify-end  pt-6">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <CustomButton type="submit" form="project-form" loading={loading}>
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

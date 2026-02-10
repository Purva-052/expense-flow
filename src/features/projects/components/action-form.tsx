/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm } from "react-hook-form";
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
import {
  projectFormSchema,
  projectFormSchemaWithoutRefine,
  TProjectFormSchema,
} from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { Textarea } from "@/components/ui/textarea";

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
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const schema = isEdit
    ? projectFormSchemaWithoutRefine.omit({ status: true }).refine(
        (data) => {
          // Only validate if both dates are present
          if (!data.startDate || !data.expectedCompletionDate) return true;

          const startDate = new Date(data.startDate);
          const expectedDate = new Date(data.expectedCompletionDate);

          return expectedDate >= startDate;
        },
        {
          message: "Expected completion date cannot be before start date",
          path: ["expectedCompletionDate"],
        }
      ) // use base schema without status, then apply date validation
    : projectFormSchema; // use full schema with date validation when adding

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
          handlerId: currentRow.projectHandler?.id ?? undefined,
          percentageComplete: currentRow.percentageComplete ?? 0,
          priority: currentRow.priority ?? "",
          status: currentRow.status,
          projectTypeId: currentRow.projectTypeId ?? undefined,
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
        },
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
        <div className="h-fit w-full py-1">
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

              {/* Project Description */}

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

              {/* Client Dropdown */}
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
                searchEnabled={false}
                isLoading={projectTypesLoading}
                placeholder="Select Project Type"
              />
              <CustomDropDownSearchable
                form={form}
                name="technologyId"
                label="Project Technologies"
                options={technologyList?.data?.map((technology: any) => {
                  return { value: technology.id, label: technology.name };
                })}
                isLoading={technologyListLoading}
                placeholder="Select Technologies"
                multiple
              />
              {/* Manager */}
              <CustomDropDownSearchable
                form={form}
                name="handlerId"
                label="Project Coordinator"
                options={projecthandler?.data?.map((handler: any) => ({
                  value: handler.id,
                  label: handler.fullName,
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
                minDate={form.watch("startDate")}
              />

              {/* Progress */}
              {/* <TextInputField
                control={form.control}
                name="percentageComplete"
                type="number"
                label="Progress (%)"
                min={0}
                max={100}
                placeholder="Enter progress percentage"
                valueAsNumber
              /> */}

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
                {/* {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )} */}
              </div>
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

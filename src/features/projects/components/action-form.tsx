/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, SubmitHandler, useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";

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
          startDate: currentRow?.startDate
            ? new Date(currentRow.startDate)
            : undefined,

          expectedCompletionDate: currentRow?.expectedCompletionDate
            ? new Date(currentRow.expectedCompletionDate)
            : undefined,
          handlerId: currentRow.projectHandler?.id ?? undefined,
          percentageComplete: currentRow.percentageComplete ?? 0,
          priority: currentRow.priority ?? "",
          status: currentRow.status,
          projectTypeId: currentRow.projectTypeId ?? undefined,
          isVisibleToAllDevTeam: currentRow.isVisibleToAllDevTeam ?? false,
          isVisibleToAllBdeTeam: currentRow.isVisibleToAllBdeTeam ?? false,
        }
      : {
          name: "",
          description: "",
          clientId: null,
          technologyId: null,
          startDate: undefined,
          expectedCompletionDate: undefined,
          handlerId: undefined,
          percentageComplete: 0,
          priority: "",
          status: undefined,
          projectTypeId: undefined,
          isVisibleToAllDevTeam: false,
          isVisibleToAllBdeTeam: false,
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
              className="space-y-6"
            >
              {/* Basic Info */}
              <div className="space-y-4">
                <TextInputField
                  control={form.control}
                  name="name"
                  label="Project Name"
                  placeholder="Enter project name"
                />
              </div>

              {/* Status (only Add) */}
              {!isEdit && (
                <CustomDropDownSearchable
                  form={form}
                  name="status"
                  label="Project Status"
                  options={[
                    { value: "active-discovery", label: "Active Discovery" },
                    { value: "running", label: "Running" },
                    { value: "slow", label: "Slow" },
                    { value: "stop", label: "Stopped" },
                    { value: "completed", label: "Completed" },
                  ]}
                  searchEnabled={false}
                  placeholder="Select status"
                />
              )}

              {/* Relations */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <CustomDropDownSearchable
                  form={form}
                  name="clientId"
                  label="Client"
                  options={clientsList?.map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  isLoading={clientListLoading}
                  placeholder="Select client"
                />

                <CustomDropDownSearchable
                  form={form}
                  name="projectTypeId"
                  label="Project Type"
                  options={projectTypes?.map((t: any) => ({
                    value: t.id,
                    label: t.name,
                  }))}
                  isLoading={projectTypesLoading}
                  searchEnabled={false}
                  placeholder="Select type"
                />
              </div>

              <CustomDropDownSearchable
                form={form}
                name="technologyId"
                label="Technologies"
                options={technologyList?.data?.map((t: any) => ({
                  value: t.id,
                  label: t.name,
                }))}
                isLoading={technologyListLoading}
                placeholder="Select technologies"
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
                placeholder="Select coordinator"
              />

              <CustomDropDownSearchable
                form={form}
                name="priority"
                label="Priority"
                options={[
                  { value: "low", label: "Low" },
                  { value: "medium", label: "Medium" },
                  { value: "high", label: "High" },
                ]}
                searchEnabled={false}
                placeholder="Select priority"
              />

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <Textarea
                  {...form.register("description")}
                  placeholder="Brief project overview"
                  rows={3}
                  className="resize-none"
                />
              </div>

              {/* Global Switch */}
              <Controller
                control={form.control}
                name="isVisibleToAllDevTeam"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">Global Project</p>
                      <p className="text-xs text-muted-foreground">
                        Accessible across all roles and members
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />

              <Controller
                control={form.control}
                name="isVisibleToAllBdeTeam"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium">BDE Team</p>
                      <p className="text-xs text-muted-foreground">
                        Accessible across BDE team
                      </p>
                    </div>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </div>
                )}
              />
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

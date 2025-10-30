/* eslint-disable no-console */
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
import { projectFormSchema, TProjectFormSchema } from "../schema";
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
}: Readonly<Props>) {
  console.log(
    "🚀 ~ ProjectActionForm ~ projecthandlerLoading:",
    projecthandlerLoading
  );

  console.log("🚀 ~ ProjectActionForm ~ projecthandler:", projecthandler);

  const isEdit = !!currentRow;

  const form = useForm<TProjectFormSchema>({
    resolver: zodResolver(projectFormSchema) as any,
    defaultValues: isEdit
      ? {
          name: currentRow.name ?? "",
          description: currentRow.description ?? "",
          clientId: currentRow.clientId ?? 0,
          startDate: currentRow.startDate ?? "",
          expectedCompletionDate: currentRow.expectedCompletionDate ?? "",
          handlerId: currentRow.projectHandler?.id ?? 0,
          percentageComplete: currentRow.percentageComplete ?? 0,
          priority: currentRow.priority ?? "",
        }
      : {
          name: "",
          description: "",
          clientId: null,
          startDate: "",
          expectedCompletionDate: "",
          handlerId: undefined,
          percentageComplete: 0,
          priority: "",
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

              {/* Project Description */}
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

              {/* Manager */}
              <CustomDropDownSearchable
                form={form}
                name="handlerId"
                label="Project Handler"
                options={projecthandler?.data?.map((handler: any) => ({
                  value: handler.id,
                  label: handler.fullName,
                }))}
                isLoading={projecthandlerLoading}
                placeholder="Select Handler"
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

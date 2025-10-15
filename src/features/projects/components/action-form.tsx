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

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TProjectFormSchema) => void;
  clients?: { id: number; name: string }[];
  users?: { id: number; fullName: string }[];
  clientsList?: { id: number; name: string }[];
  clientListLoading?: boolean;
  ManagerListData?: { id: number; fullName: string }[];
  managerListLoading?: boolean;
  teamLeaderListData?: { id: number; fullName: string }[];
  teamLeaderListLoading?: boolean;
}

export function ProjectActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
  clientsList,
  clientListLoading,
  ManagerListData,
  managerListLoading,
  teamLeaderListData,
  teamLeaderListLoading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TProjectFormSchema>({
    resolver: zodResolver(projectFormSchema) as any,
    defaultValues: isEdit
      ? {
          name: currentRow.name ?? "",
          clientId: currentRow.clientId ?? 0,
          startDate: currentRow.startDate ?? "",
          expectedCompletionDate: currentRow.expectedCompletionDate ?? "",
          managerId: currentRow.managerId ?? 0,
          teamLeadId: currentRow.teamLeadId ?? 0,
          percentageComplete: currentRow.percentageComplete ?? 0,
          priority: currentRow.priority ?? "",
        }
      : {
          name: "",
          clientId: 0,
          startDate: "",
          expectedCompletionDate: "",
          managerId: 0,
          teamLeadId: 0,
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
      <DialogContent className="sm:max-w-lg">
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
              <TextInputField
                control={form.control}
                name="name"
                label="Project Name"
                placeholder="Enter project name"
              />
              <CustomDropDownSearchable
                form={form}
                name="clientId"
                label="Client"
                options={clientsList?.map((client) => {
                  return { value: client.id, label: client.name };
                })}
                isLoading={clientListLoading}
                placeholder="Select Client"
              />
              <CustomDropDownSearchable
                form={form}
                name="managerId"
                label="Manager"
                options={ManagerListData?.map((manager) => {
                  return { value: manager.id, label: manager.fullName };
                })}
                isLoading={managerListLoading}
                placeholder="Select Manager"
              />
              <CustomDropDownSearchable
                form={form}
                name="teamLeadId"
                label="Team Leader"
                options={teamLeaderListData?.map((tl) => {
                  return { value: tl.id, label: tl.fullName };
                })}
                isLoading={teamLeaderListLoading}
                placeholder="Select Team Leader"
              />
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
              <TextInputField
                control={form.control}
                name="percentageComplete"
                type="number"
                label="Progress (%)"
                placeholder="Enter progress percentage"
                valueAsNumber
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

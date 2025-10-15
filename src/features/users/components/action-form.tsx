/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm, Controller } from "react-hook-form";
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
import { Checkbox } from "@/components/ui/checkbox";
import { TUserFormSchema, userFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";

interface Props {
  currentRow?: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
  onSubmit: (values: TUserFormSchema) => void;
  projectListLoading?: boolean;
  projectListdata?: { id: number; name: string }[];
  technologyListData?: { id: number; name: string }[];
  technologyListLoading?: boolean;
  roleList?: any;
  roleListLoading?: boolean;
}

export function UserActionForm({
  currentRow,
  open,
  onOpenChange,
  onSubmit: onSubmitValues,
  loading,
  projectListdata,
  projectListLoading,
  technologyListData,
  technologyListLoading,
  roleList,
  roleListLoading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;

  const form = useForm<TUserFormSchema>({
    resolver: zodResolver(userFormSchema) as any,
    defaultValues: isEdit
      ? {
          fullName: currentRow?.fullName ?? "",
          email: currentRow?.email ?? "",
          role: currentRow?.role ?? "",
          technologyId: currentRow?.technology?.id ?? undefined,
          joiningDate: currentRow?.joiningDate
            ? currentRow.joiningDate.slice(0, 10)
            : "",
          status: currentRow?.status === "active",
          currentWorkingProjectId: Array.isArray(
            currentRow?.currentWorkingProjectId
          )
            ? currentRow.currentWorkingProjectId
            : currentRow?.currentWorkingProjectId
              ? [currentRow.currentWorkingProjectId]
              : [],
        }
      : {
          fullName: "",
          email: "",
          role: "",
          technologyId: undefined,
          joiningDate: "",
          status: true,
        },
  });

  const onSubmit: SubmitHandler<TUserFormSchema> = (values: any) => {
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
        <DialogHeader className="text-left">
          <DialogTitle>{isEdit ? "Edit User" : "Add User"}</DialogTitle>
        </DialogHeader>
        <div className="-mr-4 h-fit w-full overflow-y-auto py-1">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4 p-0.5"
            >
              {" "}
              <TextInputField
                control={form.control}
                name="fullName"
                label="Full Name"
                placeholder="Enter full name"
              />{" "}
              <TextInputField
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter email"
                type="email"
              />{" "}
              <CustomDropDownSearchable
                form={form}
                name="role"
                label="Role"
                options={roleList?.data?.map((role: any) => ({
                  value: role,
                  label: role
                    .split("_")
                    .map((word: any) => word[0].toUpperCase() + word.slice(1))
                    .join(" "), // Converts "team_lead" -> "Team Lead"
                }))}
                placeholder="Select role"
                isLoading={roleListLoading}
              />
              <CustomDropDownSearchable
                form={form}
                name="technologyId"
                label="Technology"
                options={technologyListData?.map((technology) => {
                  return { value: technology.id, label: technology.name };
                })}
                isLoading={technologyListLoading}
                placeholder="Select Technology"
              />
              {isEdit && (
                <CustomDropDownSearchable
                  form={form}
                  name="currentWorkingProjectId"
                  label="Current Working Project"
                  options={projectListdata?.map((project) => {
                    return { value: project.id, label: project.name };
                  })}
                  isLoading={projectListLoading}
                  placeholder="Select Project"
                  multiple
                />
              )}
              <CustomDatePicker
                control={form.control}
                name="joiningDate"
                label="Joining Date"
              />
              {/* ✅ Status Checkbox */}{" "}
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <div className="flex items-center space-x-2">
                    {" "}
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />{" "}
                    <label className="text-sm font-medium">Active</label>{" "}
                  </div>
                )}
              />{" "}
            </form>
          </Form>
        </div>
        <DialogFooter>
          <CustomButton type="submit" loading={loading} form="user-form">
            Save Changes
          </CustomButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

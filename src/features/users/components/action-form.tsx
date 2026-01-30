/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, UploadCloud, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { Button } from "@/components/ui/button";
import { TextInputField } from "@/components/shared/custom-input-field";
import { Checkbox } from "@/components/ui/checkbox";
import { addUserSchema, editUserSchema, TUserFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { roles } from "@/utils/constant";
import { FileUpload } from "@/components/shared/custome-file-upload";
import { useState, useEffect } from "react";
import { useUploadTransactionFile } from "../../transaction-logs/services";
// import { Switch } from "@/components/ui/switch";

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
    resolver: zodResolver(isEdit ? editUserSchema : addUserSchema) as any,
    defaultValues: isEdit
      ? {
          fullName: currentRow?.fullName ?? "",
          email: currentRow?.email ?? "",
          role: currentRow?.role ?? "",
          technologyId: currentRow?.technology?.id ?? undefined,
          careerStartDate: currentRow?.careerStartDate
            ? currentRow.careerStartDate.slice(0, 10)
            : "",
          status: currentRow?.status === "active",
          joining: currentRow?.joining ?? false, // ✅ FIXED
          currentWorkingProjectId: currentRow?.currentProject?.id ?? null,
          profilePic: currentRow?.profilePic ?? "",
          file: null,
        }
      : {
          fullName: "",
          email: "",
          role: "",
          technologyId: undefined,
          careerStartDate: "",
          status: true,
          joining: false,
          password: "",
          profilePic: "",
          file: null,
        },
  });

  const [uploadedFileKey, setUploadedFileKey] = useState<string>("");
  const [hasExistingFile, setHasExistingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { mutateAsync: uploadFile } = useUploadTransactionFile();

  const watchedFile = useWatch({
    control: form.control,
    name: "file",
  });

  useEffect(() => {
    if (open && currentRow) {
      form.reset({
        fullName: currentRow?.fullName ?? "",
        email: currentRow?.email ?? "",
        role: currentRow?.role ?? "",
        technologyId: currentRow?.technology?.id ?? undefined,
        careerStartDate: currentRow?.careerStartDate
          ? currentRow.careerStartDate.slice(0, 10)
          : "",
        status: currentRow?.status === "active",
        joining: currentRow?.joining ?? false,
        currentWorkingProjectId: currentRow?.currentProject?.id ?? null,
        profilePic: currentRow?.profilePic ?? "",
        file: null,
      });

      setPreviewUrl(currentRow?.profilePic ?? null);
      setHasExistingFile(!!currentRow?.profilePic);
      setUploadedFileKey(currentRow?.profilePic ?? "");
    }
  }, [open, currentRow]);

  useEffect(() => {
    if (watchedFile instanceof File) {
      const url = URL.createObjectURL(watchedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (!watchedFile && !hasExistingFile) {
      setPreviewUrl(null);
    }
  }, [watchedFile, hasExistingFile]);

  // ✅ Watch the "role" field
  const selectedRole = useWatch({
    control: form.control,
    name: "role",
  });

  const handleFileRemove = () => {
    setUploadedFileKey("");
    setHasExistingFile(false);
    setPreviewUrl(null);

    form.setValue("file", null, { shouldValidate: true });
    form.setValue("profilePic", "", { shouldValidate: true });

    form.clearErrors("file");
    form.clearErrors("profilePic");
  };

  // 🧹 Auto-clear technology when role = "project_manager"
  if (
    selectedRole === roles.PROJECT_MANAGER &&
    form.getValues("technologyId")
  ) {
    form.setValue("technologyId", undefined);
  }

  const onSubmit: SubmitHandler<TUserFormSchema> = async (values: any) => {
    let finalFileKey = uploadedFileKey || values.profilePic || "";

    const fileToUpload = values.file;
    if (fileToUpload instanceof File) {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", "profile-picture");

      try {
        const response: any = await uploadFile(formData);
        if (response?.key) {
          finalFileKey = response.url;
        }
      } catch (error) {
        console.error("Upload failed", error);
        return;
      }
    }

    const payload = {
      ...values,
      profilePic: finalFileKey,
    };
    delete payload.file;

    onSubmitValues(payload);
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
              <div className="flex flex-col items-center gap-4 py-4 border-b border-gray-100 mb-6">
                <FileUpload
                  name="file"
                  label=""
                  onFileRemove={handleFileRemove}
                  hideDefaultUI
                  acceptedFormats={{
                    "image/jpeg": [".jpg", ".jpeg"],
                    "image/png": [".png"],
                  }}
                  className="flex flex-col items-center"
                >
                  <div className="relative group cursor-pointer">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-primary/20 shadow-sm relative transition-all duration-300 group-hover:opacity-90">
                      {previewUrl ? (
                        <img
                          src={previewUrl}
                          alt="Profile preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-100 text-gray-400">
                          <UploadCloud className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 right-0 h-7 w-7 bg-primary rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white group-hover:scale-110 transition-transform duration-200">
                      <Pencil className="h-3.5 w-3.5" />
                    </div>
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-1 -right-1 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileRemove();
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </FileUpload>

                <div className="text-xs text-muted-foreground text-center">
                  Profile picture must be a JPG, JPEG, PNG (MAX 2MB)
                </div>
              </div>

              <TextInputField
                control={form.control}
                name="fullName"
                label="Full Name"
                placeholder="Enter full name"
              />

              <TextInputField
                control={form.control}
                name="email"
                label="Email"
                placeholder="Enter email"
                type="email"
                autoComplete="new-email" // 👈 disables auto-fill
              />

              {!isEdit && (
                <TextInputField
                  control={form.control}
                  name="password"
                  label="Password"
                  placeholder="Enter password"
                  type="password"
                  autoComplete="new-password" // 👈 disables Chrome’s “suggested password”
                />
              )}

              {/* Role Dropdown */}
              <CustomDropDownSearchable
                form={form}
                name="role"
                label="Role"
                options={roleList?.data?.map((role: any) => ({
                  value: role,
                  label: role
                    .split("_")
                    .map((word: any) => word[0].toUpperCase() + word.slice(1))
                    .join(" "),
                }))}
                placeholder="Select role"
                isLoading={roleListLoading}
              />

              {/* Technology Dropdown (disabled for project_manager) */}
              <CustomDropDownSearchable
                form={form}
                name="technologyId"
                label="Technology"
                options={technologyListData?.map((technology) => ({
                  value: technology.id,
                  label: technology.name,
                }))}
                isLoading={technologyListLoading}
                placeholder="Select Technology"
                disabled={
                  selectedRole === roles.PROJECT_MANAGER ||
                  selectedRole === roles.ADMIN
                }
              />

              {isEdit && (
                <CustomDropDownSearchable
                  form={form}
                  name="currentWorkingProjectId"
                  label="Current Working Project"
                  options={projectListdata?.map((project) => ({
                    value: project.id,
                    label: project.name,
                  }))}
                  isLoading={projectListLoading}
                  placeholder="Select Project"
                />
              )}

              <CustomDatePicker
                control={form.control}
                name="careerStartDate"
                label="Career Start Date"
              />

              {/* ✅ Status Checkbox */}
              <div className="flex gap-6">
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label className="text-sm font-medium">Active</label>
                    </div>
                  )}
                />

                {/* <Controller
                  control={form.control}
                  name="joining"
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                      <label className="text-sm font-medium">Joined</label>
                    </div>
                  )}
                /> */}
              </div>
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubmitHandler, useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Pencil, UploadCloud, X } from "lucide-react";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import CustomButton from "@/components/shared/custom-button";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { addUserSchema, editUserSchema, TUserFormSchema } from "../schema";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { roles } from "@/utils/constant";
import { FileUpload } from "@/components/shared/custome-file-upload";
import { useState, useEffect, useRef } from "react";
import { useUploadTransactionFile } from "../../transaction-logs/services";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/use-auth-store";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
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
  // projectListdata,
  // projectListLoading,
  technologyListData,
  technologyListLoading,
  roleList,
  roleListLoading,
}: Readonly<Props>) {
  const isEdit = !!currentRow;
  const formatDateToYMD = (value: unknown): string | null => {
    if (!value) return null;

    if (typeof value === "string") {
      if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

      const parsedDate = new Date(value);
      if (isNaN(parsedDate.getTime())) return null;

      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
      const day = String(parsedDate.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    if (value instanceof Date) {
      if (isNaN(value.getTime())) return null;

      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }

    return null;
  };

  const form = useForm<TUserFormSchema>({
    resolver: zodResolver(isEdit ? editUserSchema : addUserSchema) as any,
    defaultValues: isEdit
      ? {
          fullName: currentRow?.fullName ?? "",
          email: currentRow?.email ?? "",
          role: currentRow?.role ?? "",
          technologyId: currentRow?.technology?.id ?? undefined,
          reportLogAccessIds:
            currentRow?.reportLogAccess?.map((item: any) =>
              String(item.technology.id)
            ) ?? [],
          careerStartDate: currentRow?.careerStartDate
            ? currentRow.careerStartDate.slice(0, 10)
            : "",
          dateOfBirth: currentRow?.dateOfBirth
            ? currentRow.dateOfBirth.slice(0, 10)
            : null,
          status: currentRow?.status === "active",
          joining: currentRow?.joining ?? false, // ✅ FIXED
          // currentWorkingProjectId: currentRow?.currentProject?.id ?? null,
          profilePicS3Key: currentRow?.profilePicUrl ?? "",
          file: null,
        }
      : {
          fullName: "",
          email: "",
          role: "",
          technologyId: undefined,
          reportLogAccessIds: [],
          careerStartDate: "",
          dateOfBirth: null,
          status: true,
          joining: false,
          password: "",
          profilePicS3Key: "",
          file: null,
        },
  });

  const [uploadedFileKey, setUploadedFileKey] = useState<string>("");
  const [hasExistingFile, setHasExistingFile] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const { mutateAsync: uploadFile } = useUploadTransactionFile();

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const cropperRef = useRef<any>(null);
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;

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
        reportLogAccessIds:
          currentRow?.reportLogAccess?.map((item: any) => item.technology.id) ??
          [],
        careerStartDate: currentRow?.careerStartDate
          ? currentRow.careerStartDate.slice(0, 10)
          : "",
        dateOfBirth: currentRow?.dateOfBirth
          ? currentRow.dateOfBirth.slice(0, 10)
          : null,
        status: currentRow?.status === "active",
        joining: currentRow?.joining ?? false,
        // currentWorkingProjectId: currentRow?.currentProject?.id ?? null,
        profilePicS3Key: currentRow?.profilePicUrl ?? "",
        file: null,
      });

      setPreviewUrl(currentRow?.profilePicUrl ?? null);
      setHasExistingFile(!!currentRow?.profilePicUrl);
      setUploadedFileKey(currentRow?.profilePicUrl ?? "");
    }
  }, [open, currentRow]);

  useEffect(() => {
    if (watchedFile instanceof File) {
      const url = URL.createObjectURL(watchedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    if (!watchedFile && !hasExistingFile && !isEdit) {
      setPreviewUrl(null);
    }
  }, [watchedFile, hasExistingFile, isEdit]);

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
    form.setValue("profilePicS3Key", "", { shouldValidate: true });

    form.clearErrors("file");
    form.clearErrors("profilePicS3Key");
  };

  // 🧹 Auto-clear technology when role = "project_manager"
  if (
    selectedRole === roles.PROJECT_MANAGER &&
    form.getValues("technologyId")
  ) {
    form.setValue("technologyId", undefined);
  }

  const onSubmit: SubmitHandler<TUserFormSchema> = async (values: any) => {
    let finalFileKey = uploadedFileKey || values.profilePicS3Key || "";

    const fileToUpload = values.file;
    if (fileToUpload instanceof File) {
      const formData = new FormData();
      formData.append("file", fileToUpload);
      formData.append("folder", "profile-picture");

      try {
        const response: any = await uploadFile(formData);
        if (response?.key) {
          finalFileKey = response.key;
        }
      } catch (error) {
        console.error("Upload failed", error);
        return;
      }
    }

    const payload = {
      ...values,
      dateOfBirth: formatDateToYMD(values.dateOfBirth),
      careerStartDate: formatDateToYMD(values.careerStartDate) || "",
      profilePicS3Key: finalFileKey,
    };
    delete payload.file;

    onSubmitValues(payload);
  };

  const handleCrop = async () => {
    const cropper = cropperRef.current?.cropper;
    if (!cropper) {
      toast.error("Cropper not initialized");
      return;
    }

    try {
      const croppedCanvas = cropper.getCroppedCanvas({
        width: 400,
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: "high",
      });
      if (!croppedCanvas) {
        toast.error("Failed to get cropped canvas");
        return;
      }

      croppedCanvas.toBlob(async (blob: Blob | null) => {
        if (!blob) {
          toast.error("Failed to generate image blob");
          return;
        }

        const croppedFile = new File([blob], "profile-picture.jpg", {
          type: "image/jpeg",
        });

        // Update local preview and form value
        const url = URL.createObjectURL(croppedFile);
        setPreviewUrl(url);

        form.setValue("file", croppedFile, { shouldValidate: true });
        setShowCropDialog(false);
      }, "image/jpeg");
    } catch (err) {
      console.error("Cropping failed", err);
      toast.error("An error occurred while cropping");
    }
  };

  return (
    <>
      <Dialog
        open={open}
        modal
        onOpenChange={(state) => {
          form.reset();
          onOpenChange(state);
        }}
      >
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
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
                    existingFileUrl={previewUrl ?? undefined}
                    name="file"
                    label=""
                    onFileRemove={handleFileRemove}
                    onFileSelect={async (file) => {
                      if (file.size > 2 * 1024 * 1024) {
                        return;
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        setImageToCrop(reader.result as string);
                        setShowCropDialog(true);
                      };
                      reader.readAsDataURL(file);
                    }}
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

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Full Name <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Email <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Enter email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isEdit && (
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Password <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Role Dropdown */}

                <FormField
                  control={form.control}
                  name="role"
                  render={() => (
                    <FormItem>
                      <FormLabel>
                        Role<span className="text-red-500">*</span>
                      </FormLabel>
                      <CustomDropDownSearchable
                        form={form}
                        name="role"
                        label=""
                        options={roleList?.data?.map((role: any) => ({
                          value: role,
                          label: role
                            .split("_")
                            .map(
                              (word: any) =>
                                word[0].toUpperCase() + word.slice(1)
                            )
                            .join(" "),
                        }))}
                        placeholder="Select role"
                        isLoading={roleListLoading}
                      />
                    </FormItem>
                  )}
                />

                {/* Technology Dropdown (disabled for project_manager) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  {userRole !== roles.TEAM_LEAD && (
                    <CustomDropDownSearchable
                      form={form}
                      name="reportLogAccessIds"
                      label="Report Log Access"
                      multiple
                      options={technologyListData?.map((technology) => ({
                        value: String(technology.id), // 👈 safe (string)
                        label: technology.name,
                      }))}
                      placeholder="Select Report Log Access"
                      searchEnabled={true}
                      isLoading={technologyListLoading}
                      className="report-log-access-dropdown"
                      // disabled={selectedRole === roles.TEAM_LEAD}
                    />
                  )}
                </div>

                <CustomDatePicker
                  control={form.control}
                  name="dateOfBirth"
                  label="Date of Birth"
                />

                <FormField
                  control={form.control}
                  name="careerStartDate"
                  render={({ fieldState }) => (
                    <FormItem>
                      <FormLabel
                        className={cn(
                          "flex items-center gap-1",
                          fieldState.error && "text-red-500"
                        )}
                      >
                        Career Start Date
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <CustomDatePicker
                        control={form.control}
                        name="careerStartDate"
                        label=""
                      />
                    </FormItem>
                  )}
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
                </div>
              </form>
            </Form>
          </div>

          <DialogFooter className="pt-4">
            <CustomButton type="submit" loading={loading} form="user-form">
              Save Changes
            </CustomButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showCropDialog} onOpenChange={setShowCropDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Crop Profile Picture</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            {imageToCrop && (
              <Cropper
                src={imageToCrop}
                style={{ height: 400, width: "100%" }}
                initialAspectRatio={1}
                aspectRatio={1}
                guides={true}
                ref={cropperRef}
                viewMode={1}
                dragMode="move"
                background={false}
                responsive={true}
                autoCropArea={1}
                checkOrientation={false}
              />
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setShowCropDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCrop}>Crop</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

/* eslint-disable prefer-const */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCircle2, CalendarClock, Check } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { interviewTypes, interviewStatuses } from "../constants";
import { useCreateInterviewResumeLink } from "../services";
import { FileUpload } from "@/components/shared/custome-file-upload";
import TimePicker from "@/components/shared/custome-timepicker";
import { roles } from "@/utils/constant";
import { useAuthStore } from "@/stores/use-auth-store";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { interviewFormSchema, InterviewFormValues } from "../schema";

const RequiredIndicator = ({ error }: { error?: boolean }) => (
  <span className={cn("ml-0.5", error ? "text-red-500" : "text-red-500")}>
    *
  </span>
);

interface InterviewFormProps {
  selectedDate: Date;
  onSubmit: (data: InterviewFormValues) => void;
  onClose: () => void;
  technologyList: any;
  technologyListLoading: boolean;
  usersList: any;
  usersListLoading: boolean;
  isSubmitting?: boolean;
  initialData?: any;
}

const steps = [
  { id: 1, name: "Candidate Details", icon: UserCircle2 },
  { id: 2, name: "Scheduling", icon: CalendarClock },
];

const step1Fields: (keyof InterviewFormValues)[] = [
  "candidateName",
  "technology",
  "email",
  "phoneNumber",
  "location",
  "link",
  "experience",
  "currentCtc",
  "expectedCtc",
  "noticePeriod",
  "resume",
  "resumeS3Key",
];

export const InterviewForm = ({
  onSubmit,
  onClose,
  technologyList,
  technologyListLoading,
  usersList,
  usersListLoading,
  isSubmitting = false,
  initialData,
}: InterviewFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const user = useAuthStore((state) => state.user);
  const isEditMode = !!initialData;
  const userRole = user?.user?.role;

  const extractTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  };

  // const formatNoticePeriod = (days: number): string => {
  //   return `${days} Days`;
  // };
  const nameInputRef = useRef<HTMLInputElement>(null);
  const baseStatuses = interviewStatuses;
  const ADD_STATUSES = ["technical_round", "practical_round", "hr_round"];
  const EDIT_STATUSES = [...ADD_STATUSES, "rejected", "joining"];

  const filteredStatuses = isEditMode
    ? userRole === roles.ADMIN
      ? baseStatuses
      : baseStatuses.filter((s) => EDIT_STATUSES.includes(s.value))
    : userRole === roles.ADMIN
      ? baseStatuses.filter((s) => s.value !== "joining")
      : baseStatuses.filter((s) => ADD_STATUSES.includes(s.value));

  const activeSchema = useMemo(() => {
    let schema = interviewFormSchema;
    if (isEditMode && userRole === roles.ADMIN) {
      return schema.refine(
        (data) => {
          if (data.interviewStatus !== "joining") return true;
          return !!data.joiningDate;
        },
        {
          message: "Joining Date is required when status is Joining",
          path: ["joiningDate"],
        }
      );
    }
    return schema;
  }, [isEditMode, userRole]);

  console.log("initialData: ", initialData);
  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(activeSchema as any),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: isEditMode
      ? {
          step: 2,
          candidateName: initialData.candidateName || "",
          technology: initialData.technology?.id?.toString() || "",
          email: initialData.email || "",
          phoneNumber: initialData.phoneNumber || "",
          location: initialData.location || "",
          link: initialData.link || "",
          notes: initialData.notes || "",
          interviewerComments: initialData.interviewerComments || "",
          experience: Number(initialData.experienceInYears) || 0,
          currentCtc: Number(initialData.currentCtc) || 0,
          expectedCtc: Number(initialData.expectedCtc) || 0,
          noticePeriod: initialData.noticePeriodInDays || 0,
          interviewerName: initialData.interviewer?.id?.toString() || "",
          startTime: extractTime(initialData.interviewStart),
          endTime: extractTime(initialData.interviewEnd),
          interviewType: initialData.interviewType || "on_site",
          interviewUrl: initialData.interviewUrl || "",
          interviewStatus: initialData.status || "pending",
          resume: null,
          resumeS3Key: initialData.resumeLink || "",
          joiningDate: initialData.joiningDate || "",
        }
      : {
          step: 1,
          candidateName: "",
          technology: "",
          email: "",
          phoneNumber: "",
          location: "",
          link: "",
          notes: "",
          interviewerComments: "",
          experience: 0,
          currentCtc: 0,
          expectedCtc: 0,
          noticePeriod: "",
          interviewerName: "",
          startTime: "10:00",
          endTime: "11:00",
          interviewType: "on_site",
          interviewUrl: "",
          interviewStatus: "",
          resume: null,
          resumeS3Key: "",
          joiningDate: "",
        },
  });

  const { trigger, formState } = form;

  const interviewType = form.watch("interviewType");
  const interviewStatus = form.watch("interviewStatus");
  const startTime = form.watch("startTime");
  const { mutateAsync: uploadResume } = useCreateInterviewResumeLink();

  const hasActualChanges = (): boolean => {
    if (!isEditMode || !form.formState.isDirty) return false;
    return true;
  };

  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
      const endHours = String(endDate.getHours()).padStart(2, "0");
      const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
      form.setValue("endTime", `${endHours}:${endMinutes}`, {
        shouldValidate: false,
      });
    }
  }, [startTime, form]);

  useEffect(() => {
    if (interviewType && currentStep === 2) {
      form.trigger("interviewUrl");
    }
  }, [interviewType, currentStep, form]);

  const handleNextStep = async () => {
    const isValid = await trigger(step1Fields);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const goToPrevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const handleFormSubmit = async (data: InterviewFormValues) => {
    if (isSubmittingForm) return;

    setIsSubmittingForm(true);
    try {
      let finalResumeKey = data.resumeS3Key || "";
      const resumeFile = data.resume;

      if (resumeFile instanceof File) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        formData.append("folder", "interview-resumes");
        const response: any = await uploadResume(formData);
        if (response?.key) {
          finalResumeKey = response.key;
        }
      }

      const submissionData = {
        ...data,
        resumeS3Key: finalResumeKey,
        joiningDate:
          data.joiningDate instanceof Date
            ? data.joiningDate.toISOString()
            : data.joiningDate,
      };
      onSubmit(submissionData);
    } catch (error) {
      console.error("Form submission error", error);
    } finally {
      setIsSubmittingForm(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) =>
          handleFormSubmit({ ...data, step: 2 })
        )}
        className="flex flex-col h-full"
      >
        {!isEditMode && (
          <nav className="flex items-center justify-center mb-4 px-2 shrink-0">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center flex-1 sm:flex-initial"
              >
                <div className="flex flex-col items-center w-full sm:w-auto">
                  <div
                    className={cn(
                      "w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold transition-all text-xs",
                      currentStep > step.id
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.id
                          ? "bg-primary/90 text-primary-foreground border-2 border-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {currentStep > step.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <step.icon className="h-4 w-4" />
                    )}
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-sm text-center px-1 font-medium",
                      currentStep >= step.id
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    <span className="hidden sm:inline">{step.name}</span>
                    <span className="sm:hidden">
                      {step.id === 1 ? "Candidate" : "Schedule"}
                    </span>
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-auto border-t-2 mx-2 sm:mx-4 transition-all hidden sm:block opacity-30" />
                )}
              </div>
            ))}
          </nav>
        )}

        <div className="flex-1 px-1 overflow-y-auto max-h-[65vh] pr-2">
          {/* --- Step 1 / Candidate Details --- */}
          {(currentStep === 1 || isEditMode) && (
            <div className="grid grid-cols-12 gap-x-4 gap-y-3">
              {/* Name & Tech */}
              <div className="col-span-12 md:col-span-6 gap-y-0 ">
                <FormField
                  control={form.control}
                  name="candidateName"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm ">
                        Name <RequiredIndicator error={!!fieldState.error} />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Doe"
                          {...field}
                          ref={nameInputRef}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-6 min-h-0 gap-0">
                <CustomDropDownSearchable
                  form={form}
                  name="technology"
                  label={
                    <span className="text-sm ">
                      Technology <RequiredIndicator />
                    </span>
                  }
                  options={technologyList?.data?.map((technology: any) => ({
                    value: technology.id,
                    label: technology.name,
                  }))}
                  placeholder="Select technology"
                  isLoading={technologyListLoading}
                  // className="min-h-0 gap-0"
                />
              </div>

              {/* Email & Phone */}
              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Email <RequiredIndicator error={!!fieldState.error} />
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="candidate@email.com"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="tel"
                          placeholder="+91 1234567890"
                          maxLength={15}
                          className="h-10"
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^[+0-9()\-\s]*$/.test(value)) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location & Link */}
              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Location</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="City, Country"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="link"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Link</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://portfolio.com"
                          {...field}
                          className="h-10"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Admin Only CTC Fields */}
              {userRole === roles.ADMIN && (
                <>
                  <div className="col-span-12 md:col-span-6">
                    <FormField
                      control={form.control}
                      name="currentCtc"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-sm ">
                            Current CTC
                            <RequiredIndicator error={!!fieldState.error} />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step="0.01"
                              placeholder="10"
                              value={field.value ?? ""}
                              className="h-10"
                              onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key))
                                  e.preventDefault();
                              }}
                              onChange={(e) => {
                                let value = e.target.value;

                                // Remove leading zeros (but allow 0.xx)
                                if (
                                  value.length > 1 &&
                                  value.startsWith("0") &&
                                  !value.startsWith("0.")
                                ) {
                                  value = value.replace(/^0+/, "");
                                }

                                // Allow only up to 3 digits before decimal & 2 after decimal
                                const regex =
                                  /^(?:[1-9]\d{0,2}|0)?(?:\.\d{0,2})?$/;

                                if (regex.test(value)) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="col-span-12 md:col-span-6">
                    <FormField
                      control={form.control}
                      name="expectedCtc"
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel className="text-sm">
                            Expected CTC
                            <RequiredIndicator error={!!fieldState.error} />
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={1}
                              step="0.01"
                              placeholder="10"
                              value={field.value ?? ""}
                              className="h-10"
                              onKeyDown={(e) => {
                                if (["e", "E", "+", "-"].includes(e.key))
                                  e.preventDefault();
                              }}
                              onChange={(e) => {
                                let value = e.target.value;

                                // Remove leading zeros (but allow 0.xx)
                                if (
                                  value.length > 1 &&
                                  value.startsWith("0") &&
                                  !value.startsWith("0.")
                                ) {
                                  value = value.replace(/^0+/, "");
                                }

                                // Allow only up to 3 digits before decimal & 2 after decimal
                                const regex =
                                  /^(?:[1-9]\d{0,2}|0)?(?:\.\d{0,2})?$/;

                                if (regex.test(value)) {
                                  field.onChange(value);
                                }
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </>
              )}

              {/* Stats Row: Experience, Notice Period (CTC if Admin) */}
              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Experience (Yrs)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="5"
                          min={0}
                          step="0.1"
                          value={field.value ?? ""}
                          className="h-10"
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-"].includes(e.key))
                              e.preventDefault();
                          }}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (/^\d{0,2}(\.\d{0,2})?$/.test(value))
                              field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="noticePeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Notice Period (Days)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={365}
                          placeholder="Enter days (e.g., 30)"
                          value={field.value ?? ""}
                          className="h-10"
                          onKeyDown={(e) => {
                            if (["e", "E", "+", "-", "."].includes(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) => {
                            let value = e.target.value;

                            // Remove leading zeros
                            if (value.length > 1 && value.startsWith("0")) {
                              value = value.replace(/^0+/, "");
                            }

                            // Allow max 3 digits only (0–365 safe range)
                            if (/^\d{0,3}$/.test(value)) {
                              field.onChange(value);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12">
                <FormField
                  control={form.control}
                  name="interviewerComments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Remarks</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="Enter remarks regarding the candidate..."
                            maxLength={100}
                            className="w-full max-w-full resize-none break-all whitespace-pre-wrap overflow-y-auto overflow-x-hidden pr-14 pb-6 leading-relaxed min-h-80px"
                            {...field}
                          />
                          <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 pointer-events-none">
                            {field.value?.length || 0}/100
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Resume Upload - Full Width */}
              <div className="col-span-12">
                <FormLabel
                  className={cn(
                    "text-sm flex items-center gap-1 mb-1.5",
                    formState.errors.resume && "text-red-500"
                  )}
                >
                  Resume (CV) <RequiredIndicator />
                </FormLabel>
                <FileUpload
                  name="resume"
                  label=""
                  fileLabel="PDF, DOC, DOCX (Max 5MB)"
                  existingFileUrl={initialData?.resumeLink}
                  existingFileName={`${initialData?.candidateName || "Candidate"} Resume`}
                  acceptedFormats={{
                    "application/pdf": [".pdf"],
                    "application/msword": [".doc"],
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                      [".docx"],
                  }}
                />
              </div>
            </div>
          )}

          {/* --- Step 2 / Interviewer Details --- */}
          {currentStep === 2 && !isEditMode && (
            <div className="grid grid-cols-12 gap-4 ">
              <div className="col-span-12 md:col-span-6">
                <CustomDropDownSearchable
                  form={form}
                  name="interviewerName"
                  label={
                    <span className="text-sm">
                      Interviewer Name <RequiredIndicator />
                    </span>
                  }
                  options={usersList?.data?.map((user: any) => ({
                    value: user.id,
                    label: user.fullName,
                  }))}
                  placeholder="Select interviewer"
                  isLoading={usersListLoading}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">Interview Time</FormLabel>
                      <FormControl>
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Select start time"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-12 md:col-span-6">
                <CustomDropDownSearchable
                  form={form}
                  name="interviewType"
                  label={
                    <span className="text-sm">
                      Interview Type <RequiredIndicator />
                    </span>
                  }
                  options={interviewTypes}
                  placeholder="Select type"
                  searchEnabled={false}
                />
              </div>

              {interviewType === "video_call" && (
                <div className="col-span-12 md:col-span-6">
                  <FormField
                    control={form.control}
                    name="interviewUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">
                          Interview URL{" "}
                          <RequiredIndicator
                            error={!!formState.errors.interviewUrl}
                          />
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://meet.google.com/..."
                            {...field}
                            className="h-10"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="col-span-12 md:col-span-6">
                <CustomDropDownSearchable
                  form={form}
                  name="interviewStatus"
                  label={
                    <span className="text-sm">
                      Interview Status <RequiredIndicator />
                    </span>
                  }
                  options={filteredStatuses}
                  placeholder="Select status"
                  searchEnabled={false}
                  sortOptions={false}
                />
              </div>

              {isEditMode &&
                userRole === roles.ADMIN &&
                interviewStatus === "joining" && (
                  <div className="col-span-12 md:col-span-6">
                    <CustomDatePicker
                      control={form.control}
                      name="joiningDate"
                      label="Joining Date"
                    />
                  </div>
                )}

              <div className="col-span-12">
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm">
                        Interviewer Comment
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Textarea
                            placeholder="Instructions or notes for the interviewer..."
                            maxLength={100}
                            className="w-full max-w-full resize-none break-all whitespace-pre-wrap overflow-y-auto overflow-x-hidden pr-14 pb-6 leading-relaxed min-h-80px"
                            {...field}
                          />
                          <span className="absolute bottom-2 right-3 text-[10px] text-gray-400 pointer-events-none">
                            {field.value?.length || 0}/100
                          </span>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 mt-auto border-t shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1 h-9"
          >
            Cancel
          </Button>
          <div className="flex gap-3 w-full sm:w-auto order-1 sm:order-2">
            {currentStep > 1 && !isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevStep}
                className="flex-1 sm:flex-initial h-9"
              >
                Back
              </Button>
            )}
            {currentStep < steps.length && !isEditMode ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="flex-1 sm:flex-initial h-9"
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                className="flex-1 sm:flex-initial h-9"
                disabled={
                  isSubmitting ||
                  isSubmittingForm ||
                  (isEditMode && !hasActualChanges())
                }
                onClick={async () => {
                  form.setValue("step", 2, { shouldValidate: false });

                  let isValid = false;

                  if (isEditMode) {
                    isValid = await form.trigger([
                      "candidateName",
                      "technology",
                      "email",
                      "phoneNumber",
                      "location",
                      "experience",
                      "currentCtc",
                      "expectedCtc",
                      "noticePeriod",
                      "interviewerName",
                      "interviewType",
                      "interviewStatus",
                      "joiningDate",
                      "notes",
                    ]);
                  } else {
                    isValid = await form.trigger();
                  }

                  if (isValid) {
                    handleFormSubmit(form.getValues());
                  } else {
                    console.log("Validation Failed:", form.formState.errors);
                  }
                }}
              >
                {isEditMode
                  ? isSubmitting || isSubmittingForm
                    ? "Updating..."
                    : "Update Interview"
                  : isSubmitting || isSubmittingForm
                    ? "Scheduling..."
                    : "Schedule Interview"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
};

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserCircle2, CalendarClock, Check } from "lucide-react";

import { InterviewFormValues, interviewFormSchema } from "../schema";
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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// --- Import your custom components and constants ---
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { interviewTypes, interviewStatuses } from "../constants";
import {
  useCreateInterviewResumeLink,
  useCreateInterviewStatusLog,
} from "../services";
import { FileUpload } from "@/components/shared/custome-file-upload";
import TimePicker from "@/components/shared/custome-timepicker";
import { roles } from "@/utils/constant";
import { useAuthStore } from "@/stores/use-auth-store";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";

// Required field indicator component
const RequiredIndicator = ({ error }: { error?: boolean }) => (
  <span className={cn("ml-1", error ? "text-red-500" : "text-red-500")}>*</span>
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
  initialData?: any; // InterviewApiResponse for edit mode
}

const steps = [
  { id: 1, name: "Candidate Details", icon: UserCircle2 },
  { id: 2, name: "Scheduling", icon: CalendarClock },
];

// --- Define fields for each step to enable per-step validation ---
const step1Fields: (keyof InterviewFormValues)[] = [
  "candidateName",
  "technology",
  "email",
  "phoneNumber",
  "location",
  // "candidateLink",
  "experience",
  "currentCtc",
  "expectedCtc",
  "noticePeriod",
  "resume",
  "resumeS3Key",
];
const step2Fields: (keyof InterviewFormValues)[] = [
  "interviewerName",
  // "interviewRound",
  "startTime",
  "endTime",
  "interviewType",
  "interviewUrl",
  "interviewStatus",
  "joiningDate",
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
  const [uploadedResumeKey, setUploadedResumeKey] = useState<string>("");
  const [hasExistingFile, setHasExistingFile] = useState(false);
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

  const formatNoticePeriod = (days: number): string => {
    return `${days} Days`;
  };

  const baseStatuses = interviewStatuses;

  // Step 1: extract values for reuse
  const ADD_STATUSES = [
    "technical_scheduled",
    "practical_scheduled",
    "hr_round",
    "joining",
  ];
  const EDIT_STATUSES = [...ADD_STATUSES, "rejected"]; // add mode + rejected + joining

  // Step 2: final list logic
  const filteredStatuses = isEditMode
    ? userRole === roles.ADMIN
      ? baseStatuses // admin in edit → all statuses
      : baseStatuses.filter((s) => EDIT_STATUSES.includes(s.value))
    : userRole === roles.ADMIN
      ? baseStatuses.filter((s) => s.value !== "joining") // admin on add → all except joining
      : baseStatuses.filter((s) => ADD_STATUSES.includes(s.value));

  // Adjust schema based on edit mode, role, and status
  let activeSchema = interviewFormSchema;
  if (isEditMode && userRole === roles.ADMIN) {
    activeSchema = interviewFormSchema.refine(
      (data) => {
        // Only require joining date if status is "joining"
        if (data.interviewStatus !== "joining") return true;

        const val = data.joiningDate;
        if (val instanceof Date) return true;
        return !!val && typeof val === "string" && val.trim().length > 0;
      },
      {
        message: "Joining Date is required when status is Joining",
        path: ["joiningDate"],
      }
    ) as any;
  }

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(activeSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      candidateName: "",
      technology: "",
      email: "",
      phoneNumber: "",
      location: "",
      // candidateLink: "",
      notes: "",
      experience: 0,
      currentCtc: 0,
      expectedCtc: 0,
      noticePeriod: "",
      interviewerName: "",
      startTime: "10:00",
      endTime: "11:00",
      interviewType: "on_site",
      interviewUrl: "",
      // interviewRound: "",
      // interviewerComment: "",
      interviewStatus: "",
      resume: null,
      resumeS3Key: "",
      joiningDate: "",
    },
  });

  const { trigger, formState } = form;

  useEffect(() => {
    if (initialData && currentStep === 1) {
      form.reset({
        candidateName: initialData.candidateName || "",
        technology: initialData.technology?.id?.toString() || "",
        email: initialData.email || "",
        phoneNumber: initialData.phoneNumber || "",
        location: initialData.location || "",
        // candidateLink: initialData.candidateLink || "",
        notes: initialData.notes || "",
        experience: Number(initialData.experienceInYears) || 0,
        currentCtc: Number(initialData.currentCtc) || 0,
        expectedCtc: Number(initialData.expectedCtc) || 0,
        noticePeriod: formatNoticePeriod(initialData.noticePeriodInDays || 0),
        interviewerName: initialData.interviewer?.id?.toString() || "",
        startTime: extractTime(initialData.interviewStart),
        endTime: extractTime(initialData.interviewEnd),
        interviewType: initialData.interviewType || "on_site",
        interviewUrl: initialData.interviewUrl || "",
        // interviewRound: initialData.interviewRound || "",
        // interviewerComment: initialData.interviewerComments || "",
        interviewStatus: initialData.status || "pending",
        resume: null,
        resumeS3Key: initialData.resumeLink || "",
        joiningDate: initialData.joiningDate || "",
      });
      setUploadedResumeKey(initialData.resumeLink || "");
      setHasExistingFile(!!initialData.resumeLink);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, currentStep]);
  const interviewType = form.watch("interviewType");
  const interviewStatus = form.watch("interviewStatus");
  const startTime = form.watch("startTime");
  const { mutateAsync: uploadResume } = useCreateInterviewResumeLink();
  const { mutateAsync: createStatusLog } = useCreateInterviewStatusLog();
  const isEdit = !!initialData;

  const initialValues = form.formState.defaultValues;
  const currentValues = form.watch();

  // Function to check if there are actual meaningful changes (ignoring whitespace)
  const hasActualChanges = (): boolean => {
    if (!isEdit || !initialValues || !currentValues) return false;

    return Object.keys(currentValues).some((key) => {
      const initialVal = initialValues[key as keyof InterviewFormValues];
      const currentVal = currentValues[key as keyof InterviewFormValues];

      // Handle string fields - trim whitespace before comparison
      if (typeof initialVal === "string" && typeof currentVal === "string") {
        return initialVal.trim() !== currentVal.trim();
      }

      // Handle file fields - compare by reference or existence
      if (key === "resume") {
        return (initialVal instanceof File || initialVal !== null) !==
          (currentVal instanceof File || currentVal !== null)
          ? true
          : false;
      }

      // For other types (numbers, dates, etc.), direct comparison
      return initialVal !== currentVal;
    });
  };
  // Automatically set endTime to startTime + 30 minutes
  useEffect(() => {
    if (startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const startDate = new Date();
      startDate.setHours(hours, minutes, 0, 0);

      // Add 30 minutes
      const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

      const endHours = String(endDate.getHours()).padStart(2, "0");
      const endMinutes = String(endDate.getMinutes()).padStart(2, "0");
      const calculatedEndTime = `${endHours}:${endMinutes}`;

      form.setValue("endTime", calculatedEndTime, { shouldValidate: false });
    }
  }, [startTime, form]);

  // Re-validate interviewUrl when interviewType changes (only if we're on step 2)
  useEffect(() => {
    if (interviewType && currentStep === 2) {
      form.trigger("interviewUrl");
    }
  }, [interviewType, currentStep, form]);

  // Reset submission state on unmount
  useEffect(() => {
    return () => {
      setIsSubmittingForm(false);
    };
  }, []);

  const handleResumeRemove = () => {
    // Clear all resume-related state
    setUploadedResumeKey("");
    setHasExistingFile(false);

    // Clear form values
    form.setValue("resume", null, { shouldValidate: true });
    form.setValue("resumeS3Key", "", { shouldValidate: true });

    // Clear any errors
    form.clearErrors("resume");
    form.clearErrors("resumeS3Key");
  };

  const handleNextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (currentStep === 1) {
      const isValid = await trigger(step1Fields, { shouldFocus: true });

      // Manual validation for resume
      const resumeFile = form.getValues("resume");
      const resumeKey = form.getValues("resumeS3Key");

      if (!resumeFile && !resumeKey) {
        form.setError("resume", {
          type: "manual",
          message: "Resume is required",
        });
        return; // Stop if resume is missing
      }

      if (isValid) {
        // Clear any step 2 errors before moving forward
        step2Fields.forEach((field) => {
          form.clearErrors(field);
        });
        setCurrentStep(2);
      } else {
        // Scroll to first error in step 1
        const step1Errors = step1Fields.filter(
          (field) => formState.errors[field]
        );
        if (step1Errors.length > 0) {
          const firstError = step1Errors[0];
          const errorElement = document.querySelector(`[name="${firstError}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }
      }
    }
  };

  const goToPrevStep = () => {
    // Clear step 2 errors when going back
    step2Fields.forEach((field) => {
      form.clearErrors(field);
    });
    setCurrentStep((prev) => prev - 1);
  };

  const handleFormSubmit = async (data: InterviewFormValues) => {
    // Only submit if we're on step 2 - prevent auto-submit when on step 1
    if (currentStep !== 2) {
      return;
    }

    // Prevent multiple concurrent submissions
    if (isSubmittingForm) {
      return;
    }

    const isValid = await trigger(step2Fields, { shouldFocus: true });

    if (isValid) {
      // Set submitting state to prevent duplicate submissions
      setIsSubmittingForm(true);

      try {
        let finalResumeKey = uploadedResumeKey || data.resumeS3Key || "";

        // Handle file upload if new file is selected
        const resumeFile = data.resume;
        if (resumeFile instanceof File) {
          const formData = new FormData();
          formData.append("file", resumeFile);
          formData.append("folder", "interview-resumes");

          try {
            const response: any = await uploadResume(formData);
            if (response?.key) {
              finalResumeKey = response.key;
            }
          } catch (error) {
            console.error("Upload failed", error);
            setIsSubmittingForm(false);
            // Optional: handle upload error (e.g. show toast, stay on page)
            return;
          }
        }

        // Send status log if in edit mode and status or notes changed
        if (isEditMode && initialData?.id) {
          const prevStatus = initialData.status ?? "";
          const prevNotes = (initialData.notes ?? "").toString();
          const newStatus = (data.interviewStatus ?? "").toString();
          const newNotes = (data.notes ?? "").toString();

          const statusChanged = prevStatus !== newStatus;
          const notesChanged = prevNotes.trim() !== newNotes.trim();

          if (statusChanged || notesChanged) {
            try {
              await createStatusLog({
                interviewId: initialData.id,
                status: data.interviewStatus,
                notes: data.notes || "",
                effectiveDate: new Date().toISOString(),
              });
            } catch (error) {
              console.error("Failed to create status log", error);
              // Continue with submission even if status log fails
            }
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
        setIsSubmittingForm(false);
      }
    } else {
      // Scroll to first error in step 2
      const step2Errors = step2Fields.filter(
        (field) => formState.errors[field]
      );
      // console.log("step2Errors: ", step2Errors);
      if (step2Errors.length > 0) {
        const firstError = step2Errors[0];
        // console.log("firstError: ", firstError);
        const errorElement = document.querySelector(`[name="${firstError}"]`);
        // console.log("errorElement: ", errorElement);
        if (errorElement) {
          errorElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Only allow form submission when on step 2
          if (currentStep === 2) {
            form.handleSubmit(handleFormSubmit)();
          }
        }}
        className="space-y-4"
      >
        {/* --- Stepper Navigation --- */}
        <nav className="flex items-center justify-center mb-4 sm:mb-6 px-2">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex items-center flex-1 sm:flex-initial"
            >
              <div className="flex flex-col items-center w-full sm:w-auto">
                <div
                  className={cn(
                    "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold transition-all text-xs sm:text-sm",
                    currentStep > step.id
                      ? "bg-primary text-primary-foreground"
                      : currentStep === step.id
                        ? "bg-primary/90 text-primary-foreground border-2 border-primary-foreground shadow-lg"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-4 w-4 sm:h-5 sm:w-5" />
                  ) : (
                    <step.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-1 sm:mt-2 text-xs sm:text-sm text-center px-1",
                    currentStep >= step.id
                      ? "text-primary font-medium"
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
                <div className="flex-auto border-t-2 mx-2 sm:mx-4 transition-all hidden sm:block" />
              )}
            </div>
          ))}
        </nav>

        <Card className="border-none shadow-none max-h-[50vh] sm:max-h-[60vh] overflow-y-auto p-1">
          {/* --- Step 1: Candidate Details --- */}
          {currentStep === 1 && (
            <CardContent className="p-2 sm:p-4">
              <div className="space-y-4 rounded-md border p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium">
                  Candidate Details
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="candidateName"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel
                          className={cn(
                            "flex items-center gap-1",
                            fieldState.error && "text-red-500"
                          )}
                        >
                          Name
                          <span className="text-red-500">*</span>
                        </FormLabel>

                        <FormControl>
                          <Input placeholder="John Doe" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="technology"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel
                          className={cn(
                            "flex items-center gap-1",
                            fieldState.error && "text-red-500"
                          )}
                        >
                          Technology
                          <span className="text-red-500">*</span>
                        </FormLabel>

                        <FormControl>
                          <CustomDropDownSearchable
                            form={form}
                            label=""
                            name={field.name}
                            options={technologyList?.data?.map(
                              (technology: any) => {
                                return {
                                  value: technology.id,
                                  label: technology.name,
                                };
                              }
                            )}
                            placeholder="Select technology"
                            isLoading={technologyListLoading}
                          />
                        </FormControl>

                        {/* <FormMessage /> */}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel
                          className={cn(
                            "flex items-center gap-1",
                            fieldState.error && "text-red-500"
                          )}
                        >
                          Email
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="candidate@email.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="+1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input placeholder="City, Country" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {/* <FormField
                    control={form.control}
                    name="candidateLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Portfolio/GitHub Link</FormLabel>
                        <FormControl>
                          <Input placeholder="https://portfolio.com or https://github.com/username" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                  <FormField
                    control={form.control}
                    name="experience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Experience (Years)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="currentCtc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current CTC</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="100000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="expectedCtc"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected CTC</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="120000"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="noticePeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notice Period</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 30 Days" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="md:col-span-2">
                    <div className="mb-2">
                      <FormLabel
                        className={cn(
                          "flex items-center gap-1",
                          formState.errors.resume && "text-red-500"
                        )}
                      >
                        Resume (CV)
                        <span className="text-red-500">*</span>
                      </FormLabel>
                    </div>
                    <FileUpload
                      name="resume"
                      label=""
                      fileLabel="PDF,DOC,DOCX (Max 5MB)"
                      onFileSelect={undefined}
                      onFileRemove={handleResumeRemove}
                      existingFileUrl={
                        hasExistingFile && initialData?.resumeLink
                          ? initialData.resumeLink
                          : undefined
                      }
                      existingFileName={
                        hasExistingFile && initialData?.resumeLink
                          ? `${initialData.candidateName || "Candidate"} Resume`
                          : undefined
                      }
                      acceptedFormats={{
                        "application/pdf": [".pdf"],
                        "application/msword": [".doc"],
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                          [".docx"],
                      }}
                    />
                  </div>
                  {/* <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any additional notes about the candidate..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  /> */}
                </div>
              </div>
            </CardContent>
          )}

          {/* --- Step 2: Scheduling Details --- */}
          {currentStep === 2 && (
            <CardContent className="p-2 sm:p-4">
              <div className="space-y-4 rounded-md border p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium">
                  Interviewer Details
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <div>
                    <FormField
                      control={form.control}
                      name="interviewerName"
                      render={({ fieldState }) => (
                        <FormItem>
                          <FormLabel
                            className={cn(
                              "flex items-center gap-1",
                              fieldState.error && "text-red-500"
                            )}
                          >
                            Interviewer Name
                            <span className="text-red-500">*</span>
                          </FormLabel>

                          <CustomDropDownSearchable
                            form={form}
                            name="interviewerName"
                            label=""
                            options={usersList?.data?.map((user: any) => ({
                              value: user.id,
                              label: user.fullName,
                            }))}
                            placeholder="Select interviewer"
                            isLoading={usersListLoading}
                          />

                          {/* <FormMessage /> */}
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* <div>
                    <FormField
                      control={form.control}
                      name="interviewRound"
                      render={({ fieldState }) => (
                        <FormItem>
                          <FormLabel
                            className={cn(
                              "flex items-center gap-1",
                              fieldState.error && "text-red-500"
                            )}
                          >
                            Interview Round
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <CustomDropDownSearchable
                            form={form}
                            name="interviewRound"
                            label=""
                            options={interviewRounds}
                            placeholder="Select round"
                            searchEnabled={false}
                            sortOptions={false}
                          />
                        </FormItem>
                      )}
                    />
                  </div> */}
                  <FormField
                    control={form.control}
                    name="startTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interview Time</FormLabel>
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
                  <div>
                    <FormField
                      control={form.control}
                      name="interviewType"
                      render={({ fieldState }) => (
                        <FormItem>
                          <FormLabel
                            className={cn(
                              "flex items-center gap-1",
                              fieldState.error && "text-red-500"
                            )}
                          >
                            Interview Type
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <CustomDropDownSearchable
                            form={form}
                            name="interviewType"
                            label=""
                            options={interviewTypes}
                            placeholder="Select type"
                            searchEnabled={false}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  {interviewType === "video_call" && (
                    <>
                      <FormField
                        control={form.control}
                        name="interviewUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Interview URL
                              <RequiredIndicator
                                error={!!formState.errors.interviewUrl}
                              />
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://meet.google.com/..."
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <div>
                    <FormField
                      control={form.control}
                      name="interviewStatus"
                      render={({ fieldState }) => (
                        <FormItem>
                          <FormLabel
                            className={cn(
                              "flex items-center gap-1",
                              fieldState.error && "text-red-500"
                            )}
                          >
                            Interview Status
                            <span className="text-red-500">*</span>
                          </FormLabel>
                          <CustomDropDownSearchable
                            form={form}
                            name="interviewStatus"
                            label=""
                            options={filteredStatuses}
                            placeholder="Select status"
                            searchEnabled={false}
                            sortOptions={false}
                          />
                        </FormItem>
                      )}
                    />
                  </div>

                  {isEditMode &&
                    userRole === roles.ADMIN &&
                    interviewStatus === "joining" && (
                      <CustomDatePicker
                        control={form.control}
                        name="joiningDate"
                        label="Joining Date"
                      />
                    )}

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Interviewer Comment</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Instructions or notes for the interviewer..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* --- Navigation Buttons --- */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <div className="flex gap-2 w-full sm:w-auto order-1 sm:order-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevStep}
                className="flex-1 sm:flex-initial"
              >
                Back
              </Button>
            )}
            {currentStep < steps.length ? (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNextStep(e);
                }}
                className="flex-1 sm:flex-initial"
              >
                Next
              </Button>
            ) : (
              <Button
                type="submit"
                className="flex-1 sm:flex-initial"
                disabled={
                  isSubmitting ||
                  isSubmittingForm ||
                  (isEditMode && !hasActualChanges())
                }
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

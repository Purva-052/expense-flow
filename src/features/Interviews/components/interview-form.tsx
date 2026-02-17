/* eslint-disable prefer-const */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import CustomDropDownSearchable from "@/components/shared/custome-searchable-dropdown";
import { interviewTypes, interviewStatuses } from "../constants";
import {
  useCreateInterviewResumeLink,
  // useCreateInterviewStatusLog,
} from "../services";
import { FileUpload } from "@/components/shared/custome-file-upload";
import TimePicker from "@/components/shared/custome-timepicker";
import { roles } from "@/utils/constant";
import { useAuthStore } from "@/stores/use-auth-store";
import { CustomDatePicker } from "@/components/shared/custome-datePicker";
import { interviewFormSchema, InterviewFormValues } from "../schema";

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

  const formatNoticePeriod = (days: number): string => {
    return `${days} Days`;
  };

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

  const form = useForm<InterviewFormValues>({
    resolver: zodResolver(activeSchema as any),
    mode: "onSubmit",
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
          experience: Number(initialData.experienceInYears) || 0,
          currentCtc: Number(initialData.currentCtc) || 0,
          expectedCtc: Number(initialData.expectedCtc) || 0,
          noticePeriod: formatNoticePeriod(initialData.noticePeriodInDays || 0),
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
  // const { mutateAsync: createStatusLog } = useCreateInterviewStatusLog();

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
  useEffect(() => {
    if (interviewType && currentStep === 2) {
      form.trigger("interviewUrl");
    }
  }, [interviewType, currentStep, form]);

  const handleNextStep = async () => {
    // Validate only Step 1 fields
    const isValid = await trigger(step1Fields);

    if (isValid) {
      // ONLY change the UI state, do NOT set form value 'step' to 2 yet
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
        className="space-y-4"
      >
        {!isEditMode && (
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
        )}

        <Card className="border-none shadow-none max-h-[50vh] sm:max-h-[60vh] overflow-y-auto p-1">
          {/* --- Step 1 / Candidate Details --- */}
          {(currentStep === 1 || isEditMode) && (
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
                          Name <span className="text-red-500">*</span>
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
                          Technology <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <CustomDropDownSearchable
                            form={form}
                            label=""
                            name={field.name}
                            options={technologyList?.data?.map(
                              (technology: any) => ({
                                value: technology.id,
                                label: technology.name,
                              })
                            )}
                            placeholder="Select technology"
                            isLoading={technologyListLoading}
                          />
                        </FormControl>
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
                          Email <span className="text-red-500">*</span>
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
                          <Input
                            {...field}
                            type="tel"
                            placeholder="1234567890"
                            maxLength={10} // ✅ works
                            inputMode="tel"
                            onChange={(e) => {
                              // Allow only valid characters while typing
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
                  <FormField
                    control={form.control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="https://portfolio.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  {userRole === roles.ADMIN && (
                    <>
                      <FormField
                        control={form.control}
                        name="currentCtc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current CTC</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                step="0.01"
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
                                min={1}
                                step="0.01"
                                placeholder="100000"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
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
                    <FormLabel
                      className={cn(
                        "flex items-center gap-1 mb-2",
                        formState.errors.resume && "text-red-500"
                      )}
                    >
                      Resume (CV) <span className="text-red-500">*</span>
                    </FormLabel>
                    <FileUpload
                      name="resume"
                      label=""
                      fileLabel="PDF,DOC,DOCX (Max 5MB)"
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
              </div>
            </CardContent>
          )}

          {/* --- Step 2 / Interviewer Details --- */}
          {currentStep === 2 && !isEditMode && (
            <CardContent className="p-2 sm:p-4">
              <div className="space-y-4 rounded-md border p-3 sm:p-4">
                <h3 className="text-base sm:text-lg font-medium">
                  Interviewer Details
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
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
                          Interviewer Name{" "}
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
                      </FormItem>
                    )}
                  />
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
                          Interview Type <span className="text-red-500">*</span>
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
                  {interviewType === "video_call" && (
                    <FormField
                      control={form.control}
                      name="interviewUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Interview URL{" "}
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
                  )}
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
                          Interview Status{" "}
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
            {currentStep > 1 && !isEditMode && (
              <Button
                type="button"
                variant="outline"
                onClick={goToPrevStep}
                className="flex-1 sm:flex-initial"
              >
                Back
              </Button>
            )}
            {currentStep < steps.length && !isEditMode ? (
              <Button
                type="button"
                onClick={handleNextStep}
                className="flex-1 sm:flex-initial"
              >
                Next
              </Button>
            ) : (
              <Button
                // type="submit"
                type="button"
                className="flex-1 sm:flex-initial"
                disabled={
                  isSubmitting ||
                  isSubmittingForm ||
                  (isEditMode && !hasActualChanges())
                }
                onClick={async () => {
                  form.setValue("step", 2, { shouldValidate: false });

                  const isValid = await form.trigger();

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

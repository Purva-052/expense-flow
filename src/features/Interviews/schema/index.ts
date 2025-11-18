import * as z from "zod";

export const interviewFormSchema = z.object({
    // Candidate Details
    candidateName: z.string().min(1, "Name is required"),
    technology: z.any().refine((val) => {
        return val != null && val !== "" && String(val).trim().length > 0;
    }, {
        message: "Technology is required",
    }),
    email: z.string().min(1, "Email is required").email("Invalid email address"),
    phoneNumber: z.string().min(1, "Phone number is required").min(10, "Phone number must be at least 10 digits"),
    location: z.string().min(1, "Location is required"),
    notes: z.string().optional(),
    experience: z.coerce.number().min(0, "Experience must be a positive number"),
    resume: z.any().optional(), // Making resume optional as it can be complex to require
    currentCtc: z.coerce.number().min(0, "CTC must be a positive number"),
    expectedCtc: z.coerce.number().min(0, "CTC must be a positive number"),
    noticePeriod: z.string().min(1, "Notice period is required"),

    // Interviewer Details
    interviewerName: z.string().min(1, "Interviewer is required"),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    interviewType: z.string().min(1, "Interview type is required"),
    interviewUrl: z.string().optional(),
    interviewRound: z.string().min(1, "Interview round is required"),
    interviewerComment: z.string().optional(),
    interviewStatus: z.string().min(1, "Status is required"),
})
// This refine function ensures that the interviewUrl is provided only when 'video_call' is selected
.refine(data => {
    if (data.interviewType === 'video_call') {
        return !!data.interviewUrl && data.interviewUrl.trim().length > 0;
    }
    return true;
}, {
    message: "URL is required for video calls",
    path: ["interviewUrl"], // This attaches the error message to the interviewUrl field
})
.refine(data => {
    if (data.interviewType === 'video_call' && data.interviewUrl) {
        try {
            new URL(data.interviewUrl);
            return true;
        } catch {
            return false;
        }
    }
    return true;
}, {
    message: "Must be a valid URL",
    path: ["interviewUrl"],
});

// Export the inferred TypeScript type for use in your components
export type InterviewFormValues = z.infer<typeof interviewFormSchema>;
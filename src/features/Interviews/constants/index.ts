import { InterviewEvent } from "../types";

// Mock data for dropdowns
export const technologies = [
  { value: "react", label: "React.js" },
  { value: "node", label: "Node.js" },
  { value: "vue", label: "Vue.js" },
];

export const interviewers = [
  { value: "jane_smith", label: "Jane Smith" },
  { value: "peter_jones", label: "Peter Jones" },
];

export const interviewTypes = [
  { value: "telephonic", label: "Telephonic" },
  { value: "onsite", label: "On-site" },
  { value: "video_call", label: "Video Call" },
];

export const interviewRounds = [
  { value: "technical", label: "Technical" },
  { value: "practical", label: "Practical" },
];

export const interviewStatuses = [
  { value: "scheduled", label: "Scheduled" },
  { value: "pending", label: "Pending" },
];

// Mock data to pre-populate the calendar
export const initialEvents: InterviewEvent[] = [
  {
    id: "1",
    title: "John Doe",
    start: "2025-09-22",
    extendedProps: {
      candidateName: "John Doe",
      technology: "react",
      email: "john.doe@example.com",
      phoneNumber: "1234567890",
      location: "New York, USA",
      experience: 5,
      currentCtc: 120000,
      expectedCtc: 140000,
      noticePeriod: "30 Days",
      interviewerName: "jane_smith",
      startTime: "10:00",
      endTime: "11:00",
      interviewType: "video_call",
      interviewUrl: "https://meet.google.com/xyz",
      interviewRound: "technical",
      interviewStatus: "scheduled",
      notes: "Experienced React developer.",
      interviewerComment: "Please assess problem-solving skills.",
      resume: null,
    },
  },
];


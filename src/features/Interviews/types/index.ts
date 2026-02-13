export interface Technology {
  id: number;
  name: string;
  color: string;
}

export interface Interviewer {
  id: number;
  name: string;
  email: string;
}

export interface CreatedBy {
  id: number;
  name: string;
  role: string;
}

export interface InterviewApiResponse {
  id: number;
  candidateName: string;
  interviewUrl: string;
  technology: Technology;
  email: string;
  phoneNumber: string;
  location: string;
  link?: string;
  notes: string;
  experienceInYears: string;
  resumeLink: string;
  currentCtc: string;
  expectedCtc: string;
  noticePeriodInDays: number;
  interviewType: string;
  interviewRound: string;
  interviewerComments: string;
  status: string;
  interviewStart: string;
  interviewEnd: string;
  interviewer: Interviewer;
  createdBy: CreatedBy;
  joiningDate?: string;
}

export interface InterviewEvent {
  id: string;
  title: string;
  interViewer?: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: InterviewApiResponse;
}

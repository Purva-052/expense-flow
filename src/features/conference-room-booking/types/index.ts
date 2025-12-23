export interface Project {
  id: number;
  name: string;
}

export interface BookedBy {
  id: number;
  name: string;
  email: string;
}

export interface CreatedBy {
  id: number;
  fullName: string;
  role: string;
}

export interface ConferenceRoomApiResponse {
  id: number;
  meetingName: string;
  project: Project;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  recurringType: string;
  bookedBy: BookedBy;
  createdBy: CreatedBy;
  projectId: any;
  meetingType: string;
}

export interface ConferenceRoomEvent {
  id: string;
  title: string;
  start: string;
  end?: string;
  backgroundColor?: string;
  borderColor?: string;
  extendedProps: ConferenceRoomApiResponse;
}

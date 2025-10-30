// --- MODIFICATION: Using your specific enum values for the type ---
export enum ProjectPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}


/* eslint-disable @typescript-eslint/no-explicit-any */
export type Developer = {
 developer:any
 endDate: any 
}

export type Project = {
  id: string
  name: string
  expectedCompletionDate: string
  assignedDeveloperIds: string[]
  currentStatus:any
  priority: ProjectPriority; // Use the enum here
  percentageComplete?: number // New field for completion percentage
  projectHandler:any
}

export type ScheduleItem = {
  developerId: string
  projectId: string
  removeAt: string // ISO date
}

export type BoardData = {
  projects: Project[]
  developers: Developer[]
}

export type Developer = {
  id: string
  name: string
  technology: string
  assignedProjectIds: string[]
  removalSchedule?: Record<string, string> // projectId -> ISO date
}

export type Project = {
  id: string
  name: string
  completionDate: string
  assignedDeveloperIds: string[]
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

export type CronJob = {
  id: number;
  key: string;
  status: string;
  scheduleDescription: string;
  triggeredAt: string | null;
  completedAt: string | null;
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline";
import { capitalizeFirstLetter } from "@/utils/commonFunctions";
import { DialogDescription } from "@radix-ui/react-dialog";
import { format } from "date-fns";
import { useGetProjectsHistoryData } from "../services";
import { useProjectsStore } from "../stores/useProjectsStore";

export function HistoryProjectModal() {
  const { open, setOpen, currentRow } = useProjectsStore();
  const { data: projectHistory, isFetching: projectHistoryLoading }: any =
    useGetProjectsHistoryData(currentRow?.id);

  if (open !== "history" || !currentRow) return null;

  const timelineData: any =
    projectHistory?.data?.map((item: any) => ({
      id: item?.id,
      title: item?.status ? capitalizeFirstLetter(item?.status) : "No Status",
      description: item.reason,
      time: item?.effectiveDate
        ? format(item?.effectiveDate, "do MMMM yyyy")
        : "No Date",
    })) ?? [];

  return (
    <Dialog open={open === "history"} onOpenChange={() => setOpen(null)}>
      <DialogContent className="!max-w-lg rounded-xl shadow-lg border border-border bg-card p-6">
        <DialogHeader className="border-b pb-3 mb-4">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            Project History{" "}
            {currentRow?.name && (
              <span className="text-muted-foreground text-base">
                ({currentRow?.name})
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground mt-1">
            {currentRow?.description ?? "No project description available."}
          </DialogDescription>

          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">Coordinator:</span>{" "}
              {currentRow?.projectHandler?.fullName ?? "-"}
            </div>
            <div className="flex items-center gap-1">
              <span className="font-medium text-foreground">Progress:</span>
              {currentRow?.percentageComplete ? (
                <Badge variant="secondary">
                  {currentRow?.percentageComplete}%
                </Badge>
              ) : (
                "-"
              )}
            </div>
          </div>
        </DialogHeader>

        {projectHistoryLoading ? (
          <div className="flex flex-col justify-center items-center py-16 gap-3 h-[55dvh]">
            <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary" />
            <span className="text-sm text-muted-foreground font-medium">
              Loading project history...
            </span>
          </div>
        ) : timelineData?.length > 0 ? (
          <Timeline className="mt-3 overflow-y-auto max-h-[55dvh] px-2">
            {timelineData.map((item: any) => (
              <TimelineItem key={item.id}>
                <TimelineHeader>
                  <TimelineTime
                    variant="default"
                    className="text-xs bg-black px-2 py-0.5 rounded-md text-white"
                  >
                    {item.time}
                  </TimelineTime>
                  <TimelineTitle className="text-base font-medium text-foreground">
                    {item.title}
                  </TimelineTitle>
                </TimelineHeader>
                {item.description && (
                  <TimelineDescription className="text-sm  mt-1 leading-relaxed">
                    {item.description}
                  </TimelineDescription>
                )}
              </TimelineItem>
            ))}
          </Timeline>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground h-[55dvh]">
            <div className="bg-muted/50 rounded-full p-4 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-muted-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-lg font-medium text-foreground">
              No history found
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Once there’s activity, project history will appear here.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

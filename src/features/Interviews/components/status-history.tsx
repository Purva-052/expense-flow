/* eslint-disable @typescript-eslint/no-explicit-any */
import { DialogHeader } from "@/components/ui/dialog";
import {
  Timeline,
  TimelineDescription,
  TimelineHeader,
  TimelineItem,
  TimelineTime,
  TimelineTitle,
} from "@/components/ui/timeline";
import { DialogTitle } from "@radix-ui/react-dialog";
import { format } from "date-fns";

import { INTERVIEW_STATUS_LABEL } from "@/utils/constant";
import { useGetinterviewLogHistoryData } from "../services";
import { interviewTypes } from "../constants";

interface InterviewHistoryComponentProps {
  Id: string;
  Details: any;
}

const InterviewStatusHistoryComponent = ({
  Id,
  Details,
}: InterviewHistoryComponentProps) => {
  const { data: History, isFetching: HistoryLoading }: any =
    useGetinterviewLogHistoryData(Id);

  const timelineData =
    History?.data?.map((item: any) => {
      return {
        id: item?.id,
        title:
          item?.status && INTERVIEW_STATUS_LABEL?.[item?.status]
            ? INTERVIEW_STATUS_LABEL?.[item?.status]
            : "No Status",
        description: item.notes,
        time: item?.effectiveDate
          ? format(new Date(item.effectiveDate), "do MMMM yyyy")
          : "No Date",
      };
    }) ?? [];

  return (
    <div className="rounded-xl p-2">
      <DialogHeader className="border-b pb-3 mb-4">
        <DialogTitle className="text-lg font-semibold flex items-center gap-2">
          Interview History
        </DialogTitle>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 items-start">
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                Candidate Name:
              </span>
              <span>{Details?.candidateName ?? "-"}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Technology:</span>
              <span>
                {Details?.technology?.name &&
                Details?.technology?.name?.trim() !== ""
                  ? Details?.technology?.name
                  : "-"}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Email:</span>
              <span>{Details?.email ?? "-"}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Phone Number:</span>{" "}
              <span>{Details?.phoneNumber ?? "-"}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Interviewer:</span>{" "}
              <span>{Details?.interviewer?.name ?? "-"}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                Interview Round:
              </span>{" "}
              <span>{Details?.interviewRound ?? "-"}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">
                Interview Type:
              </span>{" "}
              <span>
                {interviewTypes.find(
                  (t) => t.value === Details?.interviewType || "-"
                )?.label || Details?.interviewType}
              </span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex flex-col">
              <span className="font-medium text-foreground">Location:</span>{" "}
              <span>{Details?.location ?? "-"}</span>
            </div>
          </div>
        </div>
      </DialogHeader>

      {HistoryLoading ? (
        <div className="flex flex-col justify-center items-center py-16 gap-3 h-[20dvh]">
          <div className="w-10 h-10 border-4 border-dashed rounded-full animate-spin border-primary/50 border-t-primary" />
          <span className="text-sm text-muted-foreground font-medium">
            Loading history...
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
                <TimelineDescription className="text-sm mt-1 leading-relaxed">
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
            Once there's activity, interview history will appear here.
          </p>
        </div>
      )}
    </div>
  );
};

export default InterviewStatusHistoryComponent;

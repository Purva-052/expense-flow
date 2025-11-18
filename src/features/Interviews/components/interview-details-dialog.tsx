/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { format } from "date-fns";
import { CalendarIcon, FileText, User, Clock, Tag } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { InterviewEvent } from "../types";
import {
  technologies,
  interviewers,
  interviewTypes,
  interviewRounds,
} from "../constants";

interface InterviewDetailsDialogProps {
  event: InterviewEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InterviewDetailsDialog = ({
  event,
  open,
  onOpenChange,
}: InterviewDetailsDialogProps) => {
  if (!event) return null;

  const details = event.extendedProps;
  const techLabel =
    technologies.find((t:any) => t.value === details.technology)?.label ||
    details.technology;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {details.candidateName}
          </DialogTitle>
          <DialogDescription>
            Interview Details for <Badge>{techLabel}</Badge>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />{" "}
            <strong>Interviewer:</strong>{" "}
            {
              interviewers.find((i) => i.value === details.interviewerName)
                ?.label
            }
          </div>
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-muted-foreground" />{" "}
            <strong>Round:</strong>{" "}
            {
              interviewRounds.find((r) => r.value === details.interviewRound)
                ?.label
            }
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />{" "}
            <strong>Date:</strong> {format(new Date(event.start), "PPP")}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />{" "}
            <strong>Time:</strong> {details.startTime} - {details.endTime}
          </div>
          <div className="col-span-full flex items-center gap-2">
            <FileText className="h-4 w-4 text-muted-foreground" />{" "}
            <strong>Type:</strong>{" "}
            {
              interviewTypes.find((t) => t.value === details.interviewType)
                ?.label
            }{" "}
            {details.interviewUrl && (
              <a
                href={details.interviewUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 underline ml-2"
              >
                (Meeting Link)
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


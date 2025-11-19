/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { format } from "date-fns";
import {
  CalendarIcon,
  FileText,
  User,
  Clock,
  Tag,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  DollarSign,
  FileCheck,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { InterviewEvent } from "../types";
import { interviewTypes } from "../constants";

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
  const interviewStart = new Date(details.interviewStart);
  const interviewEnd = new Date(details.interviewEnd);
  const techColor = details.technology?.colour || "#10B981";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            {details.candidateName}
            {details.technology && (
              <Badge
                style={{
                  backgroundColor: techColor,
                  color: "#fff",
                }}
              >
                {details.technology.name}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Interview Details - {format(interviewStart, "PPP")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Candidate Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
              Candidate Information
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-start gap-2">
                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <strong>Email:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.email}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <strong>Phone:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.phoneNumber}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <strong>Location:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.location}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <strong>Experience:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.experienceInYears} years
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <strong>Current CTC:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.currentCtc} LPA
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <strong>Expected CTC:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.expectedCtc} LPA
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <strong>Notice Period:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.noticePeriodInDays} days
                  </p>
                </div>
              </div>
              {details.resumeLink && (
                <div className="flex items-start gap-2">
                  <FileCheck className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <strong>Resume:</strong>
                    <p className="text-sm">
                      <a
                        href={details.resumeLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 underline"
                      >
                        View Resume
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </div>
            {details.notes && (
              <div className="flex items-start gap-2 mt-4">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <strong>Notes:</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {details.notes}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interview Details */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold border-b pb-2">
              Interview Details
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <strong>Interviewer:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.interviewer?.name || "N/A"}
                    {details.interviewer?.email && (
                      <span className="block text-xs">
                        {details.interviewer.email}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <strong>Round:</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.interviewRound}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <strong>Date:</strong>
                  <p className="text-sm text-muted-foreground">
                    {format(interviewStart, "PPP")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <strong>Time:</strong>
                  <p className="text-sm text-muted-foreground">
                    {format(interviewStart, "h:mm a")} -{" "}
                    {format(interviewEnd, "h:mm a")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <strong>Type:</strong>
                  <p className="text-sm text-muted-foreground">
                    {
                      interviewTypes.find(
                        (t) => t.value === details.interviewType
                      )?.label || details.interviewType
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div>
                  <strong>Status:</strong>
                  <Badge
                    variant={
                      details.status === "scheduled"
                        ? "default"
                        : details.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                    className="ml-2"
                  >
                    {details.status}
                  </Badge>
                </div>
              </div>
            </div>
            {details.interviewerComments && (
              <div className="flex items-start gap-2 mt-4">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="flex-1">
                  <strong>Interviewer Comments:</strong>
                  <p className="text-sm text-muted-foreground mt-1">
                    {details.interviewerComments}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Created By */}
          {details.createdBy && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold border-b pb-2">
                Created By
              </h3>
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-muted-foreground" />
                <div>
                  <strong>{details.createdBy.name}</strong>
                  <p className="text-sm text-muted-foreground">
                    {details.createdBy.role}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


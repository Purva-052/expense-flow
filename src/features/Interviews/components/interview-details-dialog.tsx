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
  Edit2,
  Trash2,
  Link,
  SquareArrowOutUpRight,
  // ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
import { InterviewEvent } from "../types";
import { interviewStatuses, interviewTypes } from "../constants";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";
import { capitalizeFirstLetter } from "@/utils/commonFunctions";
// import { useUpdateInterview } from "../services";
// import { useAuthStore } from "@/stores/use-auth-store";
// import { roles } from "@/utils/constant";

interface InterviewDetailsDialogProps {
  event: InterviewEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (event: InterviewEvent) => void;
  onDelete?: (event: InterviewEvent) => void;
  onStatusUpdate?: (eventId: string, newStatus: string) => void;
}

export const InterviewDetailsDialog = ({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  // onStatusUpdate,
}: InterviewDetailsDialogProps) => {
  if (!event) return null;

  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;
  // const baseStatuses = interviewStatuses;

  // Step 1: extract values for reuse
  // const ADD_STATUSES = [
  //   "pending",
  //   "technical_completed",
  //   "practical_completed",
  //   "hr_round",
  // ];
  // const EDIT_STATUSES = [...ADD_STATUSES, "rejected"]; // same as add but + rejected

  // Step 2: final list logic
  // const filteredStatuses = onEdit
  //   ? userRole === roles.ADMIN
  //     ? baseStatuses // admin in edit → all statuses
  //     : baseStatuses.filter((s) => EDIT_STATUSES.includes(s.value))
  //   : userRole === roles.ADMIN
  //     ? baseStatuses // admin on add → all statuses
  //     : baseStatuses.filter((s) => ADD_STATUSES.includes(s.value));

  const details = event.extendedProps;
  const interviewStart = new Date(details.interviewStart);
  const interviewEnd = new Date(details.interviewEnd);
  const techColor = details.technology?.colour || "#10B981";

  // const updateInterviewMutation = useUpdateInterview(() => {
  //   // This callback runs after successful update
  //   if (onStatusUpdate && event.id) {
  //     // The mutation already invalidates queries, but we also update local state
  //   }
  // });

  const handleEdit = () => {
    if (onEdit) {
      onEdit(event);
      onOpenChange(false);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(event);
    }
  };

  const handleRedirectToInterviewLink = () => {
    if (details.interviewUrl) {
      window.open(details.interviewUrl, "_blank");
    }
  };
  // const handleStatusChange = (newStatus: string) => {
  //   if (event.id) {
  //     // Parse notice period to extract days
  //     const noticePeriodInDays = details.noticePeriodInDays || 0;

  //     // Prepare complete API body with all required fields
  //     const apiBody = {
  //       candidateName: details.candidateName,
  //       technology: Number(details.technology?.id),
  //       email: details.email,
  //       phoneNumber: details.phoneNumber,
  //       location: details.location,
  //       notes: details.notes || "",
  //       experienceInYears: Number(details.experienceInYears),
  //       resumeS3Key: details.resumeLink || "",
  //       currentCtc: Number(details.currentCtc),
  //       expectedCtc: Number(details.expectedCtc),
  //       noticePeriodInDays: noticePeriodInDays,
  //       interviewType: details.interviewType,
  //       interviewRound: details.interviewRound,
  //       interviewerComments: details.interviewerComments || "",
  //       status: newStatus, // Update the status
  //       interviewerId: Number(details.interviewer?.id),
  //       interviewStart: new Date(details.interviewStart).toISOString(),
  //       interviewEnd: new Date(details.interviewEnd).toISOString(),
  //       ...(details.joiningDate && { joiningDate: details.joiningDate }),
  //     };

  //     updateInterviewMutation.mutate(
  //       {
  //         id: Number(event.id),
  //         data: apiBody,
  //       },
  //       {
  //         onSuccess: () => {
  //           // Update the local event state immediately for real-time UI update
  //           if (onStatusUpdate) {
  //             onStatusUpdate(event.id, newStatus);
  //           }
  //         },
  //       }
  //     );
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90vh]! overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                {details.candidateName}
                {details.technology && (
                  <Badge
                    style={{
                      backgroundColor: techColor,
                      color: "#fff",
                    }}
                    className="text-sm font-medium px-3 py-1"
                  >
                    {details.technology.name}
                  </Badge>
                )}
                {/* <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  
                  <Select
                    value={details.status}
                    disabled={updateInterviewMutation.isPending}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-[180px] h-8 border-primary/20 bg-background hover:bg-accent">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>

                    <SelectContent>
                      {(() => {
                        // Check if current status is in filtered list
                        const currentStatusInList = filteredStatuses.some(s => s.value === details.status);
                        const currentStatusObj = baseStatuses.find(s => s.value === details.status);
                        
                        // If current status is not in filtered list (e.g., "joining" for PM/TL), add it as disabled
                        const statusesToShow = !currentStatusInList && currentStatusObj
                          ? [currentStatusObj, ...filteredStatuses]
                          : filteredStatuses;

                        return statusesToShow.map((status) => {
                          const isCurrentStatus = status.value === details.status;
                          const isJoiningStatus = status.value === "joining";
                          const isPMorTL = userRole === roles.PROJECT_MANAGER || userRole === roles.TEAM_LEAD;
                          
                          // Disable "joining" for PM/TL (they can only view it, not select it)
                          const isDisabled = isJoiningStatus && isPMorTL && !isCurrentStatus;
                          
                          return (
                            <SelectItem 
                              key={status.value} 
                              value={status.value}
                              disabled={isDisabled}
                              className="flex items-center justify-between"
                            >
                              <div className="flex items-center gap-2 w-full">
                                <span>{status.label}</span>
                                {isJoiningStatus && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <ShieldCheck className="h-3.5 w-3.5 text-amber-500 ml-auto" />
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                      <p className="text-xs">
                                        {isPMorTL ? "View only - Admin can change" : "Admin only"}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </SelectItem>
                          );
                        });
                      })()}
                    </SelectContent>
                  </Select>
                </div> */}
                <div className="flex items-center gap-2 pr-4">
                  {onEdit && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={handleEdit}
                          className="h-9 w-9 rounded-full border-border/80 shadow-sm hover:border-primary/40"
                        >
                          <Edit2 className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Edit interview</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit interview</TooltipContent>
                    </Tooltip>
                  )}
                  {onDelete && userRole === roles.ADMIN && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={handleDelete}
                          className="h-9 w-9 rounded-full shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                          <span className="sr-only">Delete interview</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete interview</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </DialogTitle>
              <DialogDescription className="text-base">
                Interview Details - {format(interviewStart, "PPP")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="bg-muted/40 px-6 py-4 border-b">
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {format(interviewStart, "PPP")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <Clock className="h-4 w-4 text-primary" />
              {format(interviewStart, "h:mm a")} -{" "}
              {format(interviewEnd, "h:mm a")}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <FileText className="h-4 w-4 text-primary" />
              {interviewTypes.find((t) => t.value === details.interviewType)
                ?.label || details.interviewType}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <Tag className="h-4 w-4 text-primary" />
              {(() => {
                // find correct status from constant
                const statusItem = interviewStatuses.find(
                  (s) => s.value === details.status
                );

                // badge variant choose dynamically
                // const variant =
                //   details.status === "selected"
                //     ? "default"
                //     : details.status === "pending"
                //       ? "secondary"
                //       : "outline";

                return (
                  <Badge
                    variant={
                      details.status === "selected"
                        ? "default"
                        : details.status === "pending"
                          ? "secondary"
                          : "outline"
                    }
                    className="mt-1"
                  >
                    {statusItem?.label ?? details.status}
                  </Badge>
                );
              })()}
            </div>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* Candidate Information */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    Candidate Information
                  </h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Email
                      </p>
                      <p className="text-sm font-medium wrap-break-word">
                        {details.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Phone
                      </p>
                      <p className="text-sm font-medium">
                        {details.phoneNumber || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Location
                      </p>
                      <p className="text-sm font-medium">
                        {details.location || "-"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Experience
                      </p>
                      <p className="text-sm font-medium">
                        {details.experienceInYears} years
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Current CTC
                      </p>
                      <p className="text-sm font-medium">
                        {details.currentCtc} LPA
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <DollarSign className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Expected CTC
                      </p>
                      <p className="text-sm font-medium">
                        {details.expectedCtc} LPA
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Notice Period
                      </p>
                      <p className="text-sm font-medium">
                        {details.noticePeriodInDays} days
                      </p>
                    </div>
                  </div>
                  {details.resumeLink && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                      <FileCheck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                          Resume
                        </p>
                        <a
                          href={details.resumeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1"
                        >
                          View Resume
                          <FileCheck className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
                {details.notes && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Notes
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {details.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Interview Details */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Interview Details</h3>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <User className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Interviewer
                      </p>
                      <p className="text-sm font-medium">
                        {details.interviewer?.name || "-"}
                      </p>
                      {details.interviewer?.email && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {details.interviewer.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Tag className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Round
                      </p>
                      <p className="text-sm font-medium">
                        {capitalizeFirstLetter(details.interviewRound)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <CalendarIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Date
                      </p>
                      <p className="text-sm font-medium">
                        {format(interviewStart, "PPP")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Time
                      </p>
                      <p className="text-sm font-medium">
                        {format(interviewStart, "h:mm a")} -{" "}
                        {format(interviewEnd, "h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <FileText className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Type
                      </p>
                      <p className="text-sm font-medium">
                        {interviewTypes.find(
                          (t) => t.value === details.interviewType
                        )?.label || details.interviewType}
                      </p>
                    </div>
                  </div>
                  {details.interviewType === "video_call" &&
                    details.interviewUrl && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                        <Link className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                            Meeting Link
                          </p>
                          <p
                            className="text-sm font-medium cursor-pointer hover:underline"
                            onClick={handleRedirectToInterviewLink}
                          >
                            {details.interviewUrl}
                            <div
                              className="inline-block"
                              onClick={handleRedirectToInterviewLink}
                            >
                              <SquareArrowOutUpRight className="inline-block ml-1 h-3.5 w-3.5 text-primary shrink-0 cursor-pointer" />
                            </div>
                          </p>
                        </div>
                      </div>
                    )}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Tag className="h-5 w-5 text-primary mt-0.5 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">
                        Status
                      </p>

                      {(() => {
                        // find correct status from constant
                        const statusItem = interviewStatuses.find(
                          (s) => s.value === details.status
                        );

                        // badge variant choose dynamically
                        // const variant =
                        //   details.status === "selected"
                        //     ? "default"
                        //     : details.status === "pending"
                        //       ? "secondary"
                        //       : "outline";

                        return (
                          <Badge
                            variant={
                              details.status === "selected"
                                ? "default"
                                : details.status === "pending"
                                  ? "secondary"
                                  : "outline"
                            }
                            className="mt-1"
                          >
                            {statusItem?.label ?? details.status}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                </div>
                {details.interviewerComments && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-start gap-3">
                      <MessageSquare className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                          Interviewer Comments
                        </p>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {details.interviewerComments}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Created By */}
          {details.createdBy && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Created By</h3>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {details.createdBy.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {details.createdBy.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

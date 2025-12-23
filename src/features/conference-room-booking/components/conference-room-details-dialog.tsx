"use client";

import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  Tag,
  Briefcase,
  // MessageSquare,
  UserCircle,
  Edit2,
  Trash2,
  Users,
  Repeat,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
// import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ConferenceRoomEvent } from "../types";
import { recurringTypes } from "../constants";
import { roleToDisplay } from "@/utils/constant";
// import { useGetProjectSDropdownList } from "@/features/Project-type/services";

interface ConferenceRoomDetailsDialogProps {
  event: ConferenceRoomEvent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (event: ConferenceRoomEvent) => void;
  onDelete?: (event: ConferenceRoomEvent) => void;
}

export const ConferenceRoomDetailsDialog = ({
  event,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ConferenceRoomDetailsDialogProps) => {
  if (!event) return null;

  const details = event.extendedProps;
  // const { data: projectsList } = useGetProjectSDropdownList();
  // console.log("projectsList: ", projectsList);
  // console.log("details: ", details);

  // const getProjectName = (projectId: number) => {
  //   if (!Array.isArray(projectsList)) return "-";
  //   const project = projectsList.find((p: any) => p.id === projectId);
  //   console.log("project: ", project);
  //   console.log("project?.name: ", project?.name);
  //   return project?.name || "-";
  // };

  // Parse dates
  const startDate = new Date(details.startDate);
  const endDate = new Date(details.endDate);

  // Combine date + time (VALID JS Dates)
  const startDateTime = new Date(`${details.startDate}T${details.startTime}`);
  const endDateTime = new Date(`${details.endDate}T${details.endTime}`);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl! max-h-[90vh]! overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3 mb-2">
                {details.meetingName}

                {/* Recurring Type Chip */}
                {details.project?.name && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/50">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {details.project?.name}
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
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
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit booking</TooltipContent>
                    </Tooltip>
                  )}

                  {onDelete && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={handleDelete}
                          className="h-9 w-9 rounded-full shadow-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete booking</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </DialogTitle>

              <DialogDescription className="text-base">
                Conference Room Booking – {format(startDate, "PPP")}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Top Chips */}
        <div className="bg-muted/40 px-6 py-4 border-b">
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <CalendarIcon className="h-4 w-4 text-primary" />
              {format(startDate, "PPP")}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <Clock className="h-4 w-4 text-primary" />
              {format(startDateTime, "h:mm a")} –{" "}
              {format(endDateTime, "h:mm a")}
            </div>

            {/* <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-1.5 text-sm font-medium shadow-sm">
              <Tag className="h-4 w-4 text-primary" />
              {recurringTypes.find((r) => r.value === details.recurringType)
                ?.label || details.recurringType}
            </div> */}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-6">
          {/* Meeting Info */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarIcon className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Meeting Information</h3>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Users className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase mb-1">
                        Meeting Name
                      </p>
                      <p className="text-sm font-medium">
                        {details.meetingName || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Project */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Briefcase className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground uppercase mb-1">
                        Project
                      </p>
                      <p className="text-sm font-medium">
                        {details.project?.name || "-"}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <CalendarIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase mb-1">
                        Date
                      </p>
                      <p className="text-sm font-medium">
                        {format(startDate, "PPP")}
                      </p>
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase mb-1">
                        Time
                      </p>
                      <p className="text-sm font-medium">
                        {format(startDateTime, "h:mm a")} –{" "}
                        {format(endDateTime, "h:mm a")}
                      </p>
                    </div>
                  </div>

                  {/* Recurring Type */}
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Repeat className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase mb-1">
                        Recurring Type
                      </p>
                      <p className="text-sm font-medium">
                        {recurringTypes.find(
                          (r) => r.value === details.recurringType
                        )?.label || details.recurringType}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <CalendarIcon className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground uppercase mb-1">
                        {details.recurringType === "none"
                          ? "End Date"
                          : "Recurrence End Date"}
                      </p>
                      <p className="text-sm font-medium">
                        {format(endDate, "PPP")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Booked By */}
          {details.bookedBy && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Booked By</h3>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <UserCircle className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      {details.bookedBy.name}
                    </p>
                    {details.bookedBy.email && (
                      <p className="text-xs text-muted-foreground">
                        {details.bookedBy.email}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                      {details.createdBy.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {roleToDisplay.find(
                        (r) => r.value === details.createdBy.role
                      )?.label || details.createdBy.role}
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

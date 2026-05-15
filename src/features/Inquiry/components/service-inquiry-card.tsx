/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { startOfDay } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Calendar, MoreHorizontal, Clock, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { useInquiryStore } from "../stores/useInquiryStore";
import { useAuthStore } from "@/stores/use-auth-store";
import { roles } from "@/utils/constant";

interface InquiryCardProps {
  inquiry: any;
  view?: "grid" | "list";
  onSalesPersonClick?: (name: string) => void;
}

const statusColorMap: any = {
  "new-inquiry":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "in-discussion":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "near-to-close":
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  closed:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  "opted-out": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const getStatusBadgeClasses = (status?: string) => {
  const s = (status || "").toLowerCase();
  return statusColorMap[s] || "bg-muted text-muted-foreground";
};

const formatStatusLabel = (status?: string) => {
  if (!status) return "N/A";
  return status
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const getInitials = (name?: string) => {
  if (!name || name === "-") return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length === 1
    ? parts[0].charAt(0).toUpperCase()
    : (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

export function InquiryCard({
  inquiry,
  view = "grid",
  onSalesPersonClick,
}: InquiryCardProps) {
  const { setOpen, setCurrentRow } = useInquiryStore();
  const user = useAuthStore((state) => state.user);
  const userRole = user?.user?.role;

  // Local state for blinking alert (consistent with product-inquiry pattern)
  const [isBlinkingEnabled, setIsBlinkingEnabled] = useState(true);

  const salesPersonName = inquiry?.salesPerson?.fullName || "Unassigned";
  const clientName = inquiry?.clientName || "N/A";
  const clientCompany = inquiry?.clientCompanyName || "N/A";
  const projectName = inquiry?.projectName || "No Project Name";
  const industry = inquiry?.industry?.name || "N/A";
  const status = inquiry?.status;
  const hours = inquiry?.approximateHours || null;

  const inquiryDate = inquiry?.inquiryDate
    ? new Date(inquiry.inquiryDate).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  // Check if inquiry date is today -> trigger blinking reminder (optional but kept for feature parity)
  const isToday = (() => {
    if (!inquiry?.inquiryDate) return false;
    const today = startOfDay(new Date());
    const date = startOfDay(new Date(inquiry.inquiryDate));
    return today.getTime() === date.getTime();
  })();

  const handleEdit = () => {
    setOpen("edit");
    setCurrentRow(inquiry);
  };

  const handleDelete = () => {
    setOpen("delete");
    setCurrentRow(inquiry);
  };

  const handleView = () => {
    setOpen("view");
    setCurrentRow(inquiry);
  };

  const handleViewHistory = () => {
    setOpen("history");
    setCurrentRow(inquiry);
  };

  const actionMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="p-1 rounded-full hover:bg-muted"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleView}>View Inquiry</DropdownMenuItem>
          <DropdownMenuItem onClick={handleViewHistory}>
            View History
          </DropdownMenuItem>
          {(userRole === roles.BDE ||
            userRole === roles.ADMIN ||
            userRole === roles.TEAM_LEAD) && (
            <>
              <DropdownMenuItem onClick={handleEdit}>
                Edit Inquiry
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/40"
                onClick={handleDelete}
              >
                Delete Inquiry
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // --- LIST VIEW ---
  if (view === "list") {
    return (
      <div
        className={cn(
          "min-w-[860px] bg-card border-b hover:bg-muted/50 transition-colors py-4 px-6 relative group flex items-center gap-4",
          isToday && isBlinkingEnabled && "demo-reminder-blink"
        )}
      >
        <div className="w-1 bg-muted-foreground/40 rounded-full h-8 shrink-0" />

        {/* Sales Person + Client info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => onSalesPersonClick?.(salesPersonName)}
            >
              {salesPersonName}
            </h3>
            {isToday && (
              <div className="flex items-center gap-2 ml-1">
                <Switch
                  id={`blink-mode-list-${inquiry.id}`}
                  checked={isBlinkingEnabled}
                  onCheckedChange={(checked) => {
                    if (!checked) setIsBlinkingEnabled(false);
                  }}
                  disabled={!isBlinkingEnabled}
                  className="scale-75 data-[state=checked]:bg-red-500"
                />
                <Label
                  htmlFor={`blink-mode-list-${inquiry.id}`}
                  className="text-[9px] text-muted-foreground uppercase font-bold cursor-pointer"
                >
                  Reminder
                </Label>
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate font-medium">
            Client: {clientName} ({clientCompany})
          </p>
          <p className="text-[11px] text-muted-foreground truncate font-medium">
            Project: {projectName}
          </p>
        </div>

        {/* Status */}
        <div className="w-32 shrink-0 text-center">
          <div
            className={cn(
              "px-2.5 py-0.5 rounded-full text-[10px] font-semibold inline-block",
              getStatusBadgeClasses(status)
            )}
          >
            {formatStatusLabel(status)}
          </div>
        </div>

        {/* Industry */}
        <div className="w-28 shrink-0 text-center">
          <Badge
            variant="secondary"
            className="rounded-full px-2 py-0.5 text-[10px]"
          >
            {industry}
          </Badge>
        </div>

        {/* Inquiry Date */}
        <div className="w-28 shrink-0 flex items-center gap-2 text-[11px] text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{inquiryDate}</span>
        </div>

        {/* Client Avatar */}
        <div className="w-24 shrink-0 flex -space-x-1.5">
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarFallback className="text-foreground text-[10px] font-semibold">
              {getInitials(clientName)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Actions */}
        <div className="w-[64px] shrink-0 flex items-center justify-end pr-4 gap-2">
          {actionMenu}
        </div>
      </div>
    );
  }

  // --- GRID VIEW ---
  return (
    <div
      className={cn(
        "bg-card border-l-4 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 relative border-l-muted-foreground",
        isToday && isBlinkingEnabled && "demo-reminder-blink"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h3
              className="text-lg font-semibold text-foreground leading-tight pr-4 cursor-pointer hover:text-primary transition-colors"
              onClick={() => onSalesPersonClick?.(salesPersonName)}
            >
              {salesPersonName}
            </h3>
            {isToday && (
              <div className="flex items-center gap-2">
                <Label
                  htmlFor={`blink-mode-${inquiry.id}`}
                  className="text-[10px] text-muted-foreground uppercase font-bold cursor-pointer"
                >
                  Reminder
                </Label>
                <Switch
                  id={`blink-mode-${inquiry.id}`}
                  checked={isBlinkingEnabled}
                  onCheckedChange={(checked) => {
                    if (!checked) setIsBlinkingEnabled(false);
                  }}
                  disabled={!isBlinkingEnabled}
                  className="scale-75 data-[state=checked]:bg-red-500"
                />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">{actionMenu}</div>
      </div>

      {/* Date & Status */}
      <div className="flex items-center justify-between mb-3 mt-2">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className="text-xs">Inquiry: {inquiryDate}</span>
        </div>
        <div>
          <span
            className={cn(
              "inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase",
              getStatusBadgeClasses(status)
            )}
          >
            {formatStatusLabel(status)}
          </span>
        </div>
      </div>

      {/* Industry & Hours */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
          <Briefcase className="h-3.5 w-3.5" />
          <span>{industry}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>{hours ? `${hours} hrs` : "N/A"}</span>
        </div>
      </div>

      {/* Client Avatar Area */}
      <div className="mb-4 min-h-[40px] mt-3">
        <Avatar className="h-10 w-10 border-2 border-background">
          <AvatarFallback className="text-foreground text-[11px] font-semibold">
            {getInitials(clientName)}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4 border-t pt-4 mt-3">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-1">
            Client Company
          </p>
          <p className="text-xs font-semibold text-foreground truncate">
            {clientCompany}
          </p>
        </div>

        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider mb-1">
            Client Name
          </p>
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-foreground text-[10px] font-semibold">
                {getInitials(clientName)}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs font-semibold text-foreground leading-none">
              {clientName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

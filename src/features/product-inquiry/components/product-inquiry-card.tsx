/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Calendar, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatProductInquiryStatusLabel } from "@/utils/constant";
import { useProductInquiryStore } from "../stores/useProductInquiry";

interface InquiryCardProps {
  inquiry: any;
  view?: "grid" | "list";
  onProductClick?: (productName: string) => void;
}

const statusColorMap: any = {
  contacted: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  won: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  demo_scheduled:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  demo_completed:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400",
  proposal_shared:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  no_response:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  unqualified_lead:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  others: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
};

const getStatusBadgeClasses = (status?: string) => {
  const s = (status || "").toLowerCase();
  return statusColorMap[s] || "bg-muted text-muted-foreground";
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
  onProductClick,
}: InquiryCardProps) {
  const { setOpen, setCurrentRow, silencedInquiries, silenceInquiry } =
    useProductInquiryStore();
  const isGroup = inquiry?.isGroup;
  const inquiries = isGroup ? inquiry.inquiries : [inquiry];

  const isBlinkingEnabled = isGroup
    ? inquiry.isBlinking
    : !silencedInquiries.includes(inquiry.id || inquiry._id);

  const productName = inquiry?.product?.name || "No Product";

  const industries = isGroup
    ? Array.from(inquiry.industries)
    : [inquiry?.industry?.name].filter(Boolean);

  const statuses = isGroup
    ? Array.from(inquiry.statuses)
    : [inquiry?.status].filter(Boolean);

  // const totalUsers = isGroup ? inquiry.totalUsers : inquiry?.numberOfUsers;

  const contacts = isGroup
    ? inquiry.contacts
    : [
        {
          name: inquiry?.contactPerson?.fullName ?? inquiry?.contactPerson,
          profilePicUrl: inquiry?.contactPerson?.profilePicUrl ?? null,
          id: inquiry.id,
        },
      ].filter((c) => c.name && c.name !== "N/A");

  const companies = isGroup
    ? Array.from(inquiry.companies)
    : [inquiry?.companyName].filter((c) => c && c !== "N/A");

  // Use LOCAL midnight comparison to handle timezone offsets (e.g. IST UTC+5:30)
  const isDemoToday = isGroup
    ? inquiry.hasDemoToday
    : (() => {
        if (!inquiry?.demoDate) return false;
        const todayLocal = new Date();
        todayLocal.setHours(0, 0, 0, 0);
        const demoLocal = new Date(inquiry.demoDate);
        demoLocal.setHours(0, 0, 0, 0);
        return todayLocal.getTime() === demoLocal.getTime();
      })();

  const demoDate =
    !isGroup && inquiry?.demoDate
      ? new Date(inquiry.demoDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  // For grouped cards: collect unique formatted demo dates from all inquiries
  const groupDemoDates: any[] = isGroup
    ? [
        ...new Set(
          inquiries
            .filter((inq: any) => inq?.demoDate)
            .map((inq: any) =>
              new Date(inq.demoDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            )
        ),
      ]
    : [];

  // Handler to silence ALL inquiries in a group at once
  const silenceGroup = () => {
    inquiries.forEach((inq: any) => {
      const id = inq.id || inq._id;
      if (!silencedInquiries.includes(id)) {
        silenceInquiry(id);
      }
    });
  };

  const handleOpenComment = () => {
    setOpen("comment");
    setCurrentRow(inquiry);
  };

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

  const actionMenu = !isGroup ? (
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
          <DropdownMenuItem onClick={handleOpenComment}>
            Comments
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleView}>View Inquiry</DropdownMenuItem>
          <DropdownMenuItem onClick={handleEdit}>Edit Inquiry</DropdownMenuItem>
          <DropdownMenuItem
            className="text-red-600 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-950/40"
            onClick={handleDelete}
          >
            Delete Inquiry
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : null;

  // ─── LIST VIEW ──────────────────────────────────────────────
  if (view === "list") {
    return (
      <div
        className={cn(
          "min-w-[860px] bg-card border-b hover:bg-muted/50 transition-colors py-4 px-6 relative group flex items-center gap-4",
          isDemoToday && isBlinkingEnabled && "demo-reminder-blink"
        )}
      >
        <div className="w-1 bg-muted-foreground/40 rounded-full h-8 shrink-0" />

        {/* Product Name + Company + Contact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className="text-sm font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => onProductClick?.(productName)}
            >
              {productName}
            </h3>
            {/* Reminder toggle — individual or group */}
            {isDemoToday && (
              <div className="flex items-center gap-2 ml-1">
                <Switch
                  id={`blink-mode-list-${inquiry.id || inquiry._id || productName}`}
                  checked={isBlinkingEnabled}
                  onCheckedChange={(checked) => {
                    if (!checked) {
                      if (isGroup) silenceGroup();
                      else silenceInquiry(inquiry.id || inquiry._id);
                    }
                  }}
                  disabled={!isBlinkingEnabled}
                  className="scale-75 data-[state=checked]:bg-red-500"
                />
                <Label
                  htmlFor={`blink-mode-list-${inquiry.id || inquiry._id || productName}`}
                  className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold cursor-pointer transition-colors"
                >
                  Reminder
                </Label>
              </div>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate font-medium">
            Company : {isGroup ? companies.join(", ") : companies[0] || "N/A"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate font-medium">
            Contact :{" "}
            {isGroup
              ? contacts.map((c: any) => c.name).join(", ")
              : contacts[0]?.name || "N/A"}
          </p>
        </div>

        {/* Status */}
        <div className="w-32 shrink-0 text-center flex flex-wrap justify-center gap-1">
          {statuses.map((s: any) => (
            <div
              key={s}
              className={cn(
                "px-2 py-0.5 rounded-full text-[9px] font-semibold inline-block whitespace-nowrap",
                getStatusBadgeClasses(s)
              )}
            >
              {formatProductInquiryStatusLabel(s)}
            </div>
          ))}
        </div>

        {/* Industry */}
        <div className="w-28 shrink-0 text-center flex flex-wrap justify-center gap-1">
          {industries.length > 0 ? (
            industries.map((ind: any) => (
              <Badge
                key={ind}
                variant="secondary"
                className="rounded-full px-2 py-0.5 text-[9px] whitespace-nowrap"
              >
                {ind}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </div>

        {/* Demo Date */}
        <div className="w-28 shrink-0 text-[11px] text-muted-foreground">
          {isGroup ? (
            groupDemoDates.length > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/50 border border-muted cursor-default w-fit">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span className="font-semibold">
                        {groupDemoDates.length} Date
                        {groupDemoDates.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[180px] p-2">
                    <div className="flex flex-col gap-1">
                      {groupDemoDates.map((d) => (
                        <div
                          key={d}
                          className="flex items-center gap-1.5 text-xs"
                        >
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span>{d}</span>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-muted-foreground/50">—</span>
            )
          ) : (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>{demoDate || "—"}</span>
            </div>
          )}
        </div>

        {/* Contact Avatar */}
        <div className="w-24 shrink-0 flex items-center -space-x-2 overflow-hidden">
          {contacts.slice(0, 3).map((contact: any, idx: number) => (
            <Avatar
              key={contact.id || idx}
              className="h-8 w-8 border-2 border-background shrink-0"
            >
              <AvatarFallback className="text-foreground text-[10px] font-semibold">
                {getInitials(contact.name)}
              </AvatarFallback>
            </Avatar>
          ))}
          {contacts.length > 3 && (
            <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0 z-10">
              <span className="text-[10px] font-bold text-muted-foreground">
                +{contacts.length - 3}
              </span>
            </div>
          )}
        </div>

        {/* Actions — hidden for grouped rows */}
        {!isGroup && (
          <div className="w-[64px] shrink-0 flex items-center justify-end pr-4 gap-2">
            {actionMenu}
          </div>
        )}
        {isGroup && <div className="w-[64px] shrink-0" />}
      </div>
    );
  }

  // ─── GRID VIEW ──────────────────────────────────────────────
  return (
    <div
      className={cn(
        "bg-card border-l-4 rounded-lg shadow-sm p-6 hover:shadow-md transition-all duration-300 relative border-l-muted-foreground min-h-[220px]",
        isDemoToday && isBlinkingEnabled && "demo-reminder-blink"
      )}
    >
      {/* Header: Product Name & Inquiry Count only */}
      <div className="flex items-start justify-between mb-3">
        <h3
          className="text-lg font-bold text-foreground leading-tight cursor-pointer hover:text-rose-600 dark:hover:text-rose-500 transition-colors pr-4"
          onClick={() => onProductClick?.(productName)}
        >
          {productName}
        </h3>
        <div className="flex items-center gap-1.5 text-muted-foreground whitespace-nowrap shrink-0">
          <Calendar className="h-4 w-4" />
          <span className="text-xs font-medium">
            {isGroup
              ? `${inquiries.length} Inquiries`
              : `Demo: ${demoDate || "N/A"}`}
          </span>
        </div>
      </div>

      {/* Industry tags */}
      <div className="flex flex-wrap gap-1 mb-2">
        {industries.length > 0 ? (
          industries.map((ind: any) => (
            <span
              key={ind}
              className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded uppercase font-bold"
            >
              {ind}
            </span>
          ))
        ) : (
          <span className="text-[10px] text-muted-foreground bg-muted/40 px-1.5 py-0.5 rounded uppercase font-bold">
            N/A
          </span>
        )}
      </div>

      {/* Demo dates row — tooltip badge for groups, single date for individuals */}
      <div className="flex items-center justify-between mb-4 min-h-[22px]">
        <div>
          {isGroup && groupDemoDates.length > 0 ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/40 border border-muted/60 cursor-default text-[10px] text-muted-foreground font-semibold">
                    <Calendar className="h-3 w-3 shrink-0" />
                    {groupDemoDates.length} Demo Date
                    {groupDemoDates.length > 1 ? "s" : ""}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-2">
                  <div className="flex flex-col gap-1">
                    {groupDemoDates.map((d) => (
                      <div
                        key={d}
                        className="flex items-center gap-1.5 text-xs"
                      >
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : !isGroup && demoDate ? (
            <div className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{demoDate}</span>
            </div>
          ) : null}
        </div>

        {/* Reminder toggle — only when demo is today */}
        {isDemoToday && (
          <div className="flex items-center gap-1.5 ml-2">
            <Switch
              id={`blink-grid-${inquiry.id || inquiry._id || productName}`}
              checked={isBlinkingEnabled}
              onCheckedChange={(checked) => {
                if (!checked) {
                  if (isGroup) silenceGroup();
                  else silenceInquiry(inquiry.id || inquiry._id);
                }
              }}
              disabled={!isBlinkingEnabled}
              className="scale-75 data-[state=checked]:bg-red-500"
            />
            <Label
              htmlFor={`blink-grid-${inquiry.id || inquiry._id || productName}`}
              className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-bold cursor-pointer"
            >
              Reminder
            </Label>
          </div>
        )}
      </div>

      {/* Main Avatar Stack */}
      <div className="flex items-center -space-x-3 mb-6 overflow-visible">
        <TooltipProvider>
          {contacts.slice(0, 5).map((contact: any, idx: number) => (
            <Tooltip key={contact.id || idx}>
              <TooltipTrigger asChild>
                <Avatar className="h-10 w-10 border-2 border-background shrink-0 cursor-pointer hover:scale-110 transition-transform">
                  <AvatarImage
                    src={contact.profilePicUrl || undefined}
                    alt={contact.name}
                  />
                  <AvatarFallback className="text-foreground text-[11px] font-semibold bg-muted">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs font-medium">{contact.name}</p>
              </TooltipContent>
            </Tooltip>
          ))}
          {contacts.length > 5 && (
            <div className="h-10 w-10 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0 z-10 text-[11px] font-bold text-muted-foreground">
              +{contacts.length - 5}
            </div>
          )}
        </TooltipProvider>
      </div>

      <div className="border-t border-muted/60 my-4" />

      {/* Footer: Company and Contact Person */}
      <div className="grid grid-cols-2 gap-4">
        {/* Company — avatar stack only, name on hover */}
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
            Company
          </p>
          <div className="flex items-center -space-x-2 overflow-visible">
            <TooltipProvider>
              {companies.slice(0, 4).map((company: any, idx: number) => (
                <Tooltip key={idx}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-7 w-7 border-2 border-background shrink-0 cursor-pointer hover:scale-110 transition-transform">
                      <AvatarFallback className="text-foreground text-[9px] font-bold bg-muted">
                        {getInitials(company)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-medium">{company}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {companies.length > 4 && (
                <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0 z-10 text-[9px] font-bold text-muted-foreground">
                  +{companies.length - 4}
                </div>
              )}
            </TooltipProvider>
          </div>
        </div>

        {/* Contact Person — avatar stack only, name on hover */}
        <div className="min-w-0">
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
            Contact Person
          </p>
          <div className="flex items-center -space-x-2 overflow-visible">
            <TooltipProvider>
              {contacts.slice(0, 4).map((c: any, idx: number) => (
                <Tooltip key={c.id || idx}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-7 w-7 border-2 border-background shrink-0 cursor-pointer hover:scale-110 transition-transform">
                      <AvatarImage
                        src={c.profilePicUrl || undefined}
                        alt={c.name}
                      />
                      <AvatarFallback className="text-foreground text-[9px] font-bold bg-muted">
                        {getInitials(c.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-medium">{c.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
              {contacts.length > 4 && (
                <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center shrink-0 z-10 text-[9px] font-bold text-muted-foreground">
                  +{contacts.length - 4}
                </div>
              )}
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Action Menu (Fixed position) */}
      {!isGroup && <div className="absolute top-4 right-4">{actionMenu}</div>}
    </div>
  );
}

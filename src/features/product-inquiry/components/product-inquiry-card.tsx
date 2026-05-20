/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Badge } from "@/components/ui/badge";
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
  onProductClick?: (productId: string) => void;
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
  const { setOpen, setCurrentRow } = useProductInquiryStore();
  const isGroup = inquiry?.isGroup;
  const inquiries = isGroup ? inquiry.inquiries : [inquiry];

  const shouldBlink = isGroup
    ? inquiry.isBlinking
    : (() => {
        if (inquiry?.status !== "demo_scheduled") return false;
        if (!inquiry?.demoDate) return false;
        const todayLocal = new Date();
        todayLocal.setHours(0, 0, 0, 0);
        const demoLocal = new Date(inquiry.demoDate);
        demoLocal.setHours(0, 0, 0, 0);
        const isPastOrToday = demoLocal.getTime() <= todayLocal.getTime();
        return isPastOrToday;
      })();

  const productId = String(inquiry?.product?.id || inquiry?.productId || "");
  const productName = inquiry?.product?.name || "No Product";

  const industries = isGroup
    ? Array.from(inquiry.industries)
    : [inquiry?.industry?.name].filter(Boolean);

  const statuses = isGroup
    ? Array.from(inquiry.statuses)
    : [inquiry?.status].filter(Boolean);

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

  const attendingPersons = isGroup
    ? Array.from(
        new Map(
          inquiries
            .map((inq: any) => inq?.attendingPerson)
            .filter(Boolean)
            .map((ap: any) => [ap.id ?? ap, ap])
        ).values()
      )
    : [inquiry?.attendingPerson].filter(Boolean);

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

  const formattedInquiryDate =
    !isGroup && inquiry?.inquiryDate
      ? new Date(inquiry.inquiryDate).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : null;

  const groupInquiryDates: any[] = isGroup
    ? [
        ...new Set(
          inquiries
            .filter((inq: any) => inq?.inquiryDate)
            .map((inq: any) =>
              new Date(inq.inquiryDate).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            )
        ),
      ]
    : [];

  const numberOfUsers = isGroup
    ? inquiry.totalUsers
    : (inquiry?.numberOfUsers ?? null);

  // Handler to silence ALL inquiries in a group at once
  // const silenceGroup = () => {
  //   inquiries.forEach((inq: any) => {
  //     const id = inq.id || inq._id;
  //     if (!silencedInquiries.includes(id)) {
  //       silenceInquiry(id);
  //     }
  //   });
  // };

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
          shouldBlink && "demo-reminder-blink"
        )}
      >
        <div className="w-1 bg-muted-foreground/40 rounded-full h-8 shrink-0" />

        {/* Product Name + Company + Contact */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h3
              className="text-sm font-bold text-foreground truncate cursor-pointer hover:text-primary transition-colors"
              onClick={() => onProductClick?.(productId)}
            >
              {productName}
            </h3>
            {shouldBlink && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.15)] shrink-0">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500"></span>
                </span>
                Demo Overdue / Today
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground truncate font-medium">
            Company: {isGroup ? companies.join(", ") : companies[0] || "N/A"}
          </p>
          <p className="text-[11px] text-muted-foreground truncate font-medium">
            Contact Person:{" "}
            {isGroup
              ? contacts.map((c: any) => c.name).join(", ")
              : (inquiry?.contactPerson?.fullName ??
                inquiry?.contactPerson ??
                "N/A")}
          </p>
        </div>

        {/* Status */}
        <div className="w-32 shrink-0 text-center flex flex-wrap justify-center gap-1">
          {statuses.map((s: any) => (
            <div
              key={s}
              className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap uppercase tracking-wider",
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
                className="rounded-full px-3 py-1 text-[10px] whitespace-nowrap font-bold uppercase tracking-wide"
              >
                {ind}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-muted-foreground">N/A</span>
          )}
        </div>

        {/* Contact Person */}
        <div className="w-28 shrink-0 text-xs text-foreground font-semibold text-center truncate px-2">
          {isGroup
            ? contacts.map((c: any) => c.name).join(", ")
            : (inquiry?.contactPerson?.fullName ??
              inquiry?.contactPerson ??
              "—")}
        </div>

        {/* Inquiry Date */}
        <div className="w-28 shrink-0 text-[11px] text-muted-foreground flex items-center justify-center">
          {isGroup ? (
            groupInquiryDates.length > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/50 border border-muted cursor-default w-fit text-[10px]">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span className="font-semibold">
                        {groupInquiryDates.length} Date
                        {groupInquiryDates.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[180px] p-2">
                    <div className="flex flex-col gap-1">
                      {groupInquiryDates.map((d) => (
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
            <div className="flex items-center gap-1.5 justify-center">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{formattedInquiryDate || "—"}</span>
            </div>
          )}
        </div>

        {/* Demo Date */}
        <div className="w-28 shrink-0 text-[11px] text-muted-foreground flex items-center justify-center">
          {isGroup ? (
            groupDemoDates.length > 0 ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-muted/50 border border-muted cursor-default w-fit text-[10px]">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
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
            <div className="flex items-center gap-1.5 justify-center">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-medium">{demoDate || "—"}</span>
            </div>
          )}
        </div>

        {/* Number of Users */}
        <div className="w-26 shrink-0 text-xs text-foreground font-semibold text-center truncate px-2">
          {numberOfUsers !== null && numberOfUsers !== undefined && numberOfUsers !== 0
            ? numberOfUsers
            : "—"}
        </div>

        {/* Attending Person */}
        <div className="w-26 shrink-0 flex items-center justify-center -space-x-2 overflow-visible">
          <TooltipProvider>
            {attendingPersons.slice(0, 3).map((ap: any, idx: number) => {
              const name =
                ap?.fullName ?? (typeof ap === "string" ? ap : "N/A");
              const pic = ap?.profilePicUrl ?? null;
              return (
                <Tooltip key={ap?.id ?? idx}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-8 w-8 border-2 border-background shrink-0 hover:scale-110 transition-transform">
                      <AvatarImage src={pic || undefined} alt={name} />
                      <AvatarFallback className="text-foreground text-[10px] font-bold bg-muted">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p className="text-xs font-semibold">{name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {attendingPersons.length > 3 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-background bg-secondary text-[9px] font-bold text-muted-foreground relative z-10 cursor-default hover:bg-secondary/80 transition-colors shrink-0">
                      +{attendingPersons.length - 3}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="space-y-1">
                      <p className="font-semibold text-xs border-b pb-1 mb-1">
                        Additional Team Members:
                      </p>
                      {attendingPersons.slice(3).map((ap: any, idx: number) => {
                        const name =
                          ap?.fullName ?? (typeof ap === "string" ? ap : "N/A");
                        const email = ap?.email ?? null;
                        return (
                          <div
                            key={ap?.id ?? idx}
                            className="flex flex-col py-1 border-b last:border-0"
                          >
                            <p className="text-[10px] font-medium text-foreground">
                              {name}
                            </p>
                            {email && (
                              <p className="text-[9px] text-muted-foreground">
                                {email}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {attendingPersons.length === 0 && (
              <span className="text-xs text-muted-foreground/50">—</span>
            )}
          </TooltipProvider>
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
        shouldBlink && "demo-reminder-blink"
      )}
    >
      {/* Header: Product Name & Inquiry Count only */}
      <div className="flex items-start justify-between mb-3">
        <h3
          className="text-lg font-bold text-foreground leading-tight cursor-pointer hover:text-rose-600 dark:hover:text-rose-500 transition-colors pr-4"
          onClick={() => onProductClick?.(productId)}
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

      {shouldBlink && (
        <div className="mb-3 flex items-center justify-between p-2.5 rounded-lg border border-red-200 dark:border-red-950/40 bg-red-50 dark:bg-red-950/15 shadow-sm animate-pulse">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
              Urgent: Demo Reminder
            </span>
          </div>
          <span className="text-[10px] font-medium text-red-500/80 dark:text-red-400/80">
            {isGroup ? "Overdue Demos" : "Overdue / Today"}
          </span>
        </div>
      )}

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
      </div>

      {/* Main Avatar Stack */}
      <div className="mb-6">
        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-2">
          Attending Person
        </p>
        <div className="flex items-center -space-x-3 overflow-visible">
          <TooltipProvider>
            {attendingPersons.slice(0, 5).map((ap: any, idx: number) => {
              const name =
                ap?.fullName ?? (typeof ap === "string" ? ap : "N/A");
              const pic = ap?.profilePicUrl ?? null;
              return (
                <Tooltip key={ap?.id ?? idx}>
                  <TooltipTrigger asChild>
                    <Avatar className="h-10 w-10 border-2 border-background shrink-0 cursor-pointer hover:scale-110 transition-transform">
                      <AvatarImage src={pic || undefined} alt={name} />
                      <AvatarFallback className="text-foreground text-[11px] font-semibold bg-muted">
                        {getInitials(name)}
                      </AvatarFallback>
                    </Avatar>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs font-medium">{name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
            {attendingPersons.length > 5 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-background bg-secondary text-[11px] font-bold text-muted-foreground relative z-10 cursor-default hover:bg-secondary/80 transition-colors shrink-0">
                      +{attendingPersons.length - 5}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <div className="space-y-1">
                      <p className="font-semibold text-xs border-b pb-1 mb-1">
                        Additional Team Members:
                      </p>
                      {attendingPersons.slice(5).map((ap: any, idx: number) => {
                        const name =
                          ap?.fullName ?? (typeof ap === "string" ? ap : "N/A");
                        const email = ap?.email ?? null;
                        return (
                          <div
                            key={ap?.id ?? idx}
                            className="flex flex-col py-1 border-b last:border-0"
                          >
                            <p className="text-[10px] font-medium text-foreground">
                              {name}
                            </p>
                            {email && (
                              <p className="text-[9px] text-muted-foreground">
                                {email}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </TooltipProvider>
        </div>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center h-7 w-7 rounded-full border-2 border-background bg-secondary text-[9px] font-bold text-muted-foreground relative z-10 cursor-default hover:bg-secondary/80 transition-colors shrink-0">
                        +{companies.length - 4}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="space-y-1">
                        <p className="font-semibold text-xs border-b pb-1 mb-1">
                          Additional Companies:
                        </p>
                        {companies.slice(4).map((company: any, idx: number) => {
                          return (
                            <div
                              key={idx}
                              className="flex flex-col py-1 border-b last:border-0"
                            >
                              <p className="text-[10px] font-medium text-foreground">
                                {company}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-center h-7 w-7 rounded-full border-2 border-background bg-secondary text-[9px] font-bold text-muted-foreground relative z-10 cursor-default hover:bg-secondary/80 transition-colors shrink-0">
                        +{contacts.length - 4}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <div className="space-y-1">
                        <p className="font-semibold text-xs border-b pb-1 mb-1">
                          Additional Contact Persons:
                        </p>
                        {contacts.slice(4).map((contact: any, idx: number) => {
                          return (
                            <div
                              key={contact.id || idx}
                              className="flex flex-col py-1 border-b last:border-0"
                            >
                              <p className="text-[10px] font-medium text-foreground">
                                {contact.name}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
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

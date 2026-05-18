/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useProductInquiryStore } from "../stores/useProductInquiry";
import {
  useCreateProductInquiryComment,
  useDeleteProductInquiryComment,
  useGetProductInquiryComments,
  useUpdateProductInquiry,
  useUpdateProductInquiryComment,
} from "../services";
import { useEffect, useRef, useState } from "react";
import { useAuthStore } from "@/stores/use-auth-store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Send,
  Pencil,
  Trash2,
  Check,
  X,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { DeleteModal } from "@/components/model/delete-model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PRODUCT_INQUIRY_STATUS,
  PRODUCT_INQUIRY_STATUS_OPTIONS,
} from "@/utils/constant";

export function CommentModal() {
  const { open, setOpen, currentRow, setCurrentRow } = useProductInquiryStore();
  const user = useAuthStore((state) => state.user);
  const currentUserId = user?.user?.id;

  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState(
    currentRow?.status || ""
  );
  const [statusOthersText, setStatusOthersText] = useState(
    currentRow?.others || ""
  );
  const [_, setDemoScheduled] = useState(false);
  const [demoDate, setDemoDate] = useState<Date | undefined>(
    currentRow?.demoDate ? new Date(currentRow.demoDate) : undefined
  );

  const inquiryId = currentRow?.id;
  const { data: commentsData, isLoading: loadingComments }: any =
    useGetProductInquiryComments(inquiryId);
  const { mutateAsync: createComment, isPending: creating } =
    useCreateProductInquiryComment(inquiryId);
  const { mutateAsync: updateComment } = useUpdateProductInquiryComment(
    inquiryId,
    editingCommentId || ""
  );
  const { mutateAsync: deleteComment, isPending: deleting } =
    useDeleteProductInquiryComment(inquiryId);
  const { mutateAsync: updateInquiryStatus, isPending: updatingStatus } =
    useUpdateProductInquiry(inquiryId, {
      closeOnSuccess: false,
      onSuccess: () => {
        if (currentRow) {
          setCurrentRow({
            ...currentRow,
            status: selectedStatus,
            demoDate: demoDate?.toISOString() || null,
            others:
              selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS
                ? statusOthersText
                : "",
          });
        }
      },
    });

  const scrollRef = useRef<HTMLDivElement>(null);
  const sortedComments = [...(commentsData?.data || [])].sort(
    (a: any, b: any) =>
      new Date(a.commentedAt || a.createdAt || 0).getTime() -
      new Date(b.commentedAt || b.createdAt || 0).getTime()
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [commentsData]);

  useEffect(() => {
    setSelectedStatus(currentRow?.status || "");
    setStatusOthersText(currentRow?.others || "");
    setDemoScheduled(false);
    setDemoDate(
      currentRow?.demoDate ? new Date(currentRow.demoDate) : undefined
    );
  }, [currentRow]);

  const handleSend = async () => {
    if (!commentText.trim()) return;
    try {
      const payload: any = { comment: commentText };
      if (
        selectedStatus === PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED &&
        demoDate
      ) {
        payload.demoDate = demoDate.toISOString();
      }
      await createComment(payload);
      setCommentText("");
    } catch {
      // Request-level feedback is handled by the mutation layer.
    }
  };

  const handleUpdate = async () => {
    if (!editText.trim() || !editingCommentId) return;
    try {
      await updateComment({ comment: editText });
      setEditingCommentId(null);
      setEditText("");
    } catch {
      // Request-level feedback is handled by the mutation layer.
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCommentId) return;
    try {
      await deleteComment(deletingCommentId);
      setDeletingCommentId(null);
    } catch {
      // Request-level feedback is handled by the mutation layer.
    }
  };

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const resetEditingState = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    if (status !== PRODUCT_INQUIRY_STATUS.OTHERS) {
      setStatusOthersText("");
    }
  };

  const getUpdatePayload = (
    status: string,
    others: string,
    date: Date | null | undefined
  ) => {
    if (!currentRow) return {};

    const toNumberOrNull = (value: any): number | null => {
      if (value === null || value === undefined || value === "") return null;
      return Number(value);
    };

    return {
      companyName: currentRow.companyName ?? "",
      attendingPerson: toNumberOrNull(
        currentRow.attendingPerson?.id ?? currentRow.attendingPerson
      ),
      contactPerson:
        currentRow.contactPerson?.fullName ?? currentRow.contactPerson ?? "",
      phoneNumber: currentRow.phoneNumber ?? "",
      emailId: currentRow.emailId ?? "",
      demoDate:
        status === PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED
          ? date
            ? (() => {
                const d = new Date(date);
                d.setHours(12, 0, 0, 0);
                return d.toISOString();
              })()
            : null
          : null,
      city: currentRow.city ?? "",
      industryId: toNumberOrNull(
        currentRow.industry?.id ?? currentRow.industryId
      ),
      productId: toNumberOrNull(currentRow.product?.id ?? currentRow.productId),
      numberOfUsers: toNumberOrNull(currentRow.numberOfUsers),
      requirements: currentRow.requirements ?? "",
      status: status,
      notes: currentRow.notes ?? "",
      others: others,
      trialStartDate: currentRow.trialStartDate
        ? new Date(currentRow.trialStartDate).toISOString()
        : null,
      trialEndDate: currentRow.trialEndDate
        ? new Date(currentRow.trialEndDate).toISOString()
        : null,
      inquiryDate: currentRow.inquiryDate
        ? new Date(currentRow.inquiryDate).toISOString()
        : null,
    };
  };

  const handleDemoDateUpdate = async (date: Date | undefined) => {
    setDemoDate(date);
  };

  const handleStatusSave = async () => {
    const isOthers = selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS;
    if (isOthers && !statusOthersText.trim()) return;

    const isDemoScheduled =
      selectedStatus === PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED;
    if (isDemoScheduled) {
      if (!demoDate) {
        toast.error("Please select a demo date.");
        return;
      }
      if (!commentText.trim()) {
        toast.error("Please type a comment to schedule the demo.");
        return;
      }
    }

    try {
      const payload = getUpdatePayload(
        selectedStatus,
        isOthers ? statusOthersText.trim() : "",
        demoDate
      );
      await updateInquiryStatus(payload);

      // Create comment ONLY when status is Demo Scheduled and is being saved
      if (isDemoScheduled && demoDate) {
        const commentDate = new Date(demoDate);
        commentDate.setHours(12, 0, 0, 0);

        await createComment({
          comment: commentText.trim(),
          demoDate: commentDate.toISOString(),
        });
        setCommentText("");
      }
    } catch {
      setSelectedStatus(currentRow?.status || "");
      setStatusOthersText(currentRow?.others || "");
    }
  };

  if (open !== "comment") return null;

  return (
    <>
      <Dialog
        open={open === "comment"}
        onOpenChange={(val) => setOpen(val ? "comment" : null)}
      >
        <DialogContent className="sm:max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-[#0a0e14] dark:text-slate-100">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Inquiry Status & Comments
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Full Width: Chat UI */}
            <div className="relative flex min-h-0 flex-1 flex-col bg-white dark:bg-[#0a0e14]">
              <ScrollArea className="flex-1 min-h-0 p-6">
                <div className="space-y-6 pb-4">
                  {sortedComments.length === 0 && !loadingComments && (
                    <div className="flex flex-col items-center gap-2 py-20 text-center italic text-slate-500 dark:text-slate-500">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/50">
                        <Send className="h-5 w-5 rotate-45 text-slate-400 dark:text-slate-600" />
                      </div>
                      No comments yet. Start the conversation!
                    </div>
                  )}
                  {sortedComments.map((msg: any) => {
                    const isMe = msg.commentedBy?.id === currentUserId;
                    const userName = msg.commentedBy?.fullName || "User";
                    const commentedAt = msg.commentedAt || msg.createdAt;
                    const isEditing = editingCommentId === msg.id;
                    return (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex w-full",
                          isMe ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "flex max-w-[85%] items-start gap-3 group",
                            isMe ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <Avatar className="h-10 w-10 border-2 border-slate-300 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                            <AvatarFallback className="text-xs font-black text-slate-600 dark:text-slate-300">
                              {getInitials(userName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1.5">
                            <div
                              className={cn(
                                "flex items-center gap-3 px-1",
                                isMe
                                  ? "justify-end flex-row-reverse"
                                  : "justify-start"
                              )}
                            >
                              <span className="text-[11px] font-black uppercase tracking-tight text-slate-500 dark:text-slate-400">
                                {isMe ? "You" : userName}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                                {commentedAt
                                  ? format(
                                      new Date(commentedAt),
                                      "MMM d, h:mm a"
                                    )
                                  : "-"}
                              </span>
                            </div>

                            <div
                              className={cn(
                                "flex flex-col gap-2",
                                isMe && "items-end"
                              )}
                            >
                              <div
                                className={cn(
                                  "relative rounded-2xl text-sm shadow-xl transition-all duration-200",
                                  isEditing &&
                                    "w-full min-w-[280px] max-w-[520px]"
                                )}
                              >
                                {isEditing ? (
                                  <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700/80 dark:bg-[#111722] dark:shadow-2xl dark:shadow-black/25">
                                    <div className="mb-2 flex items-center justify-between px-1">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                                        Editing comment
                                      </span>
                                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                        Press Enter to save
                                      </span>
                                    </div>
                                    <Textarea
                                      value={editText}
                                      onChange={(e) =>
                                        setEditText(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                          e.preventDefault();
                                          handleUpdate();
                                        }
                                      }}
                                      className="min-h-[96px] resize-none rounded-2xl border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 shadow-inner focus-visible:ring-2 focus-visible:ring-primary/30 dark:border-slate-600 dark:bg-[#0b1018] dark:text-slate-100 dark:shadow-black/20"
                                      autoFocus
                                    />
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                      <p className="text-xs text-slate-400 dark:text-slate-500">
                                        Shift + Enter for a new line
                                      </p>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-9 rounded-xl px-3 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                          onClick={resetEditingState}
                                        >
                                          <X className="mr-1.5 h-3.5 w-3.5" />
                                          Cancel
                                        </Button>
                                        <Button
                                          size="sm"
                                          className="h-9 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
                                          onClick={handleUpdate}
                                          disabled={!editText.trim()}
                                        >
                                          <Check className="mr-1.5 h-3.5 w-3.5" />
                                          Save Changes
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    className={cn(
                                      "relative p-4",
                                      isMe
                                        ? "rounded-2xl rounded-tr-none bg-primary text-primary-foreground ring-1 ring-primary/20"
                                        : "rounded-2xl rounded-tl-none border border-slate-200 bg-slate-100 text-slate-800 dark:border-slate-700/50 dark:bg-[#161b22] dark:text-slate-200"
                                    )}
                                  >
                                    <p
                                      className={cn(
                                        "leading-relaxed whitespace-pre-wrap",
                                        isMe ? "pr-0" : "pl-1"
                                      )}
                                    >
                                      {msg.comment}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {isMe && !isEditing && (
                                <div className="pointer-events-none flex translate-y-1 items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 p-1 opacity-0 shadow-lg transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 dark:border-slate-700/70 dark:bg-[#101722]/90 dark:shadow-black/10">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-full px-3 text-xs font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                    onClick={() => {
                                      setEditingCommentId(msg.id);
                                      setEditText(msg.comment);
                                    }}
                                  >
                                    <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                    Edit
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-full px-3 text-xs font-medium text-red-300 hover:bg-red-950/40 hover:text-red-200"
                                    onClick={() => setDeletingCommentId(msg.id)}
                                  >
                                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                                    Delete
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              </ScrollArea>
              {/* Action Area: Demo Scheduling and Status Update */}
              <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#0d1117]">
                <div className="mx-auto max-w-4xl space-y-3">
                  {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-3"> */}
                  {/* <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-white border border-slate-200 dark:bg-[#111722] dark:border-slate-800/80 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <CalendarIcon className="h-4 w-4" />
                          </div>
                          <h4 className="text-[10px] font-bold tracking-widest text-slate-900 dark:text-white uppercase">
                            Demo Scheduled
                          </h4>
                        </div>
                        <Switch
                          checked={demoScheduled}
                          onCheckedChange={(val) => {
                            setDemoScheduled(val);
                            if (!val) setDemoDate(undefined);
                          }}
                          className="scale-90"
                        />
                      </div>

                      {demoScheduled && (
                        <div className="animate-in fade-in slide-in-from-top-1">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-8 w-full justify-start text-xs font-normal border-slate-200 bg-white transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0b1018]",
                                  !demoDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                                {demoDate ? (
                                  format(demoDate, "PPP")
                                ) : (
                                  <span>Pick date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 rounded-xl"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={demoDate}
                                onSelect={handleDemoDateUpdate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                    </div> */}

                  {/* Status Update Section (Condensed) */}
                  <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-white border border-slate-200 dark:bg-[#111722] dark:border-slate-800/80 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 whitespace-nowrap pl-1">
                        Status
                      </span>
                      <div className="flex flex-1 items-center gap-2 justify-end">
                        <Select
                          value={selectedStatus}
                          onValueChange={handleStatusChange}
                          disabled={updatingStatus}
                        >
                          <SelectTrigger className="h-8 w-[160px] rounded-lg border-slate-300 bg-white text-[11px] text-slate-800 dark:border-slate-700 dark:bg-[#0b1018] dark:text-slate-200">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent className="max-h-72 border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-[#101722] dark:text-slate-200">
                            {PRODUCT_INQUIRY_STATUS_OPTIONS.map((status) => (
                              <SelectItem
                                key={status.value}
                                value={status.value}
                                className="text-xs"
                              >
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button
                          type="button"
                          className="h-8 rounded-lg bg-primary px-3 text-[11px] font-semibold text-primary-foreground hover:bg-primary/90"
                          onClick={handleStatusSave}
                          disabled={
                            updatingStatus ||
                            (selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS &&
                              !statusOthersText.trim()) ||
                            (selectedStatus ===
                              PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED &&
                              !demoDate) ||
                            (selectedStatus === currentRow?.status &&
                              (selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS
                                ? statusOthersText ===
                                  (currentRow?.others || "")
                                : selectedStatus ===
                                    PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED
                                  ? demoDate?.getTime() ===
                                    (currentRow?.demoDate
                                      ? new Date(currentRow.demoDate).getTime()
                                      : 0)
                                  : true))
                          }
                        >
                          {updatingStatus ? "..." : "Save"}
                        </Button>
                      </div>
                    </div>
                    {selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS && (
                      <Textarea
                        value={statusOthersText}
                        onChange={(e) => setStatusOthersText(e.target.value)}
                        placeholder="Notes..."
                        className="min-h-[32px] max-h-[60px] rounded-lg border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-[#0b1018] dark:text-slate-200"
                      />
                    )}

                    {selectedStatus ===
                      PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED && (
                      <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 pl-1">
                            Demo Date
                          </span>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "h-8 w-[160px] justify-start text-xs font-normal border-slate-300 bg-white transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0b1018] dark:text-slate-200",
                                  !demoDate && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                                {demoDate ? (
                                  format(demoDate, "PPP")
                                ) : (
                                  <span>Pick date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0 rounded-xl"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={demoDate}
                                onSelect={handleDemoDateUpdate}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>

                        {(() => {
                          if (!demoDate) return null;
                          const todayLocal = new Date();
                          todayLocal.setHours(0, 0, 0, 0);
                          const demoLocal = new Date(demoDate);
                          demoLocal.setHours(0, 0, 0, 0);
                          const isPastOrToday =
                            demoLocal.getTime() <= todayLocal.getTime();

                          if (!isPastOrToday) return null;

                          return (
                            <div className="flex items-center gap-2 p-2.5 rounded-lg border border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/10 mt-1 animate-pulse">
                              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                                <span className="relative flex h-2.5 w-2.5">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                </span>
                              </div>
                              <span className="text-[10px] font-bold tracking-wider text-red-600 dark:text-red-400 uppercase">
                                Action Required: Demo Reminder Active
                              </span>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                  {/* </div> */}
                </div>

                <div className="flex gap-3 items-end max-w-4xl mx-auto pt-4 border-t border-dashed border-slate-200 dark:border-slate-800/50 mt-4">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type your comment or update here..."
                      className="min-h-[50px] max-h-[150px] resize-none rounded-2xl border-slate-300 bg-white py-3.5 pr-12 text-slate-800 transition-all placeholder:text-slate-400 focus:border-primary/30 focus:ring-2 focus:ring-primary/20 dark:border-slate-700/50 dark:bg-[#161b22] dark:text-slate-200 dark:placeholder:text-slate-600"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                  </div>
                  <Button
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-2xl transition-all duration-300 shadow-lg shadow-primary/10",
                      commentText.trim()
                        ? "bg-primary hover:bg-primary/90 scale-100"
                        : "scale-95 bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                    )}
                    onClick={handleSend}
                    disabled={creating || !commentText.trim()}
                  >
                    <Send
                      className={cn("h-5 w-5", creating && "animate-pulse")}
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DeleteModal
        isOpen={!!deletingCommentId}
        onClose={() => setDeletingCommentId(null)}
        onConfirm={handleDeleteConfirm}
        itemName="this comment"
        loading={deleting}
      />
    </>
  );
}

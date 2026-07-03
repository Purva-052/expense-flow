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
  Info,
  MessageSquare,
  ClipboardList,
  PhoneCall,
  UserX,
  BellOff,
  CalendarClock,
  CalendarCheck,
  FileText,
  Trophy,
  XCircle,
  FlaskConical,
  MoreHorizontal,
  type LucideIcon,
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
  PRODUCT_INQUIRY_STATUS,
  PRODUCT_INQUIRY_STATUS_OPTIONS,
} from "@/utils/constant";

type StatusMeta = {
  icon: LucideIcon;
  description: string;
  iconWrap: string;
  selected: string;
  dot: string;
  dotFill: string;
};

const STATUS_META: Record<string, StatusMeta> = {
  [PRODUCT_INQUIRY_STATUS.CONTACTED]: {
    icon: PhoneCall,
    description: "We have contacted the client.",
    iconWrap: "bg-emerald-500/15 text-emerald-500",
    selected: "border-emerald-500 bg-emerald-500/10",
    dot: "border-emerald-500",
    dotFill: "bg-emerald-500",
  },
  [PRODUCT_INQUIRY_STATUS.UNQUALIFIED]: {
    icon: UserX,
    description: "This lead is not qualified.",
    iconWrap: "bg-slate-500/15 text-slate-400",
    selected: "border-slate-400 bg-slate-500/10",
    dot: "border-slate-400",
    dotFill: "bg-slate-400",
  },
  [PRODUCT_INQUIRY_STATUS.NO_RESPONSE]: {
    icon: BellOff,
    description: "No response from the client yet.",
    iconWrap: "bg-amber-500/15 text-amber-500",
    selected: "border-amber-500 bg-amber-500/10",
    dot: "border-amber-500",
    dotFill: "bg-amber-500",
  },
  [PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED]: {
    icon: CalendarClock,
    description: "A demo has been scheduled.",
    iconWrap: "bg-blue-500/15 text-blue-500",
    selected: "border-blue-500 bg-blue-500/10",
    dot: "border-blue-500",
    dotFill: "bg-blue-500",
  },
  [PRODUCT_INQUIRY_STATUS.DEMO_COMPLETED]: {
    icon: CalendarCheck,
    description: "The demo has been completed.",
    iconWrap: "bg-indigo-500/15 text-indigo-500",
    selected: "border-indigo-500 bg-indigo-500/10",
    dot: "border-indigo-500",
    dotFill: "bg-indigo-500",
  },
  [PRODUCT_INQUIRY_STATUS.PROPOSAL_SHARED]: {
    icon: FileText,
    description: "Proposal has been shared with the client.",
    iconWrap: "bg-violet-500/15 text-violet-500",
    selected: "border-violet-500 bg-violet-500/10",
    dot: "border-violet-500",
    dotFill: "bg-violet-500",
  },
  [PRODUCT_INQUIRY_STATUS.WON]: {
    icon: Trophy,
    description: "The deal has been won.",
    iconWrap: "bg-green-500/15 text-green-500",
    selected: "border-green-500 bg-green-500/10",
    dot: "border-green-500",
    dotFill: "bg-green-500",
  },
  [PRODUCT_INQUIRY_STATUS.LOST]: {
    icon: XCircle,
    description: "The deal has been lost.",
    iconWrap: "bg-rose-500/15 text-rose-500",
    selected: "border-rose-500 bg-rose-500/10",
    dot: "border-rose-500",
    dotFill: "bg-rose-500",
  },
  [PRODUCT_INQUIRY_STATUS.TRIAL]: {
    icon: FlaskConical,
    description: "The client is on a trial.",
    iconWrap: "bg-cyan-500/15 text-cyan-500",
    selected: "border-cyan-500 bg-cyan-500/10",
    dot: "border-cyan-500",
    dotFill: "bg-cyan-500",
  },
  [PRODUCT_INQUIRY_STATUS.OTHERS]: {
    icon: MoreHorizontal,
    description: "Set a custom status note.",
    iconWrap: "bg-fuchsia-500/15 text-fuchsia-500",
    selected: "border-fuchsia-500 bg-fuchsia-500/10",
    dot: "border-fuchsia-500",
    dotFill: "bg-fuchsia-500",
  },
};

const DEFAULT_STATUS_META: StatusMeta = {
  icon: Info,
  description: "Update the inquiry status.",
  iconWrap: "bg-slate-500/15 text-slate-400",
  selected: "border-primary bg-primary/10",
  dot: "border-primary",
  dotFill: "bg-primary",
};

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
  const [activeTab, setActiveTab] = useState<"comment" | "status">("comment");
  const [selectedStatus, setSelectedStatus] = useState(
    currentRow?.status || ""
  );
  const [statusOthersText, setStatusOthersText] = useState(
    currentRow?.others || ""
  );
  const [_, setDemoScheduled] = useState(false);
  const [demoDate, setDemoDate] = useState<Date | undefined>(
    currentRow?.demoDate ? new Date(currentRow.demoDate) : new Date()
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
      currentRow?.demoDate ? new Date(currentRow.demoDate) : new Date()
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

  const isSaveDisabled =
    updatingStatus ||
    !selectedStatus ||
    (selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS &&
      !statusOthersText.trim()) ||
    (selectedStatus === PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED && !demoDate) ||
    (selectedStatus === currentRow?.status &&
      (selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS
        ? statusOthersText === (currentRow?.others || "")
        : selectedStatus === PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED
          ? demoDate?.getTime() ===
            (currentRow?.demoDate ? new Date(currentRow.demoDate).getTime() : 0)
          : true));

  if (open !== "comment") return null;

  const demoReminderActive = (() => {
    if (selectedStatus !== PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED || !demoDate)
      return false;
    const todayLocal = new Date();
    todayLocal.setHours(0, 0, 0, 0);
    const demoLocal = new Date(demoDate);
    demoLocal.setHours(0, 0, 0, 0);
    return demoLocal.getTime() <= todayLocal.getTime();
  })();

  const renderStatusPanel = () => (
    <>
      {/* Info banner */}
      <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800/80 dark:bg-[#111722]">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          Update the status of this inquiry. Adding a comment is optional.
        </p>
      </div>

      {/* Status options */}
      <ScrollArea className="min-h-0 flex-1">
        <div className="space-y-2 pb-2 pr-3">
          {PRODUCT_INQUIRY_STATUS_OPTIONS.map((status) => {
            const meta = STATUS_META[status.value] || DEFAULT_STATUS_META;
            const Icon = meta.icon;
            const isSelected = selectedStatus === status.value;
            return (
              <button
                type="button"
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={updatingStatus}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800/80 dark:bg-[#111722] dark:hover:border-slate-700 dark:hover:bg-[#161b22]",
                  isSelected && meta.selected
                )}
              >
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                    meta.iconWrap
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {status.label}
                  </span>
                  <span className="block truncate text-xs text-slate-500 dark:text-slate-400">
                    {meta.description}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected
                      ? meta.dot
                      : "border-slate-300 dark:border-slate-600"
                  )}
                >
                  {isSelected && (
                    <span
                      className={cn("h-2 w-2 rounded-full", meta.dotFill)}
                    />
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Others note */}
      {selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS && (
        <Textarea
          value={statusOthersText}
          onChange={(e) => setStatusOthersText(e.target.value)}
          placeholder="Add a note for this custom status..."
          className="min-h-[60px] rounded-xl border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-[#0b1018] dark:text-slate-200"
        />
      )}

      {/* Demo date */}
      {selectedStatus === PRODUCT_INQUIRY_STATUS.DEMO_SCHEDULED && (
        <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800/80 dark:bg-[#111722]">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Demo Date
            </span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "h-8 w-[150px] justify-start text-xs font-normal border-slate-300 bg-white transition-all hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0b1018] dark:text-slate-200",
                    !demoDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />
                  {demoDate ? format(demoDate, "PPP") : <span>Pick date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl" align="end">
                <Calendar
                  mode="single"
                  selected={demoDate}
                  onSelect={handleDemoDateUpdate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          {demoReminderActive && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50/50 p-2.5 dark:border-red-950/40 dark:bg-red-950/10">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                Action Required: Demo Reminder Active
              </span>
            </div>
          )}
        </div>
      )}

      {/* Optional comment */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Add Comment (Optional)
        </span>
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Add a comment (optional)..."
          className="min-h-[70px] resize-none rounded-xl border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-[#0b1018] dark:text-slate-200"
        />
      </div>

      <Button
        type="button"
        className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90"
        onClick={handleStatusSave}
        disabled={isSaveDisabled}
      >
        {updatingStatus ? "Updating..." : "Update Status"}
      </Button>
    </>
  );

  return (
    <>
      <Dialog
        open={open === "comment"}
        onOpenChange={(val) => setOpen(val ? "comment" : null)}
      >
        <DialogContent className="sm:max-w-5xl h-[85vh] p-0 flex flex-col overflow-hidden border border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-[#0a0e14] dark:text-slate-100">
          <DialogHeader className="flex flex-row items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2.5">
                <DialogTitle className="text-lg font-bold tracking-tight">
                  {currentRow?.companyName || "Inquiry"}
                </DialogTitle>
                {currentRow?.status && (
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-primary">
                    {PRODUCT_INQUIRY_STATUS_OPTIONS.find(
                      (o) => o.value === currentRow.status
                    )?.label || currentRow.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inquiry Status &amp; Comments
              </p>
            </div>
          </DialogHeader>

          <div className="flex flex-1 overflow-hidden">
            {/* Left: Timeline + composer */}
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

              {/* Bottom: Tabs + composer */}
              <div className="border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#0d1117]">
                {/* Tab bar */}
                <div className="flex items-center gap-1 border-b border-slate-200 px-4 pt-3 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab("comment")}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-3 pb-2.5 text-sm font-semibold transition-colors",
                      activeTab === "comment"
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Add Comment
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("status")}
                    className={cn(
                      "flex items-center gap-2 border-b-2 px-3 pb-2.5 text-sm font-semibold transition-colors lg:hidden",
                      activeTab === "status"
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    )}
                  >
                    <ClipboardList className="h-4 w-4" />
                    Update Status
                  </button>
                </div>

                {/* Tab content */}
                {activeTab === "comment" ? (
                  <div className="flex items-end gap-3 p-4">
                    <div className="relative flex-1">
                      <Textarea
                        placeholder="Type your comment here..."
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
                ) : (
                  <div className="flex max-h-[45vh] flex-col gap-3 overflow-y-auto p-4 lg:hidden">
                    {renderStatusPanel()}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Update Status panel (desktop) */}
            <div className="hidden w-[340px] shrink-0 flex-col gap-3 border-l border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-[#0d1117] lg:flex">
              <h3 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Update Status
              </h3>
              {renderStatusPanel()}
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

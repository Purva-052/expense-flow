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
import { Send, Pencil, Trash2, Check, X } from "lucide-react";
import { format } from "date-fns";
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
  formatProductInquiryStatusLabel,
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
            others:
              selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS
                ? statusOthersText
                : "",
          });
        }
      },
    });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [commentsData]);

  useEffect(() => {
    setSelectedStatus(currentRow?.status || "");
    setStatusOthersText(currentRow?.others || "");
  }, [currentRow?.status, currentRow?.others]);

  const handleSend = async () => {
    if (!commentText.trim()) return;
    try {
      await createComment({ comment: commentText });
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

  const handleStatusChange = async (status: string) => {
    setSelectedStatus(status);
    if (status === PRODUCT_INQUIRY_STATUS.OTHERS) {
      return;
    }
    setStatusOthersText("");
    try {
      await updateInquiryStatus({ status, others: "" });
    } catch {
      setSelectedStatus(currentRow?.status || "");
    }
  };

  const handleOthersStatusSave = async () => {
    if (!statusOthersText.trim()) return;
    try {
      await updateInquiryStatus({
        status: PRODUCT_INQUIRY_STATUS.OTHERS,
        others: statusOthersText.trim(),
      });
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
        <DialogContent className="sm:max-w-4xl h-[85vh] p-0 flex flex-col overflow-hidden bg-[#0a0e14] border-slate-800 text-slate-100">
          <DialogHeader className="p-4 border-b border-slate-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-xl font-bold tracking-tight">
              Inquiry Activity & Comments
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-1 max-h-[90vh] overflow-auto">
            {/* Left Side: Inquiry Details */}
            <div className="w-1/3 border-r border-slate-800 bg-[#0f141d] p-4 space-y-8 hidden md:block">
              {/* <div className="space-y-1">
                <h3 className="font-bold text-2xl tracking-tight">Inquiry Details</h3>
                <div className="h-1 w-20 bg-primary/40 rounded-full" />
              </div> */}

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Company Name
                  </label>
                  <p className="text-lg font-semibold text-slate-200 mt-1">
                    {currentRow?.companyName || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Contact Person
                  </label>
                  <p className="text-lg font-semibold text-slate-200 mt-1">
                    {currentRow?.contactPerson?.fullName ||
                      currentRow?.contactPerson ||
                      "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Industry
                  </label>
                  <p className="text-lg font-semibold text-slate-200 mt-1">
                    {currentRow?.industry?.name || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Status
                  </label>
                  <div className="mt-2">
                    <span className="px-3 py-1.5 bg-primary/20 text-primary rounded-md text-xs font-black uppercase tracking-tighter border border-primary/30">
                      {formatProductInquiryStatusLabel(currentRow?.status)}
                    </span>
                  </div>
                  {currentRow?.status === PRODUCT_INQUIRY_STATUS.OTHERS &&
                    currentRow?.others && (
                      <p className="mt-2 text-sm text-slate-400">
                        {currentRow.others}
                      </p>
                    )}
                </div>
              </div>
            </div>

            {/* Right Side: Chat UI */}
            <div className="flex-1 flex flex-col bg-[#0a0e14] relative">
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6 pb-4">
                  {commentsData?.data?.length === 0 && !loadingComments && (
                    <div className="text-center py-20 text-slate-500 italic flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center">
                        <Send className="h-5 w-5 text-slate-600 rotate-45" />
                      </div>
                      No comments yet. Start the conversation!
                    </div>
                  )}
                  {commentsData?.data?.map((msg: any) => {
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
                          <Avatar className="h-10 w-10 border-2 border-slate-700 bg-slate-800 shadow-lg">
                            <AvatarFallback className="text-xs font-black text-slate-300">
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
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-tight">
                                {isMe ? "You" : userName}
                              </span>
                              <span className="text-[10px] text-slate-500 font-medium">
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
                                  <div className="rounded-3xl border border-slate-700/80 bg-[#111722] p-3 shadow-2xl shadow-black/25">
                                    <div className="mb-2 flex items-center justify-between px-1">
                                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                        Editing comment
                                      </span>
                                      <span className="text-[11px] text-slate-500">
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
                                      className="min-h-[96px] resize-none rounded-2xl border-slate-600 bg-[#0b1018] px-4 py-3 text-sm text-slate-100 shadow-inner shadow-black/20 focus-visible:ring-2 focus-visible:ring-primary/30"
                                      autoFocus
                                    />
                                    <div className="mt-3 flex items-center justify-between gap-3">
                                      <p className="text-xs text-slate-500">
                                        Shift + Enter for a new line
                                      </p>
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-9 rounded-xl px-3 text-xs text-slate-300 hover:bg-slate-800 hover:text-white"
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
                                        : "rounded-2xl rounded-tl-none border border-slate-700/50 bg-[#161b22] text-slate-200"
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
                                <div className="pointer-events-none flex translate-y-1 items-center gap-1.5 rounded-full border border-slate-700/70 bg-[#101722]/90 p-1 opacity-0 shadow-lg shadow-black/10 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 rounded-full px-3 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
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

              {/* Input area */}
              <div className="p-6 border-t border-slate-800 bg-[#0d1117]">
                <div className="mx-auto mb-4 flex max-w-4xl flex-col gap-2 rounded-2xl border border-slate-800/80 bg-[#111722] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                    <span className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500">
                      Update Status:
                    </span>
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
                      <Select
                        value={selectedStatus}
                        onValueChange={handleStatusChange}
                        disabled={updatingStatus}
                      >
                        <SelectTrigger className="h-9 w-full min-w-[220px] rounded-xl border-slate-700 bg-[#0b1018] text-sm text-slate-200 sm:w-[240px]">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 border-slate-800 bg-[#101722] text-slate-200">
                          {PRODUCT_INQUIRY_STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS && (
                        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                          <Textarea
                            value={statusOthersText}
                            onChange={(e) =>
                              setStatusOthersText(e.target.value)
                            }
                            placeholder="Additional notes about the status"
                            className="min-h-[44px] rounded-xl border-slate-700 bg-[#0b1018] px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 sm:min-h-[44px] sm:max-h-[92px]"
                          />
                          <Button
                            type="button"
                            className="h-10 rounded-xl bg-primary px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
                            onClick={handleOthersStatusSave}
                            disabled={
                              updatingStatus || !statusOthersText.trim()
                            }
                          >
                            Save Status
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {updatingStatus
                      ? "Updating status..."
                      : selectedStatus === PRODUCT_INQUIRY_STATUS.OTHERS
                        ? "Add a note before saving Others"
                        : "Changes apply instantly"}
                  </span>
                </div>

                <div className="flex gap-3 items-end max-w-4xl mx-auto">
                  <div className="flex-1 relative">
                    <Textarea
                      placeholder="Type your comment or update here..."
                      className="min-h-[50px] max-h-[150px] resize-none pr-12 py-3.5 rounded-2xl bg-[#161b22] border-slate-700/50 text-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-slate-600"
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
                        : "bg-slate-800 text-slate-600 scale-95"
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

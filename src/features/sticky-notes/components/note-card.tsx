import { useState } from "react";
import { Trash2, Edit2, Lock, Globe, Clipboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { COLORS } from "./color-picker";

interface NoteCardProps {
  note: any;
  onView: (note: any) => void;
  onEdit: (note: any) => void;
  onDelete: (id: string) => void;
  onCopy: (note: any) => Promise<boolean>;
}

export const NoteCard = ({
  note,
  onView,
  onEdit,
  onDelete,
  onCopy,
}: NoteCardProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const colorObj = COLORS.find((c) => c.id === note.color) || COLORS[0];

  const handleCopyClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const success = await onCopy(note);
    if (success) {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleCardClick = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }
    onView(note);
  };
  const isPublic = note.isPublic === true || note.isPublic === "true";
  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group relative p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border cursor-pointer h-[200px] flex flex-col",
        colorObj.bg,
        colorObj.border
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {note.title && (
              <h4 className="font-bold text-gray-900 dark:text-gray-100 truncate text-lg">
                {note.title}
              </h4>
            )}

            <Badge
              className={`h-5 px-2 text-[10px] font-semibold flex gap-1 items-center
    ${
      isPublic
        ? "bg-green-100 text-green-700 border-green-300 dark:bg-green-950/40 dark:text-green-400 dark:border-green-800"
        : "bg-gray-200 text-gray-600 border-gray-300 dark:bg-gray-800/60 dark:text-gray-400 dark:border-gray-700"
    }`}
            >
              {isPublic ? (
                <Globe className="w-3 h-3" />
              ) : (
                <Lock className="w-3 h-3" />
              )}
              {isPublic ? "Public" : "Private"}
            </Badge>
          </div>
        </div>
        <div
          className="flex gap-1 shrink-0 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <TooltipProvider>
            <Tooltip open={isCopied}>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
                  onClick={handleCopyClick}
                >
                  <Clipboard className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                side="top"
                className="bg-gray-900 text-white font-medium dark:bg-gray-800"
              >
                Copied!
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-black/5 dark:hover:bg-white/10 rounded-full"
            onClick={() => onEdit(note)}
          >
            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-red-500/20 rounded-full"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>
      <div
        className="text-sm text-gray-700 dark:text-gray-300 overflow-hidden text-ellipsis line-clamp-4 sticky-note-content break-words flex-1 select-text"
        dangerouslySetInnerHTML={{ __html: note.description }}
      />
      <div className="flex items-center justify-end gap-2 mt-auto pt-3 border-t border-black/5 dark:border-white/10 text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        <span>{note.createdBy?.name}</span>
        <span className="opacity-30">•</span>
        <span>
          {note.createdAt
            ? new Date(note.createdAt).toLocaleDateString()
            : "Just now"}
        </span>
      </div>
    </div>
  );
};

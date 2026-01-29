import { Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COLORS } from "./color-picker";

interface NoteCardProps {
  note: any;
  onView: (note: any) => void;
  onEdit: (note: any) => void;
  onDelete: (id: string) => void;
}

export const NoteCard = ({ note, onView, onEdit, onDelete }: NoteCardProps) => {
  const colorObj = COLORS.find((c) => c.id === note.color) || COLORS[0];

  return (
    <div
      onClick={() => onView(note)}
      className={cn(
        "group relative p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border cursor-pointer h-[200px] flex flex-col",
        colorObj.bg,
        colorObj.border
      )}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            {note.title && (
              <h4 className="font-bold text-gray-900 truncate text-lg">
                {note.title}
              </h4>
            )}
          </div>
        </div>
        <div
          className="flex gap-1 shrink-0 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-black/5 rounded-full"
            onClick={() => onEdit(note)}
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
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
        className="text-sm text-gray-700 overflow-hidden text-ellipsis line-clamp-4 sticky-note-content break-words flex-1"
        dangerouslySetInnerHTML={{ __html: note.description }}
      />
      <div className="flex items-center justify-end gap-2 mt-auto pt-3 border-t border-black/5 text-[10px] font-semibold text-gray-500 uppercase tracking-wider">
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

import { Trash2, Edit2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { COLORS } from "./color-picker";
import { useGetStickyNoteById } from "../services/sticky-note-services";

interface NoteViewProps {
  noteId: string;
  onEdit: (note: any) => void;
  onDelete: (id: string) => void;
}

export const NoteView = ({ noteId, onEdit, onDelete }: NoteViewProps) => {
  const { data: noteResponse, isLoading } = useGetStickyNoteById(noteId) as any;
  const note = noteResponse?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px] text-muted-foreground">
        Note not found
      </div>
    );
  }

  const colorObj = COLORS.find((c) => c.id === note.color) || COLORS[0];

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div
        className={cn(
          "p-8 rounded-2xl shadow-lg border-2",
          colorObj.bg,
          colorObj.border
        )}
      >
        <div className="flex justify-between items-start mb-6">
          <div>
            {note.title && (
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {note.title}
              </h3>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
              <span>{note.createdBy?.name}</span>
              <span>•</span>
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-black/5"
              onClick={() => onEdit(note)}
            >
              <Edit2 className="w-5 h-5 text-gray-600" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full hover:bg-red-500/10"
              onClick={() => onDelete(note.id)}
            >
              <Trash2 className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        </div>
        <div
          className="prose prose-sm max-w-none text-gray-800 ck-content sticky-note-content min-h-[200px]"
          dangerouslySetInnerHTML={{ __html: note.description }}
        />
      </div>
    </div>
  );
};

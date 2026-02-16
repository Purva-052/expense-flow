import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DeleteModal } from "@/components/model/delete-model";
import { useProjectsStore } from "@/features/projects/stores/useProjectsStore";
import { Button } from "@/components/ui/button";
import { Plus, X, Loader2 } from "lucide-react";
import {
  useGetStickyNotes,
  useCreateStickyNote,
  useUpdateStickyNote,
  useDeleteStickyNote,
} from "@/features/sticky-notes/services/sticky-note-services";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NoteCard } from "./note-card";
import { NoteEditor } from "./note-editor";
import { NoteView } from "./note-view";

export const StickyNotesDialog = () => {
  const { open, setOpen, currentRow } = useProjectsStore();
  const isOpen = open === "sticky-note";

  const { data: notesData, isLoading } = useGetStickyNotes(
    currentRow?.id
  ) as any;
  const { mutateAsync: createNote } = useCreateStickyNote();
  const { mutateAsync: updateNote } = useUpdateStickyNote();
  const { mutateAsync: deleteNote } = useDeleteStickyNote();

  const [isAdding, setIsAdding] = useState(false);
  const [viewingNote, setViewingNote] = useState<any>(null);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setEditingNote(null);
    setIsAdding(true);
    setViewingNote(null);
  };

  const handleClose = () => {
    setOpen(null);
    setIsAdding(false);
    setViewingNote(null);
    setEditingNote(null);
  };

  const handleSave = async (data: any) => {
    try {
      if (editingNote?.id) {
        await updateNote({
          id: editingNote.id,
          data: {
            title: data.title,
            description: data.content,
            color: data.color,
            isCompleted: false,
          },
        });
      } else {
        await createNote({
          title: data.title,
          description: data.content,
          color: data.color,
          isCompleted: false,
          projectId: Number(currentRow?.id),
        });
      }
      setIsAdding(false);
      setEditingNote(null);
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  const startEdit = (note: any) => {
    setEditingNote(note);
    setIsAdding(true);
    setViewingNote(null);
  };

  const handleDelete = (noteId: string) => {
    setNoteToDelete(noteId);
    setIsDeleteDialogOpen(true);
  };

  const handleCopy = async (note: any) => {
    try {
      const temp = document.createElement("div");
      temp.innerHTML = note?.description ?? "";
      const text = temp.textContent || temp.innerText || "";
      if (!text) {
        return false;
      }

      // Try modern Clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        try {
          await navigator.clipboard.writeText(text);
          return true;
        } catch (err) {
          // Fall through to execCommand fallback
        }
      }

      // Fallback for older browsers: use textarea + execCommand
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.top = "0";
      textarea.style.left = "0";
      textarea.style.width = "1px";
      textarea.style.height = "1px";
      textarea.style.padding = "0";
      textarea.style.border = "none";
      textarea.style.outline = "none";
      textarea.style.boxShadow = "none";
      textarea.style.background = "transparent";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    } catch (error) {
      console.error("Failed to copy note", error);
      return false;
    }
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;
    try {
      await deleteNote(noteToDelete);
      if (viewingNote?.id === noteToDelete) {
        setViewingNote(null);
      }
    } catch (error) {
      console.error("Failed to delete note", error);
    } finally {
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="max-w-4xl h-[80vh] flex flex-col bg-gray-50/95 backdrop-blur-sm p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 border-b bg-white/80 sticky top-0 z-10 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-bold bg-clip-text text-black">
              {isAdding
                ? editingNote
                  ? "Edit Note"
                  : "Add Note"
                : viewingNote
                  ? "View Note"
                  : "Sticky Notes"}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{currentRow?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isAdding && !viewingNote && (
              <Button onClick={handleOpenAdd}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
              </Button>
            )}
            {(isAdding || viewingNote) && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsAdding(false);
                  setViewingNote(null);
                }}
              >
                Back to List
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden relative bg-grid-black/[0.02]">
          <ScrollArea className="h-full w-full p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <Loader2 className="w-10 h-10 animate-spin text-primary/50" />
              </div>
            ) : isAdding ? (
              <NoteEditor
                initialData={
                  editingNote
                    ? {
                        title: editingNote.title ?? "",
                        content: editingNote.description,
                        color: editingNote.color ?? "yellow",
                      }
                    : undefined
                }
                onSave={handleSave}
                onCancel={() => setIsAdding(false)}
              />
            ) : viewingNote ? (
              <NoteView
                noteId={viewingNote.id}
                onEdit={startEdit}
                onDelete={handleDelete}
              />
            ) : notesData?.data?.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[50vh] text-center opacity-60">
                <div className="w-24 h-24 bg-yellow-100 rounded-lg rotate-3 mb-4 shadow-sm border border-yellow-200 flex items-center justify-center">
                  <span className="text-4xl">📝</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">No Stickies Yet</h3>
                <p className="text-muted-foreground max-w-sm">
                  Add a sticky note to keep track of quick thoughts, reminders,
                  or important tasks for this project.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 border-dashed"
                  onClick={handleOpenAdd}
                >
                  Create your first note
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20 w-full max-w-full px-1">
                {notesData?.data?.map((note: any) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onView={setViewingNote}
                    onEdit={startEdit}
                    onDelete={handleDelete}
                    onCopy={handleCopy}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName="this note"
      />
    </Dialog>
  );
};

"use client";

import { useState } from "react";
import { DeleteModal } from "@/components/model/delete-model";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, ArrowLeft } from "lucide-react";
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
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useDebounce from "@/hooks/use-debaunce";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StickyNotesTabProps {
  projectId: number | string;
  projectName?: string;
}

export const StickyNotesTab = ({ projectId }: StickyNotesTabProps) => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search, 500);

  const { data: notesData, isLoading } = useGetStickyNotes({
    projectId: projectId?.toString(),
    search: debouncedSearch,
    page: currentPage,
    limit: pageSize,
    pagination: true,
  }) as any;
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
            isPublic: data.isPublic,
          },
        });
      } else {
        await createNote({
          title: data.title,
          description: data.content,
          color: data.color,
          isCompleted: false,
          projectId: Number(projectId),
          isPublic: data.isPublic,
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
    <Card className="gap-3">
      <CardHeader className="px-0 gap-0">
        <div className="flex items-center justify-between border-b pb-2">
          <h2 className="text-2xl font-bold text-black">
            {isAdding
              ? editingNote
                ? "Edit Note"
                : "Add Note"
              : viewingNote
                ? "View Note"
                : "Sticky Notes"}
          </h2>

          <div className="flex items-center gap-4">
            {!isAdding && !viewingNote && (
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-9 h-9 rounded-full"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              {!isAdding && !viewingNote && (
                <Button onClick={handleOpenAdd} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Note
                </Button>
              )}
              {(isAdding || viewingNote) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAdding(false);
                    setViewingNote(null);
                    setEditingNote(null);
                  }}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to List
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <div className="flex-1 overflow-hidden relative">
        <ScrollArea className="h-[calc(100vh-340px)] w-full p-6">
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
                      isPublic: editingNote.isPublic ?? false,
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
            <div className="flex flex-col items-center justify-center h-[40vh] text-center opacity-60">
              <div className="w-20 h-20 bg-yellow-100 rounded-lg rotate-3 mb-4 shadow-sm border border-yellow-200 flex items-center justify-center">
                <span className="text-4xl">📝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {search ? "No results found" : "No Stickies Yet"}
              </h3>
              <p className="text-muted-foreground max-w-sm">
                {search
                  ? "Try adjusting your search to find what you're looking for."
                  : "Add a sticky note to keep track of quick thoughts, reminders, or important tasks for this project."}
              </p>
              {!search && (
                <Button
                  variant="outline"
                  className="mt-6 border-dashed"
                  onClick={handleOpenAdd}
                >
                  Create your first note
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 w-full max-w-full px-1">
              {notesData?.data?.map((note: any) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  onView={setViewingNote}
                  onEdit={startEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {!isAdding && !viewingNote && notesData?.data?.length > 0 && (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-gray-50/50">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
            <span>
              Total{" "}
              <span className="text-foreground">
                {notesData?.metadata?.totalCount || 0}
              </span>{" "}
              notes
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Rows per page</p>
              <Select
                value={`${pageSize}`}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={pageSize} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((size) => (
                    <SelectItem key={size} value={`${size}`}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-center text-sm font-medium">
              Page {currentPage} of{" "}
              {Math.ceil((notesData?.metadata?.totalCount || 0) / pageSize) ||
                1}
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((prev) => prev - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={
                  currentPage >=
                  Math.ceil((notesData?.metadata?.totalCount || 0) / pageSize)
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={() =>
                  setCurrentPage(
                    Math.ceil((notesData?.metadata?.totalCount || 0) / pageSize)
                  )
                }
                disabled={
                  currentPage >=
                  Math.ceil((notesData?.metadata?.totalCount || 0) / pageSize)
                }
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemName="this note"
      />
    </Card>
  );
};

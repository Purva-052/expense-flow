import { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Undo,
  Heading,
  Link,
  List,
  TodoList,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useProjectsStore } from "@/features/projects/stores/useProjectsStore";
import { Button } from "@/components/ui/button";
import { Plus, X, Trash2, Edit2, Save, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useGetStickyNotes,
  useCreateStickyNote,
  useUpdateStickyNote,
  useDeleteStickyNote,
} from "@/features/sticky-notes/services/sticky-note-services";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

const COLORS = [
  { name: "yellow", bg: "bg-yellow-100", border: "border-yellow-200" },
  { name: "blue", bg: "bg-blue-100", border: "border-blue-200" },
  { name: "green", bg: "bg-green-100", border: "border-green-200" },
  { name: "pink", bg: "bg-pink-100", border: "border-pink-200" },
  { name: "purple", bg: "bg-purple-100", border: "border-purple-200" },
];

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    color: "yellow",
  });
  const [editorReady, setEditorReady] = useState(false);

  const handleClose = () => {
    setOpen(null);
    setIsAdding(false);
    setEditingId(null);
    setFormData({ title: "", content: "", color: "yellow" });
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateNote({
          id: editingId,
          data: {
            title: formData.title,
            description: formData.content, // API expects description
            isCompleted: false, // Default
          },
        });
      } else {
        await createNote({
          title: formData.title,
          description: formData.content, // API expects description
          isCompleted: false, // Default
          projectId: Number(currentRow?.id),
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setFormData({ title: "", content: "", color: "yellow" });
    } catch (error) {
      console.error("Failed to save note", error);
    }
  };

  const startEdit = (note: any) => {
    setFormData({
      title: note.title ?? "",
      content: note.description,
      color: "yellow", // Color not supported by API
    });
    setEditingId(note.id);
    setIsAdding(true);
  };

  const handleDelete = async (noteId: string) => {
    try {
      await deleteNote(noteId);
    } catch (error) {
      console.error("Failed to delete note", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col bg-gray-50/95 backdrop-blur-sm p-0 gap-0 overflow-hidden rounded-2xl border-none shadow-2xl [&>button]:hidden">
        <DialogHeader className="p-6 border-b bg-white/80 sticky top-0 z-10 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-2xl font-bold bg-clip-text text-black">
              Sticky Notes
            </DialogTitle>
            <p className="text-sm text-muted-foreground">{currentRow?.name}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isAdding && (
              <Button onClick={() => setIsAdding(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Note
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
              <div className="max-w-md mx-auto mt-10">
                <div
                  className={cn(
                    "p-6 rounded-xl shadow-xl transition-all duration-300 border-2 bg-yellow-100 border-yellow-200"
                  )}
                >
                  <div className="mb-4">
                    <Input
                      placeholder="Title (optional)"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="bg-transparent border-none text-lg font-bold placeholder:text-gray-400 focus-visible:ring-0 p-0 h-auto"
                    />
                  </div>
                  <div className="bg-transparent border-none min-h-[200px] text-gray-700 ck-content ck-editor-custom">
                    <CKEditor
                      //@ts-ignore
                      editor={ClassicEditor}
                      data={formData.content}
                      onReady={() => setEditorReady(true)}
                      onChange={(_, editor) => {
                        const data = editor.getData();
                        setFormData({ ...formData, content: data });
                      }}
                      disabled={!editorReady}
                      config={{
                        plugins: [
                          Essentials,
                          Paragraph,
                          Heading,
                          Bold,
                          Italic,
                          Link,
                          List,
                          TodoList,
                          Undo,
                        ],
                        toolbar: [
                          "heading",
                          "|",
                          "bold",
                          "italic",
                          "link",
                          "|",
                          "bulletedList",
                          "numberedList",
                          "todoList",
                          "|",
                          "undo",
                          "redo",
                        ],
                        placeholder: "Type your note here...",
                        licenseKey: "GPL",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-end mt-4 pt-4 border-t border-black/5">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setIsAdding(false);
                          setEditingId(null);
                        }}
                        className="hover:bg-black/5"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={!formData.content}
                        className="bg-primary hover:bg-primary/90"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
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
                  onClick={() => setIsAdding(true)}
                >
                  Create your first note
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                {notesData?.data?.map((note: any) => {
                  return (
                    <div
                      key={note.id}
                      className={cn(
                        "group relative p-6 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 aspect-square flex flex-col border bg-yellow-100 border-yellow-200"
                      )}
                    >
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-black/5 rounded-full"
                          onClick={() => startEdit(note)}
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-red-500/20 rounded-full"
                          onClick={() => handleDelete(note.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                      {note.title && (
                        <h4 className="font-bold text-gray-900 mb-2 truncate pr-16">
                          {note.title}
                        </h4>
                      )}
                      <div className="flex items-start gap-3 mt-1">
                        <Checkbox
                          id={`note-${note.id}`}
                          checked={note.isCompleted}
                          onCheckedChange={(checked) => {
                            updateNote({
                              id: note.id,
                              data: {
                                description: note.description,
                                isCompleted: checked === true,
                                projectId: Number(currentRow?.id),
                              },
                            });
                          }}
                          className="mt-1"
                        />
                        <div
                          className={cn(
                            "text-sm text-gray-700 flex-1 overflow-hidden text-ellipsis line-clamp-[8] sticky-note-content",
                            note.isCompleted &&
                              "line-through text-gray-500 opacity-70"
                          )}
                          dangerouslySetInnerHTML={{ __html: note.description }}
                        />
                      </div>
                      <div className="mt-4 text-xs text-gray-500 font-medium pl-8">
                        {note.createdAt
                          ? new Date(note.createdAt).toLocaleDateString()
                          : "Just now"}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

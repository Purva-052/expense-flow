import { useState } from "react";
import { TiptapEditor } from "@/components/shared/tiptap-editor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorPicker, COLORS } from "./color-picker";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Lock, Globe } from "lucide-react";

interface NoteEditorProps {
  initialData?: {
    title: string;
    content: string;
    color: string;
    isPublic?: boolean;
  };
  onSave: (data: {
    title: string;
    content: string;
    color: string;
    isPublic: boolean;
  }) => void;
  onCancel: () => void;
}

export const NoteEditor = ({
  initialData,
  onSave,
  onCancel,
}: NoteEditorProps) => {
  const [formData, setFormData] = useState({
    title: initialData?.title ?? "",
    content: initialData?.content ?? "",
    color: initialData?.color ?? "yellow",
    isPublic: initialData?.isPublic ?? true,
  });

  const colorObj = COLORS.find((c) => c.id === formData.color) || COLORS[0];

  return (
    <div className="max-w-md mx-auto mt-10">
      <div
        className={cn(
          "p-6 rounded-xl shadow-xl transition-all duration-300 border-2",
          colorObj.bg,
          colorObj.border
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <ColorPicker
            selectedColor={formData.color}
            onColorSelect={(color) => setFormData({ ...formData, color })}
          />
          <div className="flex items-center space-x-2 bg-black/5 px-3 py-1.5 rounded-full transition-colors hover:bg-black/10">
            {formData.isPublic ? (
              <Globe className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
            )}
            <Label
              htmlFor="privacy-toggle"
              className="text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer"
            >
              {formData.isPublic ? "Public" : "Private"}
            </Label>
            <div className="flex items-center gap-3">
              <Switch
                id="privacy-toggle"
                checked={formData.isPublic}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isPublic: checked })
                }
              />

              <span
                className={cn(
                  "text-xs font-semibold px-2 py-1 rounded-full",
                  formData.isPublic
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-200 text-gray-600"
                )}
              >
                {formData.isPublic ? "Public" : "Private"}
              </span>
            </div>
          </div>
        </div>
        <div className="mb-4">
          <Input
            placeholder="Title (optional)"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="bg-transparent border-none text-lg font-bold placeholder:text-gray-400/60 focus-visible:ring-0 p-2 h-auto text-slate-900 dark:text-slate-100"
          />
        </div>
        <div className="min-h-[200px] border-none bg-transparent text-slate-800 dark:text-slate-200">
          <TiptapEditor
            value={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
            placeholder="Type your note here..."
            className="border-none bg-transparent shadow-none"
            minHeightClassName="min-h-[200px]"
            editorClassName="text-slate-800 dark:text-slate-200"
            toolbar={[
              "bold",
              "italic",
              "underline",
              "bulletList",
              "orderedList",
              "taskList",
              "undo",
              "redo",
            ]}
          />
        </div>
        <div className="flex items-center justify-end mt-4 pt-4 border-t border-black/5">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="hover:bg-black/5"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => onSave(formData)}
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
  );
};

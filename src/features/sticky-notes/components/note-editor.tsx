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
  Underline,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColorPicker, COLORS } from "./color-picker";

interface NoteEditorProps {
  initialData?: {
    title: string;
    content: string;
    color: string;
  };
  onSave: (data: { title: string; content: string; color: string }) => void;
  onCancel: () => void;
}

export const NoteEditor = ({
  initialData,
  onSave,
  onCancel,
}: NoteEditorProps) => {
  const [formData, setFormData] = useState(
    initialData ?? { title: "", content: "", color: "yellow" }
  );
  const [editorReady, setEditorReady] = useState(false);

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
        </div>
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
        <div className="bg-transparent border-none min-h-[200px] text-gray-700 ck-editor-custom">
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
                Underline,
                Link,
                List,
                TodoList,
                Undo,
              ],
              toolbar: [
                "bold",
                "italic",
                "underline",
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

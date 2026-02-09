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
  Underline,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { cn } from "@/lib/utils";

interface WorkDescriptionEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const WorkDescriptionEditor = ({
  value,
  onChange,
  placeholder = "Type your description here...",
  className,
  disabled = false,
}: WorkDescriptionEditorProps) => {
  const [editorReady, setEditorReady] = useState(false);

  return (
    <div className={cn("ck-editor-shared-container", className)}>
      <CKEditor
        //@ts-ignore
        editor={ClassicEditor}
        data={value}
        onReady={() => setEditorReady(true)}
        onChange={(_, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        disabled={disabled || !editorReady}
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
            "|",
            "undo",
            "redo",
          ],
          placeholder: placeholder,
          licenseKey: "GPL",
        }}
      />
    </div>
  );
};

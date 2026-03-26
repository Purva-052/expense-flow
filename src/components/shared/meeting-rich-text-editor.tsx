import { TiptapEditor } from "@/components/shared/tiptap-editor";

interface MeetingRichTextEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const MEETING_TOOLBAR = [
  "underline",
  "italic",
  "bold",
  "heading1",
  "heading2",
  "bulletList",
  "orderedList",
  "undo",
  "redo",
] as const;

export const MeetingRichTextEditor = ({
  value,
  onChange,
  placeholder = "Type here...",
  className,
  disabled = false,
}: MeetingRichTextEditorProps) => {
  return (
    <TiptapEditor
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      disabled={disabled}
      toolbar={[...MEETING_TOOLBAR]}
      hideToolbarWhenDisabled
      minHeightClassName="min-h-[220px]"
      editorClassName="max-h-[60vh] overflow-y-auto"
    />
  );
};

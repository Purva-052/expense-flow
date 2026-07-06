import { TiptapEditor } from "@/components/shared/tiptap-editor";

interface WorkDescriptionEditorProps {
  value: string;
  onChange: (data: string) => void;
  onBlur?: (data: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const WorkDescriptionEditor = ({
  value,
  onChange,
  onBlur,
  placeholder = "Type your description here...",
  className,
  disabled = false,
}: WorkDescriptionEditorProps) => {
  return (
    <TiptapEditor
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      hideToolbarWhenDisabled
      className={className}
      disabled={disabled}
      minHeightClassName="min-h-[220px]"
      contentWrapperClassName="max-h-[320px] overflow-y-auto"
      editorClassName="min-h-[220px]"
    />
  );
};

import { useEffect } from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  Bold,
  CheckSquare,
  Heading1,
  Heading2,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Redo2,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ToolbarFeature =
  | "paragraph"
  | "heading1"
  | "heading2"
  | "bold"
  | "italic"
  | "underline"
  | "link"
  | "bulletList"
  | "orderedList"
  | "taskList"
  | "blockquote"
  | "undo"
  | "redo";

interface TiptapEditorProps {
  value: string;
  onChange: (data: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  toolbar?: ToolbarFeature[];
  minHeightClassName?: string;
  editorClassName?: string;
  contentWrapperClassName?: string;
  hideToolbarWhenDisabled?: boolean;
}

const DEFAULT_TOOLBAR: ToolbarFeature[] = [
  "bold",
  "italic",
  "underline",
  "bulletList",
  "orderedList",
  "undo",
  "redo",
];

export const TiptapEditor = ({
  value,
  onChange,
  placeholder = "Type here...",
  className,
  disabled = false,
  toolbar = DEFAULT_TOOLBAR,
  minHeightClassName = "min-h-[160px]",
  editorClassName,
  contentWrapperClassName,
  hideToolbarWhenDisabled = false,
}: TiptapEditorProps) => {
  const hasHeadings =
    toolbar.includes("paragraph") ||
    toolbar.includes("heading1") ||
    toolbar.includes("heading2");
  const hasUnderline = toolbar.includes("underline");
  const hasLink = toolbar.includes("link");
  const hasTaskList = toolbar.includes("taskList");
  const hasBlockquote = toolbar.includes("blockquote");

  const editor = useEditor({
    immediatelyRender: false,
    editable: !disabled,
    extensions: [
      StarterKit.configure({
        heading: hasHeadings
          ? {
              levels: [1, 2],
            }
          : false,
        blockquote: hasBlockquote ? {} : false,
      }),
      ...(hasUnderline ? [Underline] : []),
      ...(hasLink
        ? [
            Link.configure({
              openOnClick: false,
              HTMLAttributes: {
                class: "text-primary underline underline-offset-2",
              },
            }),
          ]
        : []),
      ...(hasTaskList
        ? [
            TaskList,
            TaskItem.configure({
              nested: true,
            }),
          ]
        : []),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          minHeightClassName,
          "w-full px-3 py-2 text-sm outline-none",
          "[&_p.is-editor-empty:first-child::before]:pointer-events-none",
          "[&_p.is-editor-empty:first-child::before]:float-left",
          "[&_p.is-editor-empty:first-child::before]:h-0",
          "[&_p.is-editor-empty:first-child::before]:text-muted-foreground",
          "[&_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:list-decimal [&_ol]:pl-6",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic",
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2",
          "[&_h1]:text-xl [&_h1]:font-semibold",
          "[&_h2]:text-lg [&_h2]:font-semibold",
          "[&_li[data-type='taskItem']]:list-none",
          "[&_li[data-type='taskItem']>label]:mr-2 [&_li[data-type='taskItem']>label]:inline-flex",
          "[&_li[data-type='taskItem']>div]:inline-block",
          editorClassName
        ),
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;

    const currentValue = editor.getHTML();

    if (currentValue !== value) {
      editor.commands.setContent(value || "", false);
    }
  }, [editor, value]);

  const toggleLink = () => {
    if (!editor || disabled) return;

    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Enter URL", previousUrl || "");

    if (url === null) return;

    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: trimmedUrl })
      .run();
  };

  const toolbarButtonClass = (isActive: boolean) =>
    cn(
      "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors",
      "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive && "bg-muted text-foreground",
      disabled && "pointer-events-none opacity-50"
    );

  const toolbarItems = toolbar.map((item) => {
    switch (item) {
      case "paragraph":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(
              editor?.isActive("paragraph") ?? false
            )}
            onClick={() => editor?.chain().focus().setParagraph().run()}
            aria-label="Paragraph"
          >
            <Pilcrow className="h-4 w-4" />
          </button>
        );
      case "heading1":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(
              editor?.isActive("heading", { level: 1 }) ?? false
            )}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 1 }).run()
            }
            aria-label="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
        );
      case "heading2":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(
              editor?.isActive("heading", { level: 2 }) ?? false
            )}
            onClick={() =>
              editor?.chain().focus().toggleHeading({ level: 2 }).run()
            }
            aria-label="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
        );
      case "bold":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(editor?.isActive("bold") ?? false)}
            onClick={() => editor?.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
        );
      case "italic":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(editor?.isActive("italic") ?? false)}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
        );
      case "underline":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(
              editor?.isActive("underline") ?? false
            )}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
        );
      case "link":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(editor?.isActive("link") ?? false)}
            onClick={toggleLink}
            aria-label="Link"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
        );
      case "bulletList":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(
              editor?.isActive("bulletList") ?? false
            )}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
          >
            <List className="h-4 w-4" />
          </button>
        );
      case "orderedList":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(
              editor?.isActive("orderedList") ?? false
            )}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            aria-label="Numbered list"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
        );
      case "taskList":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(
              editor?.isActive("taskList") ?? false
            )}
            onClick={() => editor?.chain().focus().toggleTaskList().run()}
            aria-label="Task list"
          >
            <CheckSquare className="h-4 w-4" />
          </button>
        );
      case "blockquote":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(
              editor?.isActive("blockquote") ?? false
            )}
            onClick={() => editor?.chain().focus().toggleBlockquote().run()}
            aria-label="Blockquote"
          >
            <Quote className="h-4 w-4" />
          </button>
        );
      case "undo":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(false)}
            onClick={() => editor?.chain().focus().undo().run()}
            aria-label="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </button>
        );
      case "redo":
        return (
          <button
            key={item}
            type="button"
            className={toolbarButtonClass(false)}
            onClick={() => editor?.chain().focus().redo().run()}
            aria-label="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        );
      default:
        return null;
    }
  });

  const showToolbar = !(disabled && hideToolbarWhenDisabled);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-md border border-input bg-background",
        className
      )}
    >
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/40 p-2">
          {toolbarItems}
        </div>
      ) : null}
      <div className={cn("min-h-0", contentWrapperClassName)}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

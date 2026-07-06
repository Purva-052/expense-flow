import { useEffect, useState } from "react";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, Editor } from "@tiptap/react";
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
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { getSpellingMatchesInHtml, applySpellingCorrections, SpellingMatch } from "@/utils/spell-corrector";

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
  | "redo"
  | "aiSpellCheck";

interface TiptapEditorProps {
  value: string;
  onChange: (data: string) => void;
  onBlur?: (data: string) => void;
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
  "aiSpellCheck",
];


export const TiptapEditor = ({
  value,
  onChange,
  onBlur,
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
    onBlur: ({ editor }) => {
      onBlur?.(editor.getHTML());
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
      "inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-foreground/60 transition-colors",
      "hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive &&
        "bg-accent text-accent-foreground shadow-sm dark:bg-primary dark:text-white",
      disabled && "pointer-events-none opacity-50"
    );

  const standardToolbar = toolbar.filter((item) => item !== "aiSpellCheck");
  const hasAiSpellCheck = toolbar.includes("aiSpellCheck");

  const toolbarItems = standardToolbar.map((item) => {
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
        <div className="flex flex-wrap items-center gap-1 border-b border-input bg-muted/60 p-2 justify-between">
          <div className="flex flex-wrap items-center gap-1">
            {toolbarItems}
          </div>
          {hasAiSpellCheck && (
            <div className="ml-auto">
              <AiSpellCheckButton
                editor={editor}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      ) : null}
      <div className={cn("min-h-0", contentWrapperClassName)}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

interface AiSpellCheckButtonProps {
  editor: Editor | null;
  disabled: boolean;
}

export const AiSpellCheckButton = ({ editor, disabled }: AiSpellCheckButtonProps) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "checking" | "no-errors" | "has-errors" | "error">("idle");
  const [matches, setMatches] = useState<SpellingMatch[]>([]);
  const [doc, setDoc] = useState<Document | null>(null);

  const handleOpenChange = async (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setStatus("checking");
      setMatches([]);
      setDoc(null);
      try {
        const html = editor?.getHTML() || "";
        const result = await getSpellingMatchesInHtml(html);
        setDoc(result.doc);
        if (result.matches.length === 0) {
          setStatus("no-errors");
        } else {
          setMatches(result.matches);
          setStatus("has-errors");
        }
      } catch (err) {
        console.error("AI Spell check failed:", err);
        setStatus("error");
      }
    }
  };

  const handleApply = () => {
    if (!doc) return;
    const correctedHtml = applySpellingCorrections(doc, matches);
    editor?.commands.setContent(correctedHtml, false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled || !editor}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border border-transparent px-2.5 text-xs font-semibold text-[#e11d48] bg-rose-50 dark:bg-rose-950/20 transition-colors hover:bg-rose-100 dark:hover:bg-rose-950/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            disabled && "pointer-events-none opacity-50"
          )}
          aria-label="AI Spell Check"
        >
          <Sparkles className="h-3.5 w-3.5" />
          AI Spell Check
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-4 max-h-[420px] overflow-y-auto flex flex-col gap-3 z-[60]">
        <div className="flex items-center justify-between border-b pb-2 mb-1">
          <span className="font-semibold text-sm flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
            <Sparkles className="h-4 w-4 text-[#e11d48]" />
            AI Spelling Assistant
          </span>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setOpen(false)}>
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>

        {status === "checking" && (
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-[#e11d48]" />
            <span className="text-xs text-muted-foreground font-medium">Scanning description for typos...</span>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center justify-center py-6 text-center gap-1">
            <span className="text-sm font-medium text-destructive">Spell Check Failed</span>
            <span className="text-xs text-muted-foreground">Please try again later.</span>
          </div>
        )}

        {status === "no-errors" && (
          <div className="flex flex-col items-center justify-center py-8 text-center gap-2">
            <span className="text-lg">✨</span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Looks Perfect!</span>
            <span className="text-[11px] text-muted-foreground max-w-[200px]">No spelling errors or grammar mistakes detected.</span>
          </div>
        )}

        {status === "has-errors" && (
          <>
            {matches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center gap-2">
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">All set!</span>
                <span className="text-[11px] text-muted-foreground">All spelling corrections applied or ignored.</span>
                <Button size="sm" className="mt-2 w-full bg-[#e11d48] hover:bg-[#be123c] text-white text-xs h-8" onClick={handleApply}>
                  Save Changes
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto max-h-[260px] pr-1">
                {matches.map((match) => {
                  const beforeText = match.contextText.substring(0, match.contextOffset);
                  const keyword = match.contextText.substring(match.contextOffset, match.contextOffset + match.contextLength);
                  const afterText = match.contextText.substring(match.contextOffset + match.contextLength);

                  return (
                    <div key={match.id} className="flex flex-col gap-2 p-2.5 rounded-lg border bg-muted/20 text-xs">
                      <div className="text-[11px] text-muted-foreground leading-normal italic break-words">
                        ...{beforeText}
                        <span className="font-semibold text-[#e11d48] underline decoration-wavy decoration-[#f43f5e] bg-rose-50 dark:bg-rose-950/40 px-1 py-0.5 rounded">
                          {keyword}
                        </span>
                        {afterText}...
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Replace with:</span>
                        <div className="flex items-center gap-1.5">
                          <Select
                            value={match.selectedReplacement}
                            onValueChange={(val) => {
                              setMatches((prev) =>
                                prev.map((m) => (m.id === match.id ? { ...m, selectedReplacement: val } : m))
                              );
                            }}
                          >
                            <SelectTrigger className="h-7 w-[160px] text-[11px] px-2 py-0.5 bg-background">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="z-[70]">
                              {match.suggestions.map((sug) => (
                                <SelectItem key={sug} value={sug} className="text-[11px]">
                                  {sug}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            className="h-7 px-2 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => {
                              setMatches((prev) => prev.filter((m) => m.id !== match.id));
                            }}
                          >
                            Ignore
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {matches.length > 0 && (
              <div className="pt-2 border-t border-border mt-1">
                <Button size="sm" className="w-full bg-[#e11d48] hover:bg-[#be123c] text-white text-xs h-8" onClick={handleApply}>
                  Apply {matches.length} Correction{matches.length > 1 ? "s" : ""}
                </Button>
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};


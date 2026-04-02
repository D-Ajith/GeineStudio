import React, { useCallback } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

const Icon = ({ d, size = 15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const icons = {
  bold:          "M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z",
  italic:        "M19 4h-9M14 20H5M15 4 9 20",
  underline:     "M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M4 21h16",
  strike:        "M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.1 2.1 2 2.7L12 12 M10.3 19c1.7.4 3.6.5 5.4.2 2.6-.5 4.3-1.8 4.3-3.7 0-1.5-1-2.3-2-2.9",
  h1:            "M4 12h8M4 18V6M12 18V6M17 12l3-3v9",
  h2:            "M4 12h8M4 18V6M12 18V6M21 18h-4c0-4 4-3 4-6 0-1.657-1.343-2-2-2-.979 0-2 .5-2 2",
  ul:            "M9 6h11M9 12h11M9 18h11M4 6v.01M4 12v.01M4 18v.01",
  ol:            "M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01",
  quote:         "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",
  code:          "M16 18l6-6-6-6M8 6l-6 6 6 6",
  codeblock:     "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 17l2-2-2-2",
  link:          "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  unlink:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71 M2 2l20 20",
  alignLeft:     "M21 10H3M21 6H3M21 14H3M21 18H3",
  alignCenter:   "M21 10H3M21 6H3M17 14H7M17 18H7",
  alignRight:    "M21 10H3M21 6H3M21 14H11M21 18H11",
  undo:          "M3 7v6h6 M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13",
  redo:          "M21 7v6h-6 M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13",
  clear:         "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3 13H9",
  hr:            "M5 12h14",
  paragraph:     "M13 4v16M17 4H9.5a4.5 4.5 0 0 0 0 9H13",
};

/* ─── toolbar button ────────────────────────────────────────────── */
function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      className={`
        relative flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold
        transition-all duration-150 select-none outline-none
        ${active
          ? "bg-[#6B4A2D] text-white shadow-md shadow-[#6B4A2D]/30 scale-105"
          : "text-gray-500 hover:bg-[#6B4A2D]/10 hover:text-[#6B4A2D]"
        }
        ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
      `}
    >
      {children}
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#6B4A2D]" />
      )}
    </button>
  );
}

/* ─── divider ───────────────────────────────────────────────────── */
const Divider = () => (
  <div className="w-px h-5 bg-gray-200 mx-1 self-center shrink-0" />
);

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════════════ */
export default function BlogEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder: "Start writing your blog content here…" }),
    ],
    content: value,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose max-w-none focus:outline-none min-h-[220px] px-5 py-4 text-gray-800",
      },
    },
  });

  /* ── link handler ── */
  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Enter URL:", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  /* ── check active states ── */
  const a = {
    bold:         editor.isActive("bold"),
    italic:       editor.isActive("italic"),
    underline:    editor.isActive("underline"),
    strike:       editor.isActive("strike"),
    h1:           editor.isActive("heading", { level: 1 }),
    h2:           editor.isActive("heading", { level: 2 }),
    h3:           editor.isActive("heading", { level: 3 }),
    ul:           editor.isActive("bulletList"),
    ol:           editor.isActive("orderedList"),
    blockquote:   editor.isActive("blockquote"),
    code:         editor.isActive("code"),
    codeBlock:    editor.isActive("codeBlock"),
    link:         editor.isActive("link"),
    alignLeft:    editor.isActive({ textAlign: "left" }),
    alignCenter:  editor.isActive({ textAlign: "center" }),
    alignRight:   editor.isActive({ textAlign: "right" }),
  };

  return (
    <div className="rounded-2xl overflow-hidden border-2 border-gray-200 focus-within:border-[#6B4A2D] transition-colors duration-200 bg-white shadow-sm">

      {/* ── TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2.5 bg-gray-50/80 border-b border-gray-200 backdrop-blur">

        {/* undo / redo */}
        <ToolBtn title="Undo (Ctrl+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} active={false}>
          <Icon d={icons.undo} />
        </ToolBtn>
        <ToolBtn title="Redo (Ctrl+Y)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} active={false}>
          <Icon d={icons.redo} />
        </ToolBtn>

        <Divider />

        {/* text style */}
        <ToolBtn title="Bold (Ctrl+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={a.bold}>
          <Icon d={icons.bold} />
        </ToolBtn>
        <ToolBtn title="Italic (Ctrl+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={a.italic}>
          <Icon d={icons.italic} />
        </ToolBtn>
        <ToolBtn title="Underline (Ctrl+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={a.underline}>
          <Icon d={icons.underline} />
        </ToolBtn>
        <ToolBtn title="Strikethrough" onClick={() => editor.chain().focus().toggleStrike().run()} active={a.strike}>
          <Icon d={icons.strike} />
        </ToolBtn>

        <Divider />

        {/* headings */}
        <ToolBtn title="Heading 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={a.h1}>
          <span className="text-[11px] font-black tracking-tight">H1</span>
        </ToolBtn>
        <ToolBtn title="Heading 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={a.h2}>
          <span className="text-[11px] font-black tracking-tight">H2</span>
        </ToolBtn>
        <ToolBtn title="Heading 3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={a.h3}>
          <span className="text-[11px] font-black tracking-tight">H3</span>
        </ToolBtn>
        <ToolBtn title="Paragraph" onClick={() => editor.chain().focus().setParagraph().run()} active={editor.isActive("paragraph") && !a.h1 && !a.h2 && !a.h3}>
          <Icon d={icons.paragraph} />
        </ToolBtn>

        <Divider />

        {/* lists */}
        <ToolBtn title="Bullet List" onClick={() => editor.chain().focus().toggleBulletList().run()} active={a.ul}>
          <Icon d={icons.ul} />
        </ToolBtn>
        <ToolBtn title="Numbered List" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={a.ol}>
          <Icon d={icons.ol} />
        </ToolBtn>

        <Divider />

        {/* block */}
        <ToolBtn title="Blockquote" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={a.blockquote}>
          <Icon d={icons.quote} />
        </ToolBtn>
        <ToolBtn title="Inline Code" onClick={() => editor.chain().focus().toggleCode().run()} active={a.code}>
          <Icon d={icons.code} />
        </ToolBtn>
        <ToolBtn title="Code Block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={a.codeBlock}>
          <Icon d={icons.codeblock} />
        </ToolBtn>
        <ToolBtn title="Horizontal Rule" onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false}>
          <Icon d={icons.hr} />
        </ToolBtn>

        <Divider />

        {/* alignment */}
        <ToolBtn title="Align Left" onClick={() => editor.chain().focus().setTextAlign("left").run()} active={a.alignLeft}>
          <Icon d={icons.alignLeft} />
        </ToolBtn>
        <ToolBtn title="Align Center" onClick={() => editor.chain().focus().setTextAlign("center").run()} active={a.alignCenter}>
          <Icon d={icons.alignCenter} />
        </ToolBtn>
        <ToolBtn title="Align Right" onClick={() => editor.chain().focus().setTextAlign("right").run()} active={a.alignRight}>
          <Icon d={icons.alignRight} />
        </ToolBtn>

        <Divider />

        {/* link */}
        <ToolBtn title={a.link ? "Edit / Remove Link" : "Insert Link"} onClick={handleLink} active={a.link}>
          <Icon d={a.link ? icons.unlink : icons.link} />
        </ToolBtn>

        <Divider />

        {/* clear */}
        <ToolBtn title="Clear Formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} active={false}>
          <Icon d={icons.clear} />
        </ToolBtn>
      </div>

      {/* ── live active-state indicator strip ── */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-white border-b border-gray-100 min-h-[30px] overflow-x-auto">
        {[
          a.bold && "Bold",
          a.italic && "Italic",
          a.underline && "Underline",
          a.strike && "Strike",
          a.h1 && "H1",
          a.h2 && "H2",
          a.h3 && "H3",
          a.ul && "Bullet List",
          a.ol && "Numbered List",
          a.blockquote && "Blockquote",
          a.code && "Code",
          a.codeBlock && "Code Block",
          a.link && "Link",
          a.alignCenter && "Center",
          a.alignRight && "Right",
        ].filter(Boolean).length === 0 ? (
          <span className="text-[11px] text-gray-300 font-medium italic whitespace-nowrap">
            No active formatting
          </span>
        ) : (
          <>
            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap shrink-0">
              Active:
            </span>
            <div className="flex items-center gap-1 flex-wrap">
              {[
                a.bold && "Bold",
                a.italic && "Italic",
                a.underline && "Underline",
                a.strike && "Strike",
                a.h1 && "H1",
                a.h2 && "H2",
                a.h3 && "H3",
                a.ul && "Bullet List",
                a.ol && "Numbered List",
                a.blockquote && "Blockquote",
                a.code && "Code",
                a.codeBlock && "Code Block",
                a.link && "Link",
                a.alignCenter && "Center",
                a.alignRight && "Right",
              ].filter(Boolean).map((label) => (
                <span
                  key={label}
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
                  style={{ background: "#6B4A2D20", color: "#6B4A2D" }}
                >
                  {label}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── EDITOR CONTENT ── */}
      <EditorContent editor={editor} />

      {/* ── footer: word count ── */}
      <div className="flex items-center justify-between px-5 py-2 bg-gray-50/60 border-t border-gray-100">
        <span className="text-[11px] text-gray-400 font-medium">
          {editor.storage.characterCount?.characters?.() ?? editor.getText().length} characters
          &nbsp;·&nbsp;
          {editor.getText().split(/\s+/).filter(Boolean).length} words
        </span>
        <span className="text-[11px] text-gray-300 font-medium italic">
          Tip: Select text to format
        </span>
      </div>

      {/* ── prose styles ── */}
      <style>{`
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #9ca3af;
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
        }
        .ProseMirror blockquote {
          border-left: 3px solid #6B4A2D;
          padding-left: 1rem;
          color: #6b7280;
          font-style: italic;
          margin: 1rem 0;
        }
        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.1em 0.4em;
          border-radius: 4px;
          font-size: 0.875em;
          color: #6B4A2D;
        }
        .ProseMirror pre {
          background: #1e1e1e;
          color: #d4d4d4;
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
          font-size: 0.875em;
        }
        .ProseMirror pre code {
          background: none;
          color: inherit;
          padding: 0;
        }
        .ProseMirror hr {
          border: none;
          border-top: 2px solid #e5e7eb;
          margin: 1.5rem 0;
        }
        .ProseMirror a {
          color: #6B4A2D;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .ProseMirror h1 { font-size: 1.75em; font-weight: 800; margin: 0.75em 0 0.4em; }
        .ProseMirror h2 { font-size: 1.4em;  font-weight: 700; margin: 0.75em 0 0.4em; }
        .ProseMirror h3 { font-size: 1.15em; font-weight: 700; margin: 0.75em 0 0.4em; }
        .ProseMirror ul { list-style: disc;    padding-left: 1.5rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5rem; }
        .ProseMirror li { margin: 0.25rem 0; }
      `}</style>
    </div>
  );
}
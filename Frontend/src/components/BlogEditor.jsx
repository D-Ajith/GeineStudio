import React, { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";

/* ─── SVG Icon ───────────────────────────────────────────────────────────── */
const Icon = ({ d, size = 15 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

const icons = {
  bold:        "M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z",
  italic:      "M19 4h-9M14 20H5M15 4 9 20",
  underline:   "M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3M4 21h16",
  strike:      "M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.1 2.1 2 2.7L12 12 M10.3 19c1.7.4 3.6.5 5.4.2 2.6-.5 4.3-1.8 4.3-3.7 0-1.5-1-2.3-2-2.9",
  ul:          "M9 6h11M9 12h11M9 18h11M4 6v.01M4 12v.01M4 18v.01",
  ol:          "M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01",
  quote:       "M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z",
  code:        "M16 18l6-6-6-6M8 6l-6 6 6 6",
  codeblock:   "M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M10 13l-2 2 2 2 M14 17l2-2-2-2",
  link:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  unlink:      "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71 M2 2l20 20",
  alignLeft:   "M21 10H3M21 6H3M21 14H3M21 18H3",
  alignCenter: "M21 10H3M21 6H3M17 14H7M17 18H7",
  alignRight:  "M21 10H3M21 6H3M21 14H11M21 18H11",
  undo:        "M3 7v6h6 M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13",
  redo:        "M21 7v6h-6 M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13",
  clear:       "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm3 13H9",
  hr:          "M5 12h14",
  paragraph:   "M13 4v16M17 4H9.5a4.5 4.5 0 0 0 0 9H13",
};

/* ─── ToolBtn ────────────────────────────────────────────────────────────── */
function ToolBtn({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={active}
      style={{ WebkitTapHighlightColor: "transparent", minWidth: 30 }}
      className={[
        "relative flex items-center justify-center flex-shrink-0",
        "w-8 h-8 rounded-lg",
        "text-[12px] font-bold",
        "transition-all duration-150 select-none outline-none",
        "focus-visible:ring-2 focus-visible:ring-[#6B4A2D]/50",
        active
          ? "bg-[#6B4A2D] text-white shadow-md"
          : "text-gray-500 hover:bg-[#6B4A2D]/10 hover:text-[#6B4A2D] active:bg-[#6B4A2D]/20",
        disabled ? "opacity-30 cursor-not-allowed pointer-events-none" : "cursor-pointer",
      ].join(" ")}
    >
      {children}
      {active && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/70" />
      )}
    </button>
  );
}

/* ─── Divider ────────────────────────────────────────────────────────────── */
const Divider = () => (
  <div className="w-px h-5 bg-gray-200 mx-1 self-center flex-shrink-0" aria-hidden="true" />
);

/* ─── ToolbarRow — always scrollable horizontally ────────────────────────── */
function ToolbarRow({ groups }) {
  return (
    <div
      className="flex items-center gap-0.5 overflow-x-auto be-toolbar-scroll py-1.5 px-2"
      role="toolbar"
    >
      {groups.map((group, gi) => (
        <React.Fragment key={gi}>
          {gi > 0 && <Divider />}
          {group.map((btn, bi) => (
            <ToolBtn
              key={bi}
              title={btn.title}
              onClick={btn.onClick}
              active={btn.active}
              disabled={btn.disabled}
            >
              {btn.icon}
            </ToolBtn>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN BlogEditor
═══════════════════════════════════════════════════════════════════════════ */
export default function BlogEditor({ value, onChange }) {
  const [isFocused, setIsFocused] = useState(false);

  const editor = useEditor({
   extensions: [
  StarterKit.configure({
    heading: { levels: [1, 2, 3] },
    link: false,
    underline: false,
  }),
  Link.configure({ openOnClick: false, autolink: true }),
  Underline,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Placeholder.configure({ placeholder: "Start writing your blog content here…" }),
],
    content: value,
    onUpdate: ({ editor }) => onChange?.(editor.getHTML()),
    onFocus:  () => setIsFocused(true),
    onBlur:   () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: [
          "prose prose-sm max-w-none",
          "focus:outline-none",
          "min-h-[220px]",
          "px-4 py-3",
          "text-gray-800 text-sm sm:text-[15px]",
          "leading-relaxed",
        ].join(" "),
      },
    },
  });

  const handleLink = useCallback(() => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url  = window.prompt("Enter URL:", prev);
    if (url === null) return;
    if (url === "") { editor.chain().focus().unsetLink().run(); return; }
    editor.chain().focus().setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  /* ── Active states ── */
  const a = {
    bold:        editor.isActive("bold"),
    italic:      editor.isActive("italic"),
    underline:   editor.isActive("underline"),
    strike:      editor.isActive("strike"),
    h1:          editor.isActive("heading", { level: 1 }),
    h2:          editor.isActive("heading", { level: 2 }),
    h3:          editor.isActive("heading", { level: 3 }),
    para:        editor.isActive("paragraph"),
    ul:          editor.isActive("bulletList"),
    ol:          editor.isActive("orderedList"),
    blockquote:  editor.isActive("blockquote"),
    code:        editor.isActive("code"),
    codeBlock:   editor.isActive("codeBlock"),
    link:        editor.isActive("link"),
    alignLeft:   editor.isActive({ textAlign: "left" }),
    alignCenter: editor.isActive({ textAlign: "center" }),
    alignRight:  editor.isActive({ textAlign: "right" }),
  };

  /* ── Active format pills ── */
  const activeLabels = [
    a.bold && "Bold", a.italic && "Italic", a.underline && "Underline",
    a.strike && "Strike", a.h1 && "H1", a.h2 && "H2", a.h3 && "H3",
    a.ul && "Bullet", a.ol && "Numbered", a.blockquote && "Quote",
    a.code && "Code", a.codeBlock && "Code Block", a.link && "Link",
    a.alignCenter && "Center", a.alignRight && "Right",
  ].filter(Boolean);

  /* ── Word / char count ── */
  const charCount = editor.storage.characterCount?.characters?.() ?? editor.getText().length;
  const wordCount = editor.getText().split(/\s+/).filter(Boolean).length;

  /* ══════════════════════════════════════════════════════════════
     TOOLBAR GROUPS
     ALL groups shown on BOTH mobile and desktop.
     Split into 2 rows (each independently scrollable) so that
     narrow screens never hide any button — just scroll to see all.
  ══════════════════════════════════════════════════════════════ */

  /* Row 1: History + Inline marks + Code + Link + Clear */
  const row1Groups = [
    /* History */
    [
      {
        title: "Undo (Ctrl+Z)",
        onClick: () => editor.chain().focus().undo().run(),
        active: false,
        disabled: !editor.can().undo(),
        icon: <Icon d={icons.undo} />,
      },
      {
        title: "Redo (Ctrl+Y)",
        onClick: () => editor.chain().focus().redo().run(),
        active: false,
        disabled: !editor.can().redo(),
        icon: <Icon d={icons.redo} />,
      },
    ],
    /* Inline marks */
    [
      { title: "Bold (Ctrl+B)",   onClick: () => editor.chain().focus().toggleBold().run(),      active: a.bold,      icon: <Icon d={icons.bold} /> },
      { title: "Italic (Ctrl+I)", onClick: () => editor.chain().focus().toggleItalic().run(),    active: a.italic,    icon: <Icon d={icons.italic} /> },
      { title: "Underline",       onClick: () => editor.chain().focus().toggleUnderline().run(), active: a.underline, icon: <Icon d={icons.underline} /> },
      { title: "Strikethrough",   onClick: () => editor.chain().focus().toggleStrike().run(),    active: a.strike,    icon: <Icon d={icons.strike} /> },
    ],
    /* Code + Link + Clear */
    [
      {
        title: "Inline Code",
        onClick: () => editor.chain().focus().toggleCode().run(),
        active: a.code,
        icon: <Icon d={icons.code} />,
      },
      {
        title: a.link ? "Remove Link" : "Insert Link",
        onClick: handleLink,
        active: a.link,
        icon: <Icon d={a.link ? icons.unlink : icons.link} />,
      },
      {
        title: "Clear Formatting",
        onClick: () => editor.chain().focus().unsetAllMarks().clearNodes().run(),
        active: false,
        icon: <Icon d={icons.clear} />,
      },
    ],
  ];

  /* Row 2: Headings + Lists + Blocks + Alignment */
  const row2Groups = [
    /* Headings + Paragraph */
    [
      {
        title: "Heading 1",
        onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        active: a.h1,
        icon: <span className="text-[10px] font-black tracking-tight leading-none">H1</span>,
      },
      {
        title: "Heading 2",
        onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        active: a.h2,
        icon: <span className="text-[10px] font-black tracking-tight leading-none">H2</span>,
      },
      {
        title: "Heading 3",
        onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        active: a.h3,
        icon: <span className="text-[10px] font-black tracking-tight leading-none">H3</span>,
      },
      {
        title: "Paragraph",
        onClick: () => editor.chain().focus().setParagraph().run(),
        active: a.para && !a.h1 && !a.h2 && !a.h3,
        icon: <Icon d={icons.paragraph} />,
      },
    ],
    /* Lists */
    [
      { title: "Bullet List",  onClick: () => editor.chain().focus().toggleBulletList().run(),  active: a.ul, icon: <Icon d={icons.ul} /> },
      { title: "Ordered List", onClick: () => editor.chain().focus().toggleOrderedList().run(), active: a.ol, icon: <Icon d={icons.ol} /> },
    ],
    /* Block-level */
    [
      { title: "Blockquote",      onClick: () => editor.chain().focus().toggleBlockquote().run(),  active: a.blockquote, icon: <Icon d={icons.quote} /> },
      { title: "Code Block",      onClick: () => editor.chain().focus().toggleCodeBlock().run(),   active: a.codeBlock,  icon: <Icon d={icons.codeblock} /> },
      { title: "Horizontal Rule", onClick: () => editor.chain().focus().setHorizontalRule().run(), active: false,        icon: <Icon d={icons.hr} /> },
    ],
    /* Text Alignment */
    [
      { title: "Align Left",   onClick: () => editor.chain().focus().setTextAlign("left").run(),   active: a.alignLeft,   icon: <Icon d={icons.alignLeft} /> },
      { title: "Align Center", onClick: () => editor.chain().focus().setTextAlign("center").run(), active: a.alignCenter, icon: <Icon d={icons.alignCenter} /> },
      { title: "Align Right",  onClick: () => editor.chain().focus().setTextAlign("right").run(),  active: a.alignRight,  icon: <Icon d={icons.alignRight} /> },
    ],
  ];

  /* ─────────────────────────────────────────────────────────── */
  return (
    <>
      <div
        className={[
          "w-full rounded-xl border-2 bg-white",
          "overflow-y-auto",
          "max-h-[70vh] sm:max-h-[600px]",
          "transition-all duration-200 shadow-sm",
          isFocused
            ? "border-[#6B4A2D] shadow-[0_0_0_3px_rgba(107,74,45,0.08)]"
            : "border-gray-200",
        ].join(" ")}
      >

        {/* ── Sticky Toolbar ── */}
        <div
          className={[
            "sticky top-0 z-20",
            "bg-white",
            "border-b border-gray-200",
            isFocused ? "shadow-[0_1px_12px_rgba(107,74,45,0.10)]" : "",
          ].join(" ")}
        >
          {/* Focus accent line */}
          <div
            className="h-[2.5px] w-full transition-opacity duration-300"
            style={{
              background: "linear-gradient(90deg,#6B4A2D,#b07d50 50%,rgba(107,74,45,0.08))",
              opacity: isFocused ? 1 : 0,
            }}
          />

          {/*
            ── ALWAYS show BOTH rows on ALL screen sizes ──
            Each row is independently horizontally scrollable.
            This ensures every option (including alignment) is
            always accessible to the admin on both mobile & desktop.
          */}
          <div className="divide-y divide-gray-100">
            {/* Row 1: Undo/Redo + Inline marks + Code/Link/Clear */}
            <ToolbarRow groups={row1Groups} />
            {/* Row 2: Headings + Lists + Blocks + Alignment */}
            <ToolbarRow groups={row2Groups} />
          </div>

          {/* Active format pills */}
          {activeLabels.length > 0 && (
            <div
              className="flex items-center gap-1 px-3 py-1 bg-[#faf9f7] border-t border-gray-100 overflow-x-auto be-toolbar-scroll"
              aria-live="polite"
              aria-label="Active formatting"
            >
              <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider whitespace-nowrap flex-shrink-0 mr-0.5">
                Active:
              </span>
              {activeLabels.map((label) => (
                <span
                  key={label}
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0"
                  style={{ background: "rgba(107,74,45,0.10)", color: "#6B4A2D" }}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Editor content ── */}
        <EditorContent editor={editor} />

        {/* ── Sticky footer ── */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm border-t border-gray-100">
          <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
            {charCount} chars · {wordCount} words
          </span>
          <span className="text-[10px] text-gray-300 italic whitespace-nowrap">
            Select text to format
          </span>
        </div>

      </div>

      <style>{`
        /* Placeholder */
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          color: #b0b7c0;
          float: left;
          height: 0;
          pointer-events: none;
          font-style: italic;
        }

        /* Typography */
        .ProseMirror p  { margin: 0.4em 0; line-height: 1.75; }
        .ProseMirror h1 { font-size: clamp(1.3em, 4vw, 1.75em); font-weight: 800; margin: 0.8em 0 0.3em; line-height: 1.2; }
        .ProseMirror h2 { font-size: clamp(1.1em, 3vw, 1.4em);  font-weight: 700; margin: 0.8em 0 0.3em; line-height: 1.3; }
        .ProseMirror h3 { font-size: clamp(1em, 2.5vw, 1.15em); font-weight: 700; margin: 0.8em 0 0.3em; line-height: 1.4; }

        /* Lists */
        .ProseMirror ul { list-style: disc;    padding-left: 1.4rem; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.4rem; }
        .ProseMirror li { margin: 0.2em 0; line-height: 1.6; }

        /* Blockquote */
        .ProseMirror blockquote {
          border-left: 3px solid #6B4A2D;
          padding: 0.3em 0 0.3em 1em;
          color: #6b7280;
          font-style: italic;
          margin: 1em 0;
          background: rgba(107,74,45,0.04);
          border-radius: 0 6px 6px 0;
        }

        /* Inline code */
        .ProseMirror code {
          background: #f3f4f6;
          padding: 0.15em 0.45em;
          border-radius: 4px;
          font-size: 0.88em;
          color: #6B4A2D;
          font-family: ui-monospace, SFMono-Regular, monospace;
          word-break: break-all;
        }

        /* Code block */
        .ProseMirror pre {
          background: #1a1a2e;
          color: #e2e8f0;
          padding: 0.9rem 1rem;
          border-radius: 10px;
          overflow-x: auto;
          font-size: 0.85em;
          margin: 1em 0;
          font-family: ui-monospace, SFMono-Regular, monospace;
          line-height: 1.6;
        }
        .ProseMirror pre code {
          background: none; color: inherit;
          padding: 0; font-size: inherit; word-break: normal;
        }

        /* HR */
        .ProseMirror hr { border: none; border-top: 2px solid #e5e7eb; margin: 1.5rem 0; }

        /* Links */
        .ProseMirror a { color: #6B4A2D; text-decoration: underline; text-underline-offset: 2px; word-break: break-word; }
        .ProseMirror a:hover { color: #9b6a3d; }

        /* Text alignment */
        .ProseMirror [style*="text-align: center"] { text-align: center; }
        .ProseMirror [style*="text-align: right"]  { text-align: right;  }
        .ProseMirror [style*="text-align: left"]   { text-align: left;   }

        /* Images */
        .ProseMirror img { max-width: 100%; height: auto; border-radius: 8px; }

        /* Selection */
        .ProseMirror ::selection { background: rgba(107,74,45,0.18); }

        /* Scrollbar hide */
        .be-toolbar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        .be-toolbar-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </>
  );
}
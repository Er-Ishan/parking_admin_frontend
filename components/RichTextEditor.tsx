"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type Props = {
    value: string;
    onChange: (val: string) => void;
};

export default function RichTextEditor({ value, onChange }: Props) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                bulletList: {
                    keepMarks: true,
                    keepAttributes: true,
                },
                orderedList: {
                    keepMarks: true,
                    keepAttributes: true,
                },
            }),
        ],
        content: value,
        immediatelyRender: false,
        editorProps: {
            attributes: {
                class:
                    "prose prose-sm max-w-none focus:outline-none min-h-[120px] px-3 py-2",
            },
        },
        onUpdate({ editor }) {
            onChange(editor.getHTML());
        },
    });


    if (!editor) return null;

    return (
        <div className="border border-gray-300 bg-white">
            {/* TOOLBAR */}
            <div className="flex items-center gap-1 border-b bg-gray-50 px-2 py-1 text-sm">
                <ToolbarButton
                    active={editor.isActive("bold")}
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    label="B"
                    bold
                />
                <ToolbarButton
                    active={editor.isActive("italic")}
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    label="I"
                    italic
                />
                <ToolbarButton
                    active={editor.isActive("bulletList")}
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    label="• List"
                />
                <ToolbarButton
                    active={editor.isActive("orderedList")}
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    label="1. List"
                />
            </div>

            {/* EDITOR */}
            <EditorContent editor={editor} />
        </div>
    );
}

/* ---------- Toolbar Button ---------- */
function ToolbarButton({
    onClick,
    label,
    active,
    bold,
    italic,
}: any) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-2 py-1 border text-xs rounded-sm
        ${active ? "bg-orange-600 text-white" : "bg-white text-gray-700"}
        hover:bg-orange-100`}
            style={{
                fontWeight: bold ? "bold" : undefined,
                fontStyle: italic ? "italic" : undefined,
            }}
        >
            {label}
        </button>
    );
}

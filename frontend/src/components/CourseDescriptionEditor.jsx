"use client";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";

import { useEffect, useRef } from "react";
import { BlockNoteView } from "@blocknote/shadcn";
import { useCreateBlockNote } from "@blocknote/react";

export default function CourseDescriptionEditor({ value, onChange }) {
  const editor = useCreateBlockNote();

  const initialized = useRef(false);

  useEffect(() => {
    if (!editor || initialized.current) {
      return;
    }

    initialized.current = true;

    if (!value) {
      return;
    }

    const loadContent = async () => {
      const blocks = await editor.tryParseHTMLToBlocks(value);

      editor.replaceBlocks(editor.document, blocks);
    };

    loadContent();
  }, [editor, value]);

  const handleChange = async () => {
    const html = await editor.blocksToHTMLLossy(editor.document);

    onChange(html);
  };

  return (
    <div className="min-h-[450px] overflow-hidden rounded-lg border">
      <BlockNoteView editor={editor} onChange={handleChange} theme="dark" />
    </div>
  );
}

export type EditorSelectionRange = {
  start: number;
  end: number;
};

function clampSelectionIndex(value: number, textLength: number) {
  if (Number.isNaN(value)) {
    return textLength;
  }

  return Math.max(0, Math.min(value, textLength));
}

export function insertMarkdownBlock(
  text: string,
  markdown: string,
  selection: EditorSelectionRange
) {
  const safeStart = clampSelectionIndex(selection.start, text.length);
  const safeEnd = clampSelectionIndex(selection.end, text.length);
  const start = Math.min(safeStart, safeEnd);
  const end = Math.max(safeStart, safeEnd);

  const before = text.slice(0, start);
  const after = text.slice(end);

  const leadingBreak =
    before.length === 0
      ? ""
      : before.endsWith("\n\n")
        ? ""
        : before.endsWith("\n")
          ? "\n"
          : "\n\n";

  const trailingBreak =
    after.length === 0
      ? ""
      : after.startsWith("\n\n")
        ? ""
        : after.startsWith("\n")
          ? "\n"
          : "\n\n";

  const insertion = `${leadingBreak}${markdown}${trailingBreak}`;
  const nextText = `${before}${insertion}${after}`;
  const caret = before.length + insertion.length;

  return {
    text: nextText,
    caret,
  };
}

export type EditorSelectionRange = {
  start: number;
  end: number;
};

export type ReferencedMarkdownImage = {
  altText: string;
  path: string;
  markdown: string;
  count: number;
};

const MARKDOWN_IMAGE_PATTERN =
  /!\[([^\]]*)\]\((\/(?:notes|work|pages)\/[^)\s]+)(?:\s+["'][^"']*["'])?\)/g;

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

export function getReferencedMarkdownImages(
  text: string
): ReferencedMarkdownImage[] {
  const matches = text.matchAll(MARKDOWN_IMAGE_PATTERN);
  const images = new Map<string, ReferencedMarkdownImage>();

  for (const match of matches) {
    const markdown = match[0];
    const altText = match[1] ?? "";
    const path = match[2] ?? "";

    if (!path) {
      continue;
    }

    const existing = images.get(path);

    if (existing) {
      existing.count += 1;
      continue;
    }

    images.set(path, {
      altText,
      path,
      markdown,
      count: 1,
    });
  }

  return [...images.values()];
}

export function removeMarkdownImageReferences(text: string, imagePath: string) {
  const matches = [...text.matchAll(MARKDOWN_IMAGE_PATTERN)].filter(
    (match) => match[2] === imagePath && typeof match.index === "number"
  );

  if (matches.length === 0) {
    return text;
  }

  let nextText = text;

  for (const match of matches.reverse()) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const lineStart = nextText.lastIndexOf("\n", start - 1) + 1;
    const newlineIndex = nextText.indexOf("\n", end);
    const beforeOnLine = nextText.slice(lineStart, start);
    const lineEnd = newlineIndex === -1 ? nextText.length : newlineIndex;
    const afterOnLine = nextText.slice(end, lineEnd);
    const isStandaloneLine =
      beforeOnLine.trim().length === 0 && afterOnLine.trim().length === 0;

    let removeStart = start;
    let removeEnd = end;

    if (isStandaloneLine) {
      removeStart = lineStart;
      removeEnd = newlineIndex === -1 ? nextText.length : newlineIndex + 1;
    }

    nextText = `${nextText.slice(0, removeStart)}${nextText.slice(removeEnd)}`;
  }

  return nextText.replace(/\n{3,}/g, "\n\n");
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const notesDir = path.join(process.cwd(), "content/notes");
const NOTE_SLUG_PATTERN = /^[a-z0-9_-]+$/i;

export type NoteMetadata = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
  pinned: boolean;
};

export type Note = NoteMetadata & {
  content: string;
};

export type NoteInput = Note;

export class NoteSaveError extends Error {}

function getNoteFilePath(slug: string) {
  if (!NOTE_SLUG_PATTERN.test(slug)) {
    return null;
  }

  const filePath = path.normalize(path.join(notesDir, `${slug}.mdx`));

  if (!filePath.startsWith(notesDir)) {
    return null;
  }

  return filePath;
}

function serializeNote(input: NoteInput) {
  const frontmatter = {
    title: input.title,
    date: input.date,
    tags: input.tags,
    description: input.description,
    ...(input.pinned ? { pinned: true } : {}),
  };
  const normalizedContent = input.content.replace(/\r\n/g, "\n").trimEnd();

  return matter.stringify(
    normalizedContent ? `${normalizedContent}\n` : "",
    frontmatter
  );
}

function getMissingRequiredNoteFields(input: Pick<NoteInput, "slug" | "title" | "date" | "tags" | "description">) {
  return [
    !input.slug.trim() && "slug",
    !input.title.trim() && "title",
    !input.date.trim() && "date",
    input.tags.length === 0 && "tags",
    !input.description.trim() && "description",
  ].filter(Boolean) as string[];
}

function formatFieldList(fields: string[]) {
  if (fields.length <= 1) {
    return fields[0] ?? "";
  }

  if (fields.length === 2) {
    return `${fields[0]} and ${fields[1]}`;
  }

  return `${fields.slice(0, -1).join(", ")}, and ${fields.at(-1)}`;
}

export function getNoteDisplayTitle(note: Pick<NoteMetadata, "slug" | "title">) {
  const trimmedTitle = note.title.trim();

  if (trimmedTitle) {
    return trimmedTitle;
  }

  return note.slug.replace(/[-_]+/g, " ").trim() || "untitled note";
}

export function getAvailableNoteSlug(baseSlug = "untitled-note") {
  const sanitizedBaseSlug = baseSlug.trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "untitled-note";
  let slug = sanitizedBaseSlug;
  let index = 2;

  while (true) {
    const filePath = getNoteFilePath(slug);

    if (filePath && !fs.existsSync(filePath)) {
      return slug;
    }

    slug = `${sanitizedBaseSlug}-${index}`;
    index += 1;
  }
}

export function getNewNoteDraft(): Note {
  return {
    slug: "",
    title: "",
    date: "",
    tags: [],
    description: "",
    pinned: false,
    content: "",
  };
}

export function getAllNotes(): NoteMetadata[] {
  const files = fs.readdirSync(notesDir).filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(/\.mdx$/, "");
      const raw = fs.readFileSync(path.join(notesDir, file), "utf8");
      const { data } = matter(raw);

      return {
        slug,
        title: data.title ?? "",
        date: data.date ?? "",
        tags: data.tags ?? [],
        description: data.description ?? "",
        pinned: data.pinned ?? false,
      };
    })
    .sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getNote(slug: string): Note | null {
  const filePath = getNoteFilePath(slug);

  if (!filePath || !fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    description: data.description ?? "",
    pinned: data.pinned ?? false,
    content,
  };
}

export function saveNote(slug: string, input: NoteInput): Note | null {
  const currentFilePath = getNoteFilePath(slug);

  if (!currentFilePath || !fs.existsSync(currentFilePath)) {
    return null;
  }

  const nextSlug = input.slug.trim();
  const nextFilePath = getNoteFilePath(nextSlug);
  const missingFields = getMissingRequiredNoteFields({
    slug: nextSlug,
    title: input.title,
    date: input.date,
    tags: input.tags,
    description: input.description,
  });

  if (missingFields.length > 0) {
    throw new NoteSaveError(
      `Add ${formatFieldList(missingFields)} before saving this note.`
    );
  }

  if (!nextFilePath) {
    throw new NoteSaveError(
      "Use only lowercase letters, numbers, hyphens, or underscores for the slug."
    );
  }

  if (nextSlug !== slug && fs.existsSync(nextFilePath)) {
    throw new NoteSaveError("Another note already uses this slug.");
  }

  if (nextSlug !== slug) {
    fs.renameSync(currentFilePath, nextFilePath);
  }

  fs.writeFileSync(nextFilePath, serializeNote(input), "utf8");

  return getNote(nextSlug);
}

export function createNote(input: NoteInput): Note {
  const nextSlug = input.slug.trim();
  const nextFilePath = getNoteFilePath(nextSlug);
  const missingFields = getMissingRequiredNoteFields({
    slug: nextSlug,
    title: input.title,
    date: input.date,
    tags: input.tags,
    description: input.description,
  });

  if (missingFields.length > 0) {
    throw new NoteSaveError(
      `Add ${formatFieldList(missingFields)} before creating this note.`
    );
  }

  if (!nextFilePath) {
    throw new NoteSaveError(
      "Use only lowercase letters, numbers, hyphens, or underscores for the slug."
    );
  }

  if (fs.existsSync(nextFilePath)) {
    throw new NoteSaveError("Another note already uses this slug.");
  }

  fs.writeFileSync(nextFilePath, serializeNote(input), "utf8");

  return getNote(nextSlug);
}

export function deleteNote(slug: string) {
  const filePath = getNoteFilePath(slug);

  if (!filePath || !fs.existsSync(filePath)) {
    return false;
  }

  fs.unlinkSync(filePath);

  return true;
}

import fs from "fs";
import path from "path";
import matter from "gray-matter";

const notesDir = path.join(process.cwd(), "content/notes");

export type NoteMetadata = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  description: string;
};

export type Note = NoteMetadata & {
  content: string;
};

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
      };
    })
    .sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getNote(slug: string): Note | null {
  const filePath = path.join(notesDir, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? "",
    date: data.date ?? "",
    tags: data.tags ?? [],
    description: data.description ?? "",
    content,
  };
}

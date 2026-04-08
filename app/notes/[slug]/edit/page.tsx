import { notFound } from "next/navigation";
import NoteEditor from "../../../components/NoteEditor";
import NoteScrollRestorer from "../../../components/NoteScrollRestorer";
import PageFrame from "../../../components/PageFrame";
import { getNote } from "../../../lib/notes";

type EditNotePageProps = {
  params: Promise<{ slug: string }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const { slug } = await params;
  const note = getNote(slug);

  if (!note) {
    notFound();
  }

  return (
    <PageFrame>
      <NoteScrollRestorer storageKey={`note-scroll:${note.slug}`} />
      <NoteEditor note={note} />
    </PageFrame>
  );
}

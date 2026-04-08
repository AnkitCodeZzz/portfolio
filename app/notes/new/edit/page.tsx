import { notFound } from "next/navigation";
import NoteEditor from "../../../components/NoteEditor";
import PageFrame from "../../../components/PageFrame";
import { getNewNoteDraft } from "../../../lib/notes";

export default function NewNoteEditPage() {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  return (
    <PageFrame>
      <NoteEditor note={getNewNoteDraft()} mode="create" />
    </PageFrame>
  );
}

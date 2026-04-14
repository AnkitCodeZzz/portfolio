import Link from "next/link";
import Divider from "../components/Divider";
import PinIcon from "../components/PinIcon";
import PageFrame from "../components/PageFrame";
import { getAllNotes, getNoteDisplayTitle } from "../lib/notes";
import { getNoteTagColorCssValue, getNoteTagLabel } from "../lib/noteTags";
import editorial from "../styles/editorial.module.css";
import homeStyles from "../page.module.css";

export default function NotesPage() {
  const notes = getAllNotes();
  const editingEnabled = process.env.NODE_ENV === "development";

  return (
    <PageFrame>
      <section
        className={homeStyles.hero}
        data-ruler-track
        data-ruler-pad-bottom={220}
      >
        <div className={editorial.introBlock}>
          <div className={editorial.introCopy}>
            <div className={`${editorial.detailTopBar} ${editorial.introTopBar}`}>
              <h1 className={editorial.pageTitle}>My Notes</h1>
              {editingEnabled ? (
                <div className={editorial.utilityRow}>
                  <Link href="/notes/new/edit" className={editorial.utilityLink}>
                    New note
                  </Link>
                </div>
              ) : null}
            </div>
            <p className={editorial.pageTagline}>
              Thinking out loud about design, craft, and the things I&apos;m trying to understand more clearly.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section className={homeStyles.section} data-ruler-track>
        {notes.length === 0 ? (
          <p className={editorial.emptyState}>
            No notes published yet.
          </p>
        ) : (
          <div className={homeStyles.noteList}>
            {notes.map((note) => (
              <article key={note.slug} className={homeStyles.noteRow}>
                <div className={homeStyles.noteContent}>
                  {note.tags.length > 0 ? (
                    <div className={homeStyles.notesMeta}>
                      {note.tags.map((tag, tagIndex) => (
                        <span className={homeStyles.tagMetaItem} key={`${note.slug}-${tag}`}>
                          <span
                            data-ruler-tag
                            className={homeStyles.noteTag}
                            style={{ color: getNoteTagColorCssValue(tag) }}
                          >
                            {getNoteTagLabel(tag)}
                          </span>
                          {tagIndex < note.tags.length - 1 ? <span className={homeStyles.dot}>•</span> : null}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <Link href={`/notes/${note.slug}`} className={homeStyles.noteTitleLink}>
                    <h2 className={homeStyles.noteTitle}>{getNoteDisplayTitle(note)}</h2>
                  </Link>
                </div>
                {note.pinned ? <PinIcon /> : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </PageFrame>
  );
}

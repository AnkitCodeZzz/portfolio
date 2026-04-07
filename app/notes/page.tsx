import { Fragment } from "react";
import Link from "next/link";
import Divider from "../components/Divider";
import PageFrame from "../components/PageFrame";
import { getAllNotes } from "../lib/notes";
import editorial from "../styles/editorial.module.css";
import homeStyles from "../page.module.css";

const tagClasses = [
  homeStyles.tagOlive,
  homeStyles.tagViolet,
  homeStyles.tagBlue,
  homeStyles.tagBrown,
  homeStyles.tagRose,
];

export default function NotesPage() {
  const notes = getAllNotes();

  return (
    <PageFrame>
      <section className={homeStyles.hero} data-ruler-track>
        <div className={editorial.introBlock}>
          <div className={editorial.introCopy}>
            <h1 className={editorial.pageTitle}>Notes</h1>
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
                        <Fragment key={`${note.slug}-${tag}`}>
                          <span
                            data-ruler-tag
                            className={`${homeStyles.noteTag} ${tagClasses[tagIndex % tagClasses.length]}`}
                          >
                            {tag}
                          </span>
                          {tagIndex < note.tags.length - 1 ? <span className={homeStyles.dot}>•</span> : null}
                        </Fragment>
                      ))}
                    </div>
                  ) : null}

                  <Link href={`/notes/${note.slug}`} className={homeStyles.noteTitleLink}>
                    <h2 className={homeStyles.noteTitle}>{note.title}</h2>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </PageFrame>
  );
}

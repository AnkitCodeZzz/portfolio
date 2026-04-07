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
      <section className={editorial.intro}>
        <div className={editorial.introBlock} data-ruler-track data-ruler-pad-bottom="56">
          <span className={editorial.eyebrow}>/notes</span>
          <div className={editorial.introCopy}>
            <h1 className={editorial.pageTitle}>Notes</h1>
            <p className={editorial.pageTagline}>
              Thinking out loud about design, craft, and the things I&apos;m trying to understand more clearly.
            </p>
          </div>
        </div>
      </section>

      <Divider />

      <section className={editorial.section}>
        <div className={editorial.sectionBlock}>
          {notes.length === 0 ? (
            <p className={editorial.emptyState} data-ruler-track>
              No notes published yet.
            </p>
          ) : (
            <div className={editorial.list}>
              {notes.map((note) => (
                <article
                  key={note.slug}
                  className={editorial.listItem}
                  data-ruler-track
                  data-ruler-pad-top="24"
                  data-ruler-pad-bottom="40"
                >
                  <div className={editorial.metaCluster}>
                    <span className={editorial.date}>{note.date}</span>
                    {note.tags.length > 0 ? (
                      <div className={editorial.tagRow}>
                        {note.tags.map((tag, tagIndex) => (
                          <Fragment key={`${note.slug}-${tag}`}>
                            <span className={`${editorial.tag} ${tagClasses[tagIndex % tagClasses.length]}`}>{tag}</span>
                            {tagIndex < note.tags.length - 1 ? <span className={homeStyles.dot}>•</span> : null}
                          </Fragment>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <Link href={`/notes/${note.slug}`} className={editorial.entryLink}>
                    <h2 className={editorial.entryTitle}>{note.title}</h2>
                  </Link>

                  {note.description ? <p className={editorial.entryDescription}>{note.description}</p> : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageFrame>
  );
}

import Link from "next/link";
import InteractiveRuler from "./components/InteractiveRuler";
import Divider from "./components/Divider";
import MobileHeader from "./components/MobileHeader";
import PinIcon from "./components/PinIcon";
import { getAllNotes, getNoteDisplayTitle } from "./lib/notes";
import styles from "./page.module.css";

const projects = [
  {
    label: "UI Redesign",
    labelClassName: styles.tagBrown,
    title: "Redesigning Goodreads",
    description: "Revamped Goodread's UI → A fresh perspective to discovery, organisation, and community.",
    pinned: true,
  },
  {
    label: "Usability Testing",
    labelClassName: styles.tagViolet,
    title: "Tripwise Usability Testing",
    description: "Conducted extensive usability testing for an online travel agency.",
  },
  {
    label: "Experience Design",
    labelClassName: styles.tagRose,
    title: "Rigved's Omnichannel Experience",
    description: "Designed an omnichannel experience for a sports retail brand.",
  },
];

const backgroundEntries = {
  lead: {
    role: "B. Design [UX]",
    date: "Jun 2022 - Present",
    place: "Chitkara University",
    description: "Building a strong foundation in design, learning from some of the most influential voices in the industry and my peers.",
  },
  rest: [
    {
      role: "Internship",
      date: "May - Jul 2025",
      place: "Accenture SONG",
      description: "Worked in a 5-member team, translating research into user-centric, business-aligned solutions.",
    },
    {
      role: "Cohort",
      date: "Jul - Oct 2024",
      place: "Era of No-Code",
      description: "Dived into no-code tools to build MVPs, simplify and speed up workflows.",
    },
    {
      role: "Cohort",
      date: "Jan - May 2024",
      place: "10K Designers",
      description: "Connected with product designers, learning from their experiences.",
    },
  ],
};

const noteTagClasses = [
  styles.tagOlive,
  styles.tagViolet,
  styles.tagBlue,
  styles.tagBrown,
  styles.tagRose,
];

function TimelineConnector({ className }: { className?: string }) {
  return (
    <div className={className} aria-hidden="true">
      <svg
        className={styles.timelineHeadTop}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 7 9"
        fill="none"
      >
        <path
          d="M0.5 3.5L3.5 0.5L6.5 3.5M3.5 0.5V9"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className={styles.timelineStem} />
      <svg
        className={styles.timelineHeadBottom}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 6 6"
        fill="none"
      >
        <path
          d="M3 0L6 6H0L3 0Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export default function HomePage() {
  const notes = getAllNotes().slice(0, 5);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.desktopBrandRow}>
          <Link href="/" className={styles.brand}>
            <span>Ankit </span>
            <span className={styles.brandMuted}>Mandal</span>
          </Link>
          <nav className={styles.desktopNav} aria-label="Primary">
            <span className={`${styles.navItem} ${styles.navWork}`}>/work</span>
            <Link href="/notes" className={`${styles.inactiveLink} ${styles.navNotes}`}>
              /notes
            </Link>
            <span className={`${styles.navItem} ${styles.navReadme}`}>/readme</span>
          </nav>
        </div>
        <MobileHeader />
      </header>

      <div className={styles.pageBody}>
        <InteractiveRuler />

        <div className={styles.main} data-ruler-content="main">
          <section className={styles.hero} data-ruler-track data-hero-section>
            <div className={styles.heroTop}>
              <h1 className={styles.heroTitle}>
                Hey,
                <br />
                I&apos;m Ankit.
              </h1>
              <p className={styles.heroTagline}>
                I&apos;m a Designer &
                <br />I like making things make sense.
              </p>
            </div>
            <p className={styles.heroCopy}>
              I&apos;m a curious person with a tendency to explore a bit of everything. Over time, I&apos;ve developed an
              eye for detail and a sense for what feels right. I care about taste, clarity and how things actually
              work. I rely on data to make sense of things when it gets blurry and I don&apos;t let things slide easily.
            </p>
            <span className={styles.heroNow}>/now</span>
          </section>

          <Divider />

          <section className={styles.section} aria-labelledby="projects-title" data-ruler-track>
            <div className={styles.sectionHeader}>
              <h2 id="projects-title" className={styles.sectionTitle}>
                My Projects
              </h2>
              <span className={styles.sectionAction}>view all</span>
            </div>
            <div className={styles.projectList}>
              {projects.map((project) => (
                <article key={project.title} className={styles.projectRow}>
                  <div>
                    <div className={styles.entryMeta}>
                      <span data-ruler-tag className={`${styles.entryLabel} ${project.labelClassName}`}>
                        {project.label}
                      </span>
                    </div>
                    <h3 className={styles.projectTitle}>{project.title}</h3>
                    <p className={styles.projectDescription}>{project.description}</p>
                  </div>
                  {project.pinned ? <PinIcon /> : null}
                </article>
              ))}
            </div>
          </section>

          <Divider />

          <section className={styles.section} aria-labelledby="notes-title" data-ruler-track>
            <div className={styles.sectionHeader}>
              <h2 id="notes-title" className={styles.sectionTitle}>
                Latest Notes
              </h2>
              <Link href="/notes" className={styles.sectionAction}>
                view all
              </Link>
            </div>
            <div className={styles.noteList}>
              {notes.map((note) => (
                <article key={note.slug} className={styles.noteRow}>
                  <div className={styles.noteContent}>
                    {note.tags.length > 0 ? (
                      <div className={styles.notesMeta}>
                        {note.tags.map((tag, tagIndex) => (
                          <span className={styles.tagMetaItem} key={`${note.slug}-${tag}`}>
                            <span
                              data-ruler-tag
                              className={`${styles.noteTag} ${noteTagClasses[tagIndex % noteTagClasses.length]}`}
                            >
                              {tag}
                            </span>
                            {tagIndex < note.tags.length - 1 ? <span className={styles.dot}>•</span> : null}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <Link href={`/notes/${note.slug}`} className={styles.noteTitleLink}>
                      <h3 className={styles.noteTitle}>{getNoteDisplayTitle(note)}</h3>
                    </Link>
                  </div>
                  {note.pinned ? <PinIcon /> : null}
                </article>
              ))}
            </div>
          </section>

          <Divider />

          <section
            className={`${styles.section} ${styles.backgroundSection}`}
            aria-labelledby="background-title"
            data-ruler-track
          >
            <div className={styles.backgroundHeader}>
              <h2 id="background-title" className={styles.sectionTitle}>
                My Background
              </h2>
            </div>
            <div className={styles.backgroundTimeline}>
              <div className={styles.backgroundLead}>
                <div className={styles.backgroundLeadLabel}>
                  <span className={styles.backgroundLeadLabelText}>Under Grad</span>
                </div>
                <TimelineConnector className={styles.backgroundLeadLine} />
              </div>

              <div className={styles.backgroundContent}>
                <article className={styles.backgroundEntry}>
                  <div className={styles.backgroundEntryMeta}>
                    <span data-ruler-tag className={styles.backgroundRole}>
                      {backgroundEntries.lead.role}
                    </span>
                    <span className={styles.backgroundDate}>{backgroundEntries.lead.date}</span>
                  </div>
                  <div>
                    <h3 className={styles.backgroundPlace}>{backgroundEntries.lead.place}</h3>
                    <p className={styles.backgroundDescription}>{backgroundEntries.lead.description}</p>
                  </div>
                </article>

                <div className={styles.backgroundNested}>
                  <TimelineConnector className={styles.backgroundTailLine} />
                  <div className={styles.backgroundNestedEntries}>
                    {backgroundEntries.rest.map((entry) => (
                      <article key={`${entry.role}-${entry.place}`} className={styles.backgroundEntry}>
                        <div className={styles.backgroundEntryMeta}>
                          <span data-ruler-tag className={styles.backgroundRole}>
                            {entry.role}
                          </span>
                          <span className={styles.backgroundDate}>{entry.date}</span>
                        </div>
                        <div>
                          <h3 className={styles.backgroundPlace}>{entry.place}</h3>
                          <p className={styles.backgroundDescription}>{entry.description}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { useId } from "react";
import { getAllNotes } from "./lib/notes";
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

const sidebarLabels = Array.from({ length: 11 }, (_, index) => `${index * 100}`);

function PinIcon() {
  return (
    <span className={styles.pin} aria-hidden="true">
      <span className={styles.pinPartA} />
      <span className={styles.pinPartB} />
    </span>
  );
}

function XIcon() {
  return (
    <span className={styles.xIcon} aria-hidden="true">
      <span className={styles.xLayerA} />
      <span className={styles.xLayerB} />
      <span className={styles.xLayerC} />
    </span>
  );
}

function Divider() {
  const patternId = useId();
  const clipId = useId();

  return (
    <div className={styles.dividerWrap} aria-hidden="true">
      <div className={styles.divider}>
        <svg className={styles.dividerPattern} width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern
              id={patternId}
              patternUnits="userSpaceOnUse"
              width="4"
              height="4"
              patternTransform="scale(1.5)"
            >
              <g clipPath={`url(#${clipId})`}>
                <path d="M1 -1L5 3" stroke="currentColor" strokeWidth="0.5" />
                <path d="M-1 1L3 5" stroke="currentColor" strokeWidth="0.5" />
              </g>
            </pattern>
            <clipPath id={clipId}>
              <rect width="4" height="4" fill="white" />
            </clipPath>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
        </svg>
      </div>
    </div>
  );
}

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
            <span className={styles.navItem}>/work</span>
            <Link href="/notes" className={styles.inactiveLink}>
              /notes
            </Link>
            <span className={styles.navItem}>/readme</span>
          </nav>
        </div>
        <div className={styles.brandRow}>
          <Link href="/" className={styles.brand}>
            <span>Ankit </span>
            <span className={styles.brandMuted}>Mandal</span>
          </Link>
        </div>
        <div className={styles.mobileNavRow}>
          <nav className={styles.mobileNav} aria-label="Primary">
            <span className={styles.navItem}>/work</span>
            <Link href="/notes" className={styles.inactiveLink}>
              /notes
            </Link>
            <span className={styles.navItem}>/readme</span>
          </nav>
        </div>
      </header>

      <div className={styles.pageBody}>
        <aside className={styles.sidebar} aria-hidden="true">
          {sidebarLabels.map((label) => (
            <div key={label} className={styles.sidebarTick}>
              <div className={styles.sidebarLabelWrap}>
                <span className={styles.sidebarLabel}>{label}</span>
              </div>
              <span className={styles.sidebarDash} />
            </div>
          ))}
        </aside>

        <div className={styles.main}>
          <section className={styles.hero}>
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

          <section className={styles.section} aria-labelledby="projects-title">
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
                      <span className={`${styles.entryLabel} ${project.labelClassName}`}>{project.label}</span>
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

          <section className={styles.section} aria-labelledby="notes-title">
            <div className={styles.sectionHeader}>
              <h2 id="notes-title" className={styles.sectionTitle}>
                Latest Notes
              </h2>
              <Link href="/notes" className={styles.sectionAction}>
                view all
              </Link>
            </div>
            <div className={styles.noteList}>
              {notes.map((note, noteIndex) => (
                <article key={note.slug} className={styles.noteRow}>
                  <div>
                    {note.tags.length > 0 ? (
                      <div className={styles.notesMeta}>
                        {note.tags.map((tag, tagIndex) => (
                          <span key={`${note.slug}-${tag}`}>
                            <span className={`${styles.noteTag} ${noteTagClasses[tagIndex % noteTagClasses.length]}`}>
                              {tag}
                            </span>
                            {tagIndex < note.tags.length - 1 ? <span className={styles.dot}>•</span> : null}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <Link href={`/notes/${note.slug}`} className={styles.noteTitleLink}>
                      <h3 className={styles.noteTitle}>{note.title}</h3>
                    </Link>
                  </div>
                  {noteIndex === 0 ? <PinIcon /> : null}
                </article>
              ))}
            </div>
          </section>

          <Divider />

          <section className={`${styles.section} ${styles.backgroundSection}`} aria-labelledby="background-title">
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
                    <span className={styles.backgroundRole}>{backgroundEntries.lead.role}</span>
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
                          <span className={styles.backgroundRole}>{entry.role}</span>
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

          <Divider />
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <span className={styles.footerCopy}>
              <span>© Ankit Mandal</span>
              <span className={styles.footerMutedDot}>•</span>
              <span>{new Date().getFullYear()}</span>
            </span>
            <div className={styles.footerLinks}>
              <a href="https://x.com/Ankit__TwT" target="_blank" rel="noreferrer" className={styles.footerLink}>
                <XIcon />
              </a>
              <span className={styles.footerMutedDot}>•</span>
              <a
                href="https://www.linkedin.com/in/itsankitmandal/"
                target="_blank"
                rel="noreferrer"
                className={styles.footerLink}
              >
                LinkedIn
              </a>
              <span className={styles.footerMutedDot}>•</span>
              <span>Resume</span>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}

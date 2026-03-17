import Typography from "../components/Typography";
import Container from "../components/Container";

const experience = [
  {
    company: "Accenture SONG",
    role: "Internship",
    date: "May - Jul 2025",
    description: "Worked in a 5-member team, translating research and feedback into user-centric, business-aligned solutions.",
    tagColor: "var(--color-b)",
    tagBg: "var(--color-b-bg)",
  },
  {
    company: "Era of No Code",
    role: "Cohort",
    date: "Jul - Oct 2024",
    description: "Learned no-code tools and automations to build MVPs, simplify and speed up workflows.",
    tagColor: "var(--color-c)",
    tagBg: "var(--color-c-bg)",
  },
  {
    company: "10K Designers",
    role: "Cohort",
    date: "Jan - May 2024",
    description: "Connected with product designers, learning from their experiences.",
    tagColor: "var(--color-d)",
    tagBg: "var(--color-d-bg)",
  },
  {
    company: "Chitkara University",
    role: "B.Design UX/UI",
    date: "Jun 2022 - 2026",
    description: "Building a strong foundation in design, learning from mentors and peers.",
    tagColor: "var(--color-e)",
    tagBg: "var(--color-e-bg)",
  },
];

const projects = [
  {
    name: "Redesigning Goodreads",
    description: "Revamped Goodread's UI — fresh perspective on discovery, organisation, and community.",
    tag: "UI Redesign",
  },
  {
    name: "Rigved's Omnichannel Experience",
    description: "Designed an omnichannel experience for an e-sports retail brand.",
    tag: "Experience Design",
  },
  {
    name: "Usability Testing — Tripwise",
    description: "Conducted extensive usability testing for an online travel agency.",
    tag: "Research",
  },
];

export default function Home() {
  return (
    <main style={{ paddingTop: "var(--spacing-2xl)" }}>
      <Container size="md">
        <h1
          style={{
            fontSize: "32px",
            letterSpacing: "-0.02em",
            fontWeight: 300,
            lineHeight: 1.1,
            fontVariationSettings: "'opsz' 144",
            fontFamily: "var(--font-family-display)",
            color: "var(--color-text-primary)",
            margin: 0,
          }}
        >
          Why I stopped using component libraries.
        </h1>
        <div style={{ marginTop: "var(--spacing-sm)" }}>
          <p
            style={{
              fontFamily: "var(--font-family-display)",
              fontStyle: "italic",
              fontSize: "17px",
              fontWeight: 300,
              color: "var(--ink-40)",
              lineHeight: 1.35,
              margin: 0,
            }}
          >
            Designer — curious by default, guided by data, precise by habit.
          </p>
        </div>

        <div style={{ marginTop: "var(--spacing-4xl)" }}>
          <Typography as="h2" size="3xl" font="display" weight="light" letterSpacing="var(--letter-spacing-tight)" lineHeight={1.15} fontVariationSettings="'opsz' 72">
            Selected Work
          </Typography>
          <div>
            {projects.map(({ name, description, tag }) => (
              <div
                key={name}
                style={{
                  paddingTop: "var(--spacing-lg)",
                  paddingBottom: "var(--spacing-lg)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <Typography as="h3" size="xl" weight="normal">
                  {name}
                </Typography>
                <div style={{ marginTop: "var(--spacing-xs)" }}>
                  <p style={{ fontFamily: "var(--font-family-body)", fontSize: "16px", lineHeight: 1.78, color: "var(--ink-60)", margin: 0 }}>
                    {description}
                  </p>
                </div>
                <div style={{ marginTop: "var(--spacing-sm)" }}>
                  <span style={{
                    display: "inline-block",
                    background: "var(--color-accent-bg)",
                    color: "var(--color-accent)",
                    fontFamily: "var(--font-family-ui)",
                    fontSize: "10px",
                    padding: "2px 8px",
                    borderRadius: 0,
                    textTransform: "uppercase" as const,
                    letterSpacing: "var(--letter-spacing-tag)",
                    border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                  }}>
                    {tag}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "var(--spacing-4xl)" }}>
          <Typography as="h2" size="3xl" font="display" weight="light" letterSpacing="var(--letter-spacing-tight)" lineHeight={1.15} fontVariationSettings="'opsz' 72">
            Experience & Education
          </Typography>
          <div>
            {experience.map(({ company, role, date, description, tagColor, tagBg }) => (
              <div
                key={company}
                style={{
                  paddingTop: "var(--spacing-lg)",
                  paddingBottom: "var(--spacing-lg)",
                  borderBottom: "1px solid var(--color-border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "var(--spacing-md)",
                }}
              >
                <div>
                  <Typography as="h3" size="lg" weight="normal">
                    {company}
                  </Typography>
                  <div style={{ marginTop: "var(--spacing-xs)" }}>
                    <p style={{ fontFamily: "var(--font-family-body)", fontSize: "16px", lineHeight: 1.78, color: "var(--ink-60)", margin: 0 }}>
                      {description}
                    </p>
                  </div>
                  <div style={{ marginTop: "var(--spacing-sm)" }}>
                    <span style={{
                      display: "inline-block",
                      background: tagBg,
                      color: tagColor,
                      fontFamily: "var(--font-family-ui)",
                      fontSize: "10px",
                      padding: "2px 8px",
                      borderRadius: 0,
                      textTransform: "uppercase" as const,
                      letterSpacing: "var(--letter-spacing-tag)",
                      border: `1px solid color-mix(in srgb, ${tagColor} 30%, transparent)`,
                    }}>
                      {role}
                    </span>
                  </div>
                </div>
                <span style={{ whiteSpace: "nowrap" }}>
                  <Typography as="span" size="xs" color="muted" font="ui">
                    {date}
                  </Typography>
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}

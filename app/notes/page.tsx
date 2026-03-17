import Link from "next/link";
import Container from "../components/Container";
import Typography from "../components/Typography";
import { getAllNotes } from "../lib/notes";

export default function NotesPage() {
  const notes = getAllNotes();

  return (
    <main style={{ paddingTop: "var(--spacing-4xl)", paddingBottom: "var(--spacing-4xl)" }}>
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
          Notes
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
            Thinking out loud — design, craft, and whatever's on my mind.
          </p>
        </div>

        <div style={{ marginTop: "var(--spacing-2xl)" }}>
          {notes.map((note) => (
            <Link
              key={note.slug}
              href={`/notes/${note.slug}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <div
                style={{
                  paddingTop: "var(--spacing-lg)",
                  paddingBottom: "var(--spacing-lg)",
                  borderBottom: "1px solid var(--color-border)",
                }}
              >
                <Typography as="span" size="sm" color="muted" font="ui">
                  {note.date}
                </Typography>
                <div style={{ marginTop: "var(--spacing-xs)" }}>
                  <Typography as="h2" size="xl" weight="normal">
                    {note.title}
                  </Typography>
                </div>
                {note.description && (
                  <div style={{ marginTop: "var(--spacing-xs)" }}>
                    <p
                      style={{
                        fontFamily: "var(--font-family-body)",
                        fontSize: "16px",
                        lineHeight: 1.78,
                        color: "var(--ink-60)",
                        margin: 0,
                      }}
                    >
                      {note.description}
                    </p>
                  </div>
                )}
                {note.tags.length > 0 && (
                  <div style={{ marginTop: "var(--spacing-sm)", display: "flex", gap: "6px" }}>
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          display: "inline-block",
                          background: "var(--color-accent-bg)",
                          color: "var(--color-accent)",
                          fontFamily: "var(--font-family-ui)",
                          fontSize: "10px",
                          padding: "2px 8px",
                          borderRadius: 0,
                          textTransform: "uppercase",
                          letterSpacing: "var(--letter-spacing-tag)",
                          border: "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}

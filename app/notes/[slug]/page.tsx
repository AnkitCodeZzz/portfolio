import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import Container from "../../components/Container";
import { getAllNotes, getNote } from "../../lib/notes";

export function generateStaticParams() {
  return getAllNotes().map((note) => ({ slug: note.slug }));
}

export default async function NotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNote(slug);
  if (!note) notFound();

  return (
    <main style={{ paddingTop: "var(--spacing-4xl)", paddingBottom: "var(--spacing-4xl)" }}>
      <Container size="md">
        {/* Header */}
        <div style={{ marginBottom: "var(--spacing-2xl)" }}>
          <span
            style={{
              fontFamily: "var(--font-family-ui)",
              fontSize: "var(--font-size-sm)",
              color: "var(--ink-40)",
            }}
          >
            {note.date}
          </span>
          <h1
            style={{
              fontSize: "32px",
              letterSpacing: "-0.02em",
              fontWeight: 300,
              lineHeight: 1.1,
              fontVariationSettings: "'opsz' 144",
              fontFamily: "var(--font-family-display)",
              color: "var(--color-text-primary)",
              margin: "var(--spacing-xs) 0 0",
            }}
          >
            {note.title}
          </h1>
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
          <div
            style={{
              marginTop: "var(--spacing-xl)",
              borderBottom: "1px solid var(--color-border)",
            }}
          />
        </div>

        {/* MDX content */}
        <div className="prose">
          <MDXRemote source={note.content} options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }} />
        </div>
      </Container>
    </main>
  );
}

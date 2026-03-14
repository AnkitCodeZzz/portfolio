import Typography from "../components/Typography";
import Container from "../components/Container";
import ContributionGraph from "../components/ContributionGraph";

const logs = [
  {
    date: "March 8, 2026",
    entry: "Project planning complete. Tech stack finalized — Next.js, TypeScript, Tailwind CSS.",
  },
  {
    date: "March 9, 2026",
    entry: "Dev environment set up on Windows PC and MacBook. First deploy to Vercel. Built Typography, Container, and Button components. Design tokens system created.",
  },
  {
    date: "March 10, 2026",
    entry: "Type system finalized — Fraunces for display, Lora for body, Geist for UI. Updated Typography component with font prop.",
  },
  {
    date: "March 11, 2026",
    entry: "Added fonts to project. Created public build log page at /log for accountability. Linked it from homepage.",
  },
  {
    date: "March 12, 2026",
    entry: "Added contribution graph to build log page. Connected custom domain ankitmandal.tech to Vercel.",
  },
  {
    date: "March 14, 2026",
    entry: "Refined contribution graph: streak-based tracking, adaptive tooltip with collision detection, auto-fill grid width. Learned useState, useLayoutEffect, and useRef.",
  },
];

export default function BuildLog() {
  return (
    <main style={{ paddingTop: "var(--spacing-4xl)", paddingBottom: "var(--spacing-4xl)" }}>
      <Container size="md">
        <Typography as="h1" size="4xl" weight="bold" font="display">
          Build Log
        </Typography>
        <div style={{ marginTop: "var(--spacing-sm)" }}>
          <Typography as="p" size="lg" color="secondary">
            A public record of building this site from scratch — learning design engineering along the way.
          </Typography>
        </div>
        <div style={{ marginTop: "var(--spacing-xl)" }}>
          <ContributionGraph logs={logs} startDate="March 8, 2026" />
        </div>
        <div style={{ marginTop: "var(--spacing-2xl)" }}>
          {logs.map((log, index) => (
            <div
              key={index}
              style={{
                paddingTop: "var(--spacing-lg)",
                paddingBottom: "var(--spacing-lg)",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <Typography as="span" size="sm" color="muted" font="ui">
                {log.date}
              </Typography>
              <div style={{ marginTop: "var(--spacing-xs)" }}>
                <Typography as="p" size="base">
                  {log.entry}
                </Typography>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </main>
  );
}
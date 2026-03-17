import Typography from "./components/Typography";
import Container from "./components/Container";
import ContributionGraph from "./components/ContributionGraph";
import { logs } from "./lib/logs";

export default function BuildLog() {
  return (
    <main style={{ paddingTop: "var(--spacing-2xl)", paddingBottom: "var(--spacing-4xl)" }}>
      <Container size="md">
        <Typography as="h1" size="4xl" weight="semibold" font="display">
          Build Log
        </Typography>
        <div style={{ marginTop: "var(--spacing-sm)" }}>
          <Typography as="p" size="lg" color="secondary">
            A public record of building this site from scratch — learning agentic development along the way.
          </Typography>
        </div>
        <div style={{ marginTop: "var(--spacing-2xl)" }}>
          <ContributionGraph logs={logs} startDate="March 8, 2026" />
        </div>
        <div style={{ marginTop: "var(--spacing-2xl)" }}>
          {[...logs].reverse().map((log, index) => (
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

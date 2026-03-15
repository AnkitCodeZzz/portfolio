import Typography from "../components/Typography";
import Container from "../components/Container";
import Button from "../components/Button";

export default function Home() {
  return (
    <main style={{ paddingTop: "var(--spacing-4xl)" }}>
      <Container size="md">
        <Typography as="h1" size="5xl" weight="medium" font="display">
          Ankit Mandal
        </Typography>
        <div style={{ marginTop: "var(--spacing-sm)" }}>
          <Typography as="p" size="lg" color="secondary">
            Designer & design engineer — portfolio coming soon.
          </Typography>
        </div>
        <div style={{ marginTop: "var(--spacing-xl)", display: "flex", gap: "var(--spacing-sm)" }}>
          <Button variant="primary" href="mailto:your@email.com">
            Get in touch
          </Button>
          <Button variant="secondary" href="https://github.com/AnkitCodeZzz">
            GitHub
          </Button>
          <Button variant="ghost" href="/log">
            Build log
          </Button>
        </div>
      </Container>
    </main>
  );
}

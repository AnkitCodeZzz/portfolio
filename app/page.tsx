import Typography from "./components/Typography";

export default function Home() {
  return (
    <main style={{ padding: "var(--spacing-2xl)" }}>
      <Typography as="h1" size="5xl" weight="bold">
        Ankit Mandal
      </Typography>
      <Typography as="p" size="lg" color="secondary">
        Designer & design engineer, portfolio coming soon.
      </Typography>
    </main>
  );
}
type DayStatus = "none" | "light" | "medium" | "heavy";

type ContributionDay = {
  date: string;
  status: DayStatus;
};

const statusColors: Record<DayStatus, string> = {
  none: "var(--color-gray-100)",
  light: "var(--color-gray-300)",
  medium: "var(--color-gray-500)",
  heavy: "var(--color-gray-800)",
};

// Each entry represents one day — add new days as you work
const contributions: ContributionDay[] = [
  { date: "Mar 8", status: "medium" },
  { date: "Mar 9", status: "heavy" },
  { date: "Mar 10", status: "medium" },
  { date: "Mar 11", status: "medium" },
  { date: "Mar 12", status: "none" },
];

export default function ContributionGraph() {
  return (
    <div>
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
        {contributions.map((day, index) => (
          <div
            key={index}
            title={`${day.date}: ${day.status}`}
            style={{
              width: "14px",
              height: "14px",
              borderRadius: "var(--radius-sm)",
              background: statusColors[day.status],
              cursor: "default",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: "var(--spacing-sm)",
          marginTop: "var(--spacing-sm)",
          alignItems: "center",
        }}
      >
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-family-ui)" }}>
          Less
        </span>
        {(["none", "light", "medium", "heavy"] as DayStatus[]).map((status) => (
          <div
            key={status}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "2px",
              background: statusColors[status],
            }}
          />
        ))}
        <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-family-ui)" }}>
          More
        </span>
      </div>
    </div>
  );
}
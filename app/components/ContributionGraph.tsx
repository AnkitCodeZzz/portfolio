"use client";

import { useState, useRef, useLayoutEffect } from "react";

type Log = {
  date: string;
  entry: string;
};

type ContributionGraphProps = {
  logs: Log[];
  startDate: string;
};

function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getWeeksGrid(start: Date, numWeeks: number): Date[][] {
  const weeks: Date[][] = [];
  const current = new Date(start);
  current.setDate(current.getDate() - current.getDay());

  for (let i = 0; i < numWeeks * 7; i++) {
    const weekIndex = Math.floor(i / 7);
    if (!weeks[weekIndex]) weeks[weekIndex] = [];
    weeks[weekIndex].push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return weeks;
}

type TooltipData = {
  text: string;
  squareTop: number;
  squareBottom: number;
  squareCenterX: number;
};

export default function ContributionGraph({ logs, startDate }: ContributionGraphProps) {
  const [tooltipData, setTooltipData] = useState<TooltipData | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; ready: boolean }>({ top: 0, left: 0, ready: false });
  const tooltipRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [containerWidth, setContainerWidth] = useState(700);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = (width: number) => setContainerWidth(width || 700);
    updateWidth(container.offsetWidth);

    const observer = new ResizeObserver((entries) => {
      updateWidth(entries[0]?.contentRect.width ?? container.offsetWidth);
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  const squareSize = 14;
  const gap = 3;
  const numWeeks = Math.max(1, Math.floor(containerWidth / (squareSize + gap)));
  const weeks = getWeeksGrid(start, numWeeks);

  const logDates = new Set(
    logs.map((log) => {
      const d = new Date(log.date + " 12:00:00");
      return toLocalDateStr(d);
    })
  );

  useLayoutEffect(() => {
    if (!tooltipData || !tooltipRef.current || !containerRef.current) return;

    const tooltipEl = tooltipRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();
    const tooltipWidth = tooltipEl.offsetWidth;
    const tooltipHeight = tooltipEl.offsetHeight;
    const gap = 8;

    // Default: above the square
    let top = tooltipData.squareTop - tooltipHeight - gap;

    // If not enough space above (near top edge), go below
    if (top < 0) {
      top = tooltipData.squareBottom + gap;
    }

    // Horizontal: center on square, clamp to container
    let left = tooltipData.squareCenterX - tooltipWidth / 2;
    left = Math.max(0, Math.min(left, containerRect.width - tooltipWidth));

    setTooltipPos({ top, left, ready: true });
  }, [tooltipData]);

  function handleMouseEnter(e: React.MouseEvent, day: Date, isActive: boolean, isFuture: boolean) {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    if (!containerRect) return;

    const dateStr = day.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
    let status = "No activity";
    if (isFuture) status = "Upcoming";
    if (isActive) status = "Active";

    setTooltipPos({ top: 0, left: 0, ready: false });
    setTooltipData({
      text: `${dateStr} · ${status}`,
      squareTop: rect.top - containerRect.top,
      squareBottom: rect.bottom - containerRect.top,
      squareCenterX: rect.left - containerRect.left + rect.width / 2,
    });
  }

  return (
    <div ref={containerRef} style={{ width: "100%", overflowX: "hidden", position: "relative" }}>
      <div style={{ display: "flex", gap: "3px" }}>
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {week.map((day, dayIndex) => {
              const dayStr = toLocalDateStr(day);
              const isBeforeStart = dayStr < toLocalDateStr(start);
              const isFuture = dayStr > toLocalDateStr(today);
              const isActive = !isBeforeStart && !isFuture && logDates.has(dayStr);

              let background = "transparent";
              let border = "1px solid var(--color-border)";
              let opacity = 1;

              if (isBeforeStart) {
                background = "transparent";
                border = "none";
                opacity = 0;
              } else if (isFuture) {
                background = "var(--color-surface)";
                border = "1px dashed var(--ink-08)";
                opacity = 0.5;
              } else if (isActive) {
                background = "var(--color-accent)";
                border = "none";
              }

              return (
                <div
                  key={dayIndex}
                  onMouseEnter={(e) => !isBeforeStart && handleMouseEnter(e, day, isActive, isFuture)}
                  onMouseLeave={() => {
                    setTooltipData(null);
                    setTooltipPos({ top: 0, left: 0, ready: false });
                  }}
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "var(--radius-sm)",
                    background,
                    border,
                    opacity,
                    cursor: isBeforeStart ? "default" : "pointer",
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Adaptive tooltip */}
      {tooltipData && (
        <div
          ref={tooltipRef}
          style={{
            position: "absolute",
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            visibility: tooltipPos.ready ? "visible" : "hidden",
            background: "var(--color-ink)",
            color: "#fff",
            fontSize: "var(--font-size-xs)",
            fontFamily: "var(--font-family-ui)",
            padding: "4px 8px",
            borderRadius: "var(--radius-sm)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {tooltipData.text}
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: "flex",
          gap: "var(--spacing-md)",
          marginTop: "var(--spacing-sm)",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--color-accent)" }} />
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-family-ui)" }}>Active</span>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "2px", border: "1px solid var(--color-border)" }} />
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-family-ui)" }}>Missed</span>
        </div>
        <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
          <div style={{ width: "10px", height: "10px", borderRadius: "2px", background: "var(--color-surface)", border: "1px dashed var(--ink-08)", opacity: 0.5 }} />
          <span style={{ fontSize: "var(--font-size-xs)", color: "var(--color-text-muted)", fontFamily: "var(--font-family-ui)" }}>Upcoming</span>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import editorial from "../styles/editorial.module.css";

type ScrollSectionNavItem = {
  anchorId: string;
  title: string;
};

type ScrollSectionNavProps = {
  items: ScrollSectionNavItem[];
};

type NavRow =
  | {
      kind: "major";
      anchorId: string;
      width: number;
      top: number;
    }
  | {
      kind: "minor";
      width: number;
      top: number;
    };

const LABEL_GAP = 12;
const LABEL_LINE_HEIGHT = 18;
const MAJOR_ROW_STEP = LABEL_LINE_HEIGHT + LABEL_GAP;
const FIELD_STEP = 6;
const BASE_STROKE_WIDTH = 8;
const MAJOR_STROKE_WIDTH = 12;
const WAVE_AMPLITUDE = 16;
const WAVE_SIGMA = 14;
function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function gaussian(distance: number, sigma: number) {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

function getWaveWidthAt(top: number, waveCenter: number) {
  return BASE_STROKE_WIDTH + gaussian(top - waveCenter, WAVE_SIGMA) * WAVE_AMPLITUDE;
}

function snapPixel(value: number) {
  return Math.round(value);
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / Math.max(1, edge1 - edge0), 0, 1);

  return t * t * (3 - 2 * t);
}

export default function ScrollSectionNav({ items }: ScrollSectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(
    items[0]?.anchorId ?? null
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [waveCenter, setWaveCenter] = useState<number>(LABEL_LINE_HEIGHT / 2);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const pendingTargetRef = useRef<string | null>(null);
  const [markerTops, setMarkerTops] = useState<number[]>(
    items.map((_, index) => index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2)
  );

  useEffect(() => {
    const measure = () => {
      const nextMarkerTops = items.map((item, index) => {
        const row = rowRefs.current.get(item.anchorId);

        if (!row) {
          return index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2;
        }

        return row.offsetTop + LABEL_LINE_HEIGHT / 2;
      });

      setMarkerTops((current) => {
        if (
          current.length === nextMarkerTops.length &&
          current.every((value, index) => Math.abs(value - nextMarkerTops[index]) < 0.5)
        ) {
          return current;
        }

        return nextMarkerTops;
      });
    };

    const frame = window.requestAnimationFrame(measure);
    const observer = new ResizeObserver(measure);

    rowRefs.current.forEach((row) => observer.observe(row));
    window.addEventListener("resize", measure);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [items]);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const anchorTops =
      markerTops.length === items.length
        ? markerTops
        : items.map((_, index) => index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2);
    const firstAnchorTop = anchorTops[0] ?? LABEL_LINE_HEIGHT / 2;

    setWaveCenter(firstAnchorTop);

    const clearPendingTarget = () => {
      pendingTargetRef.current = null;
    };

    const updateActiveSection = () => {
      const viewportAnchor = window.innerHeight * 0.28;
      const scrollBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const rectTops = items.map((item) => {
        const element = document.getElementById(item.anchorId);
        return element?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY;
      });

      const nextIndex = rectTops.findIndex((top) => top > viewportAnchor);
      let nextWaveCenter = firstAnchorTop;

      if (nextIndex === -1) {
        nextWaveCenter = anchorTops[anchorTops.length - 1] ?? firstAnchorTop;
      } else if (nextIndex === 0) {
        nextWaveCenter = firstAnchorTop;
      } else {
        const previousIndex = nextIndex - 1;
        const previousTop = rectTops[previousIndex] ?? viewportAnchor;
        const upcomingTop = rectTops[nextIndex] ?? viewportAnchor;
        const previousAnchor = anchorTops[previousIndex] ?? firstAnchorTop;
        const upcomingAnchor = anchorTops[nextIndex] ?? previousAnchor;
        const span = Math.max(1, upcomingTop - previousTop);
        const progress = clamp(
          (viewportAnchor - previousTop) / span,
          0,
          1
        );

        nextWaveCenter =
          previousAnchor + (upcomingAnchor - previousAnchor) * progress;
      }

      const bottomDistance = documentHeight - scrollBottom;
      const topDistance = Math.max(0, window.scrollY);
      const topBlend = 1 - smoothstep(48, 220, topDistance);
      const lastAnchor = anchorTops[anchorTops.length - 1] ?? firstAnchorTop;
      const bottomBlend = 1 - smoothstep(48, 220, bottomDistance);

      if (topBlend > 0) {
        nextWaveCenter =
          nextWaveCenter + (firstAnchorTop - nextWaveCenter) * topBlend;
      }

      if (bottomBlend > 0) {
        nextWaveCenter =
          nextWaveCenter + (lastAnchor - nextWaveCenter) * bottomBlend;
      }

      setWaveCenter(nextWaveCenter);

      const labelWaveCenter = nextWaveCenter + 10;

      const activeIndex = anchorTops.findIndex((anchorTop, index) => {
        const previousMidpoint =
          index === 0 ? Number.NEGATIVE_INFINITY : (anchorTops[index - 1] + anchorTop) / 2;
        const nextMidpoint =
          index === anchorTops.length - 1
            ? Number.POSITIVE_INFINITY
            : (anchorTop + anchorTops[index + 1]) / 2;

        return labelWaveCenter >= previousMidpoint && labelWaveCenter < nextMidpoint;
      });

      const pendingTarget = pendingTargetRef.current;

      if (pendingTarget) {
        const pendingElement = document.getElementById(pendingTarget);

        if (pendingElement) {
          const rect = pendingElement.getBoundingClientRect();

          if (Math.abs(rect.top - viewportAnchor) > 12) {
            setActiveId(pendingTarget);
            return;
          }
        }

        pendingTargetRef.current = null;
      }

      setActiveId(items[activeIndex === -1 ? items.length - 1 : activeIndex]?.anchorId ?? null);
    };

    const frame = window.requestAnimationFrame(updateActiveSection);
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    window.addEventListener("wheel", clearPendingTarget, { passive: true });
    window.addEventListener("touchmove", clearPendingTarget, { passive: true });
    window.addEventListener("pointerdown", clearPendingTarget, {
      passive: true,
    });
    window.addEventListener("keydown", clearPendingTarget);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
      window.removeEventListener("wheel", clearPendingTarget);
      window.removeEventListener("touchmove", clearPendingTarget);
      window.removeEventListener("pointerdown", clearPendingTarget);
      window.removeEventListener("keydown", clearPendingTarget);
    };
  }, [items, markerTops]);

  const majorWidths = useMemo(
    () =>
      items.map((_, index) => {
        const anchorTop =
          markerTops[index] ?? index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2;
        const strength = gaussian(anchorTop - waveCenter, WAVE_SIGMA);
        return snapPixel(MAJOR_STROKE_WIDTH + strength * (24 - MAJOR_STROKE_WIDTH));
      }),
    [items, markerTops, waveCenter]
  );

  const rows = useMemo<NavRow[]>(() => {
    if (items.length === 0) {
      return [];
    }

    const anchorTops =
      markerTops.length === items.length
        ? markerTops
        : items.map((_, index) => index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2);

    const majorRows = anchorTops.map((top, index) => {
      const strength = gaussian(top - waveCenter, WAVE_SIGMA);

      return {
        kind: "major" as const,
        anchorId: items[index]?.anchorId ?? `section-${index}`,
        width: snapPixel(MAJOR_STROKE_WIDTH + strength * (24 - MAJOR_STROKE_WIDTH)),
        top: snapPixel(top),
      };
    });

    const minorRows: NavRow[] = [];

    for (let index = 0; index < anchorTops.length - 1; index += 1) {
      const currentTop = anchorTops[index] ?? 0;
      const nextTop = anchorTops[index + 1] ?? currentTop;
      const gap = nextTop - currentTop;
      const strokeCount = Math.max(0, Math.floor(gap / FIELD_STEP) - 1);

      if (strokeCount === 0) {
        continue;
      }

      if (strokeCount === 1) {
        const top = Number(((currentTop + nextTop) / 2).toFixed(2));

        minorRows.push({
          kind: "minor",
          width: snapPixel(getWaveWidthAt(top, waveCenter)),
          top: snapPixel(top),
        });
        continue;
      }

      const positions: number[] = [
        currentTop + FIELD_STEP,
        nextTop - FIELD_STEP,
      ];

      if (strokeCount > 2) {
        const interiorCount = strokeCount - 2;
        const interiorStart = currentTop + FIELD_STEP;
        const interiorEnd = nextTop - FIELD_STEP;
        const interiorStep = (interiorEnd - interiorStart) / (interiorCount + 1);

        for (let interiorIndex = 1; interiorIndex <= interiorCount; interiorIndex += 1) {
          positions.splice(
            positions.length - 1,
            0,
            interiorStart + interiorStep * interiorIndex
          );
        }
      }

      positions.forEach((position) => {
        const top = Number(position.toFixed(2));

        minorRows.push({
          kind: "minor",
          width: snapPixel(getWaveWidthAt(top, waveCenter)),
          top: snapPixel(top),
        });
      });
    }

    return [...majorRows, ...minorRows].sort((a, b) => a.top - b.top);
  }, [items, markerTops, waveCenter]);

  if (items.length < 2) {
    return null;
  }

  return (
    <div className={editorial.sectionNav}>
      <nav className={editorial.sectionNavInner} aria-label="Section navigation">
        <div className={editorial.sectionNavField} aria-hidden="true">
          {rows.map((row, index) => (
            <span
              key={`field-${index}`}
              className={`${editorial.sectionNavFieldStroke} ${
                row.kind === "major"
                  ? editorial.sectionNavFieldStrokeMajor
                  : editorial.sectionNavFieldStrokeMinor
              } ${
                row.kind === "major" && row.anchorId === hoveredId
                  ? editorial.sectionNavFieldStrokeHovered
                  : ""
              }`}
              style={
                {
                  "--section-nav-stroke-width": `${row.width}px`,
                  "--section-nav-stroke-top": `${row.top}px`,
                  "--section-nav-wave-strength": `${gaussian(
                    row.top - waveCenter,
                    WAVE_SIGMA
                  ).toFixed(3)}`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <ol className={editorial.sectionNavList}>
          {items.map((item, index) => {
            const isActive = item.anchorId === activeId;
            const markerTop =
              markerTops[index] ?? index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2;
            const markerStrength = gaussian(markerTop - waveCenter, WAVE_SIGMA);
            return (
              <li
                key={item.anchorId}
                className={`${editorial.sectionNavRow} ${editorial.sectionNavRowMajor}`}
                ref={(node) => {
                  if (node) {
                    rowRefs.current.set(item.anchorId, node);
                    return;
                  }

                  rowRefs.current.delete(item.anchorId);
                }}
              >
                <a
                  ref={(node) => {
                    if (node) {
                      linkRefs.current.set(item.anchorId, node);
                      return;
                    }

                    linkRefs.current.delete(item.anchorId);
                  }}
                  href={`#${item.anchorId}`}
                  className={`${editorial.sectionNavLink} ${
                    isActive ? editorial.sectionNavLinkActive : ""
                  }`.trim()}
                  aria-current={isActive ? "location" : undefined}
                  style={
                    {
                      "--section-nav-wave-strength": `${markerStrength.toFixed(3)}`,
                      "--section-nav-marker-width": `${majorWidths[index] ?? MAJOR_STROKE_WIDTH}px`,
                    } as CSSProperties
                  }
                  onMouseEnter={() => setHoveredId(item.anchorId)}
                  onMouseLeave={() =>
                    setHoveredId((current) =>
                      current === item.anchorId ? null : current
                    )
                  }
                  onFocus={() => setHoveredId(item.anchorId)}
                  onBlur={() =>
                    setHoveredId((current) =>
                      current === item.anchorId ? null : current
                    )
                  }
                  onClick={(event) => {
                    event.preventDefault();

                    const section = document.getElementById(item.anchorId);

                    if (!section) {
                      return;
                    }

                    pendingTargetRef.current = item.anchorId;
                    section.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                    window.history.replaceState(
                      null,
                      "",
                      `#${item.anchorId}`
                    );
                    setActiveId(item.anchorId);
                  }}
                >
                  <span>{item.title}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}

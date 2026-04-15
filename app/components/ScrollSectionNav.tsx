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
const MAJOR_ROW_EXCLUSION = 2;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function gaussian(distance: number, sigma: number) {
  return Math.exp(-(distance * distance) / (2 * sigma * sigma));
}

function getWaveWidthAt(top: number, waveCenter: number) {
  return BASE_STROKE_WIDTH + gaussian(top - waveCenter, WAVE_SIGMA) * WAVE_AMPLITUDE;
}

function smoothstep(edge0: number, edge1: number, value: number) {
  const t = clamp((value - edge0) / Math.max(1, edge1 - edge0), 0, 1);

  return t * t * (3 - 2 * t);
}

export default function ScrollSectionNav({ items }: ScrollSectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(
    items[0]?.anchorId ?? null
  );
  const [waveCenter, setWaveCenter] = useState<number>(LABEL_LINE_HEIGHT / 2);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const pendingTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const anchorTops = items.map(
      (_, index) => index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2
    );
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

      const activeIndex = anchorTops.findIndex((anchorTop, index) => {
        const previousMidpoint =
          index === 0 ? Number.NEGATIVE_INFINITY : (anchorTops[index - 1] + anchorTop) / 2;
        const nextMidpoint =
          index === anchorTops.length - 1
            ? Number.POSITIVE_INFINITY
            : (anchorTop + anchorTops[index + 1]) / 2;

        return nextWaveCenter >= previousMidpoint && nextWaveCenter < nextMidpoint;
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
  }, [items]);

  const majorWidths = useMemo(
    () =>
      items.map((_, index) => {
        const anchorTop = index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2;
        const strength = gaussian(anchorTop - waveCenter, WAVE_SIGMA);
        return Number(
          (MAJOR_STROKE_WIDTH + strength * (24 - MAJOR_STROKE_WIDTH)).toFixed(2)
        );
      }),
    [items, waveCenter]
  );

  const rows = useMemo<NavRow[]>(() => {
    if (items.length === 0) {
      return [];
    }

    const anchorTops = items.map(
      (_, index) => index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2
    );
    const firstTop = anchorTops[0] ?? 0;
    const lastTop = anchorTops[anchorTops.length - 1] ?? 0;
    const startTop = firstTop;
    const endTop = lastTop;
    const sampledTops: number[] = [];

    for (let top = startTop; top <= endTop + 0.01; top += FIELD_STEP) {
      sampledTops.push(Number(top.toFixed(2)));
    }

    const filteredTops = sampledTops.filter((top) =>
      anchorTops.every((anchorTop) => Math.abs(top - anchorTop) > MAJOR_ROW_EXCLUSION)
    );

    return filteredTops.map((top) => {
      const width = getWaveWidthAt(top, waveCenter);

      return {
        kind: "minor",
        width: Number(width.toFixed(2)),
        top,
      };
    });
  }, [items, waveCenter]);

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
            const markerTop = index * MAJOR_ROW_STEP + LABEL_LINE_HEIGHT / 2;
            const markerStrength = gaussian(markerTop - waveCenter, WAVE_SIGMA);
            return (
              <li
                key={item.anchorId}
                className={`${editorial.sectionNavRow} ${editorial.sectionNavRowMajor}`}
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
                  <span
                    className={editorial.sectionNavMarker}
                    aria-hidden="true"
                    style={
                      {
                        "--section-nav-stroke-width": `${majorWidths[index] ?? MAJOR_STROKE_WIDTH}px`,
                        "--section-nav-wave-strength": `${markerStrength.toFixed(3)}`,
                      } as CSSProperties
                    }
                  />
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

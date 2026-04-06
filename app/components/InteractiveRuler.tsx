"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import styles from "../page.module.css";

type HighlightState = {
  visible: boolean;
  top: number;
  height: number;
};

type InteractiveRulerProps = {
  labels: string[];
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function unionClientRects(rects: DOMRectList | DOMRect[]) {
  const items = Array.from(rects).filter((rect) => rect.width > 0 || rect.height > 0);

  if (items.length === 0) {
    return null;
  }

  const first = items[0];
  let top = first.top;
  let bottom = first.bottom;

  for (const rect of items.slice(1)) {
    top = Math.min(top, rect.top);
    bottom = Math.max(bottom, rect.bottom);
  }

  return { top, bottom };
}

export default function InteractiveRuler({ labels }: InteractiveRulerProps) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const activeSectionIndexRef = useRef<number | null>(null);
  const [highlight, setHighlight] = useState<HighlightState>({
    visible: false,
    top: 0,
    height: 0,
  });

  useEffect(() => {
    const sidebar = sidebarRef.current;

    if (!sidebar) {
      return undefined;
    }

    let frame = 0;

    const updateHighlight = () => {
      frame = 0;

      const root = sidebar.parentElement;

      if (!root) {
        setHighlight((current) => (current.visible ? { visible: false, top: 0, height: 0 } : current));
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const rootHeight = rootRect.height;

      if (rootHeight <= 0) {
        setHighlight((current) => (current.visible ? { visible: false, top: 0, height: 0 } : current));
        return;
      }

      const selection = window.getSelection();
      const isMobile = window.matchMedia("(max-width: 899px)").matches;

      if (selection && !selection.isCollapsed && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container =
          range.commonAncestorContainer.nodeType === Node.TEXT_NODE
            ? range.commonAncestorContainer.parentElement
            : (range.commonAncestorContainer as Element | null);

        if (container && root.contains(container)) {
          const unionRect = unionClientRects(range.getClientRects()) ?? unionClientRects([range.getBoundingClientRect()]);

          if (unionRect) {
            const top = clamp(unionRect.top - rootRect.top, 0, rootHeight);
            const bottom = clamp(unionRect.bottom - rootRect.top, 0, rootHeight);
            const height = Math.max(0, bottom - top);

            if (height > 0) {
              setHighlight({
                visible: true,
                top,
                height,
              });
              return;
            }
          }
        }
      }

      if (!isMobile) {
        setHighlight((current) => (current.visible ? { visible: false, top: 0, height: 0 } : current));
        return;
      }

      const trackedSections = Array.from(root.querySelectorAll<HTMLElement>("[data-ruler-track]"));
      const viewportTop = Math.max(rootRect.top, 0);
      const viewportBottom = Math.min(rootRect.bottom, window.innerHeight);
      const viewportHeight = viewportBottom - viewportTop;

      if (viewportHeight <= 0) {
        setHighlight((current) => (current.visible ? { visible: false, top: 0, height: 0 } : current));
        return;
      }

      const viewportCenter = viewportTop + viewportHeight * 0.5;
      const visibleSections = trackedSections
        .map((section, index) => {
          const rect = section.getBoundingClientRect();
          const visibleTop = Math.max(rect.top, viewportTop);
          const visibleBottom = Math.min(rect.bottom, viewportBottom);
          const visibleHeight = visibleBottom - visibleTop;

          if (visibleHeight <= 0) {
            return null;
          }

          const center = rect.top + rect.height / 2;

          return {
            index,
            rect,
            distance: Math.abs(center - viewportCenter),
          };
        })
        .filter((section): section is { index: number; rect: DOMRect; distance: number } => section !== null);

      if (visibleSections.length === 0) {
        setHighlight((current) => (current.visible ? { visible: false, top: 0, height: 0 } : current));
        return;
      }

      let nextSection = visibleSections.reduce((best, section) =>
        section.distance < best.distance ? section : best
      );

      const currentIndex = activeSectionIndexRef.current;
      const currentSection = currentIndex === null
        ? null
        : visibleSections.find((section) => section.index === currentIndex) ?? null;

      if (
        currentSection &&
        nextSection.index !== currentSection.index &&
        nextSection.distance > currentSection.distance - 48
      ) {
        nextSection = currentSection;
      }

      activeSectionIndexRef.current = nextSection.index;

      const activeRect = nextSection.rect;
      const bestTop = activeRect.top;
      const bestBottom = activeRect.bottom;

      const top = clamp(bestTop - rootRect.top, 0, rootHeight);
      const bottom = clamp(bestBottom - rootRect.top, 0, rootHeight);
      const height = Math.max(32, bottom - top);

      setHighlight({
        visible: true,
        top,
        height: clamp(height, 32, rootHeight - top),
      });
    };

    const scheduleUpdate = () => {
      if (frame !== 0) {
        return;
      }

      frame = window.requestAnimationFrame(updateHighlight);
    };

    scheduleUpdate();

    document.addEventListener("selectionchange", scheduleUpdate);
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });

    return () => {
      if (frame !== 0) {
        window.cancelAnimationFrame(frame);
      }

      document.removeEventListener("selectionchange", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
    };
  }, []);

  return (
    <aside
      ref={sidebarRef}
      className={styles.sidebar}
      data-highlight-visible={highlight.visible ? "true" : "false"}
      aria-hidden="true"
      style={
        {
          "--ruler-highlight-top": `${highlight.top}px`,
          "--ruler-highlight-height": `${highlight.height}px`,
        } as CSSProperties
      }
    >
      <div
        className={styles.sidebarHighlight}
        data-visible={highlight.visible ? "true" : "false"}
      />
      {labels.map((label) => (
        <div key={label} className={styles.sidebarTick}>
          <div className={styles.sidebarLabelWrap}>
            <span className={styles.sidebarLabel}>{label}</span>
          </div>
          <span className={styles.sidebarDash} />
        </div>
      ))}
    </aside>
  );
}

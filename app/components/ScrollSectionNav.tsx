"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import editorial from "../styles/editorial.module.css";

type ScrollSectionNavItem = {
  anchorId: string;
  title: string;
};

type ScrollSectionNavProps = {
  items: ScrollSectionNavItem[];
};

function getActiveSectionId(items: ScrollSectionNavItem[]) {
  if (typeof window === "undefined") {
    return items[0]?.anchorId ?? null;
  }

  const scrollBottom = window.scrollY + window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;

  if (documentHeight - scrollBottom <= 48) {
    return items[items.length - 1]?.anchorId ?? null;
  }

  const viewportAnchor = window.innerHeight * 0.28;
  let nextActiveId = items[0]?.anchorId ?? null;

  for (const item of items) {
    const element = document.getElementById(item.anchorId);

    if (!element) {
      continue;
    }

    const rect = element.getBoundingClientRect();

    if (rect.top <= viewportAnchor) {
      nextActiveId = item.anchorId;
      continue;
    }

    if (rect.top < window.innerHeight * 0.6) {
      nextActiveId = item.anchorId;
    }

    break;
  }

  return nextActiveId;
}

export default function ScrollSectionNav({ items }: ScrollSectionNavProps) {
  const [activeId, setActiveId] = useState<string | null>(
    items[0]?.anchorId ?? null
  );
  const listRef = useRef<HTMLOListElement | null>(null);
  const highlightRef = useRef<HTMLSpanElement | null>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());
  const pendingTargetRef = useRef<string | null>(null);

  useEffect(() => {
    if (items.length === 0) {
      return;
    }

    const clearPendingTarget = () => {
      pendingTargetRef.current = null;
    };

    const updateActiveSection = () => {
      const pendingTarget = pendingTargetRef.current;

      if (pendingTarget) {
        const pendingElement = document.getElementById(pendingTarget);

        if (pendingElement) {
          const rect = pendingElement.getBoundingClientRect();
          const viewportAnchor = window.innerHeight * 0.28;

          if (Math.abs(rect.top - viewportAnchor) > 12) {
            setActiveId(pendingTarget);
            return;
          }
        }

        pendingTargetRef.current = null;
      }

      setActiveId(getActiveSectionId(items));
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

  useLayoutEffect(() => {
    const highlight = highlightRef.current;

    if (!highlight) {
      return;
    }

    if (!activeId) {
      highlight.style.opacity = "0";
      return;
    }

    const updateHighlight = () => {
      const list = listRef.current;
      const activeLink = linkRefs.current.get(activeId);

      if (!list || !activeLink || !highlightRef.current) {
        highlight.style.opacity = "0";
        return;
      }

      const listRect = list.getBoundingClientRect();
      const linkRect = activeLink.getBoundingClientRect();
      const nextHighlight = highlightRef.current;

      nextHighlight.style.top = `${linkRect.top - listRect.top}px`;
      nextHighlight.style.height = `${linkRect.height}px`;
      nextHighlight.style.opacity = "1";
    };

    const frame = window.requestAnimationFrame(updateHighlight);
    window.addEventListener("resize", updateHighlight);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", updateHighlight);
    };
  }, [activeId, items]);

  if (items.length < 2) {
    return null;
  }

  return (
    <div className={editorial.sectionNav}>
      <nav className={editorial.sectionNavInner} aria-label="Section navigation">
        <ol ref={listRef} className={editorial.sectionNavList}>
          <span
            ref={highlightRef}
            className={editorial.sectionNavHighlight}
            aria-hidden="true"
          />
          {items.map((item) => {
            const isActive = item.anchorId === activeId;

            return (
              <li key={item.anchorId} className={editorial.sectionNavItem}>
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

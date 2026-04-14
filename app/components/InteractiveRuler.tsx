"use client";

import type { CSSProperties } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import styles from "../page.module.css";

type HighlightState = {
  visible: boolean;
  top: number;
  height: number;
};

type RulerMetrics = {
  height: number;
  majorStep: number;
  majorLabelStep: number;
  paddingY: number;
  labelHeight: number;
};

type TagScrambleState = {
  delayTimeout: number | null;
  scrambleInterval: number | null;
  progressState: { value: number } | null;
  original: string;
};

type TagLayers = {
  ghost: HTMLSpanElement;
  stable: HTMLSpanElement;
  scramble: HTMLSpanElement;
  original: string;
};

const MOBILE_SECTION_ANCHOR_RATIO = 0.56;
const TAG_SCRAMBLE_CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

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

function getNumericAttribute(element: HTMLElement, name: string) {
  const rawValue = element.dataset[name];

  if (!rawValue) {
    return 0;
  }

  const parsedValue = Number.parseFloat(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function getNumericCustomProperty(source: CSSStyleDeclaration, name: string, fallback: number) {
  const rawValue = source.getPropertyValue(name).trim();

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseFloat(rawValue);
  return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

function scrambleCharacter(character: string) {
  if (character === " " || character === "\u00a0") {
    return character;
  }

  if (!/[A-Za-z]/.test(character)) {
    return character;
  }

  return TAG_SCRAMBLE_CHARSET[Math.floor(Math.random() * TAG_SCRAMBLE_CHARSET.length)] ?? character;
}

function buildScrambledLabel(text: string, progress: number) {
  const characters = Array.from(text);
  const settledCount = clamp(Math.floor(progress * characters.length), 0, characters.length);

  return characters
    .map((character, index) => (index < settledCount ? character : scrambleCharacter(character)))
    .join("");
}

function highlightStatesEqual(a: HighlightState, b: HighlightState) {
  return a.visible === b.visible && a.top === b.top && a.height === b.height;
}

function syncActiveTrackedSections(sections: HTMLElement[], activeIndex: number | null) {
  sections.forEach((section, index) => {
    const nextValue = activeIndex === index ? "true" : "false";

    if (section.dataset.rulerActive !== nextValue) {
      section.dataset.rulerActive = nextValue;
    }
  });
}

function ensureTagLayers(element: HTMLElement) {
  const original = element.dataset.rulerTagOriginal ?? element.textContent ?? "";

  if (!original) {
    return null;
  }

  element.dataset.rulerTagOriginal = original;
  element.setAttribute("aria-label", original);
  element.classList.add(styles.rulerTagHost);

  const existingGhost = element.querySelector<HTMLElement>("[data-ruler-layer='ghost']");
  const existingStable = element.querySelector<HTMLElement>("[data-ruler-layer='stable']");
  const existingScramble = element.querySelector<HTMLElement>("[data-ruler-layer='scramble']");

  if (existingGhost instanceof HTMLSpanElement && existingStable instanceof HTMLSpanElement && existingScramble instanceof HTMLSpanElement) {
    existingGhost.textContent = original;
    existingStable.textContent = original;
    existingScramble.textContent = original;
    element.style.setProperty("--ruler-tag-progress", "1");

    return {
      ghost: existingGhost,
      stable: existingStable,
      scramble: existingScramble,
      original,
    } satisfies TagLayers;
  }

  const ghost = document.createElement("span");
  ghost.className = styles.rulerTagGhost;
  ghost.dataset.rulerLayer = "ghost";
  ghost.setAttribute("aria-hidden", "true");
  ghost.textContent = original;

  const stable = document.createElement("span");
  stable.className = styles.rulerTagStable;
  stable.dataset.rulerLayer = "stable";
  stable.setAttribute("aria-hidden", "true");
  stable.textContent = original;

  const scramble = document.createElement("span");
  scramble.className = styles.rulerTagScramble;
  scramble.dataset.rulerLayer = "scramble";
  scramble.setAttribute("aria-hidden", "true");
  scramble.textContent = original;

  element.textContent = "";
  element.append(ghost, stable, scramble);
  element.style.setProperty("--ruler-tag-progress", "1");

  return {
    ghost,
    stable,
    scramble,
    original,
  } satisfies TagLayers;
}


export default function InteractiveRuler() {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const activeSectionIndexRef = useRef<number | null>(null);
  const hasPrimedActiveSectionRef = useRef(false);
  const tagScramblesRef = useRef<Map<HTMLElement, TagScrambleState>>(new Map());
  const [highlight, setHighlight] = useState<HighlightState>({
    visible: false,
    top: 0,
    height: 0,
  });
  const [metrics, setMetrics] = useState<RulerMetrics>({
    height: 0,
    majorStep: 100,
    majorLabelStep: 100,
    paddingY: 8,
    labelHeight: 14,
  });

  const commitHighlight = useCallback((nextHighlight: HighlightState) => {
    setHighlight((current) => (highlightStatesEqual(current, nextHighlight) ? current : nextHighlight));
  }, []);

  const hideHighlight = useCallback(() => {
    setHighlight((current) => {
      const hiddenState: HighlightState = {
        visible: false,
        top: 0,
        height: 0,
      };

      return highlightStatesEqual(current, hiddenState) ? current : hiddenState;
    });
  }, []);

  const stopTagScramble = useCallback((element: HTMLElement, restoreText = true) => {
    const activeScramble = tagScramblesRef.current.get(element);

    if (!activeScramble) {
      return;
    }

    if (activeScramble.delayTimeout !== null) {
      window.clearTimeout(activeScramble.delayTimeout);
    }

    if (activeScramble.scrambleInterval !== null) {
      window.clearInterval(activeScramble.scrambleInterval);
    }

    const layers = ensureTagLayers(element);

    if (activeScramble.progressState) {
      gsap.killTweensOf(activeScramble.progressState);
    }

    if (restoreText) {
      if (layers) {
        layers.ghost.textContent = activeScramble.original;
        layers.stable.textContent = activeScramble.original;
        layers.scramble.textContent = activeScramble.original;
        element.style.setProperty("--ruler-tag-progress", "1");
      } else {
        element.textContent = activeScramble.original;
      }
    }

    element.dataset.rulerGlitching = "false";
    tagScramblesRef.current.delete(element);
  }, []);

  const playTagScramble = useCallback((
    element: HTMLElement,
    delay: number,
    durationMs: number,
    revealDelayMs: number,
    scrambleSpeed: number
  ) => {
    stopTagScramble(element);

    const layers = ensureTagLayers(element);

    if (!layers) {
      return;
    }

    const { original, stable, scramble } = layers;

    const nextScramble: TagScrambleState = {
      delayTimeout: null,
      scrambleInterval: null,
      progressState: { value: 0 },
      original,
    };

    tagScramblesRef.current.set(element, nextScramble);

    const startScramble = () => {
      element.dataset.rulerGlitching = "true";
      const durationSeconds = durationMs / 1000;
      const revealDelaySeconds = Math.max(0, revealDelayMs / 1000);
      const revealDurationSeconds = Math.max(0.3, durationSeconds - revealDelaySeconds);
      const scrambleStepMs = Math.max(60, scrambleSpeed);

      stable.textContent = original;
      scramble.textContent = buildScrambledLabel(original, 0);
      nextScramble.progressState!.value = 0;
      element.style.setProperty("--ruler-tag-progress", "0");

      const refreshScramble = () => {
        const progress = nextScramble.progressState?.value ?? 0;
        scramble.textContent = buildScrambledLabel(original, progress);
      };

      refreshScramble();
      nextScramble.scrambleInterval = window.setInterval(refreshScramble, scrambleStepMs);

      gsap.to(nextScramble.progressState, {
        value: 1,
        duration: revealDurationSeconds,
        delay: revealDelaySeconds,
        ease: "none",
        overwrite: "auto",
        onUpdate: () => {
          element.style.setProperty("--ruler-tag-progress", `${nextScramble.progressState?.value ?? 0}`);
        },
        onComplete: () => {
          stable.textContent = original;
          scramble.textContent = original;
          element.style.setProperty("--ruler-tag-progress", "1");
          stopTagScramble(element);
        },
      });
    };

    if (delay > 0) {
      nextScramble.delayTimeout = window.setTimeout(() => {
        nextScramble.delayTimeout = null;
        startScramble();
      }, delay);

      return;
    }

    startScramble();
  }, [stopTagScramble]);

  const playSectionTagScramble = useCallback((section: HTMLElement, styleSource: CSSStyleDeclaration) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    for (const element of tagScramblesRef.current.keys()) {
      stopTagScramble(element);
    }

    const tags = Array.from(section.querySelectorAll<HTMLElement>("[data-ruler-tag]"));

    if (tags.length === 0) {
      return;
    }

    const stagger = getNumericCustomProperty(styleSource, "--site-motion-tag-stagger", 48);
    const durationMs = getNumericCustomProperty(styleSource, "--site-motion-tag-duration", 2400);
    const revealDelayMs = getNumericCustomProperty(styleSource, "--site-motion-tag-reveal-delay", 800);
    const scrambleStepMs = getNumericCustomProperty(styleSource, "--site-motion-tag-scramble-step", 90);

    tags.forEach((tag, index) => {
      playTagScramble(tag, index * stagger, durationMs, revealDelayMs, scrambleStepMs);
    });
  }, [playTagScramble, stopTagScramble]);

  useEffect(() => {
    const sidebar = sidebarRef.current;

    if (!sidebar) {
      return undefined;
    }

    const root = sidebar.parentElement;

    if (!root) {
      return undefined;
    }

    const updateMetrics = () => {
      const sidebarStyles = window.getComputedStyle(sidebar);

      setMetrics({
        height: root.getBoundingClientRect().height,
        majorStep: getNumericCustomProperty(sidebarStyles, "--site-ruler-major-step", 100),
        majorLabelStep: getNumericCustomProperty(sidebarStyles, "--site-ruler-major-label-step", 100),
        paddingY: getNumericCustomProperty(sidebarStyles, "--site-ruler-padding-y", 8),
        labelHeight: getNumericCustomProperty(sidebarStyles, "--site-sidebar-label-height", 14),
      });
    };

    updateMetrics();

    const resizeObserver = new ResizeObserver(updateMetrics);
    resizeObserver.observe(root);
    window.addEventListener("resize", updateMetrics);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateMetrics);
    };
  }, []);

  const ticks = useMemo(() => {
    if (metrics.height <= 0 || metrics.majorStep <= 0 || metrics.labelHeight <= 0) {
      return [];
    }

    const usableHeight = Math.max(0, metrics.height - metrics.paddingY * 2 - metrics.labelHeight);
    const tickCount = Math.max(1, Math.floor(usableHeight / metrics.majorStep) + 1);
    const startOffset = metrics.paddingY + metrics.labelHeight / 2;

    return Array.from({ length: tickCount }, (_, index) => ({
      key: `${index * metrics.majorLabelStep}`,
      label: `${index * metrics.majorLabelStep}`,
      top: startOffset + index * metrics.majorStep,
    }));
  }, [metrics]);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    const tagScrambles = tagScramblesRef.current;

    if (!sidebar) {
      return undefined;
    }

    let frame = 0;

    const updateHighlight = () => {
      frame = 0;

      const root = sidebar.parentElement;

      if (!root) {
        hideHighlight();
        return;
      }

      const rootRect = root.getBoundingClientRect();
      const rootHeight = rootRect.height;
      const trackedSections = Array.from(root.querySelectorAll<HTMLElement>("[data-ruler-track]"));

      if (rootHeight <= 0) {
        syncActiveTrackedSections(trackedSections, null);
        activeSectionIndexRef.current = null;
        hideHighlight();
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
              syncActiveTrackedSections(trackedSections, null);
              activeSectionIndexRef.current = null;
              commitHighlight({
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
        syncActiveTrackedSections(trackedSections, null);
        activeSectionIndexRef.current = null;
        hideHighlight();
        return;
      }
      const viewportTop = Math.max(rootRect.top, 0);
      const viewportBottom = Math.min(rootRect.bottom, window.innerHeight);
      const viewportHeight = viewportBottom - viewportTop;

      if (viewportHeight <= 0) {
        syncActiveTrackedSections(trackedSections, null);
        activeSectionIndexRef.current = null;
        hideHighlight();
        return;
      }

      const sectionBounds = trackedSections.map((section, index) => {
        const rect = section.getBoundingClientRect();
        const padTop = getNumericAttribute(section, "rulerPadTop");
        const padBottom = getNumericAttribute(section, "rulerPadBottom");

        return {
          index,
          rect,
          activationTop: rect.top - padTop,
          activationBottom: rect.bottom + padBottom,
        };
      });

      if (sectionBounds.length === 0) {
        syncActiveTrackedSections(trackedSections, null);
        activeSectionIndexRef.current = null;
        hideHighlight();
        return;
      }

      const scrollRoot = document.scrollingElement ?? document.documentElement;
      const remainingScroll = scrollRoot.scrollHeight - (scrollRoot.scrollTop + window.innerHeight);
      const isAtSectionEnd = remainingScroll <= 1;
      const anchorY = viewportTop + viewportHeight * MOBILE_SECTION_ANCHOR_RATIO;
      let nextSection = isAtSectionEnd
        ? sectionBounds[sectionBounds.length - 1]
        : sectionBounds[0];

      if (!isAtSectionEnd) {
        const containingSection = sectionBounds.find(
          (section) =>
            section.activationTop <= anchorY && section.activationBottom >= anchorY
        );

        if (containingSection) {
          nextSection = containingSection;
        } else {
          for (const section of sectionBounds) {
            if (section.activationTop <= anchorY) {
              nextSection = section;
              continue;
            }

            break;
          }
        }
      }

      const activeRect = nextSection.rect;
      const bestTop = activeRect.top;
      const bestBottom = activeRect.bottom;
      syncActiveTrackedSections(trackedSections, nextSection.index);

      if (activeSectionIndexRef.current !== nextSection.index) {
        const nextActiveSection = trackedSections[nextSection.index];

        if (nextActiveSection) {
          if (hasPrimedActiveSectionRef.current) {
            playSectionTagScramble(nextActiveSection, window.getComputedStyle(sidebar));
          } else {
            hasPrimedActiveSectionRef.current = true;
          }
        }

        activeSectionIndexRef.current = nextSection.index;
      }

      const top = clamp(bestTop - rootRect.top, 0, rootHeight);
      const bottom = clamp(bestBottom - rootRect.top, 0, rootHeight);
      const height = Math.max(32, bottom - top);

      commitHighlight({
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

      for (const element of tagScrambles.keys()) {
        stopTagScramble(element);
      }

      document.removeEventListener("selectionchange", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
    };
  }, [commitHighlight, hideHighlight, playSectionTagScramble, stopTagScramble]);

  useEffect(() => {
    const sidebar = sidebarRef.current;

    if (!sidebar) {
      return undefined;
    }

    const root = sidebar.parentElement;

    if (!root) {
      return undefined;
    }

    const tagElements = Array.from(root.querySelectorAll<HTMLElement>("[data-ruler-tag]"));

    if (tagElements.length === 0) {
      return undefined;
    }

    tagElements.forEach((tag) => {
      ensureTagLayers(tag);
    });

    const triggerTagScramble = (tag: HTMLElement) => {
      const styleSource = window.getComputedStyle(sidebar);
      const durationMs = getNumericCustomProperty(styleSource, "--site-motion-tag-duration", 2400);
      const revealDelayMs = getNumericCustomProperty(styleSource, "--site-motion-tag-reveal-delay", 120);
      const scrambleStepMs = getNumericCustomProperty(styleSource, "--site-motion-tag-scramble-step", 90);

      playTagScramble(tag, 0, durationMs, revealDelayMs, scrambleStepMs);
    };

    const handleMouseEnter = (event: Event) => {
      const tag = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;

      if (!tag) {
        return;
      }

      triggerTagScramble(tag);
    };

    const handleFocusIn = (event: FocusEvent) => {
      const tag = event.currentTarget instanceof HTMLElement ? event.currentTarget : null;

      if (!tag) {
        return;
      }

      triggerTagScramble(tag);
    };

    tagElements.forEach((tag) => {
      tag.addEventListener("mouseenter", handleMouseEnter);
      tag.addEventListener("focus", handleFocusIn);
    });

    return () => {
      tagElements.forEach((tag) => {
        tag.removeEventListener("mouseenter", handleMouseEnter);
        tag.removeEventListener("focus", handleFocusIn);
      });
    };
  }, [playTagScramble]);

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
      {ticks.map((tick) => (
        <div
          key={tick.key}
          className={styles.sidebarTick}
          style={{ "--ruler-tick-top": `${tick.top}px` } as CSSProperties}
        >
          <div className={styles.sidebarLabelWrap}>
            <span className={styles.sidebarLabel}>{tick.label}</span>
          </div>
          <span className={styles.sidebarDash} />
        </div>
      ))}
    </aside>
  );
}

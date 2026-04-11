"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import DeleteProjectButton from "./DeleteProjectButton";
import editorial from "../styles/editorial.module.css";
import homeStyles from "../page.module.css";

export type CraftShowcaseItem = {
  alt: string;
  imageSrc: string;
  slug: string;
};

type CraftShowcaseProps = {
  editingEnabled?: boolean;
  items: CraftShowcaseItem[];
};

type CraftShowcaseThumbnailProps = {
  item: CraftShowcaseItem;
  index: number;
  onOpen: (index: number) => void;
};

function CraftShowcaseThumbnail({
  item,
  index,
  onOpen,
}: CraftShowcaseThumbnailProps) {
  const [inlineScale, setInlineScale] = useState(1.08);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const currentScaleRef = useRef(1.08);
  const targetScaleRef = useRef(1.08);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) {
      return;
    }

    const startScale = 1.08;
    const endScale = 1;
    let frameId = 0;

    function updateTargetScale() {
      const currentElement = buttonRef.current;
      if (!currentElement) {
        return;
      }

      const rect = currentElement.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const shrinkStart = viewportHeight * 0.92;
      const shrinkEnd = viewportHeight * 0.2;
      const progress = (shrinkStart - rect.top) / (shrinkStart - shrinkEnd);
      const clamped = Math.min(Math.max(progress, 0), 1);
      targetScaleRef.current = startScale - clamped * (startScale - endScale);
    }

    function animateScale() {
      const current = currentScaleRef.current;
      const target = targetScaleRef.current;
      const next = current + (target - current) * 0.16;

      if (Math.abs(next - target) < 0.0005) {
        currentScaleRef.current = target;
        setInlineScale(target);
        frameId = 0;
        return;
      }

      currentScaleRef.current = next;
      setInlineScale(Number(next.toFixed(4)));
      frameId = window.requestAnimationFrame(animateScale);
    }

    function queueUpdate() {
      updateTargetScale();

      if (!frameId) {
        frameId = window.requestAnimationFrame(animateScale);
      }
    }

    queueUpdate();
    window.addEventListener("scroll", queueUpdate, { passive: true });
    window.addEventListener("resize", queueUpdate);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", queueUpdate);
      window.removeEventListener("resize", queueUpdate);
    };
  }, []);

  const inlineStyle = {
    "--media-inline-scale": inlineScale,
  } as CSSProperties;

  return (
    <button
      ref={buttonRef}
      type="button"
      className={`${editorial.utilityMediaButton} ${homeStyles.showcaseCard}`}
      style={inlineStyle}
      onClick={() => {
        onOpen(index);
      }}
      aria-label="Open craft showcase image"
    >
      <span className={`${editorial.utilityMediaFrame} ${homeStyles.showcaseFrame}`}>
        <span
          className={`${editorial.utilityMediaInlineStage} ${homeStyles.showcaseStage}`}
        >
          <Image
            src={item.imageSrc}
            alt={item.alt}
            fill
            sizes="(min-width: 1280px) 520px, (min-width: 900px) 45vw, 100vw"
            className={homeStyles.showcaseImage}
          />
        </span>
      </span>
    </button>
  );
}

export default function CraftShowcase({
  items,
  editingEnabled = false,
}: CraftShowcaseProps) {
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const activeItem = activeItemIndex === null ? null : items[activeItemIndex] ?? null;
  const hasMultipleImages = items.length > 1;

  useEffect(() => {
    if (!activeItem) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActiveItemIndex(null);
        return;
      }

      if (!hasMultipleImages) {
        return;
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveItemIndex((current) =>
          current === null || current + 1 >= items.length ? 0 : current + 1
        );
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveItemIndex((current) =>
          current === null || current - 1 < 0 ? items.length - 1 : current - 1
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeItem, hasMultipleImages, items.length]);

  function openItem(index: number) {
    setActiveItemIndex(index);
  }

  function closeItem() {
    setActiveItemIndex(null);
  }

  function showPreviousImage() {
    setActiveItemIndex((current) =>
      current === null || current - 1 < 0 ? items.length - 1 : current - 1
    );
  }

  function showNextImage() {
    setActiveItemIndex((current) =>
      current === null || current + 1 >= items.length ? 0 : current + 1
    );
  }

  return (
    <>
      <div className={homeStyles.showcaseGrid}>
        {items.map((item, index) => (
          <CraftShowcaseThumbnail
            key={`${item.slug}-${index}`}
            item={item}
            index={index}
            onOpen={openItem}
          />
        ))}
      </div>

      {activeItem ? (
        <div className={homeStyles.showcaseLightbox} onClick={closeItem}>
          <div
            className={homeStyles.showcaseLightboxFrame}
            role="dialog"
            aria-modal="true"
            aria-label="Craft showcase image"
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={homeStyles.showcaseLightboxTopBar}>
              {editingEnabled ? (
                <div className={editorial.utilityRow}>
                  <DeleteProjectButton
                    slug={activeItem.slug}
                    className={`${editorial.utilityLink} ${editorial.utilityButton} ${editorial.utilityLinkDanger}`}
                  />
                </div>
              ) : (
                <span />
              )}

              <button
                type="button"
                className={`${editorial.utilityLink} ${editorial.utilityButton} ${homeStyles.showcaseCloseButton}`}
                onClick={closeItem}
                aria-label="Close craft showcase"
              >
                Close
              </button>
            </div>

            <div className={homeStyles.showcaseLightboxMedia}>
              <Image
                src={activeItem.imageSrc}
                alt={activeItem.alt}
                fill
                sizes="90vw"
                className={homeStyles.showcaseLightboxImage}
                priority
              />

              <div className={homeStyles.showcaseLightboxOverlay}>
                {hasMultipleImages ? (
                  <div className={homeStyles.showcaseLightboxControls}>
                    <button
                      type="button"
                      className={homeStyles.showcaseArrowButton}
                      onClick={showPreviousImage}
                      aria-label="Previous image"
                    >
                      <span aria-hidden="true">←</span>
                    </button>
                    <button
                      type="button"
                      className={homeStyles.showcaseArrowButton}
                      onClick={showNextImage}
                      aria-label="Next image"
                    >
                      <span aria-hidden="true">→</span>
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

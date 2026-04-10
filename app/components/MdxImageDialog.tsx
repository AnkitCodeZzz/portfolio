"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from "react";
import editorial from "../styles/editorial.module.css";

type MdxImageDialogProps = ImgHTMLAttributes<HTMLImageElement>;

export default function MdxImageDialog({
  src,
  alt = "",
  className,
  ...props
}: MdxImageDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inlineScale, setInlineScale] = useState(1.16);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const currentScaleRef = useRef(1.16);
  const targetScaleRef = useRef(1.16);
  const stripePatternId = useId();
  const stripeClipId = useId();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  useEffect(() => {
    const element = buttonRef.current;
    if (!element) {
      return;
    }

    const startScale = 1.16;
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

  if (!src) {
    return null;
  }

  const inlineStyle = {
    "--media-inline-scale": inlineScale,
  } as CSSProperties;

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={editorial.utilityMediaButton}
        style={inlineStyle}
        onClick={() => {
          setIsOpen(true);
        }}
        aria-label={alt ? `Open image: ${alt}` : "Open image"}
      >
        <span className={editorial.utilityMediaFrame}>
          <svg
            className={editorial.utilityMediaStripe}
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id={stripePatternId}
                patternUnits="userSpaceOnUse"
                width="4"
                height="4"
                patternTransform="scale(1.5)"
              >
                <g clipPath={`url(#${stripeClipId})`}>
                  <path d="M1 -1L5 3" stroke="currentColor" strokeWidth="0.5" />
                  <path d="M-1 1L3 5" stroke="currentColor" strokeWidth="0.5" />
                </g>
              </pattern>
              <clipPath id={stripeClipId}>
                <rect width="4" height="4" fill="white" />
              </clipPath>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill={`url(#${stripePatternId})`} />
          </svg>
          <span className={editorial.utilityMediaInlineStage}>
            <img
              src={src}
              alt={alt}
              className={className}
              {...props}
            />
          </span>
        </span>
      </button>

      {isOpen ? (
        <div
          className={editorial.utilityConfirmOverlay}
          onClick={() => {
            setIsOpen(false);
          }}
        >
          <div
            className={editorial.utilityMediaPopup}
            role="dialog"
            aria-modal="true"
            aria-label={alt ? `Image preview: ${alt}` : "Image preview"}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={editorial.utilityMediaPopupFrame}>
              <img
                src={src}
                alt={alt}
                className={editorial.utilityMediaPopupImage}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

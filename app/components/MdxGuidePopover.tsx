"use client";

import { useEffect, useId, useState } from "react";
import Divider from "./Divider";
import styles from "../styles/noteEditor.module.css";

const MDX_GUIDE_ITEMS = [
  { label: "Bold", example: "**text**" },
  { label: "Italic", example: "*text*" },
  { label: "Link", example: "[text](url)" },
  { label: "Heading", example: "## Heading" },
  { label: "List", example: "- Bullet item" },
  { label: "Quote", example: "> Quote text" },
  { label: "Image", example: "![Alt text](/notes/image.jpg)" },
  { label: "Image grid", example: "<ImageGrid columns={2}> or column={2}" },
  { label: "Facts", example: "<Facts> + <Fact />" },
  { label: "Accordion", example: "<Accordion title=\"...\">" },
  { label: "Line break", example: "Blank line or <br />" },
] as const;

export default function MdxGuidePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const titleId = useId();

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

  return (
    <>
      <div className={styles.guidePopover}>
        <button
          type="button"
          className={styles.guideTrigger}
          onClick={() => {
            setIsOpen(true);
          }}
        >
          MDX guide
        </button>
      </div>

      {isOpen ? (
        <div
          className={styles.guideOverlay}
          onClick={() => {
            setIsOpen(false);
          }}
        >
          <div
            className={styles.guidePanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            onClick={(event) => {
              event.stopPropagation();
            }}
          >
            <div className={styles.guidePanelHeader}>
              <p id={titleId} className={styles.guidePanelTitle}>
                MDX guide
              </p>
              <button
                type="button"
                className={styles.guideClose}
                onClick={() => {
                  setIsOpen(false);
                }}
              >
                Close
              </button>
            </div>

            <Divider className={styles.guidePanelDivider} />

            <ul className={styles.guideList}>
              {MDX_GUIDE_ITEMS.map((item) => (
                <li key={item.label} className={styles.guideListItem}>
                  <span className={styles.guideItemLabel}>{item.label}</span>
                  <code className={styles.guideItemCode}>{item.example}</code>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

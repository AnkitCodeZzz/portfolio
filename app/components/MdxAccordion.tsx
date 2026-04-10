import type { ReactNode } from "react";

type MdxAccordionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean | string;
};

export default function MdxAccordion({
  title,
  children,
  defaultOpen = false,
}: MdxAccordionProps) {
  const initiallyOpen =
    typeof defaultOpen === "string"
      ? !["", "false", "0", "no", "off"].includes(defaultOpen.toLowerCase())
      : Boolean(defaultOpen);

  return (
    <details className="mdx-accordion" open={initiallyOpen}>
      <summary className="mdx-accordionSummary">
        <span className="mdx-accordionTitle">{title}</span>
        <span className="mdx-accordionToggle" aria-hidden="true">
          <svg className="mdx-accordionToggleIcon" viewBox="0 0 16 16" fill="none">
            <line
              className="mdx-accordionToggleLine"
              x1="2.5"
              y1="8"
              x2="13.5"
              y2="8"
            />
            <line
              className="mdx-accordionToggleLine mdx-accordionToggleLineVertical"
              x1="8"
              y1="2.5"
              x2="8"
              y2="13.5"
            />
          </svg>
        </span>
      </summary>
      <div className="mdx-accordionPanel">{children}</div>
    </details>
  );
}

import type { ReactNode } from "react";

type FactsProps = {
  children: ReactNode;
};

type FactProps = {
  label: string;
  children: ReactNode;
};

type AccordionProps = {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function Facts({ children }: FactsProps) {
  return <dl className="mdx-facts">{children}</dl>;
}

export function Fact({ label, children }: FactProps) {
  return (
    <div className="mdx-factRow">
      <dt className="mdx-factLabel">{label}</dt>
      <dd className="mdx-factValue">{children}</dd>
    </div>
  );
}

export function Accordion({
  title,
  children,
  defaultOpen = false,
}: AccordionProps) {
  return (
    <details className="mdx-accordion" open={defaultOpen}>
      <summary className="mdx-accordionSummary">
        <span className="mdx-accordionTitle">{title}</span>
        <span className="mdx-accordionToggle" aria-hidden="true">
          <svg
            className="mdx-accordionToggleIcon"
            viewBox="0 0 16 16"
            fill="none"
          >
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

export const sharedMdxComponents = {
  Facts,
  Fact,
  Accordion,
};

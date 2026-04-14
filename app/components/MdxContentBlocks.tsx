import { Children, isValidElement, type ReactNode } from "react";
import MdxAccordion from "./MdxAccordion";
import MdxImageDialog from "./MdxImageDialog";

type FactsProps = {
  children: ReactNode;
};

type FactProps = {
  label: string;
  children: ReactNode;
};

type ImageGridProps = {
  children: ReactNode;
  columns?: number | string;
  column?: number | string;
};

type ImageCellProps = {
  children: ReactNode;
};

type ParagraphProps = {
  children: ReactNode;
};

type CarouselProps = {
  children: ReactNode;
};

export function MdxDivider() {
  return <hr className="mdx-dividerRule" />;
}

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

export function Paragraph({ children }: ParagraphProps) {
  const items = Children.toArray(children).filter((child) => {
    if (typeof child === "string") {
      return child.trim().length > 0;
    }

    return true;
  });

  const isStandaloneMediaBlock =
    items.length === 1 &&
    isValidElement(items[0]) &&
    (items[0].type === MdxImageDialog ||
      items[0].type === ImageGrid ||
      items[0].type === MdxDivider);

  if (isStandaloneMediaBlock) {
    return <>{children}</>;
  }

  return <p>{children}</p>;
}

export function ImageGrid({
  children,
  columns,
  column,
}: ImageGridProps) {
  const items = Children.toArray(children).filter((child) => {
    if (typeof child === "string") {
      return child.trim().length > 0;
    }

    return isValidElement(child);
  });
  const requestedColumns = columns ?? column ?? 2;
  const parsedColumns =
    typeof requestedColumns === "string"
      ? Number.parseInt(requestedColumns, 10)
      : requestedColumns;
  const safeColumns =
    Number.isFinite(parsedColumns) && parsedColumns > 0
      ? Math.min(parsedColumns, 4)
      : Math.min(Math.max(items.length, 1), 4);

  return (
    <div className={`mdx-imageGrid mdx-imageGridColumns${safeColumns}`}>
      {items}
    </div>
  );
}

export function ImageCell({ children }: ImageCellProps) {
  return <div className="mdx-imageCell">{children}</div>;
}

export function Carousel({ children }: CarouselProps) {
  const items = Children.toArray(children).filter((child) => {
    if (typeof child === "string") {
      return child.trim().length > 0;
    }

    return isValidElement(child);
  });

  return (
    <div className="mdx-carousel">
      {items.map((child, index) => (
        <div key={index} className="mdx-carouselSlide">
          {child}
        </div>
      ))}
    </div>
  );
}

export const sharedMdxComponents = {
  p: Paragraph,
  hr: MdxDivider,
  Facts,
  Fact,
  Accordion: MdxAccordion,
  ImageGrid,
  ImageCell,
  Carousel,
  img: MdxImageDialog,
};

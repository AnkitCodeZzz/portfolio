import Link from "next/link";
import { Fragment, type MouseEvent } from "react";
import editorial from "../styles/editorial.module.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={editorial.breadcrumbs} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const hasSeparator = index > 0;
        const isIntermediate = !isLast && !item.href;

        return (
          <Fragment key={`${item.label}-${index}`}>
            <span
              className={`${editorial.breadcrumbItem} ${
                hasSeparator ? editorial.breadcrumbItemWithSeparator : ""
              }`.trim()}
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className={editorial.breadcrumbLink}
                  onClick={item.onClick}
                >
                  {hasSeparator ? (
                    <span className={editorial.breadcrumbSeparator} aria-hidden="true">
                      /
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                </Link>
              ) : (
                <span
                  className={`${editorial.breadcrumbCurrentGroup} ${
                    isIntermediate ? editorial.breadcrumbIntermediateGroup : ""
                  }`.trim()}
                >
                  {hasSeparator ? (
                    <span className={editorial.breadcrumbSeparator} aria-hidden="true">
                      /
                    </span>
                  ) : null}
                  <span className={isLast ? editorial.breadcrumbCurrent : undefined}>
                    {item.label}
                  </span>
                </span>
              )}
            </span>
          </Fragment>
        );
      })}
    </nav>
  );
}

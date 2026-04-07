import Link from "next/link";
import { Fragment } from "react";
import editorial from "../styles/editorial.module.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className={editorial.breadcrumbs} aria-label="Breadcrumb">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={`${item.label}-${index}`}>
            <span className={editorial.breadcrumbItem}>
              {item.href && !isLast ? (
                <Link href={item.href} className={editorial.breadcrumbLink}>
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? editorial.breadcrumbCurrent : editorial.breadcrumbLink}>
                  {item.label}
                </span>
              )}
            </span>
            {!isLast ? (
              <span className={editorial.breadcrumbSeparator} aria-hidden="true">
                /
              </span>
            ) : null}
          </Fragment>
        );
      })}
    </nav>
  );
}

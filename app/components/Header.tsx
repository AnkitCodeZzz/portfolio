"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Container from "./Container";

const navLinks = [
  { label: "work", href: "/work" },
  { label: "notes", href: "/notes" },
  { label: "now", href: "/now" },
  { label: "readme", href: "/readme" },
];

export default function Header() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <>
      <style>{`
        .header-site-name {
          position: relative;
          color: var(--ink-80);
          text-decoration: none;
          font-family: var(--font-family-display);
          font-weight: 300;
          font-size: 16px;
        }
        .header-nav-link {
          color: rgba(12, 12, 24, 0.45);
          text-decoration: none;
          cursor: default;
          font-family: var(--font-family-mono);
        }
      `}</style>
      <header
        style={{
          borderBottom: "1px solid var(--color-border)",
          paddingTop: "var(--spacing-md)",
          paddingBottom: "var(--spacing-md)",
        }}
      >
        <Container size="md">
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontFamily: "var(--font-family-ui)",
              fontSize: "var(--font-size-sm)",
            }}
          >
            <Link href="/" className="header-site-name">
              Ankit Mandal
            </Link>
            <ul
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-md)",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {/* TODO: Re-enable nav links when pages are ready */}
              {navLinks.map(({ label }) => (
                <li key={label}>
                  <span className="header-nav-link">/{label}</span>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </header>
    </>
  );
}

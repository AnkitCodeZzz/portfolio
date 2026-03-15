"use client";

import Link from "next/link";
import Container from "./Container";

const navLinks = [
  { label: "work", href: "/work" },
  { label: "notes", href: "/notes" },
  { label: "now", href: "/now" },
  { label: "readme", href: "/readme" },
];

export default function Header() {
  return (
    <>
      <style>{`
        .header-site-name {
          position: relative;
          color: var(--ink-80);
          text-decoration: none;
          font-family: var(--font-family-display);
        }
        .header-nav-link {
          color: var(--ink-20);
          text-decoration: none;
          cursor: default;
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
                gap: "var(--spacing-sm)",
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {/* TODO: Re-enable nav links when pages are ready */}
              {navLinks.map(({ label }, index) => (
                <li key={label} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)" }}>
                  {index > 0 && <span style={{ color: "var(--ink-20)", fontSize: "16px", userSelect: "none" }}>·</span>}
                  <span className="header-nav-link">{label}</span>
                </li>
              ))}
            </ul>
          </nav>
        </Container>
      </header>
    </>
  );
}

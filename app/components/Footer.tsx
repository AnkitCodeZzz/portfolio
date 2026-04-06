"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Container from "./Container";

const sharedText: React.CSSProperties = {
  fontFamily: "var(--font-family-ui)",
  fontSize: "var(--font-size-xs)",
  color: "var(--ink-40)",
};

function FooterLink({ href, children, style }: { href: string; children: React.ReactNode; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        color: hovered ? "var(--ink-80)" : "var(--ink-40)",
        textDecoration: "none",
        transition: "color 0.2s",
        ...style,
      }}
    >
      {children}
    </a>
  );
}

const Dot = () => <span style={{ margin: "0 6px" }}>·</span>;

export default function Footer() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <footer style={{ borderTop: "1px solid var(--color-border)" }}>
      <Container>
        <div
          style={{
            ...sharedText,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingTop: "var(--spacing-xl)",
            paddingBottom: "var(--spacing-xl)",
          }}
        >
          <span>© Ankit Mandal<Dot />{new Date().getFullYear()}</span>

          <span>
            <FooterLink href="https://x.com/Ankit__TwT" style={{ fontWeight: 600 }}>𝕏</FooterLink>
            <Dot />
            <FooterLink href="https://www.linkedin.com/in/itsankitmandal/">LinkedIn</FooterLink>
          </span>
        </div>
      </Container>
    </footer>
  );
}

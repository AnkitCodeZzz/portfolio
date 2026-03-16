type TypographyProps = {
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  color?: "primary" | "secondary" | "muted";
  font?: "display" | "body" | "ui" | "mono";
  letterSpacing?: string;
  children: React.ReactNode;
};

export default function Typography({
  as: Tag = "p",
  size = "base",
  weight = "normal",
  color = "primary",
  font = "body",
  letterSpacing,
  children,
}: TypographyProps) {
  return (
    <Tag
      style={{
        fontSize: `var(--font-size-${size})`,
        fontWeight: `var(--font-weight-${weight})`,
        color: `var(--color-text-${color})`,
        fontFamily: `var(--font-family-${font})`,
        lineHeight: "var(--line-height-normal)",
        ...(letterSpacing ? { letterSpacing } : {}),
      }}
    >
      {children}
    </Tag>
  );
}

type TypographyProps = {
    as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
    size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
    weight?: "normal" | "medium" | "semibold" | "bold";
    color?: "primary" | "secondary" | "muted";
    children: React.ReactNode;
  };
  
  export default function Typography({
    as: Tag = "p",
    size = "base",
    weight = "normal",
    color = "primary",
    children,
  }: TypographyProps) {
    return (
      <Tag
        style={{
          fontSize: `var(--font-size-${size})`,
          fontWeight: `var(--font-weight-${weight})`,
          color: `var(--color-text-${color})`,
          lineHeight: "var(--line-height-normal)",
        }}
      >
        {children}
      </Tag>
    );
  }
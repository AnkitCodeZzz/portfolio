type ButtonProps = {
    children: React.ReactNode;
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md" | "lg";
    href?: string;
  };
  
  export default function Button({
    children,
    variant = "primary",
    size = "md",
    href,
  }: ButtonProps) {
    const baseStyles: React.CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "var(--radius-md)",
      fontWeight: "var(--font-weight-medium)" as string,
      cursor: "pointer",
      border: "none",
      transition: "all 0.2s ease",
      textDecoration: "none",
    };
  
    const variants: Record<string, React.CSSProperties> = {
      primary: {
        background: "var(--color-accent)",
        color: "var(--site-header-bg)",
      },
      secondary: {
        background: "transparent",
        color: "var(--color-text-primary)",
        border: "1px solid var(--color-border)",
      },
      ghost: {
        background: "transparent",
        color: "var(--color-text-secondary)",
      },
    };
  
    const sizes: Record<string, React.CSSProperties> = {
      sm: {
        padding: "var(--spacing-xs) var(--spacing-sm)",
        fontSize: "var(--font-size-sm)",
      },
      md: {
        padding: "var(--spacing-sm) var(--spacing-md)",
        fontSize: "var(--font-size-base)",
      },
      lg: {
        padding: "var(--spacing-md) var(--spacing-lg)",
        fontSize: "var(--font-size-lg)",
      },
    };
  
    const style = { ...baseStyles, ...variants[variant], ...sizes[size] };
  
    if (href) {
      return (
        <a href={href} style={style}>
          {children}
        </a>
      );
    }
  
    return <button style={style}>{children}</button>;
  }

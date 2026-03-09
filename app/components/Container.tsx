type ContainerProps = {
    children: React.ReactNode;
    size?: "sm" | "md" | "lg";
  };
  
  export default function Container({
    children,
    size = "md",
  }: ContainerProps) {
    const maxWidths = {
      sm: "640px",
      md: "768px",
      lg: "1024px",
    };
  
    return (
      <div
        style={{
          maxWidth: maxWidths[size],
          marginLeft: "auto",
          marginRight: "auto",
          paddingLeft: "var(--spacing-lg)",
          paddingRight: "var(--spacing-lg)",
        }}
      >
        {children}
      </div>
    );
  }
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageHeader({ title, subtitle, className = "" }: PageHeaderProps) {
  return (
    <div className={`mx-auto max-w-3xl px-4 pt-10 text-center sm:px-6 ${className}`}>
      <h1 className="text-4xl font-semibold italic">{title}</h1>
      {subtitle && (
        <h3 className="font-mono-label mt-3 text-xs uppercase tracking-wide text-muted-foreground">{subtitle}</h3>
      )}
      <div className="mx-auto mt-6 h-px w-16 bg-border" />
    </div>
  );
}
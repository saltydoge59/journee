interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function PageHeader({ title, subtitle, className = "" }: PageHeaderProps) {
  return (
    <div className={`text-center ${className}`}>
      <h1 className="text-4xl font-bold">{title}</h1>
      {subtitle && (
        <h3 className="text-xl text-slate-400 mt-2">{subtitle}</h3>
      )}
    </div>
  );
}
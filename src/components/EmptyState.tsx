import Link from "next/link";
import BlurFade from "@/components/ui/blur-fade";

interface EmptyStateProps {
  title: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  title,
  actionText,
  actionHref,
  className = ""
}: EmptyStateProps) {
  return (
    <BlurFade delay={0.25} inView className={`h-screen ${className}`}>
      <div className="h-screen w-full flex justify-center items-center">
        <div className="flex flex-col items-center">
          <span aria-hidden className="h-3 w-3 rounded-full border border-muted-foreground/40" />
          <h4 className="font-entry mt-4 text-muted-foreground">{title}</h4>
          {actionText && actionHref && (
            <Link
              href={actionHref}
              className="font-mono-label mt-5 border border-primary px-6 py-2 text-xs uppercase text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              {actionText}
            </Link>
          )}
        </div>
      </div>
    </BlurFade>
  );
}
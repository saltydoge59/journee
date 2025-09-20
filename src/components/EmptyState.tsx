import Link from "next/link";
import BlurFade from "@/components/ui/blur-fade";

interface EmptyStateProps {
  emoji: string;
  title: string;
  actionText?: string;
  actionHref?: string;
  className?: string;
}

export default function EmptyState({
  emoji,
  title,
  actionText,
  actionHref,
  className = ""
}: EmptyStateProps) {
  return (
    <BlurFade delay={0.25} inView className={`h-screen ${className}`}>
      <div className="h-screen w-full flex justify-center items-center">
        <div className="flex flex-col items-center">
          <span className="text-4xl">{emoji}</span>
          <h4 className="mt-1">{title}</h4>
          {actionText && actionHref && (
            <button className="p-[3px] relative mt-4 block mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
              <div className="px-8 py-2 bg-black rounded-[6px] relative group transition duration-200 text-white hover:bg-transparent md:text-lg text-md">
                <Link href={actionHref}>
                  {actionText}
                </Link>
              </div>
            </button>
          )}
        </div>
      </div>
    </BlurFade>
  );
}
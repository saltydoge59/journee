import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import BlurFade from "@/components/ui/blur-fade";

interface DayGridProps {
  daysArray: Date[];
  tripName: string;
  logs: {entry: any, title: any, day: any}[];
}

export default function DayGrid({ daysArray, tripName, logs }: DayGridProps) {
  return (
    <BlurFade inView delay={0.5}>
      <div className="mx-auto mt-8 max-w-3xl px-4 sm:px-6">
        <div className="border-t border-border">
          {daysArray.map((day, index) => {
            const hasEntry = logs[index]?.entry != null;
            return (
              <Link
                key={index}
                to={`/day?${new URLSearchParams({
                  day: day.toLocaleDateString("en-us"),
                  trip: tripName,
                  num: String(Number(index) + 1),
                })}`}
                className="group flex items-baseline gap-4 border-b border-border py-3 transition-colors hover:bg-secondary/60"
              >
                <span className="font-mono-label w-10 shrink-0 text-xs tabular-nums text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  aria-hidden
                  className={cn(
                    "h-2.5 w-2.5 shrink-0 rounded-full border",
                    hasEntry
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/40 bg-transparent"
                  )}
                />
                <span className="font-mono-label text-xs text-muted-foreground">
                  {day.toLocaleDateString("en-us", { month: "short", day: "numeric" })}
                </span>
                <span
                  className={cn(
                    "truncate text-base",
                    hasEntry ? "text-foreground" : "italic text-muted-foreground/70"
                  )}
                >
                  {hasEntry ? (logs[index]?.title || "Untitled day") : "Nothing recorded"}
                </span>
                <span className="ml-auto shrink-0 font-mono-label text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  open →
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </BlurFade>
  );
}
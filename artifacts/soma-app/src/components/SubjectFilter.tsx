import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  subjects: string[];
  active: string;
  onChange: (subject: string) => void;
  /** Subjects to flag as "recommended for you" — shown with a star, not filtered out. */
  recommended?: Set<string>;
}

export function SubjectFilter({ subjects, active, onChange, recommended }: Props) {
  const hasRec = recommended && recommended.size > 0;
  return (
    <div className="relative w-full">
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-2 items-center">
          <Button
            variant={active === "All" ? "default" : "outline"}
            className={cn("rounded-full px-6 transition-all", active === "All" ? "shadow-md ring-2 ring-primary ring-offset-2" : "bg-white")}
            onClick={() => onChange("All")}
          >
            All Subjects
          </Button>

          {subjects.map((subject, i) => {
            const isRec = recommended?.has(subject);
            const isFirstNonRec = hasRec && !isRec && subjects.slice(0, i).every((s) => recommended?.has(s));
            return (
              <div key={subject} className="flex items-center">
                {isFirstNonRec && <span className="mx-1 text-xs text-muted-foreground font-medium shrink-0">·  more subjects  ·</span>}
                <Button
                  variant={active === subject ? "default" : "outline"}
                  className={cn(
                    "rounded-full px-5 transition-all",
                    active === subject ? "shadow-md ring-2 ring-primary ring-offset-2" : "bg-white hover:bg-gray-50",
                    isRec && active !== subject && "border-primary/40",
                  )}
                  onClick={() => onChange(subject)}
                >
                  {isRec && <span className="mr-1">⭐</span>}
                  {subject}
                </Button>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="hidden sm:flex" />
      </ScrollArea>
    </div>
  );
}

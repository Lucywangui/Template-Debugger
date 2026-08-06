import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  subjects: string[];
  active: string;
  onChange: (subject: string) => void;
}

export function SubjectFilter({ subjects, active, onChange }: Props) {
  return (
    <div className="relative w-full">
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-2">
          <Button
            variant={active === "All" ? "default" : "outline"}
            className={cn(
              "rounded-full px-6 transition-all",
              active === "All" ? "shadow-md ring-2 ring-primary ring-offset-2" : "bg-white"
            )}
            onClick={() => onChange("All")}
          >
            All Subjects
          </Button>
          
          {subjects.map((subject) => (
            <Button
              key={subject}
              variant={active === subject ? "default" : "outline"}
              className={cn(
                "rounded-full px-6 transition-all",
                active === subject ? "shadow-md ring-2 ring-primary ring-offset-2" : "bg-white hover:bg-gray-50"
              )}
              onClick={() => onChange(subject)}
            >
              {subject}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="hidden sm:flex" />
      </ScrollArea>
    </div>
  );
}

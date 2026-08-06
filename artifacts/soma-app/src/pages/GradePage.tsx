import { useState } from "react";
import { motion } from "framer-motion";
import { useSomaStore } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  onNext: () => void;
}

const SECTIONS = [
  {
    id: "cbc",
    title: "🇰🇪 CBC",
    subtitle: "Competency Based Curriculum",
    grades: [
      { id: "cbc-1", label: "Grade 1" },
      { id: "cbc-2", label: "Grade 2" },
      { id: "cbc-3", label: "Grade 3" },
      { id: "cbc-4", label: "Grade 4" },
      { id: "cbc-5", label: "Grade 5" },
      { id: "cbc-6", label: "Grade 6" },
      { id: "cbc-7", label: "Grade 7" },
      { id: "cbc-8", label: "Grade 8" },
      { id: "cbc-9", label: "Grade 9" },
    ],
  },
  {
    id: "844",
    title: "📖 8-4-4",
    subtitle: "Secondary School",
    grades: [
      { id: "844-form1", label: "Form 1" },
      { id: "844-form2", label: "Form 2" },
      { id: "844-form3", label: "Form 3" },
      { id: "844-form4", label: "Form 4" },
    ],
  },
  {
    id: "senior",
    title: "🎓 Senior School",
    subtitle: "Grades 10 – 12",
    grades: [
      { id: "senior-10", label: "Grade 10" },
      { id: "senior-11", label: "Grade 11" },
      { id: "senior-12", label: "Grade 12" },
    ],
  },
];

export function GradePage({ onNext }: Props) {
  const { setGrade, grade } = useSomaStore();
  const [selectedId, setSelectedId] = useState<string | null>(grade);

  const handleConfirm = () => {
    if (selectedId) {
      setGrade(selectedId);
      onNext();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center pb-32 px-4 pt-8"
      style={{ background: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 50%, #1e4d7b 100%)" }}
    >
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">Select Your Level</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15 }}>
            Choose your grade or form to get the right materials
          </p>
        </div>

        <div className="space-y-4">
          {SECTIONS.map((section, si) => (
            <motion.div
              key={section.id}
              className="rounded-3xl p-5 shadow-lg"
              style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.13)" }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: si * 0.1 }}
            >
              <p className="text-white font-extrabold text-lg">{section.title}</p>
              <p className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.45)" }}>{section.subtitle}</p>
              <div className="flex flex-wrap gap-2">
                {section.grades.map((g) => {
                  const isSelected = selectedId === g.id;
                  return (
                    <button
                      key={g.id}
                      onClick={() => setSelectedId(g.id)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        isSelected
                          ? "text-white shadow-lg scale-105"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                      style={{
                        background: isSelected
                          ? "linear-gradient(135deg, #e67e22, #d35400)"
                          : "rgba(255,255,255,0.07)",
                        border: isSelected ? "none" : "1px solid rgba(255,255,255,0.15)",
                        boxShadow: isSelected ? "0 4px 16px rgba(230,126,34,0.4)" : "none",
                      }}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Fixed bottom button */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-4"
        style={{ background: "linear-gradient(to top, #0d2137 60%, transparent)" }}
      >
        <div className="max-w-xl mx-auto">
          <Button
            size="lg"
            disabled={!selectedId}
            className="w-full text-xl font-bold py-7 rounded-2xl border-0"
            style={{
              background: selectedId ? "linear-gradient(135deg, #e67e22, #d35400)" : "rgba(255,255,255,0.12)",
              color: "#fff",
              boxShadow: selectedId ? "0 6px 24px rgba(230,126,34,0.45)" : "none",
            }}
            onClick={handleConfirm}
            data-testid="btn-confirm-grade"
          >
            CONFIRM GRADE →
          </Button>

          {/* Step indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === 1 ? 24 : 8,
                  height: 8,
                  background: i === 1 ? "#e67e22" : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

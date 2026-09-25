import { useState } from "react";
import { motion } from "framer-motion";
import { useSomaStore, type StudyIntent } from "@/lib/storage";
import { INTENT_LABELS } from "@/data/grade";
import { Button } from "@/components/ui/button";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

const ORDER: StudyIntent[] = ["exam", "keep-up", "catch-up", "get-ahead"];

export function IntentPage({ onNext, onBack }: Props) {
  const { setStudyIntent, studyIntent } = useSomaStore();
  const [selected, setSelected] = useState<StudyIntent | null>(studyIntent);

  const confirm = () => {
    if (!selected) return;
    setStudyIntent(selected);
    onNext();
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center pb-32 px-4 pt-10"
      style={{ background: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 50%, #1e4d7b 100%)" }}
    >
      <motion.div className="w-full max-w-xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-white mb-2">What brings you here?</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15 }}>
            We'll shape your home screen around this. You can change it later.
          </p>
        </div>

        <div className="space-y-3">
          {ORDER.map((key, i) => {
            const info = INTENT_LABELS[key];
            const isSel = selected === key;
            return (
              <motion.button
                key={key}
                onClick={() => setSelected(key)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="w-full flex items-center gap-4 rounded-2xl p-4 text-left transition-all"
                style={{
                  background: isSel ? "linear-gradient(135deg, #e67e22, #d35400)" : "rgba(255,255,255,0.08)",
                  border: isSel ? "none" : "1px solid rgba(255,255,255,0.14)",
                  boxShadow: isSel ? "0 6px 20px rgba(230,126,34,0.4)" : "none",
                }}
              >
                <span className="text-3xl">{info.emoji}</span>
                <span>
                  <span className="block font-extrabold text-white text-lg">{info.title}</span>
                  <span className="block text-sm" style={{ color: isSel ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)" }}>
                    {info.blurb}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-4" style={{ background: "linear-gradient(to top, #0d2137 60%, transparent)" }}>
        <div className="max-w-xl mx-auto flex gap-3">
          <Button variant="ghost" onClick={onBack} className="text-white/70 hover:text-white hover:bg-white/10 py-7 rounded-2xl">
            Back
          </Button>
          <Button
            size="lg"
            disabled={!selected}
            className="flex-1 text-xl font-bold py-7 rounded-2xl border-0"
            style={{
              background: selected ? "linear-gradient(135deg, #e67e22, #d35400)" : "rgba(255,255,255,0.12)",
              color: "#fff",
              boxShadow: selected ? "0 6px 24px rgba(230,126,34,0.45)" : "none",
            }}
            onClick={confirm}
          >
            CONTINUE →
          </Button>
        </div>
      </div>
    </div>
  );
}

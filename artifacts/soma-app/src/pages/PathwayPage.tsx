import { useState } from "react";
import { motion } from "framer-motion";
import { useSomaStore } from "@/lib/storage";
import { PATHWAYS, SENIOR_CORE, type Pathway } from "@/data/curriculum";
import { Button } from "@/components/ui/button";

interface Props {
  onNext: () => void;
  onBack: () => void;
}

export function PathwayPage({ onNext, onBack }: Props) {
  const { setPathway, pathway } = useSomaStore();
  const [selected, setSelected] = useState<Pathway | null>(pathway);

  const confirm = () => {
    if (!selected) return;
    setPathway(selected);
    onNext();
  };

  return (
    <div className="min-h-screen flex flex-col items-center pb-32 px-4 pt-10" style={{ background: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 50%, #1e4d7b 100%)" }}>
      <motion.div className="w-full max-w-xl" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-white mb-2">Pick your pathway</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15 }}>
            Senior School. Everyone takes {SENIOR_CORE.join(", ")}. Your pathway subjects come up first —
            <span className="text-white/70"> every other subject stays available too.</span>
          </p>
        </div>

        <div className="space-y-3">
          {PATHWAYS.map((p, i) => {
            const isSel = selected === p.id;
            return (
              <motion.button
                key={p.id}
                onClick={() => setSelected(p.id)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="w-full rounded-2xl p-4 text-left transition-all"
                style={{
                  background: isSel ? "linear-gradient(135deg, #e67e22, #d35400)" : "rgba(255,255,255,0.08)",
                  border: isSel ? "none" : "1px solid rgba(255,255,255,0.14)",
                  boxShadow: isSel ? "0 6px 20px rgba(230,126,34,0.4)" : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{p.emoji}</span>
                  <div>
                    <span className="block font-extrabold text-white text-lg">{p.title}</span>
                    <span className="block text-sm" style={{ color: isSel ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)" }}>{p.blurb}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2.5">
                  {p.subjects.map((s) => (
                    <span key={s} className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.15)", color: "#fff" }}>{s}</span>
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <div className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-4" style={{ background: "linear-gradient(to top, #0d2137 60%, transparent)" }}>
        <div className="max-w-xl mx-auto flex flex-col gap-2">
          <div className="flex gap-3">
            <Button variant="ghost" onClick={onBack} className="text-white/70 hover:text-white hover:bg-white/10 py-7 rounded-2xl">Back</Button>
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
          <button
            className="text-sm text-white/50 hover:text-white/80 py-1"
            onClick={() => { setPathway(null); onNext(); }}
          >
            Not sure yet — show me every subject
          </button>
        </div>
      </div>
    </div>
  );
}

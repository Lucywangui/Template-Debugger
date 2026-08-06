import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Material } from "@/data/materials";
import { getQuestionsForMaterial } from "@/data/questions";
import { useSomaStore } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface Props {
  material: Material;
  onClose: () => void;
}

const TOTAL_QUESTIONS = 15;

export function TopicalViewer({ material, onClose }: Props) {
  const { addQuizResult } = useSomaStore();

  // Synchronous — instant, fully offline
  const questions = useMemo(() => getQuestionsForMaterial(material, TOTAL_QUESTIONS), [material]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasChecked, setHasChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);

  const currentQ = questions[currentIndex];

  const handleCheck = () => {
    if (!selectedOption || !currentQ) return;
    setHasChecked(true);
    if (parseInt(selectedOption) === currentQ.correct) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedOption("");
      setHasChecked(false);
    } else {
      setIsFinished(true);
    }
  };

  useEffect(() => {
    if (isFinished && !resultSaved && questions.length > 0) {
      const pct = Math.round((score / questions.length) * 100);
      addQuizResult({
        materialId: material.id,
        materialTitle: material.title,
        subject: material.subject,
        type: "topical",
        score,
        total: questions.length,
        percentage: pct,
      });
      setResultSaved(true);
    }
  }, [isFinished]);

  // ── Finished screen ───────────────────────────────────────────────────────────
  if (isFinished) {
    const percentage = Math.round((score / questions.length) * 100);
    const emoji = percentage >= 80 ? "🏆" : percentage >= 60 ? "🌟" : percentage >= 40 ? "👍" : "📚";
    const message =
      percentage >= 80 ? "Outstanding! Keep it up!" :
      percentage >= 60 ? "Great work! Almost there!" :
      percentage >= 40 ? "Good effort! Keep practising!" :
      "Don't give up! Try again!";

    return (
      <motion.div
        className="flex flex-col items-center justify-center min-h-full p-8 rounded-xl text-white"
        style={{ background: "linear-gradient(135deg, #1a3a5c, #1e5799)" }}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <motion.div className="text-8xl mb-4" animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }} transition={{ duration: 0.8, delay: 0.3 }}>
          {emoji}
        </motion.div>
        <h2 className="text-3xl font-extrabold mb-2">Quiz Complete!</h2>
        <p className="text-lg opacity-70 mb-1">{material.subject}</p>
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {material.topics.map((t, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(255,255,255,0.15)" }}>{t}</span>
          ))}
        </div>
        <div className="w-36 h-36 rounded-full flex flex-col items-center justify-center mb-6 shadow-xl" style={{ background: "rgba(255,255,255,0.12)", border: "4px solid rgba(255,255,255,0.3)" }}>
          <span className="text-4xl font-extrabold">{percentage}%</span>
          <span className="text-sm opacity-70 mt-1">{score}/{questions.length}</span>
        </div>
        <p className="text-xl font-semibold mb-2" style={{ color: "#e67e22" }}>{message}</p>
        <div className="px-6 py-2 rounded-full text-sm font-bold mb-8" style={{ background: percentage >= 80 ? "#27ae60" : percentage >= 60 ? "#e67e22" : percentage >= 40 ? "#2980b9" : "#e74c3c" }}>
          {percentage >= 80 ? "EXCELLENT" : percentage >= 60 ? "GOOD" : percentage >= 40 ? "FAIR" : "NEEDS WORK"}
        </div>
        <div className="w-full max-w-xs mb-8">
          <div className="h-3 rounded-full bg-white/20 overflow-hidden">
            <motion.div className="h-full rounded-full" style={{ background: percentage >= 80 ? "#27ae60" : percentage >= 60 ? "#e67e22" : percentage >= 40 ? "#2980b9" : "#e74c3c" }} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.8, delay: 0.5 }} />
          </div>
        </div>
        <Button size="lg" className="px-12 py-6 text-xl rounded-full border-0 font-bold" style={{ background: "#e67e22", color: "#fff" }} onClick={onClose}>
          Back to Dashboard
        </Button>
      </motion.div>
    );
  }

  if (!currentQ) return null;

  const progress = ((currentIndex + (hasChecked ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="flex flex-col min-h-full bg-card rounded-xl shadow-2xl overflow-hidden max-w-4xl mx-auto mt-4 mb-4 border">
      {/* Header */}
      <div className="text-primary-foreground p-4 flex justify-between items-center" style={{ background: "linear-gradient(90deg, #1a3a5c, #1e5799)" }}>
        <div>
          <h2 className="font-bold text-xl text-white">{material.subject}</h2>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {material.topics.map((t, i) => (
              <span key={i} className="text-xs text-white/60 font-medium">{i > 0 ? "· " : ""}{t}</span>
            ))}
          </div>
          <div className="text-sm text-white/70 mt-1">Question {currentIndex + 1} of {questions.length}</div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="h-6 w-6" />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted">
        <motion.div className="h-full" style={{ background: "#e67e22" }} animate={{ width: `${progress}%` }} transition={{ duration: 0.3 }} />
      </div>

      <div className="p-8 flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
            <div className="text-2xl font-medium mb-10 leading-relaxed">{currentQ.text}</div>
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} disabled={hasChecked} className="space-y-4">
              {currentQ.options.map((opt, i) => (
                <div key={i} className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                  hasChecked && i === currentQ.correct ? "border-green-500 bg-green-50 text-green-900" :
                  hasChecked && selectedOption === i.toString() && i !== currentQ.correct ? "border-red-500 bg-red-50 text-red-900" :
                  "border-muted hover:border-primary/50"
                }`}>
                  <RadioGroupItem value={i.toString()} id={`opt-${i}`} className="w-5 h-5" />
                  <Label htmlFor={`opt-${i}`} className="flex-1 text-lg cursor-pointer leading-snug">{opt}</Label>
                  {hasChecked && i === currentQ.correct && <span className="text-green-600 font-bold text-xl">✓</span>}
                  {hasChecked && selectedOption === i.toString() && i !== currentQ.correct && <span className="text-red-600 font-bold text-xl">✗</span>}
                </div>
              ))}
            </RadioGroup>
          </motion.div>
        </AnimatePresence>

        <div className="mt-auto pt-10 flex justify-between items-center">
          <div className="text-xl font-bold">
            {hasChecked && (
              parseInt(selectedOption) === currentQ.correct ?
                <span className="text-green-600">✅ CORRECT!</span> :
                <span className="text-red-600 text-base">❌ Answer: {currentQ.options[currentQ.correct]}</span>
            )}
          </div>
          {!hasChecked ? (
            <Button size="lg" className="text-lg px-10 py-6 rounded-full" disabled={!selectedOption} onClick={handleCheck}>
              CHECK ANSWER
            </Button>
          ) : (
            <Button size="lg" className="text-lg px-10 py-6 rounded-full text-white border-0" style={{ background: "#e67e22" }} onClick={handleNext}>
              {currentIndex < questions.length - 1 ? "NEXT ➔" : "SEE RESULTS"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState, useMemo } from "react";
import { Material } from "@/data/materials";
import { getQuestionsForMaterial } from "@/data/questions";
import { useSomaStore } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

interface Props {
  material: Material;
  onClose: () => void;
}

const TOTAL_QUESTIONS = 15;
const TOTAL_MARKS = 100;

export function ExamViewer({ material, onClose }: Props) {
  const { addQuizResult } = useSomaStore();

  // Synchronous — instant, fully offline
  const questions = useMemo(() => getQuestionsForMaterial(material, TOTAL_QUESTIONS), [material]);

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showIncompleteWarning, setShowIncompleteWarning] = useState(false);

  const unanswered = questions.filter((_, i) => !answers[i]).length;
  const correctCount = questions.filter((q, i) => answers[i] === q.correct.toString()).length;
  const score = Math.round((correctCount / TOTAL_QUESTIONS) * TOTAL_MARKS);
  const percentage = score;

  let gradeLetter = "E";
  if (percentage >= 80) gradeLetter = "A";
  else if (percentage >= 65) gradeLetter = "B";
  else if (percentage >= 50) gradeLetter = "C";
  else if (percentage >= 40) gradeLetter = "D";

  const doSubmit = () => {
    addQuizResult({
      materialId: material.id,
      materialTitle: material.title,
      subject: material.subject,
      type: "exam",
      score,
      total: TOTAL_MARKS,
      percentage,
    });
    setIsSubmitted(true);
    setShowResults(true);
    setShowIncompleteWarning(false);
  };

  const handleSubmitClick = () => {
    if (unanswered > 0) setShowIncompleteWarning(true);
    else doSubmit();
  };

  return (
    <div className="bg-white min-h-full text-black p-6 font-serif print:p-0">
      <div className="max-w-4xl mx-auto border-2 border-black p-8 shadow-sm">

        {/* Header */}
        <div className="text-center border-b-2 border-black pb-6 mb-8">
          <h1 className="text-3xl font-bold uppercase mb-2">END OF TERM EXAMINATION</h1>
          <h2 className="text-xl font-bold mb-1">{material.subject}</h2>

          {/* Topic badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-2 mb-3">
            {material.topics.slice(0, 5).map((t, i) => (
              <span key={i} className="text-xs px-3 py-1 rounded-full font-sans font-semibold" style={{ background: "#f0f4ff", color: "#1a3a5c" }}>
                {t}
              </span>
            ))}
          </div>

          <p className="text-sm font-sans text-gray-600 mb-4">
            {TOTAL_QUESTIONS} Questions · {TOTAL_MARKS} Marks · Time: 1 Hour 30 Minutes
          </p>

          {isSubmitted ? (
            <div className="inline-block bg-green-100 border-2 border-green-600 px-4 py-2 text-green-800 font-bold text-sm font-sans">
              ✅ REVIEW MODE — Correct answers highlighted below
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-left font-sans text-sm mt-6 border border-black p-4">
              <div><span className="font-bold">STUDENT NAME: </span><div className="border-b border-dashed border-black h-6 w-full mt-1" /></div>
              <div><span className="font-bold">DATE: </span><div className="border-b border-dashed border-black h-6 w-full mt-1" /></div>
              <div><span className="font-bold">SCHOOL: </span><div className="border-b border-dashed border-black h-6 w-full mt-1" /></div>
              <div><span className="font-bold">ADMISSION NO: </span><div className="border-b border-dashed border-black h-6 w-full mt-1" /></div>
            </div>
          )}
        </div>

        {/* Instructions */}
        {!isSubmitted && (
          <div className="border border-gray-300 p-4 mb-8 font-sans text-sm bg-gray-50">
            <p className="font-bold mb-1">INSTRUCTIONS TO CANDIDATES:</p>
            <ol className="list-decimal ml-5 space-y-1 text-gray-700">
              <li>Answer ALL {TOTAL_QUESTIONS} questions.</li>
              <li>Each question carries equal marks. Total: {TOTAL_MARKS} marks.</li>
              <li>Choose only ONE answer per question.</li>
              <li>Do not leave any question blank.</li>
            </ol>
            {unanswered > 0 && (
              <p className="mt-2 text-amber-600 font-semibold">⚠ {unanswered} question{unanswered !== 1 ? "s" : ""} not yet answered.</p>
            )}
          </div>
        )}

        {/* All 15 questions — single section */}
        <div className="space-y-8">
          {questions.map((q, i) => {
            const selected = answers[i];
            const isCorrect = selected === q.correct.toString();
            return (
              <div key={i} className="break-inside-avoid">
                <div className="flex gap-3">
                  <span className="font-bold shrink-0 text-base">{i + 1}.</span>
                  <div className="flex-1">
                    <p className="mb-3 text-base leading-relaxed">{q.text}</p>
                    <RadioGroup
                      value={selected || ""}
                      onValueChange={(v) => !isSubmitted && setAnswers((prev) => ({ ...prev, [i]: v }))}
                      className="space-y-2 ml-2"
                    >
                      {q.options.map((opt, optIdx) => {
                        const isThisCorrect = optIdx === q.correct;
                        const isThisSelected = selected === optIdx.toString();
                        let rowStyle = "";
                        if (isSubmitted) {
                          if (isThisCorrect) rowStyle = "bg-green-50 border-l-4 border-green-500 rounded-r";
                          else if (isThisSelected && !isCorrect) rowStyle = "bg-red-50 border-l-4 border-red-400 rounded-r";
                        }
                        return (
                          <div key={optIdx} className={`flex items-center gap-2 px-2 py-1 transition-colors font-sans ${rowStyle}`}>
                            <RadioGroupItem value={optIdx.toString()} id={`q${i}-o${optIdx}`} disabled={isSubmitted} />
                            <Label htmlFor={`q${i}-o${optIdx}`} className={`cursor-pointer flex-1 font-normal text-sm ${isThisCorrect && isSubmitted ? "text-green-800 font-semibold" : ""}`}>
                              {String.fromCharCode(65 + optIdx)}. {opt}
                            </Label>
                            {isSubmitted && isThisCorrect && <span className="text-green-600 font-bold text-xs shrink-0">✓ CORRECT</span>}
                            {isSubmitted && isThisSelected && !isThisCorrect && <span className="text-red-500 font-bold text-xs shrink-0">✗ WRONG</span>}
                          </div>
                        );
                      })}
                    </RadioGroup>
                    {isSubmitted && !isCorrect && (
                      <p className="mt-2 ml-2 text-xs text-green-700 font-sans bg-green-50 border border-green-200 px-2 py-1 rounded">
                        ✓ Correct: <strong>{String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}</strong>
                      </p>
                    )}
                    {isSubmitted && !selected && (
                      <p className="mt-2 ml-2 text-xs text-gray-400 font-sans italic">
                        Not attempted — answer: {String.fromCharCode(65 + q.correct)}. {q.options[q.correct]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Submit / Exit */}
        <div className="text-center pt-10 print:hidden space-y-2">
          {!isSubmitted ? (
            <>
              <Button size="lg" className="px-16 py-6 text-xl rounded-none border-2 border-black font-bold uppercase hover:bg-black hover:text-white" onClick={handleSubmitClick}>
                SUBMIT EXAM
              </Button>
              {unanswered > 0 && <p className="text-sm text-gray-400 font-sans">{unanswered} question{unanswered !== 1 ? "s" : ""} unanswered</p>}
            </>
          ) : (
            <Button size="lg" className="px-16 py-6 text-xl rounded-none bg-black text-white hover:bg-gray-800 font-bold" onClick={onClose}>
              Exit to Dashboard
            </Button>
          )}
        </div>
      </div>

      {/* Results dialog */}
      <Dialog open={showResults} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md bg-white border-2 border-black rounded-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <DialogHeader className="border-b-2 border-black pb-4 mb-4">
            <DialogTitle className="text-2xl font-bold uppercase text-center font-serif">Examination Results</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4 font-sans">
            <div className="text-8xl font-bold mb-2 font-serif">{gradeLetter}</div>
            <div className="text-2xl font-bold mb-1">{score} / {TOTAL_MARKS}</div>
            <div className="text-xl mb-6 text-gray-600">({percentage}%)</div>
            <div className="w-full text-sm border border-gray-200 rounded p-4 mb-6 space-y-2 bg-gray-50">
              <p className="font-bold text-base mb-1">Score Breakdown:</p>
              <div className="flex justify-between"><span>Correct answers:</span><span className="font-bold">{correctCount} / {TOTAL_QUESTIONS}</span></div>
              <div className="flex justify-between border-t pt-2 mt-1 font-bold"><span>TOTAL SCORE:</span><span>{score} / {TOTAL_MARKS}</span></div>
              <p className="text-xs text-green-600 pt-1">✅ Score saved to your progress history.</p>
            </div>
            <div className="flex gap-4 w-full">
              <Button onClick={() => setShowResults(false)} variant="outline" className="flex-1 rounded-none border-black hover:bg-gray-100">Review Answers</Button>
              <Button onClick={onClose} className="flex-1 rounded-none bg-black text-white hover:bg-gray-800">Exit</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Incomplete warning */}
      <Dialog open={showIncompleteWarning} onOpenChange={setShowIncompleteWarning}>
        <DialogContent className="sm:max-w-sm bg-white border-2 border-amber-400 rounded-none">
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-amber-700 font-sans">
              <AlertTriangle className="w-5 h-5" />Incomplete Paper
            </DialogTitle>
          </DialogHeader>
          <div className="font-sans text-sm space-y-3">
            <p>You have <strong>{unanswered}</strong> unanswered question{unanswered !== 1 ? "s" : ""}.</p>
            <p className="text-gray-500 text-xs">For practice you may submit anyway — unanswered questions score 0.</p>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 font-sans" onClick={() => setShowIncompleteWarning(false)}>Go Back</Button>
              <Button className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-sans" onClick={doSubmit}>Submit Anyway</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

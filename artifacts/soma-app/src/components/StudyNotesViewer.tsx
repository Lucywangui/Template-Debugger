import { useEffect, useState } from "react";
import { Material } from "@/data/materials";
import { getStudyNotes, type StudyNote } from "@/data/studyNotes";
import { useSomaStore } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { X, BookOpen, ArrowLeft, GraduationCap } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface Props {
  material: Material;
  onBack: () => void;
  onClose: () => void;
  onTakeQuiz: () => void;
  takeQuizLabel?: string;
}

export function StudyNotesViewer({
  material,
  onBack,
  onClose,
  onTakeQuiz,
  takeQuizLabel = "I'm ready — take the quiz →",
}: Props) {
  const [notes, setNotes] = useState<StudyNote | null>(null);
  const [showAnswers, setShowAnswers] = useState(false);

  const completeStudyNotes = useSomaStore(
    (state) => state.completeStudyNotes
  );

  useEffect(() => {
    let alive = true;
    setNotes(null);

    getStudyNotes(material).then((n) => {
      if (alive) setNotes(n);
    });

    return () => {
      alive = false;
    };
  }, [material]);

  const handleTakeQuiz = () => {
    completeStudyNotes(material.id);
    onTakeQuiz();
  };

  if (!notes) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full gap-3 text-muted-foreground">
        <Spinner className="w-8 h-8" />
        <p className="text-sm">Loading notes…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full bg-card rounded-xl shadow-2xl overflow-hidden max-w-3xl mx-auto mt-4 mb-4 border">
      {/* Header */}
      <div
        className="text-white p-4 flex justify-between items-start gap-3"
        style={{
          background: "linear-gradient(90deg, #1a3a5c, #1e5799)",
        }}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold uppercase tracking-wider">
            <BookOpen className="h-3.5 w-3.5" /> Study Notes
          </div>

          <h2 className="font-bold text-xl text-white mt-1 leading-tight">
            {notes.subject}
          </h2>

          <div className="flex items-center gap-1.5 text-sm text-white/70 mt-1">
            <GraduationCap className="h-4 w-4" /> {notes.gradeLabel}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-white hover:bg-white/20 shrink-0"
        >
          <X className="h-6 w-6" />
        </Button>
      </div>

      <div className="p-6 sm:p-8 flex-1 flex flex-col gap-8">
        <p className="text-sm leading-relaxed rounded-lg border bg-muted/40 p-4 text-muted-foreground">
          <span className="font-semibold text-foreground">
            How to study this:{" "}
          </span>
          {notes.intro}
        </p>

        {notes.topics.map((topic, ti) => (
          <section key={ti} className="space-y-3">
            <h3 className="text-lg font-extrabold text-primary border-b pb-1">
              {topic.name}
            </h3>

            <div className="space-y-2">
              <h4 className="font-bold text-sm uppercase tracking-wide text-foreground/80">
                What this topic covers
              </h4>

              {topic.overview.map((p, pi) => (
                <p
                  key={pi}
                  className="text-[15px] leading-relaxed text-foreground/90"
                >
                  {p}
                </p>
              ))}
            </div>

            {topic.keyPoints.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-sm uppercase tracking-wide text-foreground/80">
                  Key points
                </h4>

                <ul className="list-disc pl-5 space-y-1 text-[15px] leading-relaxed text-foreground/90">
                  {topic.keyPoints.map((pt, pti) => (
                    <li key={pti}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}

            {topic.subtopics.length > 0 && (
              <div className="space-y-1">
                <h4 className="font-bold text-sm uppercase tracking-wide text-foreground/80">
                  Topics under {topic.name.toLowerCase()}
                </h4>

                <Accordion
                  type="single"
                  collapsible
                  className="border rounded-lg px-3"
                >
                  {topic.subtopics.map((st, si) => (
                    <AccordionItem
                      key={si}
                      value={`t${ti}-s${si}`}
                      className="last:border-b-0"
                    >
                      <AccordionTrigger className="text-[15px] font-semibold">
                        {st.name}
                      </AccordionTrigger>

                      <AccordionContent className="space-y-2">
                        {st.paragraphs.map((p, pi) => (
                          <p
                            key={pi}
                            className="text-[15px] leading-relaxed text-foreground/90"
                          >
                            {p}
                          </p>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}

            {topic.sources.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Source:{" "}
                {topic.sources.map((s, si) => (
                  <span key={si}>
                    {si > 0 && ", "}
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:text-foreground"
                    >
                      {s.title}
                    </a>{" "}
                    ({s.site})
                  </span>
                ))}
              </p>
            )}
          </section>
        ))}

        {/* Revision questions from the same generator that builds the quiz */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b pb-1">
            <h3 className="text-lg font-extrabold text-primary">
              Check yourself
            </h3>

            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => setShowAnswers((s) => !s)}
            >
              {showAnswers ? "Hide answers" : "Show answers"}
            </Button>
          </div>

          <ol className="space-y-3">
            {notes.practice.map((item, i) => (
              <li key={i} className="text-[15px] leading-relaxed">
                <span className="font-semibold">
                  {i + 1}. {item.q}
                </span>

                {showAnswers && (
                  <span className="block text-green-700 mt-0.5">
                    ✓ {item.a}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </section>

        {notes.sources.length > 0 && (
          <section className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Sources &amp; licence
            </h3>

            <p className="text-xs text-muted-foreground leading-relaxed">
              The overview and sub-topic text on this page is adapted from the
              following open resources and used under{" "}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                CC BY-SA 4.0
              </a>
              . These notes are shared under the same licence.
            </p>

            <ul className="text-xs text-muted-foreground space-y-0.5">
              {notes.sources.map((s, i) => (
                <li key={i}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    {s.title}
                  </a>
                  {" — "}
                  {s.site}, {s.license}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t p-4 flex flex-col sm:flex-row gap-3 sm:justify-between bg-muted/20">
        <Button
          variant="outline"
          onClick={onBack}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        <Button
          onClick={handleTakeQuiz}
          className="font-bold text-white border-0"
          style={{ background: "#e67e22" }}
        >
          {takeQuizLabel}
        </Button>
      </div>
    </div>
  );
}
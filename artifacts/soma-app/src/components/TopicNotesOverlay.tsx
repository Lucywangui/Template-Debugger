import { Material } from "@/data/materials";
import { StudyNotesViewer } from "./StudyNotesViewer";

interface Props {
  material: Material;
  /** Close the overlay and return to the quiz (state is preserved underneath). */
  onClose: () => void;
}

/**
 * A full-screen study-notes overlay shown from inside a quiz when a learner
 * wants to read more about a topic they got wrong. The quiz stays mounted
 * beneath it, so closing returns exactly where they were.
 */
export function TopicNotesOverlay({ material, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[9999] bg-white text-black overflow-y-auto">
      <StudyNotesViewer
        material={material}
        onBack={onClose}
        onClose={onClose}
        onTakeQuiz={onClose}
        takeQuizLabel="← Back to the quiz"
      />
    </div>
  );
}

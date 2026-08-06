import { Material } from "@/data/materials";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { TopicalViewer } from "./TopicalViewer";
import { ExamViewer } from "./ExamViewer";
import { MATERIALS } from "@/data/materials";

interface Props {
  materialId: string;
  onClose: () => void;
}

export function ViewerModal({ materialId, onClose }: Props) {
  const material = MATERIALS.find(m => m.id === materialId);
  
  if (!material) return null;

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[95vw] w-full h-[95vh] p-0 border-0 overflow-hidden flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="flex-1 overflow-y-auto w-full h-full relative">
          <div className="absolute top-4 right-4 z-50">
             {/* The standard close button is hidden by default in shadcn if we pass a custom one or just don't use DialogClose. We'll rely on the one inside the viewers or esc key */}
          </div>
          {material.type === "topical" ? (
            <TopicalViewer material={material} onClose={onClose} />
          ) : (
            <ExamViewer material={material} onClose={onClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

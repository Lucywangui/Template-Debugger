import { useSomaStore } from "@/lib/storage";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const EARN_WAYS = [
  { icon: "📝", label: "Finish a topical quiz", value: "+15 coins" },
  { icon: "📋", label: "Sit an exam paper", value: "+25 coins" },
  { icon: "💯", label: "Score 100%", value: "+10 bonus" },
  { icon: "🔥", label: "Every 7-day streak", value: "+40 bonus" },
];

export function AddFundsModal({ isOpen, onClose }: Props) {
  const { wallet, addFunds } = useSomaStore();
  const { toast } = useToast();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="p-0 overflow-hidden border-0 max-w-sm rounded-3xl">
        <div className="px-6 pt-6 pb-5 text-white text-center" style={{ background: "linear-gradient(135deg, #1a3a5c, #1e5799)" }}>
          <div className="text-5xl mb-2">🪙</div>
          <h2 className="text-2xl font-extrabold">SOMA Coins</h2>
          <p className="text-4xl font-extrabold mt-2">{wallet}</p>
          <p className="text-sm opacity-80 mt-1">Earned by learning — spent on opening materials</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <p className="font-bold text-sm text-foreground mb-2">How to earn more</p>
            <div className="space-y-2">
              {EARN_WAYS.map((w) => (
                <div key={w.label} className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
                  <span className="text-xl">{w.icon}</span>
                  <span className="text-sm flex-1">{w.label}</span>
                  <span className="text-sm font-bold text-primary">{w.value}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Every material costs just 5 coins — keep learning and you'll never run out.
          </p>

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Done</Button>
            <Button
              variant="ghost"
              className="rounded-xl text-xs text-muted-foreground"
              onClick={() => { addFunds(100, "Bonus coins"); toast({ title: "🪙 +100 coins" }); onClose(); }}
            >
              +100 (test)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

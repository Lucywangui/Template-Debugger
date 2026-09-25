import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface UnlockPrompt {
  materialId: string;
  title: string;
  coins: number;
  price: number;
  ksh: number;
  kshNeeded: number;
  canPayWithKsh: boolean;
}

interface Props {
  prompt: UnlockPrompt | null;
  busy: boolean;
  onPayWithKsh: () => void;
  onTopUp: () => void;
  onCancel: () => void;
}

/** Asks before any KSh is spent on an unlock. */
export function UnlockDialog({ prompt, busy, onPayWithKsh, onTopUp, onCancel }: Props) {
  return (
    <Dialog open={prompt !== null} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-sm rounded-3xl">
        {prompt && (
          <div className="space-y-4 text-center">
            <div className="text-4xl">🔒</div>
            <div>
              <h2 className="text-lg font-extrabold">{prompt.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Unlocking costs {prompt.price} coins. You have {prompt.coins}.
              </p>
            </div>

            {prompt.canPayWithKsh ? (
              <p className="text-sm">
                KSh {prompt.kshNeeded} will come from your M-Pesa wallet
                (balance KSh {prompt.ksh}).
              </p>
            ) : (
              <p className="text-sm">
                Top up your M-Pesa wallet or finish a quiz to earn more coins.
              </p>
            )}

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>
                Cancel
              </Button>
              {prompt.canPayWithKsh ? (
                <Button
                  className="flex-1 rounded-xl text-white"
                  style={{ background: "#25D366" }}
                  disabled={busy}
                  onClick={onPayWithKsh}
                >
                  {busy ? "Unlocking…" : `Pay KSh ${prompt.kshNeeded}`}
                </Button>
              ) : (
                <Button className="flex-1 rounded-xl" onClick={onTopUp}>
                  Top up
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

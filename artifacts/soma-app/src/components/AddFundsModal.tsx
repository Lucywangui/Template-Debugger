import { useEffect, useRef, useState } from "react";
import { useSomaStore } from "@/lib/storage";
import { ApiError } from "@/lib/api";
import { buyCoins, grantDevCoins, syncAccount } from "@/lib/account";
import {
  MAX_TOPUP_AMOUNT,
  MIN_TOPUP_AMOUNT,
  isValidTopUpAmount,
  pollPaymentStatus,
  simulateTestPayment,
  startTopUp,
} from "@/lib/payments";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

const QUICK_AMOUNTS = [20, 50, 100, 200];

const COIN_PACKS = [20, 50, 100];

const PHONE_STORAGE_KEY = "soma_mpesa_phone";

type Step =
  | { name: "overview" }
  | { name: "form" }
  | { name: "waiting"; sessionId: string; amount: number }
  | { name: "success"; amount: number; balance: number }
  | { name: "failed"; message: string }
  | { name: "timeout" };

const FAILURE_MESSAGES = {
  failed: "The payment was cancelled or didn't go through. No money was taken.",
  expired: "The payment request expired before it was completed.",
};

function loadSavedPhone(): string {
  try {
    return localStorage.getItem(PHONE_STORAGE_KEY) ?? "";
  } catch {
    return "";
  }
}

function savePhone(phone: string) {
  try {
    localStorage.setItem(PHONE_STORAGE_KEY, phone);
  } catch {
    // Remembering the number is only a convenience.
  }
}

const formatKsh = (amount: number) => `KSh ${amount.toLocaleString()}`;

export function AddFundsModal({ isOpen, onClose }: Props) {
  const { wallet, ksh: balance, prices } = useSomaStore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>({ name: "overview" });
  const [buyingPack, setBuyingPack] = useState<number | null>(null);
  const [phone, setPhone] = useState(loadSavedPhone);
  const [amount, setAmount] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pollAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    syncAccount().catch(() => {
      // Keep showing the last known balances.
    });
  }, [isOpen]);

  useEffect(() => () => pollAbort.current?.abort(), []);

  const handleClose = () => {
    pollAbort.current?.abort();
    setStep({ name: "overview" });
    setFormError(null);
    setIsSubmitting(false);
    onClose();
  };

  const waitForPayment = async (sessionId: string, paidAmount: number) => {
    pollAbort.current?.abort();
    const controller = new AbortController();
    pollAbort.current = controller;

    const outcome = await pollPaymentStatus(sessionId, { signal: controller.signal });

    if (outcome.status === "aborted") return;

    if (outcome.status === "completed") {
      void syncAccount().catch(() => {});
      setStep({ name: "success", amount: paidAmount, balance: outcome.walletBalance });
      toast({ title: `✅ ${formatKsh(paidAmount)} added to your wallet` });
    } else if (outcome.status === "timeout") {
      setStep({ name: "timeout" });
    } else {
      setStep({ name: "failed", message: FAILURE_MESSAGES[outcome.status] });
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const numericAmount = Number(amount);

    if (!isValidTopUpAmount(numericAmount)) {
      setFormError(
        `Enter a whole amount between ${formatKsh(MIN_TOPUP_AMOUNT)} and ${formatKsh(MAX_TOPUP_AMOUNT)}.`,
      );
      return;
    }

    if (!phone.trim()) {
      setFormError("Enter the M-Pesa phone number to charge.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const { sessionId } = await startTopUp(phone.trim(), numericAmount);
      savePhone(phone.trim());
      setStep({ name: "waiting", sessionId, amount: numericAmount });
      void waitForPayment(sessionId, numericAmount);
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyCoins = async (coins: number) => {
    setBuyingPack(coins);
    try {
      await buyCoins(coins);
      toast({ title: `🪙 +${coins} coins` });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't buy coins",
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setBuyingPack(null);
    }
  };

  const handleDevCoins = async () => {
    try {
      await grantDevCoins();
      toast({ title: "🪙 +100 coins" });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Couldn't add test coins",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  const handleSimulate = async (sessionId: string) => {
    try {
      await simulateTestPayment(sessionId);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Simulation failed",
        description: error instanceof Error ? error.message : undefined,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="p-0 overflow-hidden border-0 max-w-sm rounded-3xl">
        {step.name === "overview" && (
          <>
            <div className="px-6 pt-6 pb-5 text-white text-center" style={{ background: "linear-gradient(135deg, #1a3a5c, #1e5799)" }}>
              <div className="text-5xl mb-2">🪙</div>
              <h2 className="text-2xl font-extrabold">SOMA Coins</h2>
              <p className="text-4xl font-extrabold mt-2">{wallet}</p>
              <p className="text-sm opacity-80 mt-1">Earned by learning — spent on opening materials</p>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="flex items-center justify-between rounded-xl border px-3 py-3">
                <div>
                  <p className="text-xs text-muted-foreground">M-Pesa wallet</p>
                  <p className="font-extrabold">
                    {balance === null ? "—" : formatKsh(balance)}
                  </p>
                </div>
                <Button
                  className="rounded-xl text-white"
                  style={{ background: "#25D366" }}
                  onClick={() => setStep({ name: "form" })}
                >
                  Top up with M-Pesa
                </Button>
              </div>

              <div>
                <p className="font-bold text-sm text-foreground mb-2">Buy coins</p>
                <div className="grid grid-cols-3 gap-2">
                  {COIN_PACKS.map((coins) => {
                    const cost = coins * prices.kshPerCoin;
                    return (
                      <Button
                        key={coins}
                        variant="outline"
                        className="h-auto flex-col rounded-xl py-2"
                        disabled={buyingPack !== null || balance === null || balance < cost}
                        onClick={() => handleBuyCoins(coins)}
                      >
                        <span className="font-extrabold">🪙 {coins}</span>
                        <span className="text-xs text-muted-foreground">
                          {buyingPack === coins ? "Buying…" : formatKsh(cost)}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>

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
                Every material costs just {prices.materialCoins} coins — keep learning and you'll never run out.
              </p>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={handleClose}>Done</Button>
                {import.meta.env.DEV && (
                  <Button
                    variant="ghost"
                    className="rounded-xl text-xs text-muted-foreground"
                    onClick={handleDevCoins}
                  >
                    +100 (dev)
                  </Button>
                )}
              </div>
            </div>
          </>
        )}

        {step.name !== "overview" && (
          <div className="px-6 pt-6 pb-5 text-white text-center" style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}>
            <div className="text-5xl mb-2">📱</div>
            <h2 className="text-2xl font-extrabold">M-Pesa Top Up</h2>
            <p className="text-sm opacity-80 mt-1">
              Wallet balance: {balance === null ? "—" : formatKsh(balance)}
            </p>
          </div>
        )}

        {step.name === "form" && (
          <form className="px-6 py-5 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label htmlFor="mpesa-phone" className="text-sm font-bold">M-Pesa phone number</label>
              <Input
                id="mpesa-phone"
                type="tel"
                inputMode="tel"
                placeholder="0712 345 678"
                value={phone}
                onChange={(e) => { setPhone(e.target.value); setFormError(null); }}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="mpesa-amount" className="text-sm font-bold">Amount (KSh)</label>
              <div className="grid grid-cols-4 gap-2">
                {QUICK_AMOUNTS.map((quick) => (
                  <Button
                    key={quick}
                    type="button"
                    variant="outline"
                    aria-pressed={amount === String(quick)}
                    className={
                      amount === String(quick)
                        ? "rounded-xl border-[#25D366] bg-[#25D366]/15 font-bold"
                        : "rounded-xl"
                    }
                    onClick={() => { setAmount(String(quick)); setFormError(null); }}
                  >
                    {quick}
                  </Button>
                ))}
              </div>
              <Input
                id="mpesa-amount"
                type="number"
                inputMode="numeric"
                min={MIN_TOPUP_AMOUNT}
                max={MAX_TOPUP_AMOUNT}
                step={1}
                placeholder="Or enter an amount"
                value={amount}
                onChange={(e) => { setAmount(e.target.value); setFormError(null); }}
                className="rounded-xl"
              />
            </div>

            {formError && (
              <p role="alert" className="text-sm text-destructive">{formError}</p>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => { setFormError(null); setStep({ name: "overview" }); }}
              >
                Back
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 rounded-xl text-white"
                style={{ background: "#25D366" }}
              >
                {isSubmitting ? "Sending…" : "Pay"}
              </Button>
            </div>
          </form>
        )}

        {step.name === "waiting" && (
          <div className="px-6 py-6 space-y-4 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-[#25D366]" />
            <div>
              <p className="font-bold">Check your phone</p>
              <p className="text-sm text-muted-foreground mt-1">
                Enter your M-Pesa PIN to pay {formatKsh(step.amount)}. We'll update your wallet as soon as it goes through.
              </p>
            </div>
            {import.meta.env.DEV && (
              <Button
                variant="ghost"
                className="rounded-xl text-xs text-muted-foreground"
                onClick={() => handleSimulate(step.sessionId)}
              >
                Simulate success (dev)
              </Button>
            )}
            <Button variant="outline" className="w-full rounded-xl" onClick={handleClose}>
              Close
            </Button>
          </div>
        )}

        {step.name === "success" && (
          <div className="px-6 py-6 space-y-4 text-center">
            <div className="text-4xl">✅</div>
            <div>
              <p className="font-bold">{formatKsh(step.amount)} added</p>
              <p className="text-sm text-muted-foreground mt-1">
                Your wallet balance is now {formatKsh(step.balance)}.
              </p>
            </div>
            <Button className="w-full rounded-xl" onClick={handleClose}>Done</Button>
          </div>
        )}

        {step.name === "failed" && (
          <div className="px-6 py-6 space-y-4 text-center">
            <div className="text-4xl">⚠️</div>
            <p className="text-sm text-muted-foreground">{step.message}</p>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={handleClose}>Close</Button>
              <Button className="flex-1 rounded-xl" onClick={() => setStep({ name: "form" })}>Try again</Button>
            </div>
          </div>
        )}

        {step.name === "timeout" && (
          <div className="px-6 py-6 space-y-4 text-center">
            <div className="text-4xl">⏳</div>
            <p className="text-sm text-muted-foreground">
              We haven't heard back from M-Pesa yet. If you completed the payment, your wallet will update shortly.
            </p>
            <Button className="w-full rounded-xl" onClick={handleClose}>Done</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

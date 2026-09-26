import { useEffect, useState } from "react";
import { useSomaStore } from "@/lib/storage";
import {
  buyCoins,
  grantDevCoins,
  subscribeFromWallet,
  syncAccount,
} from "@/lib/account";
import { formatExpiry } from "@/lib/subscription";
import { gradeShortName } from "@/data/grade";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MpesaPayFlow, formatKsh, type PaymentCompleted } from "@/components/MpesaPayFlow";
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

const COIN_PACKS = [20, 50, 100];

type Step =
  | { name: "overview" }
  | { name: "top-up" }
  | { name: "subscribe-pay"; amount: number }
  | { name: "topped-up"; amount: number; balance: number }
  | { name: "subscribed" }
  | { name: "subscribe-failed"; amount: number; reason: string };

export function AddFundsModal({ isOpen, onClose }: Props) {
  const { wallet, ksh: balance, prices, subscription, grade } = useSomaStore();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>({ name: "overview" });
  const [buyingPack, setBuyingPack] = useState<number | null>(null);
  const [isSubscribing, setIsSubscribing] = useState(false);

  const gradeKey = subscription?.active ? subscription.gradeKey : grade;
  const gradeLabel = gradeKey ? gradeShortName(gradeKey) : "your grade";

  useEffect(() => {
    if (!isOpen) return;

    syncAccount().catch(() => {
      // Keep showing the last known balances.
    });
  }, [isOpen]);

  const handleClose = () => {
    setStep({ name: "overview" });
    onClose();
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

  /** Pays from the wallet if it can; otherwise M-Pesa covers the rest. */
  const handleSubscribe = async () => {
    const shortfall = prices.subscriptionKsh - (balance ?? 0);

    if (shortfall > 0) {
      setStep({ name: "subscribe-pay", amount: shortfall });
      return;
    }

    setIsSubscribing(true);
    const result = await subscribeFromWallet();
    setIsSubscribing(false);

    if (result.status === "subscribed") {
      setStep({ name: "subscribed" });
    } else if (result.status === "short") {
      setStep({ name: "subscribe-pay", amount: result.kshNeeded });
    } else {
      toast({ variant: "destructive", title: "Couldn't subscribe", description: result.message });
    }
  };

  const handleTopUpCompleted = ({ amount, walletBalance }: PaymentCompleted) => {
    void syncAccount().catch(() => {});
    setStep({ name: "topped-up", amount, balance: walletBalance });
    toast({ title: `✅ ${formatKsh(amount)} added to your wallet` });
  };

  const handleSubscribePaid = async ({ amount, purposeResult }: PaymentCompleted) => {
    await syncAccount().catch(() => {});

    if (purposeResult === "done") {
      setStep({ name: "subscribed" });
    } else {
      setStep({
        name: "subscribe-failed",
        amount,
        reason: purposeResult?.replace(/^failed:\s*/, "") ?? "unknown error",
      });
    }
  };

  const mpesaHeader = (title: string) => (
    <div className="px-6 pt-6 pb-5 text-white text-center" style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}>
      <div className="text-5xl mb-2">📱</div>
      <h2 className="text-2xl font-extrabold">{title}</h2>
      <p className="text-sm opacity-80 mt-1">
        Wallet balance: {balance === null ? "—" : formatKsh(balance)}
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="p-0 overflow-hidden border-0 max-w-sm rounded-3xl max-h-[90vh] overflow-y-auto">
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
                  onClick={() => setStep({ name: "top-up" })}
                >
                  Top up with M-Pesa
                </Button>
              </div>

              <div className="rounded-xl border px-3 py-3 space-y-2" data-testid="subscription-card">
                <div>
                  <p className="text-xs text-muted-foreground">Subscription</p>
                  {subscription?.active ? (
                    <p className="font-extrabold">
                      All {gradeLabel} materials · until {formatExpiry(subscription.expiresAt)}
                    </p>
                  ) : (
                    <p className="font-extrabold">
                      All {gradeLabel} materials for {prices.subscriptionDays} days
                    </p>
                  )}
                </div>
                <Button
                  variant={subscription?.active ? "outline" : "default"}
                  className="w-full rounded-xl"
                  disabled={isSubscribing || balance === null}
                  onClick={handleSubscribe}
                >
                  {isSubscribing
                    ? "Subscribing…"
                    : `${subscription?.active ? "Renew" : "Subscribe"} · ${formatKsh(prices.subscriptionKsh)}`}
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

        {step.name === "top-up" && (
          <>
            {mpesaHeader("M-Pesa Top Up")}
            <MpesaPayFlow
              onBack={() => setStep({ name: "overview" })}
              onCompleted={handleTopUpCompleted}
              onClose={handleClose}
            />
          </>
        )}

        {step.name === "subscribe-pay" && (
          <>
            {mpesaHeader("Subscribe")}
            <MpesaPayFlow
              fixedAmount={step.amount}
              purpose="subscribe"
              description={
                (balance ?? 0) > 0
                  ? `${formatKsh(balance ?? 0)} from your wallet plus ${formatKsh(step.amount)} by M-Pesa pays for ${prices.subscriptionDays} days of all ${gradeLabel} materials.`
                  : `${formatKsh(step.amount)} for ${prices.subscriptionDays} days of all ${gradeLabel} materials.`
              }
              onBack={() => setStep({ name: "overview" })}
              onCompleted={handleSubscribePaid}
              onClose={handleClose}
            />
          </>
        )}

        {step.name === "topped-up" && (
          <>
            {mpesaHeader("M-Pesa Top Up")}
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
          </>
        )}

        {step.name === "subscribed" && (
          <>
            {mpesaHeader("Subscribed")}
            <div className="px-6 py-6 space-y-4 text-center">
              <div className="text-4xl">🎉</div>
              <div>
                <p className="font-bold">All {gradeLabel} materials are open</p>
                {subscription && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Until {formatExpiry(subscription.expiresAt)}.
                  </p>
                )}
              </div>
              <Button className="w-full rounded-xl" onClick={handleClose}>Start learning</Button>
            </div>
          </>
        )}

        {step.name === "subscribe-failed" && (
          <>
            {mpesaHeader("Subscribe")}
            <div className="px-6 py-6 space-y-4 text-center">
              <div className="text-4xl">⚠️</div>
              <p className="text-sm text-muted-foreground">
                {formatKsh(step.amount)} was added to your wallet, but the subscription didn't start ({step.reason}).
                Your money is safe in your wallet.
              </p>
              <Button className="w-full rounded-xl" onClick={() => setStep({ name: "overview" })}>
                Back to wallet
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

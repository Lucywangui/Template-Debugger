import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSomaStore } from "@/lib/storage";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Copy, CheckCircle2, FlaskConical } from "lucide-react";

const TILL_NUMBER = "9354938";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const TEST_AMOUNTS = [5, 20, 50, 100];

export function AddFundsModal({ isOpen, onClose }: Props) {
  const { addFunds } = useSomaStore();
  const { toast } = useToast();

  const [step, setStep] = useState<"choose" | "mpesa" | "confirm">("choose");
  const [amount, setAmount] = useState("");
  const [mpesaCode, setMpesaCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const reset = () => {
    setStep("choose");
    setAmount("");
    setMpesaCode("");
    setIsLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCopyTill = () => {
    navigator.clipboard.writeText(TILL_NUMBER).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTestAdd = (amt: number) => {
    setIsLoading(true);
    setTimeout(() => {
      addFunds(amt, "Test Top-Up");
      setIsLoading(false);
      toast({
        title: `✅ KSh ${amt} added!`,
        description: "Test funds added to your wallet.",
      });
      reset();
      onClose();
    }, 700);
  };

  const handleConfirmMpesa = () => {
    const num = parseInt(amount, 10);
    if (isNaN(num) || num < 5) {
      toast({ variant: "destructive", title: "Invalid amount", description: "Minimum top-up is KSh 5." });
      return;
    }
    if (!mpesaCode.trim() || mpesaCode.trim().length < 8) {
      toast({ variant: "destructive", title: "Enter your M-Pesa code", description: "The confirmation code from your M-Pesa SMS." });
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      addFunds(num, `M-Pesa ${mpesaCode.trim().toUpperCase()}`);
      setIsLoading(false);
      toast({ title: "✅ Wallet Topped Up!", description: `KSh ${num} added to your wallet.` });
      reset();
      onClose();
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="p-0 overflow-hidden border-0 max-w-sm rounded-3xl">
        {/* Header */}
        <div
          className="px-6 pt-6 pb-5 text-white text-center"
          style={{ background: "linear-gradient(135deg, #128C7E, #25D366)" }}
        >
          <div className="text-5xl mb-2">💰</div>
          <h2 className="text-2xl font-extrabold">Top Up Wallet</h2>
          <p className="text-sm opacity-80 mt-1">Choose how to add funds</p>
        </div>

        <div className="px-6 py-5 space-y-4">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Choose method ── */}
            {step === "choose" && (
              <motion.div
                key="choose"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                className="space-y-3"
              >
                {/* Real M-Pesa */}
                <button
                  className="w-full flex items-center gap-4 rounded-2xl p-4 text-left border-2 transition-all hover:scale-[1.02]"
                  style={{ borderColor: "#25D366", background: "#f0fff4" }}
                  onClick={() => setStep("mpesa")}
                >
                  <div className="text-3xl">📱</div>
                  <div>
                    <p className="font-extrabold text-gray-800">Pay via M-Pesa</p>
                    <p className="text-xs text-gray-500 mt-0.5">Till No. {TILL_NUMBER} · min KSh 5</p>
                  </div>
                  <span className="ml-auto text-xl">→</span>
                </button>

                {/* Test / Demo mode */}
                <div
                  className="rounded-2xl border-2 border-dashed p-4"
                  style={{ borderColor: "#e67e22", background: "#fff9f4" }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <FlaskConical className="w-4 h-4" style={{ color: "#e67e22" }} />
                    <p className="font-extrabold text-sm" style={{ color: "#e67e22" }}>
                      Testing / Demo Mode
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">
                    Add funds instantly without real money — for testing the app only.
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {TEST_AMOUNTS.map((amt) => (
                      <button
                        key={amt}
                        disabled={isLoading}
                        className="rounded-xl py-2 text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                        style={{ background: "linear-gradient(135deg, #e67e22, #d35400)" }}
                        onClick={() => handleTestAdd(amt)}
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2: M-Pesa instructions ── */}
            {step === "mpesa" && (
              <motion.div
                key="mpesa"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                {/* Till number */}
                <div
                  className="rounded-2xl p-4 text-center border-2"
                  style={{ borderColor: "#25D366", background: "#f0fff4" }}
                >
                  <p className="text-xs font-semibold text-gray-500 mb-1">M-Pesa Buy Goods Till</p>
                  <p className="text-4xl font-extrabold tracking-widest" style={{ color: "#128C7E" }}>
                    {TILL_NUMBER}
                  </p>
                  <p className="text-xs font-bold text-gray-500 mt-1">SOMA APP</p>
                  <button
                    className="mt-3 flex items-center gap-1.5 mx-auto text-sm font-semibold px-4 py-1.5 rounded-full transition-colors"
                    style={{ background: copied ? "#25D366" : "#e8f5e9", color: copied ? "#fff" : "#128C7E" }}
                    onClick={handleCopyTill}
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? "Copied!" : "Copy Till Number"}
                  </button>
                </div>

                {/* Steps */}
                <div className="rounded-2xl bg-gray-50 p-4 space-y-2.5">
                  <p className="font-bold text-sm text-gray-700 mb-2">How to pay:</p>
                  {[
                    "Open M-Pesa on your phone",
                    "Select Lipa na M-Pesa → Buy Goods",
                    `Enter Till: ${TILL_NUMBER}`,
                    "Enter amount (min KSh 5)",
                    "Enter your M-Pesa PIN to confirm",
                    "Come back here and tap confirm below",
                  ].map((s, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <span
                        className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 mt-0.5"
                        style={{ background: "#128C7E" }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-gray-600">{s}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full py-6 text-base font-bold rounded-2xl border-0"
                  style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", color: "#fff" }}
                  onClick={() => setStep("confirm")}
                >
                  I've Paid — Enter Code →
                </Button>
                <button
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
                  onClick={() => setStep("choose")}
                >
                  ← Back
                </button>
              </motion.div>
            )}

            {/* ── STEP 3: Enter M-Pesa code ── */}
            {step === "confirm" && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div
                  className="rounded-2xl p-3 flex items-center gap-3"
                  style={{ background: "#f0fff4", border: "1px solid #25D366" }}
                >
                  <span className="text-2xl">✅</span>
                  <p className="text-sm text-gray-600">
                    Great! Enter the details from your M-Pesa confirmation SMS.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Amount Paid (KSh)</label>
                  <Input
                    type="number"
                    min="5"
                    placeholder="e.g. 50"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-lg py-6 rounded-xl border-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">
                    M-Pesa Confirmation Code
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. SMA1X2Y3Z4"
                    value={mpesaCode}
                    onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                    className="text-lg py-6 rounded-xl border-2 font-mono"
                    maxLength={12}
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    10-character code in your M-Pesa SMS e.g. <span className="font-mono">SMA1X2Y3Z4</span>
                  </p>
                </div>

                <Button
                  className="w-full py-6 text-base font-bold rounded-2xl border-0"
                  style={{
                    background: isLoading ? "#ccc" : "linear-gradient(135deg, #128C7E, #25D366)",
                    color: "#fff",
                  }}
                  disabled={isLoading}
                  onClick={handleConfirmMpesa}
                  data-testid="btn-confirm-payment"
                >
                  {isLoading ? "Adding to wallet…" : "ADD TO WALLET ✓"}
                </Button>
                <button
                  className="w-full text-center text-sm text-gray-400 hover:text-gray-600"
                  onClick={() => setStep("mpesa")}
                >
                  ← Back to payment steps
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}

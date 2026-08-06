import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSomaStore } from "@/lib/storage";
import { Button } from "@/components/ui/button";

type Tab = "girl" | "boy" | "animal";

interface AvatarOption {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  anim: "bounce" | "wave" | "float";
}

const GIRL_AVATARS: AvatarOption[] = [
  { id: "g1", emoji: "👧🏻", name: "Lily", desc: "Sweet & smart ⭐", anim: "bounce" },
  { id: "g2", emoji: "👧🏽", name: "Amina", desc: "Bright star 🌟", anim: "wave" },
  { id: "g3", emoji: "👧🏿", name: "Zawadi", desc: "Gift to all 🎁", anim: "float" },
  { id: "g4", emoji: "👩🏻‍🎓", name: "Scholar", desc: "Top of class 📚", anim: "bounce" },
  { id: "g5", emoji: "👩🏽‍🎓", name: "Queen", desc: "Always winning 👑", anim: "wave" },
  { id: "g6", emoji: "👩🏿‍🎓", name: "Genius", desc: "Unstoppable 🔥", anim: "float" },
  { id: "g7", emoji: "🧒🏼", name: "Smarty", desc: "Quick thinker ⚡", anim: "bounce" },
  { id: "g8", emoji: "👩🏾‍🏫", name: "Teach", desc: "Born leader 🎓", anim: "wave" },
];

const BOY_AVATARS: AvatarOption[] = [
  { id: "b1", emoji: "👦🏻", name: "Jake", desc: "Quick learner ⚡", anim: "bounce" },
  { id: "b2", emoji: "👦🏽", name: "Kofi", desc: "Bold & brave 💪", anim: "wave" },
  { id: "b3", emoji: "👦🏿", name: "Amani", desc: "Champion 🏆", anim: "float" },
  { id: "b4", emoji: "👨🏻‍🎓", name: "Scholar", desc: "Book lover 📖", anim: "bounce" },
  { id: "b5", emoji: "👨🏽‍🎓", name: "Brainiac", desc: "Top marks 🥇", anim: "wave" },
  { id: "b6", emoji: "👨🏿‍🎓", name: "Genius", desc: "Unstoppable 🔥", anim: "float" },
  { id: "b7", emoji: "🧒🏾", name: "Champ", desc: "Never gives up 💯", anim: "bounce" },
  { id: "b8", emoji: "👨🏿‍🏫", name: "Prof", desc: "Born teacher 🎓", anim: "wave" },
];

const ANIMAL_AVATARS: AvatarOption[] = [
  { id: "a1", emoji: "🦁", name: "Leo", desc: "Brave & bold", anim: "bounce" },
  { id: "a2", emoji: "🐯", name: "Tiger", desc: "Fast learner", anim: "wave" },
  { id: "a3", emoji: "🐘", name: "Ellie", desc: "Never forgets", anim: "float" },
  { id: "a4", emoji: "🦊", name: "Foxy", desc: "Clever & quick", anim: "bounce" },
  { id: "a5", emoji: "🐼", name: "Panda", desc: "Cool & calm", anim: "wave" },
  { id: "a6", emoji: "🦋", name: "Bella", desc: "Free & creative", anim: "float" },
  { id: "a7", emoji: "🦄", name: "Luna", desc: "Magical mind ✨", anim: "bounce" },
  { id: "a8", emoji: "🐸", name: "Hoppy", desc: "Always jumping", anim: "wave" },
  { id: "a9", emoji: "🦅", name: "Eagle", desc: "Sharp eyes 👁️", anim: "float" },
  { id: "a10", emoji: "🐬", name: "Delphi", desc: "Smart & playful", anim: "bounce" },
  { id: "a11", emoji: "🦉", name: "Prof Owl", desc: "Very wise 🦉", anim: "wave" },
  { id: "a12", emoji: "🦒", name: "Gigi", desc: "Sees far ahead", anim: "float" },
];

const ALL_AVATARS = [...GIRL_AVATARS, ...BOY_AVATARS, ...ANIMAL_AVATARS];

function animProps(anim: AvatarOption["anim"], active: boolean) {
  if (!active) return {};
  if (anim === "bounce") return { animate: { y: [0, -10, 0] }, transition: { duration: 0.8, repeat: Infinity, repeatDelay: 1.2 } };
  if (anim === "wave") return { animate: { rotate: [0, -14, 14, -14, 0] }, transition: { duration: 0.9, repeat: Infinity, repeatDelay: 1.8 } };
  return { animate: { y: [0, -7, 0], scale: [1, 1.08, 1] }, transition: { duration: 2, repeat: Infinity } };
}

const TABS: { id: Tab; label: string; emoji: string }[] = [
  { id: "girl", label: "Girls", emoji: "👧🏽" },
  { id: "boy", label: "Boys", emoji: "👦🏽" },
  { id: "animal", label: "Animals", emoji: "🦁" },
];

interface Props {
  onNext: () => void;
}

export function AvatarPage({ onNext }: Props) {
  const { setAvatar, name } = useSomaStore();
  const [tab, setTab] = useState<Tab>("girl");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const displayAvatars =
    tab === "girl" ? GIRL_AVATARS : tab === "boy" ? BOY_AVATARS : ANIMAL_AVATARS;

  const handleSelect = () => {
    if (!selectedId) return;
    const avatar = ALL_AVATARS.find((a) => a.id === selectedId);
    if (avatar) {
      setAvatar(avatar.emoji);
      onNext();
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center pb-36 px-4 pt-8"
      style={{ background: "linear-gradient(135deg, #0d2137 0%, #1a3a5c 50%, #1e4d7b 100%)" }}
    >
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-white mb-2">
            {name ? `Hi ${name}!` : "Pick Your Avatar!"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15 }}>
            Choose the buddy that represents you best
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.08)" }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedId(null); }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={{
                background: tab === t.id ? "#e67e22" : "transparent",
                color: tab === t.id ? "#fff" : "rgba(255,255,255,0.5)",
              }}
            >
              <span className="text-lg leading-none">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Avatar grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {displayAvatars.map((avatar, i) => {
              const isSelected = selectedId === avatar.id;
              const ap = animProps(avatar.anim, isSelected);
              return (
                <motion.button
                  key={avatar.id}
                  onClick={() => setSelectedId(avatar.id)}
                  className="rounded-3xl p-4 flex flex-col items-center text-center transition-all"
                  style={{
                    background: isSelected ? "rgba(230,126,34,0.2)" : "rgba(255,255,255,0.06)",
                    border: isSelected ? "2px solid #e67e22" : "1px solid rgba(255,255,255,0.12)",
                    boxShadow: isSelected ? "0 0 22px rgba(230,126,34,0.3)" : "none",
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  data-testid={`avatar-${avatar.id}`}
                >
                  <motion.div
                    className="text-5xl mb-2 select-none"
                    {...ap}
                  >
                    {avatar.emoji}
                  </motion.div>
                  <p className="font-extrabold text-white text-xs leading-tight">{avatar.name}</p>
                  <p className="text-xs mt-0.5 leading-tight" style={{ color: "rgba(255,255,255,0.45)" }}>
                    {avatar.desc}
                  </p>
                  {isSelected && (
                    <motion.span
                      className="mt-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ background: "#e67e22", color: "#fff" }}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Fixed bottom button */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 pb-6 pt-4"
        style={{ background: "linear-gradient(to top, #0d2137 65%, transparent)" }}
      >
        <div className="max-w-xl mx-auto">
          <Button
            size="lg"
            disabled={!selectedId}
            className="w-full text-xl font-bold py-7 rounded-2xl border-0"
            style={{
              background: selectedId ? "linear-gradient(135deg, #e67e22, #d35400)" : "rgba(255,255,255,0.12)",
              color: "#fff",
              boxShadow: selectedId ? "0 6px 24px rgba(230,126,34,0.45)" : "none",
            }}
            onClick={handleSelect}
            data-testid="btn-select-buddy"
          >
            SELECT BUDDY →
          </Button>

          <div className="flex justify-center gap-2 mt-4">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-full transition-all"
                style={{
                  width: i === 2 ? 24 : 8,
                  height: 8,
                  background: i === 2 ? "#e67e22" : "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

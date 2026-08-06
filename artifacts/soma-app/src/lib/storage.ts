import { create } from "zustand";

export interface Transaction {
  id: string;
  type: "deposit" | "purchase";
  amount: number;
  description: string;
  date: string;
}

export interface QuizResult {
  id: string;
  materialId: string;
  materialTitle: string;
  subject: string;
  type: "topical" | "exam";
  score: number;
  total: number;
  percentage: number;
  date: string;
}

interface SomaState {
  name: string | null;
  avatar: string | null;
  grade: string | null;
  wallet: number;
  purchased: string[];
  transactions: Transaction[];
  quizResults: QuizResult[];
  setName: (name: string) => void;
  setAvatar: (avatar: string) => void;
  setGrade: (grade: string) => void;
  addFunds: (amount: number, description: string) => void;
  purchaseMaterial: (id: string, amount: number) => boolean;
  removePurchased: (id: string) => void;
  addQuizResult: (result: Omit<QuizResult, "id" | "date">) => void;
  logout: () => void;
}

const KEYS = [
  "soma_name", "soma_avatar", "soma_grade",
  "soma_wallet", "soma_purchased", "soma_transactions", "soma_quiz_results",
];

export const useSomaStore = create<SomaState>((set, get) => {
  const loadState = <T>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  return {
    name: loadState<string | null>("soma_name", null),
    avatar: loadState<string | null>("soma_avatar", null),
    grade: loadState<string | null>("soma_grade", null),
    wallet: loadState<number>("soma_wallet", 0),
    purchased: loadState<string[]>("soma_purchased", []),
    transactions: loadState<Transaction[]>("soma_transactions", []),
    quizResults: loadState<QuizResult[]>("soma_quiz_results", []),

    setName: (name) => {
      localStorage.setItem("soma_name", JSON.stringify(name));
      set({ name });
    },
    setAvatar: (avatar) => {
      localStorage.setItem("soma_avatar", JSON.stringify(avatar));
      set({ avatar });
    },
    setGrade: (grade) => {
      localStorage.setItem("soma_grade", JSON.stringify(grade));
      set({ grade });
    },
    addFunds: (amount, description) => {
      set((state) => {
        const newWallet = state.wallet + amount;
        const newTransaction: Transaction = {
          id: Math.random().toString(36).substring(7),
          type: "deposit",
          amount,
          description,
          date: new Date().toISOString(),
        };
        const newTransactions = [newTransaction, ...state.transactions];
        localStorage.setItem("soma_wallet", JSON.stringify(newWallet));
        localStorage.setItem("soma_transactions", JSON.stringify(newTransactions));
        return { wallet: newWallet, transactions: newTransactions };
      });
    },
    purchaseMaterial: (id, amount) => {
      const state = get();
      if (state.wallet < amount) return false;
      if (state.purchased.includes(id)) return true;
      const newWallet = state.wallet - amount;
      const newPurchased = [...state.purchased, id];
      const newTransaction: Transaction = {
        id: Math.random().toString(36).substring(7),
        type: "purchase",
        amount,
        description: `Purchased material`,
        date: new Date().toISOString(),
      };
      const newTransactions = [newTransaction, ...state.transactions];
      localStorage.setItem("soma_wallet", JSON.stringify(newWallet));
      localStorage.setItem("soma_purchased", JSON.stringify(newPurchased));
      localStorage.setItem("soma_transactions", JSON.stringify(newTransactions));
      set({ wallet: newWallet, purchased: newPurchased, transactions: newTransactions });
      return true;
    },
    removePurchased: (id) => {
      set((state) => {
        const newPurchased = state.purchased.filter((p) => p !== id);
        localStorage.setItem("soma_purchased", JSON.stringify(newPurchased));
        return { purchased: newPurchased };
      });
    },
    addQuizResult: (result) => {
      set((state) => {
        const newResult: QuizResult = {
          ...result,
          id: Math.random().toString(36).substring(7),
          date: new Date().toISOString(),
        };
        const newResults = [newResult, ...state.quizResults].slice(0, 100);
        localStorage.setItem("soma_quiz_results", JSON.stringify(newResults));
        return { quizResults: newResults };
      });
    },
    logout: () => {
      KEYS.forEach((k) => localStorage.removeItem(k));
      set({
        name: null, avatar: null, grade: null,
        wallet: 0, purchased: [], transactions: [], quizResults: [],
      });
    },
  };
});

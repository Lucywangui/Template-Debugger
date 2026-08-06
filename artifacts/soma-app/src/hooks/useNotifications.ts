import { useSomaStore } from "@/lib/storage";

const STORAGE_KEY_ENABLED = "soma_notif_enabled";
const STORAGE_KEY_LAST = "soma_notif_last";

const MASCOTS = ["🦁", "🐘", "🦉", "🐯", "🦒"];
const MASCOT_NAMES = ["Leo", "Ellie", "Prof Owl", "Cheetah", "Gigi"];

const ALL_SUBJECTS = [
  "Mathematics", "English", "Kiswahili", "Science", "Biology",
  "Chemistry", "Physics", "History", "Agriculture", "Social Studies",
];

const PARENT_MESSAGES = [
  "Your child's future is built today — 5 shillings unlocks a world of knowledge! 🌟",
  "Every great Kenyan leader started with one quiz. Top up now and let your child shine! ✨",
  "Smart parents invest in smart kids. Keep the learning going for only KSh 5! 🎓",
  "Knowledge is the best gift. Recharge your child's wallet and watch them soar! 🚀",
  "Just KSh 5 for a quiz that could change everything. Don't let learning stop today! 💪",
  "Your child is ready to learn — are you ready to invest? Top up now! 📚",
  "Champions are made through daily practice. Fund today's quiz for only KSh 5! 🏆",
  "In Kenya, education opens every door. Keep that door wide open for your child! 🇰🇪",
];

export function isNotificationsEnabled(): boolean {
  return localStorage.getItem(STORAGE_KEY_ENABLED) === "true";
}

export function setNotificationsEnabled(val: boolean): void {
  localStorage.setItem(STORAGE_KEY_ENABLED, val ? "true" : "false");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickTwo<T>(arr: T[]): [T, T] {
  const copy = [...arr];
  const a = copy.splice(Math.floor(Math.random() * copy.length), 1)[0];
  const b = copy[Math.floor(Math.random() * copy.length)];
  return [a, b];
}

export async function requestAndEnableNotifications(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") {
    setNotificationsEnabled(true);
    return true;
  }
  const perm = await Notification.requestPermission();
  if (perm === "granted") {
    setNotificationsEnabled(true);
    return true;
  }
  return false;
}

export function showDailyReminder(childName?: string): void {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const mascotIdx = Math.floor(Math.random() * MASCOTS.length);
  const mascot = MASCOTS[mascotIdx];
  const mascotName = MASCOT_NAMES[mascotIdx];
  const [subA, subB] = pickTwo(ALL_SUBJECTS);
  const message = pick(PARENT_MESSAGES);

  const name = childName ? childName : "your child";

  new Notification(`${mascot} ${mascotName} says: Time to learn!`, {
    body: `${name} has ${subA} and ${subB} waiting today!\n${message}`,
    icon: "/vite.svg",
    badge: "/vite.svg",
    tag: "soma-daily",
    requireInteraction: false,
  });

  localStorage.setItem(STORAGE_KEY_LAST, Date.now().toString());
}

export function showTestNotification(childName?: string): void {
  showDailyReminder(childName);
}

export function checkAndShowDailyReminder(childName?: string): void {
  if (!isNotificationsEnabled()) return;
  if (Notification.permission !== "granted") return;

  const lastStr = localStorage.getItem(STORAGE_KEY_LAST);
  const last = lastStr ? parseInt(lastStr, 10) : 0;
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const now = Date.now();

  if (now - last >= twentyFourHours) {
    // Small delay so it doesn't fire immediately on mount
    setTimeout(() => showDailyReminder(childName), 3000);
  }
}

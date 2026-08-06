import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useSomaStore } from "@/lib/storage";
import { MATERIALS, SUBJECTS_BY_GRADE } from "@/data/materials";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaterialCard } from "@/components/MaterialCard";
import { SubjectFilter } from "@/components/SubjectFilter";
import { AddFundsModal } from "@/components/AddFundsModal";
import { useToast } from "@/hooks/use-toast";
import {
  requestAndEnableNotifications,
  showTestNotification,
  checkAndShowDailyReminder,
  isNotificationsEnabled,
  setNotificationsEnabled,
} from "@/hooks/useNotifications";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts";
import { Search, Library, User, Home, Bell, BellOff, Plus } from "lucide-react";

interface Props {
  onOpenViewer: (id: string) => void;
  onChangeGrade: () => void;
}

const CHART_COLORS = [
  "#1a3a5c", "#e67e22", "#27ae60", "#8e44ad", "#e74c3c",
  "#2980b9", "#f39c12", "#16a085", "#d35400", "#2c3e50",
];

function getGradeName(gradeKey: string) {
  const p = gradeKey.split("-");
  if (p[0] === "cbc") return `CBC Grade ${p[1]}`;
  if (p[0] === "844") return `8-4-4 Form ${p[1].replace("form", "")}`;
  if (p[0] === "senior") return `Senior Grade ${p[1]}`;
  return gradeKey;
}

export function DashboardPage({ onOpenViewer, onChangeGrade }: Props) {
  const { name, avatar, grade, wallet, purchased, purchaseMaterial, removePurchased, logout, quizResults } = useSomaStore();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<"home" | "search" | "library" | "profile">("home");
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState<string>("All");
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [notifsEnabled, setNotifsEnabled] = useState(isNotificationsEnabled);

  // Check daily reminder on mount
  useEffect(() => {
    checkAndShowDailyReminder(name ?? undefined);
  }, [name]);

  const subjects = useMemo(() => (grade ? SUBJECTS_BY_GRADE(grade) : []), [grade]);
  const gradeMaterials = useMemo(() => (grade ? MATERIALS.filter((m) => m.gradeKey === grade) : []), [grade]);
  const purchasedMaterials = useMemo(() => MATERIALS.filter((m) => purchased.includes(m.id)), [purchased]);

  const filteredMaterials = useMemo(() => {
    return gradeMaterials.filter((m) => {
      const matchesSearch =
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.subject.toLowerCase().includes(search.toLowerCase());
      const matchesSubject = subjectFilter === "All" || m.subject === subjectFilter;
      return matchesSearch && matchesSubject;
    });
  }, [gradeMaterials, search, subjectFilter]);

  // Pie chart data
  const pieData = useMemo(() => {
    const source = purchased.length > 0 ? purchasedMaterials : gradeMaterials;
    const counts: Record<string, number> = {};
    source.forEach((m) => { counts[m.subject] = (counts[m.subject] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [gradeMaterials, purchasedMaterials, purchased.length]);

  const handleBuy = (id: string) => {
    const success = purchaseMaterial(id, 5);
    if (success) {
      toast({ title: "Purchased!", description: "Material added to your library." });
    } else {
      toast({
        variant: "destructive",
        title: "Insufficient funds!",
        description: "Top up your wallet first.",
      });
      setIsAddFundsOpen(true);
    }
  };

  const handleToggleNotifications = async () => {
    if (notifsEnabled) {
      setNotificationsEnabled(false);
      setNotifsEnabled(false);
      toast({ title: "Notifications off", description: "You can re-enable them anytime." });
    } else {
      const granted = await requestAndEnableNotifications();
      if (granted) {
        setNotifsEnabled(true);
        showTestNotification(name ?? undefined);
        toast({ title: "🔔 Notifications enabled!", description: "You'll get daily reminders for your child." });
      } else {
        toast({ variant: "destructive", title: "Permission denied", description: "Please allow notifications in your browser settings." });
      }
    }
  };

  if (!grade) return null;

  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "library", label: "Library", icon: Library },
    { id: "profile", label: "Profile", icon: User },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top App Bar */}
      <header
        className="sticky top-0 z-20 px-5 py-4 flex items-center justify-between shadow-md"
        style={{ background: "linear-gradient(90deg, #0d2137, #1a3a5c)" }}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none select-none">{avatar}</span>
          <div>
            <p className="text-white font-extrabold text-lg leading-tight tracking-wide">SOMA APP</p>
            <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
              {getGradeName(grade)}
            </p>
          </div>
        </div>
        {/* Wallet chip */}
        <button
          className="flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm shadow-inner"
          style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}
          onClick={() => setIsAddFundsOpen(true)}
        >
          <span>💰</span>
          <span>KSh {wallet}</span>
          <Plus className="w-3.5 h-3.5 opacity-70" />
        </button>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-24">

        {/* ── HOME TAB ── */}
        {activeTab === "home" && (
          <div className="max-w-2xl mx-auto px-4 pt-6 space-y-5">
            {/* Welcome card */}
            <motion.div
              className="rounded-3xl p-6 text-white shadow-xl"
              style={{ background: "linear-gradient(135deg, #1a3a5c, #1e5799)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center gap-4">
                <div
                  className="rounded-2xl p-3 text-4xl leading-none select-none shadow-inner"
                  style={{ background: "rgba(255,255,255,0.12)" }}
                >
                  {avatar}
                </div>
                <div>
                  <p className="text-sm font-medium opacity-70">Welcome back,</p>
                  <h2 className="text-2xl font-extrabold tracking-tight">{name}!</h2>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block"
                    style={{ background: "#e67e22" }}
                  >
                    {getGradeName(grade)}
                  </span>
                </div>
              </div>

              {/* Wallet + purchased stats */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  className="rounded-2xl p-3 text-center transition-opacity hover:opacity-90"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                  onClick={() => setIsAddFundsOpen(true)}
                >
                  <p className="text-2xl font-extrabold">KSh {wallet}</p>
                  <p className="text-xs opacity-70 mt-0.5">Wallet Balance</p>
                  <p className="text-xs mt-1 font-semibold" style={{ color: "#25D366" }}>
                    ＋ Top Up
                  </p>
                </button>
                <div className="rounded-2xl p-3 text-center" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <p className="text-2xl font-extrabold">{purchased.length}</p>
                  <p className="text-xs opacity-70 mt-0.5">Materials Purchased</p>
                </div>
              </div>
            </motion.div>

            {/* Pie chart */}
            <motion.div
              className="rounded-3xl bg-card p-5 shadow-sm border"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="font-bold text-lg text-foreground mb-1">
                {purchased.length > 0 ? "Your Activity by Subject" : "Curriculum Overview"}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {purchased.length > 0
                  ? `${purchased.length} material${purchased.length !== 1 ? "s" : ""} across ${pieData.length} subject${pieData.length !== 1 ? "s" : ""}`
                  : `${gradeMaterials.length} materials across ${pieData.length} subjects`}
              </p>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} materials`, ""]}
                    contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span style={{ fontSize: 11, color: "#555" }}>
                        {value.length > 14 ? value.slice(0, 14) + "…" : value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            {/* ── SCORE HISTORY ── */}
            {(() => {
              if (quizResults.length === 0) return null;

              const recent = quizResults.slice(0, 10).reverse();
              const chartData = recent.map((r, i) => ({
                name: `#${quizResults.length - (recent.length - 1 - i)}`,
                score: r.percentage,
                subject: r.subject,
                title: r.materialTitle,
                type: r.type,
              }));

              const avgScore = Math.round(
                quizResults.slice(0, 10).reduce((s, r) => s + r.percentage, 0) /
                  Math.min(quizResults.length, 10)
              );

              const subjectAvgs: Record<string, number[]> = {};
              quizResults.forEach((r) => {
                if (!subjectAvgs[r.subject]) subjectAvgs[r.subject] = [];
                subjectAvgs[r.subject].push(r.percentage);
              });
              const bestSubject = Object.entries(subjectAvgs)
                .map(([s, arr]) => ({ s, avg: Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) }))
                .sort((a, b) => b.avg - a.avg)[0];

              const streakDays = (() => {
                const days = new Set(
                  quizResults.map((r) => new Date(r.date).toDateString())
                );
                let streak = 0;
                const d = new Date();
                while (days.has(d.toDateString())) {
                  streak++;
                  d.setDate(d.getDate() - 1);
                }
                return streak;
              })();

              return (
                <motion.div
                  className="rounded-3xl bg-card p-5 shadow-sm border space-y-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-foreground">📈 Your Progress</h3>
                    <span className="text-xs text-muted-foreground">{quizResults.length} quiz{quizResults.length !== 1 ? "zes" : ""} done</span>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Avg Score", value: `${avgScore}%`, icon: "🎯" },
                      { label: "Day Streak", value: streakDays > 0 ? `${streakDays}🔥` : "0", icon: "📅" },
                      { label: "Best Subject", value: bestSubject?.s.length > 9 ? bestSubject.s.slice(0, 9) + "…" : bestSubject?.s, icon: "🏅" },
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-2xl p-3 text-center"
                        style={{ background: "linear-gradient(135deg, #f0f4ff, #f8faff)" }}
                      >
                        <div className="text-lg leading-none mb-1">{stat.icon}</div>
                        <div className="font-extrabold text-sm text-foreground">{stat.value}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bar chart of recent scores */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Last {chartData.length} quizzes</p>
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 4 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: 10, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 12 }}
                          formatter={(v: number, _: string, props: { payload?: { title?: string } }) => [
                            `${v}%`,
                            props.payload?.title ?? "",
                          ]}
                        />
                        <ReferenceLine y={50} stroke="#e74c3c" strokeDasharray="4 4" strokeWidth={1} />
                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                          {chartData.map((entry, index) => (
                            <Cell
                              key={index}
                              fill={entry.score >= 80 ? "#27ae60" : entry.score >= 50 ? "#e67e22" : "#e74c3c"}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="flex gap-3 text-xs text-muted-foreground justify-center mt-1">
                      <span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: "#27ae60" }} />≥80% Excellent</span>
                      <span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: "#e67e22" }} />≥50% Good</span>
                      <span><span className="inline-block w-2 h-2 rounded-sm mr-1" style={{ background: "#e74c3c" }} />&lt;50% Needs work</span>
                    </div>
                  </div>

                  {/* Recent attempts */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recent attempts</p>
                    {quizResults.slice(0, 5).map((r) => (
                      <div
                        key={r.id}
                        className="flex items-center justify-between rounded-xl px-3 py-2"
                        style={{ background: "#f8faff" }}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-sm shrink-0">{r.type === "exam" ? "📋" : "📝"}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold truncate max-w-[160px]">{r.materialTitle}</p>
                            <p className="text-xs text-muted-foreground">{r.subject} · {new Date(r.date).toLocaleDateString("en-KE", { day: "numeric", month: "short" })}</p>
                          </div>
                        </div>
                        <div
                          className="text-sm font-extrabold px-2 py-0.5 rounded-full shrink-0"
                          style={{
                            background: r.percentage >= 80 ? "#e8f8ee" : r.percentage >= 50 ? "#fef3e2" : "#fde8e8",
                            color: r.percentage >= 80 ? "#27ae60" : r.percentage >= 50 ? "#e67e22" : "#e74c3c",
                          }}
                        >
                          {r.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })()}

            {/* CTA to search */}
            <motion.div
              className="rounded-3xl p-5 shadow-sm border-2 text-center cursor-pointer hover:scale-[1.02] transition-transform"
              style={{ borderColor: "#e67e22", background: "linear-gradient(135deg, #fff9f4, #fff)" }}
              onClick={() => setActiveTab("search")}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl mb-2">📚</div>
              <h3 className="text-xl font-extrabold" style={{ color: "#1a3a5c" }}>
                Search Materials
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {gradeMaterials.length} materials for {getGradeName(grade)}
              </p>
              <span
                className="mt-3 inline-block px-5 py-2 rounded-full text-sm font-bold text-white"
                style={{ background: "#e67e22" }}
              >
                Explore Now →
              </span>
            </motion.div>
          </div>
        )}

        {/* ── SEARCH TAB ── */}
        {activeTab === "search" && (
          <div className="max-w-7xl mx-auto px-4 pt-6 space-y-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                type="search"
                placeholder="Search materials, subjects..."
                className="pl-11 py-6 text-base rounded-2xl border-2 bg-white"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <SubjectFilter subjects={subjects} active={subjectFilter} onChange={setSubjectFilter} />
            {filteredMaterials.length === 0 ? (
              <div className="text-center py-24 text-muted-foreground">
                <div className="text-5xl mb-3">🔍</div>
                <p className="text-xl font-semibold">No materials found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredMaterials.map((m) => (
                  <MaterialCard
                    key={m.id}
                    material={m}
                    isPurchased={purchased.includes(m.id)}
                    onBuy={() => handleBuy(m.id)}
                    onOpen={() => onOpenViewer(m.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── LIBRARY TAB ── */}
        {activeTab === "library" && (
          <div className="max-w-7xl mx-auto px-4 pt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-extrabold text-foreground">
                My Library
                <span className="ml-2 text-sm font-semibold text-white bg-primary px-2 py-0.5 rounded-full">
                  {purchased.length}
                </span>
              </h2>
            </div>
            {purchasedMaterials.length === 0 ? (
              <div className="text-center py-24 rounded-3xl border-2 border-dashed border-muted bg-muted/20">
                <div className="text-6xl mb-4">📖</div>
                <h3 className="text-xl font-bold text-foreground mb-2">Your library is empty</h3>
                <p className="text-muted-foreground mb-6">Purchase materials from Search to start learning!</p>
                <Button onClick={() => setActiveTab("search")} className="rounded-full px-8">
                  Browse Materials
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {purchasedMaterials.map((m) => (
                  <MaterialCard
                    key={m.id}
                    material={m}
                    isPurchased={true}
                    onBuy={() => {}}
                    onOpen={() => onOpenViewer(m.id)}
                    onDelete={() => {
                      removePurchased(m.id);
                      toast({ title: "Removed", description: `${m.title} removed from your library.` });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PROFILE TAB ── */}
        {activeTab === "profile" && (
          <div className="max-w-md mx-auto px-4 pt-6 space-y-4">
            {/* Avatar & Name */}
            <motion.div
              className="rounded-3xl p-8 text-center shadow-xl text-white"
              style={{ background: "linear-gradient(135deg, #1a3a5c, #1e5799)" }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mx-auto mb-4 shadow-inner select-none"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                {avatar}
              </div>
              <h2 className="text-3xl font-extrabold">{name}</h2>
              <p className="text-sm mt-1 opacity-70">{getGradeName(grade)}</p>
            </motion.div>

            {/* Wallet card */}
            <div
              className="rounded-2xl p-5 shadow-sm flex items-center justify-between"
              style={{ background: "#f0fff4", border: "1.5px solid #25D366" }}
            >
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-0.5">Wallet Balance</p>
                <p className="text-3xl font-extrabold" style={{ color: "#128C7E" }}>
                  KSh {wallet}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">Till: {/* TILL_NUMBER */}9354938</p>
              </div>
              <Button
                className="rounded-xl font-bold border-0 px-5 py-5"
                style={{ background: "linear-gradient(135deg, #128C7E, #25D366)", color: "#fff" }}
                onClick={() => setIsAddFundsOpen(true)}
              >
                Top Up
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-card border p-4 text-center shadow-sm">
                <p className="text-3xl font-extrabold text-primary">{gradeMaterials.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Materials Available</p>
              </div>
              <div className="rounded-2xl bg-card border p-4 text-center shadow-sm">
                <p className="text-3xl font-extrabold" style={{ color: "#27ae60" }}>{purchased.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Purchased</p>
              </div>
            </div>

            {/* Info rows */}
            <div className="rounded-2xl bg-card border shadow-sm divide-y divide-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-muted-foreground font-medium">Name</span>
                <span className="font-semibold text-foreground">{name}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-muted-foreground font-medium">Study Buddy</span>
                <span className="font-semibold text-foreground">{avatar}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-4">
                <span className="text-sm text-muted-foreground font-medium">Grade / Level</span>
                <span className="font-semibold text-foreground">{getGradeName(grade)}</span>
              </div>
            </div>

            {/* Daily Notification Toggle */}
            <div
              className="rounded-2xl p-5 border-2 shadow-sm"
              style={{ borderColor: notifsEnabled ? "#e67e22" : "#e2e8f0", background: notifsEnabled ? "#fff9f4" : "#f8fafc" }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {notifsEnabled ? (
                    <Bell className="w-5 h-5" style={{ color: "#e67e22" }} />
                  ) : (
                    <BellOff className="w-5 h-5 text-muted-foreground" />
                  )}
                  <p className="font-bold text-foreground">Daily Reminders</p>
                </div>
                <button
                  onClick={handleToggleNotifications}
                  className="relative w-12 h-6 rounded-full transition-colors"
                  style={{ background: notifsEnabled ? "#e67e22" : "#cbd5e1" }}
                >
                  <span
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
                    style={{ left: notifsEnabled ? "calc(100% - 20px)" : "4px" }}
                  />
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {notifsEnabled
                  ? "🔔 On! Your parent will get daily reminders with dancing animals to top up for your learning."
                  : "Enable to receive daily reminders for your parent to top up your wallet for today's quizzes."}
              </p>
              {notifsEnabled && (
                <button
                  className="mt-3 text-xs font-semibold underline"
                  style={{ color: "#e67e22" }}
                  onClick={() => showTestNotification(name ?? undefined)}
                >
                  Send a test notification now
                </button>
              )}
            </div>

            <Button
              variant="outline"
              className="w-full rounded-2xl py-6 font-semibold border-2"
              onClick={onChangeGrade}
            >
              Change Grade / Level
            </Button>

            {/* Logout */}
            <button
              className="w-full rounded-2xl py-4 font-semibold text-sm border-2 border-red-200 text-red-500 hover:bg-red-50 transition-colors"
              onClick={() => {
                if (window.confirm("Log out? Your wallet balance and library will be cleared.")) {
                  logout();
                }
              }}
            >
              🚪 Log Out
            </button>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 flex border-t shadow-2xl"
        style={{ background: "#ffffff" }}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              className="flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors relative"
              style={{ color: isActive ? "#1a3a5c" : "#999" }}
              onClick={() => setActiveTab(id)}
              data-testid={`tab-${id}`}
            >
              <Icon
                className="w-5 h-5 transition-transform"
                style={{ transform: isActive ? "scale(1.15)" : "scale(1)" }}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className="text-xs font-semibold">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 h-0.5 w-10 rounded-full"
                  style={{ background: "#e67e22" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      <AddFundsModal isOpen={isAddFundsOpen} onClose={() => setIsAddFundsOpen(false)} />
    </div>
  );
}

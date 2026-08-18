import { useApp } from "../context/AppContext";
import { ACHIEVEMENTS, getLevelInfo, LEVELS } from "../data/achievements";
import { ProgressRing, Badge } from "../components/ui";

export function Achievements() {
  const { stats, unlockedAchievements } = useApp();
  const unlockedIds = new Set(unlockedAchievements.map((a) => a.id));
  const levelInfo = getLevelInfo(stats.totalXp);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black sm:text-3xl">成就 & 等级</h1>
        <p className="mt-1 text-slate-400">每一步成长都值得被记录</p>
      </div>

      {/* Level overview */}
      <div className="card relative overflow-hidden p-6 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/30 to-accent-500/20 blur-2xl" />
        <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
          <div className="flex items-center gap-5">
            <ProgressRing value={levelInfo.progress * 100} size={130}>
              <div className="text-3xl">{levelInfo.current.icon}</div>
              <div className="mt-1 text-xs text-slate-400">{levelInfo.current.name}</div>
            </ProgressRing>
            <div>
              <div className="text-sm text-slate-400">当前等级</div>
              <div className="text-2xl font-black">{levelInfo.current.name}</div>
              <div className="mt-1 text-sm text-slate-400">累计 {stats.totalXp} XP</div>
              {levelInfo.next && (
                <div className="mt-3 text-xs text-brand-300">
                  还需 {levelInfo.next.minXp - stats.totalXp} XP 升级为「{levelInfo.next.name}」
                </div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-3">
            <div>
              <div className="text-2xl font-black text-emerald-300">{stats.lessonsCompleted}</div>
              <div className="text-xs text-slate-400">课程完成</div>
            </div>
            <div>
              <div className="text-2xl font-black text-amber-300">{stats.streak}</div>
              <div className="text-xs text-slate-400">连续天数</div>
            </div>
            <div>
              <div className="text-2xl font-black text-brand-300">{unlockedAchievements.length}</div>
              <div className="text-xs text-slate-400">已解锁成就</div>
            </div>
          </div>
        </div>
      </div>

      {/* Level ladder */}
      <div className="card p-6">
        <h2 className="mb-4 font-bold">等级阶梯</h2>
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          {LEVELS.map((lv) => {
            const reached = stats.totalXp >= lv.minXp;
            const isCurrent = lv.name === levelInfo.current.name;
            return (
              <div key={lv.name} className="flex flex-col items-center gap-1 text-center">
                <div className={`grid h-12 w-12 place-items-center rounded-full text-xl transition ${reached ? "bg-gradient-to-br from-brand-500 to-accent-500 shadow-glow" : "bg-white/5 grayscale"}`}>
                  {lv.icon}
                </div>
                <div className={`text-xs font-semibold ${reached ? "text-white" : "text-slate-500"}`}>{lv.name}</div>
                <div className="text-[10px] text-slate-500">{lv.minXp} XP</div>
                {isCurrent && <Badge color="brand">当前</Badge>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements grid */}
      <div>
        <h2 className="mb-4 text-lg font-bold">成就徽章</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {ACHIEVEMENTS.map((a) => {
            const unlocked = unlockedIds.has(a.id);
            return (
              <div
                key={a.id}
                className={`card relative flex flex-col items-center p-5 text-center transition ${unlocked ? "border-brand-400/30" : "opacity-50"}`}
              >
                <div className={`mb-2 text-4xl ${unlocked ? "" : "grayscale"}`}>{unlocked ? a.icon : "🔒"}</div>
                <div className="font-bold text-sm">{a.name}</div>
                <div className="mt-1 text-xs text-slate-400">{a.description}</div>
                {unlocked && <div className="mt-2"><Badge color="green">已解锁</Badge></div>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

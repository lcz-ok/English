import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp, AVATARS } from "../context/AppContext";
import { LANGUAGES } from "../data/languages";
import { getLevelInfo } from "../data/achievements";
import type { LangCode } from "../data/types";
import { ProgressRing, StatCard, Modal, Badge } from "../components/ui";

export function Profile() {
  const { user, stats, progress, updateUser, logout, deleteAccount } = useApp();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ name: user?.name ?? "", avatar: user?.avatar ?? AVATARS[0], goal: user?.goal ?? "", preferredLangs: user?.preferredLangs ?? [] });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!user || !progress) return null;
  const levelInfo = getLevelInfo(stats.totalXp);

  const toggleLang = (code: LangCode) => {
    setDraft((d) => ({
      ...d,
      preferredLangs: d.preferredLangs.includes(code) ? d.preferredLangs.filter((l) => l !== code) : [...d.preferredLangs, code],
    }));
  };

  const save = () => {
    updateUser({ name: draft.name, avatar: draft.avatar, goal: draft.goal, preferredLangs: draft.preferredLangs });
    setEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleDelete = () => {
    setDeleteError("");
    const res = deleteAccount();
    if (!res.ok) {
      setDeleteError(res.error ?? "注销失败");
      return;
    }
    setConfirmDelete(false);
    navigate("/");
  };

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-3xl">
        {/* Profile header */}
        <div className="card relative overflow-hidden p-6 sm:p-8">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br from-brand-500/30 to-accent-500/20 blur-2xl" />
          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center rounded-3xl bg-gradient-to-br from-brand-500 to-accent-500 text-5xl shadow-glow">
                {user.avatar}
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-ink-800 px-3 py-1 text-xs font-bold">
                {levelInfo.current.icon} {levelInfo.current.name}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-black">{user.name}</h1>
                    {user.isAdmin && <Badge color="amber">👑 管理员</Badge>}
                  </div>
                  <div className="text-sm text-slate-400">{user.email}</div>
                </div>
                <button onClick={() => setEditing(true)} className="btn-ghost">✏️ 编辑资料</button>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                {user.preferredLangs.map((l) => (
                  <Badge key={l} color="brand">{LANGUAGES[l].flag} {LANGUAGES[l].name}</Badge>
                ))}
                <Badge color="amber">🎯 {user.goal}</Badge>
                <Badge color="cyan">📅 加入 {Math.max(1, Math.ceil((Date.now() - user.createdAt) / 86400000))} 天</Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Level ring + XP */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="card flex flex-col items-center p-6">
            <ProgressRing value={levelInfo.progress * 100} size={130}>
              <div className="text-2xl font-black">{stats.totalXp}</div>
              <div className="text-xs text-slate-400">总 XP</div>
            </ProgressRing>
            <div className="mt-3 text-center">
              <div className="text-sm font-bold">{levelInfo.current.icon} {levelInfo.current.name}</div>
              {levelInfo.next && (
                <div className="text-xs text-slate-500">距「{levelInfo.next.name}」{levelInfo.next.minXp - stats.totalXp} XP</div>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="🔥" label="连续学习" value={`${stats.streak} 天`} />
            <StatCard icon="📚" label="完成课程" value={stats.lessonsCompleted} gradient="from-emerald-500/20 to-teal-500/20" />
            <StatCard icon="📖" label="学习单词" value={stats.wordsLearned} gradient="from-cyan-500/20 to-blue-500/20" />
            <StatCard icon="🎯" label="满分次数" value={stats.perfectScores} gradient="from-amber-500/20 to-rose-500/20" />
          </div>
        </div>

        {/* Account actions */}
        <div className="mt-6 card p-6">
          <h2 className="mb-3 font-bold">账号设置</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
              <div>
                <div className="font-semibold">学习提醒</div>
                <div className="text-xs text-slate-400">每日学习打卡通知</div>
              </div>
              <Badge color="green">已开启</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3">
              <div>
                <div className="font-semibold">数据存储</div>
                <div className="text-xs text-slate-400">学习数据保存在本地浏览器</div>
              </div>
              <Badge color="brand">本地</Badge>
            </div>
            <button onClick={handleLogout} className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 font-semibold text-slate-200 transition hover:bg-white/10">
              🚪 退出登录
            </button>
            <button
              onClick={() => { setDeleteError(""); setConfirmDelete(true); }}
              disabled={user.isAdmin || user.id === "guest"}
              className="flex w-full items-center justify-center gap-2 rounded-lg border border-rose-400/20 bg-rose-500/10 px-4 py-3 font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-40 disabled:pointer-events-none"
              title={user.isAdmin || user.id === "guest" ? "内置账号不可注销" : "永久删除账号及全部学习数据"}
            >
              🗑️ 注销账号{user.isAdmin ? "（管理员不可注销）" : user.id === "guest" ? "（游客账号不可注销）" : ""}
            </button>
          </div>
        </div>
      </div>

      {/* Edit profile modal */}
      <Modal open={editing} onClose={() => setEditing(false)} title="编辑资料">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">头像</label>
            <div className="grid grid-cols-8 gap-1.5">
              {AVATARS.map((a) => {
                const active = draft.avatar === a;
                return (
                  <button
                    type="button"
                    key={a}
                    onClick={() => setDraft({ ...draft, avatar: a })}
                    className={`grid aspect-square place-items-center rounded-lg text-xl transition ${active ? "bg-brand-500/30 ring-2 ring-brand-400" : "bg-white/5 hover:bg-white/10"}`}
                  >
                    {a}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">昵称</label>
            <input className="input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">学习目标</label>
            <select className="input" value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })}>
              <option>日常交流</option>
              <option>旅游出行</option>
              <option>职场提升</option>
              <option>考试留学</option>
              <option>追剧看番</option>
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-300">想学的语言</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(LANGUAGES).map((l) => {
                const active = draft.preferredLangs.includes(l.code);
                return (
                  <button
                    type="button"
                    key={l.code}
                    onClick={() => toggleLang(l.code)}
                    className={`rounded-xl border px-3 py-3 text-center transition ${active ? "border-brand-400 bg-brand-500/20" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                  >
                    <div className="text-2xl">{l.flag}</div>
                    <div className="mt-1 text-xs font-semibold">{l.name}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setEditing(false)} className="btn-ghost flex-1">取消</button>
            <button onClick={save} className="btn-primary flex-1">保存</button>
          </div>
        </div>
      </Modal>

      {/* Delete account confirmation */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} title="注销账号">
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/10 p-4 text-sm text-rose-100">
            <span className="text-2xl">⚠️</span>
            <div>
              <div className="font-bold">确认注销账号？</div>
              <p className="mt-1 text-rose-200/90">此操作不可撤销，将永久删除你的账号、全部学习进度、成就以及社区帖子。</p>
            </div>
          </div>
          {deleteError && <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{deleteError}</div>}
          <div className="flex gap-3">
            <button onClick={() => setConfirmDelete(false)} className="btn-ghost flex-1">取消</button>
            <button onClick={handleDelete} className="flex-1 rounded-xl bg-rose-500 px-4 py-2.5 font-semibold text-white transition hover:bg-rose-600">确认注销</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

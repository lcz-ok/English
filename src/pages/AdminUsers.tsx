import { useMemo, useState } from "react";
import { useApp, type User } from "../context/AppContext";
import { getRole, ROLE_LABELS } from "../lib/permissions";
import { Badge, Modal, StatCard } from "../components/ui";

export function AdminUsers() {
  const { user, users, allProgress, adminBanUser, adminUnbanUser, adminDeleteUser } = useApp();
  const [query, setQuery] = useState("");
  const [confirm, setConfirm] = useState<{ kind: "ban" | "unban" | "delete"; target: User } | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  }, [users, query]);

  const counts = useMemo(() => {
    const c = { admin: 0, user: 0, guest: 0, banned: 0 };
    for (const u of users) {
      c[getRole(u) as "admin" | "user" | "guest"]++;
      if (u.banned) c.banned++;
    }
    return c;
  }, [users]);

  const flash = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  };

  const handleConfirm = () => {
    if (!confirm) return;
    const { kind, target } = confirm;
    let res;
    if (kind === "ban") res = adminBanUser(target.id);
    else if (kind === "unban") res = adminUnbanUser(target.id);
    else res = adminDeleteUser(target.id);
    if (res.ok) flash(kind === "ban" ? `已封禁 ${target.name}` : kind === "unban" ? `已解封 ${target.name}` : `已注销 ${target.name}`);
    setConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">用户管理</h1>
          <p className="mt-1 text-slate-400">查看并管理平台用户，可封号、解封或注销账号</p>
        </div>
        <Badge color="amber">👑 管理员后台</Badge>
      </div>

      {/* Stat overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon="👥" label="总用户数" value={users.length} />
        <StatCard icon="🙋" label="普通用户" value={counts.user} gradient="from-cyan-500/20 to-blue-500/20" />
        <StatCard icon="👑" label="管理员" value={counts.admin} gradient="from-amber-500/20 to-rose-500/20" />
        <StatCard icon="🚫" label="已封禁" value={counts.banned} gradient="from-rose-500/20 to-rose-500/10" />
      </div>

      {/* Search */}
      <div className="card flex items-center gap-2 p-3">
        <span className="px-2 text-slate-400">🔍</span>
        <input
          className="flex-1 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-500"
          placeholder="按昵称或邮箱搜索用户..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {query && (
          <button onClick={() => setQuery("")} className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-white/5">清除</button>
        )}
      </div>

      {/* User table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3">用户</th>
                <th className="px-4 py-3">角色</th>
                <th className="px-4 py-3">学习进度</th>
                <th className="px-4 py-3">状态</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const role = getRole(u);
                const prog = allProgress?.[u.id];
                const isSelf = u.id === user?.id;
                const protectedUser = role === "admin" || u.id === "guest";
                return (
                  <tr key={u.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg">{u.avatar}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold">
                            {u.name}
                            {isSelf && <span className="text-[10px] text-slate-400">(你)</span>}
                          </div>
                          <div className="truncate text-xs text-slate-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={role === "admin" ? "amber" : role === "guest" ? "slate" : "brand"}>{ROLE_LABELS[role]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-slate-300">
                      {prog ? (
                        <span className="text-xs">
                          {prog.completedLessons.length} 课 · {prog.xp} XP
                          {prog.streak > 0 && <span className="ml-1 text-amber-300">🔥{prog.streak}</span>}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {u.banned ? (
                        <Badge color="rose">🚫 已封禁</Badge>
                      ) : (
                        <Badge color="green">正常</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {protectedUser ? (
                          <span className="text-xs text-slate-500" title="内置账号不可操作">受保护</span>
                        ) : u.banned ? (
                          <>
                            <button onClick={() => setConfirm({ kind: "unban", target: u })} className="rounded-lg border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/20">解封</button>
                            <button onClick={() => setConfirm({ kind: "delete", target: u })} className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20">注销</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setConfirm({ kind: "ban", target: u })} className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-200 transition hover:bg-amber-500/20">封号</button>
                            <button onClick={() => setConfirm({ kind: "delete", target: u })} className="rounded-lg border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-200 transition hover:bg-rose-500/20">注销</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">没有匹配的用户</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-400/30 bg-emerald-500/20 px-5 py-3 text-sm font-semibold text-emerald-100 shadow-glow backdrop-blur">
          ✓ {toast}
        </div>
      )}

      {/* Confirm modal */}
      <Modal open={!!confirm} onClose={() => setConfirm(null)} title={confirm?.kind === "delete" ? "注销账号" : confirm?.kind === "ban" ? "封禁账号" : "解封账号"}>
        {confirm && (
          <div className="space-y-4">
            <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${confirm.kind === "delete" ? "border-rose-400/20 bg-rose-500/10 text-rose-100" : confirm.kind === "ban" ? "border-amber-400/20 bg-amber-500/10 text-amber-100" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-100"}`}>
              <span className="text-2xl">{confirm.kind === "delete" ? "⚠️" : confirm.kind === "ban" ? "🚫" : "✅"}</span>
              <div>
                <div className="font-bold">
                  {confirm.kind === "delete" ? "确认注销该账号？" : confirm.kind === "ban" ? "确认封禁该账号？" : "确认解封该账号？"}
                </div>
                <p className="mt-1">
                  目标用户：<span className="font-semibold">{confirm.target.avatar} {confirm.target.name}</span>（{confirm.target.email}）
                </p>
                <p className="mt-1 opacity-90">
                  {confirm.kind === "delete"
                    ? "注销将永久删除该账号、学习进度、成就及社区帖子，不可恢复。"
                    : confirm.kind === "ban"
                    ? "封禁后该用户将无法登录，已有会话也会被立即清除。"
                    : "解封后该用户可重新登录使用平台。"}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirm(null)} className="btn-ghost flex-1">取消</button>
              <button
                onClick={handleConfirm}
                className={`flex-1 rounded-xl px-4 py-2.5 font-semibold text-white transition ${confirm.kind === "delete" ? "bg-rose-500 hover:bg-rose-600" : confirm.kind === "ban" ? "bg-amber-500 hover:bg-amber-600" : "bg-emerald-500 hover:bg-emerald-600"}`}
              >
                确认{confirm.kind === "delete" ? "注销" : confirm.kind === "ban" ? "封禁" : "解封"}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

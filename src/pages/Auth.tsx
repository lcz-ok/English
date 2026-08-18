import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { LANGUAGES } from "../data/languages";
import type { LangCode } from "../data/types";

// Guest demo-account credentials banner shown on login & register pages
function GuestBanner({ onUse }: { onUse?: (email: string, password: string) => void }) {
  return (
    <div className="rounded-xl border border-brand-400/30 bg-brand-500/10 p-4">
      <div className="flex items-center gap-2 text-sm font-bold text-brand-200">
        <span>🦊</span> 游客体验账号
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-lg bg-ink-800/60 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">账号</div>
          <div className="font-mono font-semibold">123@123</div>
        </div>
        <div className="rounded-lg bg-ink-800/60 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-slate-500">密码</div>
          <div className="font-mono font-semibold">123456</div>
        </div>
      </div>
      <p className="mt-2 text-xs text-slate-400">游客可浏览 A1 入门课程，发帖、个性化路径等需注册账号解锁。</p>
      {onUse && (
        <button
          type="button"
          onClick={() => onUse("123@123", "123456")}
          className="mt-3 w-full rounded-lg border border-brand-400/40 bg-brand-500/20 px-3 py-2 text-sm font-semibold text-brand-100 transition hover:bg-brand-500/30"
        >
          一键填入并体验
        </button>
      )}
    </div>
  );
}

function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle: string; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-12 lg:flex">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <Link to="/" className="relative flex items-center gap-2 text-2xl font-black">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/20 text-xl">🌐</span>
          LinguaVerse
        </Link>
        <div className="relative">
          <div className="text-5xl font-black leading-tight">让世界<br />听得见你</div>
          <p className="mt-4 max-w-sm text-white/80">在沉浸式的语境中学习英语、日语、韩语，每天都有看得见的进步。</p>
          <div className="mt-8 flex gap-3">
            {Object.values(LANGUAGES).map((l) => (
              <div key={l.code} className="rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
                <div className="text-2xl">{l.flag}</div>
                <div className="mt-1 text-xs font-semibold">{l.name}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-sm text-white/70">已有数千名学员在这里开口说世界</div>
      </div>

      {/* Right form panel */}
      <div className="flex flex-col justify-center px-4 py-10 sm:px-8">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="mb-8 flex items-center gap-2 text-lg font-black lg:hidden">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500">🌐</span>
            LinguaVerse
          </Link>
          <h1 className="text-3xl font-black">{title}</h1>
          <p className="mt-2 text-slate-400">{subtitle}</p>
          <div className="mt-8">{children}</div>
          <div className="mt-6 text-center text-sm text-slate-400">{footer}</div>
        </div>
      </div>
    </div>
  );
}

export function Login() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = login(email, password, remember);
    if (!res.ok) {
      setError(res.error ?? "登录失败");
      return;
    }
    navigate("/app/dashboard");
  };

  return (
    <AuthShell title="欢迎回来" subtitle="继续你的语言学习之旅" footer={<>还没有账号？<Link to="/register" className="font-semibold text-brand-300">立即注册</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <GuestBanner onUse={(e, p) => { setEmail(e); setPassword(p); }} />
        {error && <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">账号</label>
          <input className="input" type="text" placeholder="邮箱或用户名" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">密码</label>
          <input className="input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-white/20 bg-ink-800 accent-brand-500"
          />
          保存密码（7 天免登录）
        </label>
        <button type="submit" className="btn-primary w-full py-3">登录</button>
        <p className="text-center text-xs text-slate-500">提示：本平台为演示应用，数据保存在你的浏览器本地。</p>
      </form>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [langs, setLangs] = useState<LangCode[]>(["en"]);
  const [goal, setGoal] = useState("日常交流");
  const [error, setError] = useState("");

  const toggleLang = (code: LangCode) => {
    setLangs((prev) => (prev.includes(code) ? prev.filter((l) => l !== code) : [...prev, code]));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    const res = register({ name, email, password, preferredLangs: langs, goal });
    if (!res.ok) {
      setError(res.error ?? "注册失败");
      return;
    }
    navigate("/app/dashboard");
  };

  return (
    <AuthShell title="创建账号" subtitle="免费开始，开启沉浸式学习" footer={<>已有账号？<Link to="/login" className="font-semibold text-brand-300">直接登录</Link></>}>
      <form onSubmit={submit} className="space-y-4">
        <GuestBanner />
        {error && <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</div>}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">昵称</label>
          <input className="input" placeholder="你的昵称" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">邮箱</label>
          <input className="input" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">密码</label>
          <input className="input" type="password" placeholder="至少 6 位" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-300">想学习的语言（可多选）</label>
          <div className="grid grid-cols-3 gap-2">
            {Object.values(LANGUAGES).map((l) => {
              const active = langs.includes(l.code);
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
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-300">学习目标</label>
          <select className="input" value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option>日常交流</option>
            <option>旅游出行</option>
            <option>职场提升</option>
            <option>考试留学</option>
            <option>追剧看番</option>
          </select>
        </div>
        <button type="submit" className="btn-primary w-full py-3">注册并开始学习</button>
      </form>
    </AuthShell>
  );
}

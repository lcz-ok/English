import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";

const NAV = [
  { to: "/app/dashboard", label: "学习中心", icon: "🏠" },
  { to: "/app/courses", label: "课程库", icon: "📚" },
  { to: "/app/path", label: "学习路径", icon: "🧭" },
  { to: "/app/community", label: "社区", icon: "💬" },
  { to: "/app/achievements", label: "成就", icon: "🏆" },
];

// Admin-only navigation entry (appended for admins)
const ADMIN_NAV = { to: "/app/admin/users", label: "用户管理", icon: "👑" };

export function Layout() {
  const { user, logout, stats } = useApp();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Build nav list: standard items + admin entry if the user is an admin
  const navItems = user?.isAdmin ? [...NAV, ADMIN_NAV] : NAV;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4">
          <Link to="/app/dashboard" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg shadow-glow">
              🌐
            </div>
            <span className="hidden text-lg font-extrabold tracking-tight sm:block">LinguaVerse</span>
          </Link>

          <nav className="ml-4 hidden flex-1 items-center gap-1 md:flex">
            {navItems.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-white/10 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  }`
                }
              >
                <span className="mr-1.5">{n.icon}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {user && (
              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm sm:flex">
                <span className="text-amber-400">🔥</span>
                <span className="font-bold">{stats.streak}</span>
                <span className="text-slate-400">天</span>
                <span className="mx-1 h-4 w-px bg-white/10" />
                <span className="text-brand-300">✨</span>
                <span className="font-bold">{stats.totalXp}</span>
              </div>
            )}
            <Link to="/app/profile" className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1 pl-1 pr-3 transition hover:bg-white/10">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-base">
                {user?.avatar ?? "👤"}
              </span>
              <span className="hidden max-w-[7rem] truncate text-sm font-semibold sm:block">{user?.name ?? "未登录"}</span>
              {user?.isAdmin && <span className="chip bg-amber-500/20 text-amber-200" title="管理员">👑</span>}
            </Link>
            <button
              onClick={() => setMenuOpen((o) => !o)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 md:hidden"
              aria-label="菜单"
            >
              ☰
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-white/10 bg-ink-900/95 px-4 py-3 md:hidden">
            <nav className="grid gap-1">
              {navItems.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold ${
                      isActive ? "bg-white/10 text-white" : "text-slate-300"
                    }`
                  }
                >
                  <span>{n.icon}</span>
                  {n.label}
                </NavLink>
              ))}
              <button onClick={handleLogout} className="mt-2 flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-rose-300">
                <span>🚪</span> 退出登录
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 animate-fade-in">
        <Outlet />
      </main>

      <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">
        <p>LinguaVerse · 沉浸式多语种学习平台 · 让世界听得见你</p>
      </footer>
    </div>
  );
}

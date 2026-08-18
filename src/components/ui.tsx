import type { ReactNode } from "react";
import { useEffect, useState } from "react";

export function ProgressBar({ value, className = "", gradient = "from-brand-500 to-accent-500" }: { value: number; className?: string; gradient?: string }) {
  return (
    <div className={`h-2.5 w-full overflow-hidden rounded-full bg-white/10 ${className}`}>
      <div
        className={`h-full rounded-full bg-gradient-to-r ${gradient} transition-all duration-500`}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

export function ProgressRing({ value, size = 120, stroke = 10, children }: { value: number; size?: number; stroke?: number; children?: ReactNode }) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (Math.max(0, Math.min(100, value)) / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.1)" strokeWidth={stroke} fill="none" />
        <defs>
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

export function StatCard({ icon, label, value, hint, gradient = "from-brand-500/20 to-accent-500/20" }: { icon: string; label: string; value: ReactNode; hint?: string; gradient?: string }) {
  return (
    <div className="card relative overflow-hidden p-5">
      <div className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} blur-xl`} />
      <div className="relative">
        <div className="mb-2 text-2xl">{icon}</div>
        <div className="text-2xl font-extrabold">{value}</div>
        <div className="text-sm text-slate-400">{label}</div>
        {hint && <div className="mt-1 text-xs text-slate-500">{hint}</div>}
      </div>
    </div>
  );
}

export function Badge({ children, color = "brand" }: { children: ReactNode; color?: "brand" | "green" | "amber" | "rose" | "cyan" | "slate" }) {
  const map: Record<string, string> = {
    brand: "bg-brand-500/15 text-brand-200 border-brand-400/20",
    green: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
    amber: "bg-amber-500/15 text-amber-200 border-amber-400/20",
    rose: "bg-rose-500/15 text-rose-200 border-rose-400/20",
    cyan: "bg-cyan-500/15 text-cyan-200 border-cyan-400/20",
    slate: "bg-white/5 text-slate-300 border-white/10",
  };
  return <span className={`chip border ${map[color]}`}>{children}</span>;
}

export function Toast({ show, onClose, children }: { show: boolean; onClose: () => void; children: ReactNode }) {
  useEffect(() => {
    if (!show) return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [show, onClose]);
  if (!show) return null;
  return (
    <div className="fixed inset-x-0 top-4 z-[60] mx-auto w-fit max-w-[92%] animate-slide-up">
      <div className="card flex items-center gap-3 border-brand-400/30 bg-ink-800/90 px-5 py-3 shadow-glow">{children}</div>
    </div>
  );
}

export function AchievementToast({ achievements, onClose }: { achievements: { name: string; icon: string }[]; onClose: () => void }) {
  if (achievements.length === 0) return null;
  return (
    <Toast show onClose={onClose}>
      <div>
        {achievements.map((a, i) => (
          <div key={i} className="flex items-center gap-3 py-1">
            <span className="text-2xl animate-pop">{a.icon}</span>
            <div>
              <div className="text-xs uppercase tracking-wide text-brand-300">解锁成就</div>
              <div className="font-bold">{a.name}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white">✕</button>
    </Toast>
  );
}

export function useAchievementToast() {
  const [queue, setQueue] = useState<{ name: string; icon: string }[]>([]);
  useEffect(() => {
    if (queue.length === 0) return;
    const t = setTimeout(() => setQueue((q) => q.slice(1)), 4000);
    return () => clearTimeout(t);
  }, [queue]);
  const push = (items: { name: string; icon: string }[]) => {
    if (items.length) setQueue((q) => [...q, ...items]);
  };
  const current = queue[0];
  return { current, push, dismiss: () => setQueue((q) => q.slice(1)) };
}

export function EmptyState({ icon, title, description, action }: { icon: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-14 text-center">
      <div className="mb-3 text-5xl opacity-80">{icon}</div>
      <div className="text-lg font-bold">{title}</div>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Modal({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: ReactNode; title?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="card relative z-10 w-full max-w-md animate-pop p-6">
        {title && <h3 className="mb-4 text-xl font-extrabold">{title}</h3>}
        {children}
      </div>
    </div>
  );
}

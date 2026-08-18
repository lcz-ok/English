import { Link } from "react-router-dom";
import { LANGUAGE_LIST } from "../data/languages";

export function Home() {
  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-ink-900/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-lg shadow-glow">🌐</div>
            <span className="text-lg font-extrabold">LinguaVerse</span>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost">登录</Link>
            <Link to="/register" className="btn-primary">免费注册</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-16 text-center sm:pt-24">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold text-brand-200">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            全新沉浸式语言学习体验已上线
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-6xl">
            打开世界的钥匙
            <br />
            <span className="bg-gradient-to-r from-brand-300 via-accent-400 to-brand-300 bg-clip-text text-transparent">
              从学会一门语言开始
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg">
            英语、日语、韩语一站式学习。分级课程、互动练习、口语跟读、智能学习路径与社区陪伴，
            让每一次开口都更接近流利。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/register" className="btn-primary px-6 py-3 text-base">立即开始学习 →</Link>
            <Link to="/login" className="btn-ghost px-6 py-3 text-base">已有账号，登录</Link>
          </div>

          {/* Floating language bubbles */}
          <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {LANGUAGE_LIST.map((l, i) => (
              <div
                key={l.code}
                className={`card group relative overflow-hidden p-6 text-left transition hover:-translate-y-1 ${i === 1 ? "sm:-translate-y-3" : ""}`}
                style={{ animationDelay: `${i * 120}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${l.gradient} opacity-0 transition group-hover:opacity-10`} />
                <div className="mb-3 text-4xl">{l.flag}</div>
                <div className="text-xl font-extrabold">{l.name}</div>
                <div className="font-jp font-semibold text-slate-400">{l.nativeName}</div>
                <p className="mt-3 text-sm text-slate-400">{l.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-white/10 bg-white/[0.02] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="section-title">全方位沉浸式学习</h2>
            <p className="mt-2 text-slate-400">听说读写，立体训练，告别枯燥的死记硬背</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="card p-6 transition hover:border-brand-400/30">
                <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-brand-500/15 text-2xl">{f.icon}</div>
                <h3 className="text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="section-title">四大互动学习模块</h2>
            <p className="mt-2 text-slate-400">每个模块都为不同语言能力量身打造</p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m) => (
              <div key={m.title} className="card relative overflow-hidden p-6">
                <div className="mb-3 text-3xl">{m.icon}</div>
                <h3 className="font-bold">{m.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{m.desc}</p>
                <div className="mt-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand-500 to-accent-500" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-24">
        <div className="card relative mx-auto max-w-4xl overflow-hidden p-10 text-center sm:p-14">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-accent-500/20" />
          <div className="relative">
            <h2 className="text-3xl font-black sm:text-4xl">今天，就从第一个单词开始</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-300">加入 LinguaVerse，开启你的多语种学习之旅。免费注册，立即体验。</p>
            <Link to="/register" className="btn-primary mt-8 px-8 py-3.5 text-base">免费注册，开始学习</Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500">
        <p>© LinguaVerse · 沉浸式多语种学习平台</p>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: "🎓", title: "分级课程体系", desc: "A1 到 C1 完整分级，从零基础到流利表达，循序渐进。" },
  { icon: "🎯", title: "个性化学习路径", desc: "根据你的进度与弱项，智能推荐最适合的下一步。" },
  { icon: "📈", title: "进度实时追踪", desc: "XP、连续学习天数、完成率，可视化你的成长轨迹。" },
  { icon: "🗣️", title: "口语跟读训练", desc: "语音识别即时反馈，让发音像母语者一样自然。" },
  { icon: "🏆", title: "成就激励系统", desc: "解锁徽章、升级等级，让坚持学习充满成就感。" },
  { icon: "💬", title: "社区交流", desc: "和全球学习者一起打卡、分享、互助成长。" },
];

const MODULES = [
  { icon: "📖", title: "单词记忆", desc: "翻卡式记忆，结合例句语境" },
  { icon: "✍️", title: "语法练习", desc: "情景选择题，即时解析错题" },
  { icon: "🎙️", title: "口语跟读", desc: "语音评分，告别哑巴外语" },
  { icon: "🎧", title: "听力训练", desc: "真实场景对话，磨耳朵" },
];

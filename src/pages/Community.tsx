import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { SEED_POSTS } from "../data/community";
import { LANGUAGE_LIST } from "../data/languages";
import type { CommunityPost, LangCode } from "../data/types";
import { load, save, STORAGE_KEYS, uid } from "../lib/storage";
import { capsFor } from "../lib/permissions";
import { Badge, EmptyState, Modal } from "../components/ui";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "刚刚";
  if (m < 60) return `${m} 分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} 小时前`;
  const d = Math.floor(h / 24);
  return `${d} 天前`;
}

export function Community() {
  const { user } = useApp();
  const canPost = capsFor(user).canPostInCommunity;
  const [posts, setPosts] = useState<CommunityPost[]>(() => {
    const userPosts = load<CommunityPost[]>(STORAGE_KEYS.posts, []);
    return [...userPosts, ...SEED_POSTS].sort((a, b) => b.createdAt - a.createdAt);
  });
  const [filter, setFilter] = useState<LangCode | "all">("all");
  const [composeOpen, setComposeOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", lang: "all" as LangCode | "all", tags: "" });

  const visible = useMemo(() => {
    if (filter === "all") return posts;
    return posts.filter((p) => p.lang === filter || p.lang === "all");
  }, [posts, filter]);

  const toggleLike = (id: string) => {
    if (!user) return;
    setPosts((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p;
        const liked = p.likedBy.includes(user.id);
        return {
          ...p,
          liked: !liked,
          likes: liked ? p.likes - 1 : p.likes + 1,
          likedBy: liked ? p.likedBy.filter((u) => u !== user.id) : [...p.likedBy, user.id],
        };
      });
      // persist only user-authored posts (keep seed posts in memory)
      const userOnly = updated.filter((p) => p.authorId !== "seed");
      save(STORAGE_KEYS.posts, userOnly);
      return updated;
    });
  };

  const submit = () => {
    if (!user || !draft.title.trim() || !draft.body.trim()) return;
    const post: CommunityPost = {
      id: uid("post"),
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatar,
      lang: draft.lang,
      title: draft.title.trim(),
      body: draft.body.trim(),
      createdAt: Date.now(),
      likes: 0,
      likedBy: [],
      tags: draft.tags.split(/[，,]/).map((t) => t.trim()).filter(Boolean),
    };
    const next = [post, ...posts];
    setPosts(next);
    const userOnly = next.filter((p) => p.authorId !== "seed");
    save(STORAGE_KEYS.posts, userOnly);
    setDraft({ title: "", body: "", lang: "all", tags: "" });
    setComposeOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black sm:text-3xl">学习社区</h1>
          <p className="mt-1 text-slate-400">和全球学习者交流、打卡、互助成长</p>
        </div>
        {canPost ? (
          <button onClick={() => setComposeOpen(true)} className="btn-primary">✏️ 发布帖子</button>
        ) : (
          <Link to="/register" className="btn-primary opacity-90" title="游客不可发帖，注册后即可发布">🔒 注册后可发帖</Link>
        )}
      </div>

      {!canPost && (
        <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          当前为游客身份，仅可浏览社区内容。注册账号即可发帖、点赞、参与互动。
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${filter === "all" ? "border-brand-400 bg-brand-500/20" : "border-white/10 bg-white/5 text-slate-300"}`}
        >
          全部
        </button>
        {LANGUAGE_LIST.map((l) => (
          <button
            key={l.code}
            onClick={() => setFilter(l.code)}
            className={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${filter === l.code ? "border-brand-400 bg-brand-500/20" : "border-white/10 bg-white/5 text-slate-300"}`}
          >
            {l.flag} {l.name}
          </button>
        ))}
      </div>

      {/* Posts */}
      {visible.length === 0 ? (
        <EmptyState icon="💬" title="还没有帖子" description="成为第一个发帖的人吧！" action={canPost ? <button onClick={() => setComposeOpen(true)} className="btn-primary">发布帖子</button> : <Link to="/register" className="btn-primary">注册后可发帖</Link>} />
      ) : (
        <div className="grid gap-4">
          {visible.map((post) => {
            const liked = user ? post.likedBy.includes(user.id) : false;
            const langInfo = LANGUAGE_LIST.find((l) => l.code === post.lang);
            return (
              <div key={post.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-lg">
                    {post.authorAvatar}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{post.authorName}</span>
                      <span className="text-xs text-slate-500">{timeAgo(post.createdAt)}</span>
                      {langInfo && <Badge color="cyan">{langInfo.flag} {langInfo.name}</Badge>}
                      {post.lang === "all" && <Badge color="slate">综合</Badge>}
                    </div>
                    <h3 className="mt-1.5 text-lg font-bold">{post.title}</h3>
                    <p className="mt-1 whitespace-pre-wrap text-sm text-slate-300">{post.body}</p>
                    {post.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {post.tags.map((t) => (
                          <span key={t} className="chip bg-white/5 text-slate-400">#{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-4 text-sm">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 transition hover:text-rose-300 ${liked ? "text-rose-300" : "text-slate-400"}`}
                      >
                        <span className={liked ? "scale-110" : ""}>{liked ? "❤️" : "🤍"}</span>
                        <span>{post.likes}</span>
                      </button>
                      <span className="flex items-center gap-1.5 text-slate-400">💬 评论</span>
                      <span className="flex items-center gap-1.5 text-slate-400">🔁 分享</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal open={composeOpen} onClose={() => setComposeOpen(false)} title="发布新帖子">
        <div className="space-y-4">
          <input className="input" placeholder="帖子标题" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          <textarea className="input min-h-[120px] resize-y" placeholder="分享你的学习心得、打卡、问题…" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-300">相关语言</label>
            <select className="input" value={draft.lang} onChange={(e) => setDraft({ ...draft, lang: e.target.value as LangCode | "all" })}>
              <option value="all">综合</option>
              {LANGUAGE_LIST.map((l) => (
                <option key={l.code} value={l.code}>{l.name}</option>
              ))}
            </select>
          </div>
          <input className="input" placeholder="标签，用逗号分隔（如：打卡,学习方法）" value={draft.tags} onChange={(e) => setDraft({ ...draft, tags: e.target.value })} />
          <div className="flex gap-3">
            <button onClick={() => setComposeOpen(false)} className="btn-ghost flex-1">取消</button>
            <button onClick={submit} className="btn-primary flex-1">发布</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

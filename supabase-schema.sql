-- LinguaVerse Supabase 数据库 Schema
-- 在 Supabase 项目 SQL Editor 中执行以下脚本

-- ============================================================
-- 表 1：用户表（含账号、密码哈希、个人资料）
-- ============================================================
create table if not exists public.users (
  id text primary key,
  key text unique default 'users',
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- 表 2：学习进度表（按 userId 索引）
-- ============================================================
create table if not exists public.progress (
  id text primary key,
  key text unique,
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- 表 3：社区帖子表
-- ============================================================
create table if not exists public.posts (
  id text primary key,
  key text unique default 'posts',
  value jsonb not null,
  updated_at timestamptz default now()
);

-- ============================================================
-- 启用 Row Level Security（RLS）
-- ============================================================
alter table public.users enable row level security;
alter table public.progress enable row level security;
alter table public.posts enable row level security;

-- ============================================================
-- RLS 策略：允许匿名访问（demo 项目，公开读写）
-- 生产环境请收紧为仅认证用户可写
-- ============================================================
create policy "Allow public read access on users" on public.users for select using (true);
create policy "Allow public write access on users" on public.users for insert with check (true);
create policy "Allow public update access on users" on public.users for update using (true);

create policy "Allow public read access on progress" on public.progress for select using (true);
create policy "Allow public write access on progress" on public.progress for insert with check (true);
create policy "Allow public update access on progress" on public.progress for update using (true);

create policy "Allow public read access on posts" on public.posts for select using (true);
create policy "Allow public write access on posts" on public.posts for insert with check (true);
create policy "Allow public update access on posts" on public.posts for update using (true);
create policy "Allow public delete access on posts" on public.posts for delete using (true);

-- ============================================================
-- 自动更新 updated_at 字段
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists users_updated_at on public.users;
create trigger users_updated_at before update on public.users
  for each row execute function public.handle_updated_at();

drop trigger if exists progress_updated_at on public.progress;
create trigger progress_updated_at before update on public.progress
  for each row execute function public.handle_updated_at();

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at before update on public.posts
  for each row execute function public.handle_updated_at();

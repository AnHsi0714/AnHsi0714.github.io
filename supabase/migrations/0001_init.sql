-- 對應 docs/ARCHITECTURE.md §4、§5
-- 所有表預設只開放 public select；寫入只能透過 Supabase Studio（你自己的帳號）
-- 或下面的 redeem_invite_and_create RPC（朋友創作唯一的對外寫入口）

-- 人生區：人生事件時間軸
create table life_events (
  id bigint generated always as identity primary key,
  event_date date not null,
  title text not null,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

alter table life_events enable row level security;
create policy "public can read life_events"
  on life_events for select using (true);


-- 朋友功能：邀請碼
create table invite_codes (
  id bigint generated always as identity primary key,
  code text not null unique,
  is_used boolean not null default false,
  used_by_nickname text,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  used_at timestamptz
);

alter table invite_codes enable row level security;
-- 完全不給任何 policy → anon 連 select 都看不到，只能透過下面的 RPC 兌換


-- 朋友功能：創作內容
-- 目前方向：2D 像素風。data 範例：
--   { "grid": 16, "pixels": [ { "x": 3, "y": 2, "color": "#ff0000" }, ... ] }
create table friend_creations (
  id bigint generated always as identity primary key,
  nickname text not null,
  kind text not null default '2d' check (kind in ('2d', '3d')),  -- 保留彈性，目前只會用到 '2d'
  data jsonb not null,
  thumbnail_url text,             -- 2D 像素版不需要；若日後改走 3D 才需要存預渲染縮圖
  invite_code_id bigint references invite_codes(id),
  is_visible boolean not null default true,  -- 你審核後可關閉顯示
  created_at timestamptz not null default now()
);

alter table friend_creations enable row level security;
create policy "public can read visible creations"
  on friend_creations for select using (is_visible = true);
-- 同樣不開放 anon 直接 insert，只能透過下面的 RPC


-- 朋友功能：邀請碼兌換 + 建立創作（原子操作，避免同一碼被搶用兩次）
create or replace function redeem_invite_and_create(
  p_code text,
  p_nickname text,
  p_kind text,
  p_data jsonb
) returns friend_creations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code_row invite_codes;
  v_new_row friend_creations;
begin
  select * into v_code_row from invite_codes
    where code = p_code
      and is_used = false
      and (expires_at is null or expires_at > now())
    for update;  -- 鎖住該列，避免同碼被同時兌換兩次

  if v_code_row is null then
    raise exception '邀請碼無效或已使用';
  end if;

  update invite_codes
    set is_used = true, used_by_nickname = p_nickname, used_at = now()
    where id = v_code_row.id;

  insert into friend_creations (nickname, kind, data, invite_code_id)
    values (p_nickname, p_kind, p_data, v_code_row.id)
    returning * into v_new_row;

  return v_new_row;
end;
$$;

grant execute on function redeem_invite_and_create to anon;

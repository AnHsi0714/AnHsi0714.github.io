# 個人網站架構規劃

## 2026-06-20

> 基於 React + Supabase，部署目標假設為 GitHub Pages（`AnHsi0714.github.io`，根網域靜態站）。
> 核心前提：**網站本身不做登入系統**。你自己的內容透過 Supabase Studio（你自己的 Supabase 帳號）直接管理；朋友功能用邀請碼，不建帳號系統。

---

## 0. 核心決策摘要

| 問題                | 決定                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------- |
| 後台/登入系統       | 不做。網站對外永遠是「唯讀」的，你自己的資料透過 Supabase Studio 的 Table Editor 增刪改 |
| 朋友 2D/3D 創作身份 | 邀請碼機制，不建帳號系統，只需暱稱                                                      |
| 任務區可見度        | 公開展示任務進度（像 build-in-public 牆），訪客唯讀                                     |
| 朋友創作風格        | 2D 像素風（存座標 + 顏色），3D 方向未定；正式上線最終只會二選一其一                      |
| 畫廊視覺氛圍        | 寧靜展覽感＋單一聚光燈；與其他區塊風格分開處理而非統一視覺語言（見 §6.1）                |
| 訪客統計／第三方追蹤 | 不做，不導入任何分析工具                                                                |

這三個決定的共同結果：**整個網站只有一種寫入路徑需要對外開放**——朋友創作功能（透過邀請碼），其餘所有資料的寫入都只發生在 Supabase Studio（用你自己的帳號登入 Supabase 後台，跟網站本身的訪客是兩個世界），網站前端對 Supabase 只做 `select`。

---

## 1. 技術棧總覽

| 分類       | 選擇                                              | 理由                                                             |
| ---------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| 前端框架   | React + Vite + TypeScript                         | 輕量、無需 SSR，適合純前端打包後丟 GitHub Pages                  |
| 路由       | React Router（純前端路由）                        | user page 部署在根網域，不需要 basename                          |
| 樣式       | Tailwind CSS                                      | 大量卡片/網格版面（畫廊、專案、夢想清單）用 utility class 開發快 |
| 資料抓取   | `@tanstack/react-query` + `@supabase/supabase-js` | 統一處理 loading/error/cache，避免每頁手刻 fetch 邏輯            |
| 2D 繪製    | Canvas（固定尺寸像素網格編輯器，存座標 + 顏色）    | 資料即視覺，縮圖可直接從資料重繪，不用額外存圖（見 §7）          |
| 3D 製作    | 方向未定，暫緩（最終 2D/3D 二選一，見 §0、§7）     | 先把 2D 像素版做出來再評估是否要換方向，不同時維護兩套           |
| p5.js 畫廊 | p5.js instance mode                               | 多個 sketch 共存不衝突、可隨路由掛載/卸載                        |
| 後端       | Supabase（Postgres + Storage + RPC function）     | 你已指定；只在「朋友創作」這個真正需要動態寫入的功能上發揮價值   |
| 部署       | GitHub Actions → GitHub Pages                     | repo 本身就是 `*.github.io`，免額外網域設定                      |

---

## 2. 系統架構總覽

```
                    ┌─────────────────────────────┐
                    │   訪客瀏覽器                  │
                    │   (React SPA, 靜態檔案)       │
                    └───────────────┬─────────────┘
                                    │ HTTPS
                                    ▼
                    ┌─────────────────────────────┐
                    │   GitHub Pages（純靜態託管）   │
                    │   build 產物：dist/           │
                    └───────────────┬─────────────┘
                                    │ 前端直接呼叫 (anon key)
                                    ▼
                    ┌─────────────────────────────┐
                    │   Supabase                   │
                    │   - Postgres (RLS 唯讀 for     │
                    │     public 大部分表)           │
                    │   - RPC: redeem_invite_and_   │
                    │     create()（朋友創作唯一寫入口）│
                    │   - Storage（朋友縮圖，可選）   │
                    └───────────────┬─────────────┘
                                    │ 你自己用 Supabase 帳號登入
                                    ▼
                    ┌─────────────────────────────┐
                    │   Supabase Studio（後台）      │
                    │   你在這裡新增/編輯：           │
                    │   人生事件、讀書心得、夢想、     │
                    │   專案、任務狀態、審核朋友創作   │
                    └─────────────────────────────┘
```

網站完全不知道「登入」這件事——對訪客來說所有頁面都公開可看；你管理資料時走的是 Supabase 自己的後台，跟網站程式碼無關。

---

## 3. 內容資料分類與儲存策略

你提到「不確定用 Supabase 還是直接 commit push」。建議依「資料變動頻率」與「是否由你獨自產生」分兩類：

### A. Git 內容檔（Markdown/JSON，跟著程式碼一起 commit）

適合：你自己慢慢寫、不常變動、寫起來像「文章」的內容。

| 區塊              | 格式建議                                                                         |
| ----------------- | -------------------------------------------------------------------------------- |
| 讀書心得          | 每本書一個 `.md`（frontmatter 存書名/作者/評分/完成日期，正文是心得）            |
| 夢想清單          | 一個 `dreams.json`（陣列，每項含 title/status/desc）                             |
| 專案區            | 一個 `projects.json`（name/desc/screenshot 路徑/github url）                     |
| 藝術畫廊 metadata | 一個 `artworks.json`（title/縮圖路徑/sketch slug），sketch 程式碼本來就要進 repo |

優點：零後端延遲、版本控制、改完 `git push` 自動觸發部署，不用碰 Supabase。

### B. Supabase 資料表（透過 Supabase Studio 管理）

適合：變動頻率較高、或本質上是「執行期、多方寫入」的資料。

| 區塊                     | 為什麼放 Supabase                                                                                   |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| 人生區（人生事件時間軸） | 想到就能補一筆，不想每次都 commit；用手機開 Supabase Studio 也能加                                  |
| 任務區（任務清單）       | 你決定要公開即時展示進度，狀態可能常常變動（todo→doing→done），用 Studio 改一個欄位比 git push 方便 |
| 朋友 2D/3D 創作 + 邀請碼 | **必須**是資料庫——這是執行期、由不特定第三方（朋友）寫入的資料，沒有任何方式能用 git 處理           |

切換成本低：兩種方式在前端都只是「換一個 data fetching hook」（讀本地 JSON or 讀 Supabase），之後想把某區從 A 搬到 B（或反過來）都很容易，不是不可逆的決定。

---

## 4. Supabase 資料庫設計

只列出「會放進 Supabase 的部分」：人生區、任務區、朋友創作 + 邀請碼。

```sql
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
-- 沒有 insert/update/delete policy → anon/authenticated 預設全部被拒絕
-- 只能透過 Supabase Studio（service role）修改


-- 任務區：公開任務進度
create table tasks (
  id bigint generated always as identity primary key,
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'doing', 'done')),
  due_date date,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table tasks enable row level security;
create policy "public can read tasks"
  on tasks for select using (true);


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
-- 縮圖不用另外存——前端用同一份 pixels 資料即可即時重繪小圖（見 §7）
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
```

---

## 5. 朋友邀請碼機制：唯一的對外寫入口

因為「邀請碼必須一次性使用」這個邏輯如果單純靠前端檢查會有 race condition（兩人同時搶同一碼），用一個 `security definer` 的 RPC function 把「驗證碼 + 標記已用 + 寫入創作」包成一個原子操作：

```sql
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
```

前端流程：朋友輸入邀請碼 + 暱稱 →（2D/3D 編輯器產出 `data` 與縮圖）→ 呼叫
`supabase.rpc('redeem_invite_and_create', { p_code, p_nickname, p_kind, p_data })`。
失敗（碼錯/已用）會直接拋例外，前端顯示「邀請碼無效或已使用」。

**縮圖儲存**：因為走 2D 像素風，`data` 裡的座標 + 顏色本身就是完整的「圖」，不需要另外產生/儲存縮圖圖檔——朋友列表頁要顯示縮圖時，前端直接拿 `pixels` 陣列在一個小 `<canvas>`（或畫成 SVG `<rect>`）上重繪即可，省掉 base64/Storage 那一層。即使列表上同時顯示幾十個朋友作品，重繪像素方塊的成本也遠低於載入圖片或掛載 3D 場景。

（如果之後真的改走 3D 方向，重新渲染一個 Three.js 場景的成本就高很多，那時才需要補上預渲染縮圖 + Storage bucket 的設計。）

**個資考量**：整個流程只收「暱稱」，不收 email、不建帳號，符合你「邀請碼機制、無帳號系統」的決定，個資風險最小化。邀請碼本身由你私下發給朋友（line/訊息），網站上沒有任何地方公開列出可用邀請碼。

---

## 6. 藝術畫廊（OpenProcessing 搬遷）：效能設計

你提到的需求：「移動到該位置或 hover 播放 gif，點進去可執行操作（避免效能吃太多）」。設計如下：

1. **列表頁（grid）**：每個作品是一張靜態縮圖（poster frame）。
2. **hover/移入觸發預覽**：**建議用短秒數、無聲、循環播放的 `<video muted loop playsinline>` 取代真正的 .gif**——同樣的視覺效果下，影片檔案小很多、CPU 解碼負擔遠低於 GIF，且可以用 JS 精準控制 `play()`/`pause()`（滑出就暫停，不會所有卡片同時播放吃效能）。手機上沒有 hover，改用「滾動進入可視範圍」觸發播放。
3. **點進去才執行真正的 p5.js**：列表頁**完全不掛載任何即時 canvas**，只有進到 `/gallery/:slug` 詳細頁時才動態 `import()` 對應的 sketch 模組、用 **instance mode** `new p5(sketchFn, containerRef)` 掛載；離開頁面時呼叫 `p5Instance.remove()` 卸載。整個網站任何時刻最多只有一個活著的 p5 canvas，避免多個 WebGL/canvas context 同時跑造成的效能問題。
4. **OpenProcessing 程式碼遷移**：OpenProcessing 上的 sketch 預設是 global mode（`function setup(){}` 直接寫在頂層），搬過來時要重寫成 instance mode（包進 `(p) => { p.setup = ...; p.draw = ... }`），否則多個 sketch 的全域 `setup`/`draw` 會互相覆蓋衝突。

### 6.1 視覺氛圍：寧靜展覽感

你想要的效果是「安靜的展場 + 一盞聚光燈打在作品上」，這跟朋友創作區的像素風（鮮豔、方塊、活潑）在視覺語言上確實會衝突——**不需要勉強統一成一套風格**，把它們當成網站裡兩個不同的「房間」即可，只靠 NavBar/字體等少數元素維持整站的一致感，背景氛圍各自獨立：

- **列表頁**：偏中性即可（不用太暗），重點是縮圖卡片本身清楚好掃視。
- **詳細頁（`/gallery/:slug`，看單一作品時）**：才真正進入「展覽感」——背景轉成接近黑/深藍的純色，畫作/canvas 容器置中，用一個以 canvas 為中心的 `radial-gradient`（暖白光，由內向外漸暗）疊出聚光燈效果，四周加一點 vignette 讓視線聚焦在作品上；導覽列等 UI chrome 淡化或縮到最小，只留返回的路徑。這些單靠 CSS（`radial-gradient` + 深色背景 + 適度的 `box-shadow`）就能做到，不需要額外的燈光特效函式庫。
- 朋友創作區維持自己原本明亮、方塊感的調色，兩邊互不影響。

---

## 7. 朋友 2D/3D 創作功能：像素編輯器設計

已定案方向：**2D 像素風**，朋友在一個固定尺寸的像素網格上點選顏色作畫，存的就是「座標 + 顏色」這種最直接的結構。3D 小怪獸暫無具體想法，先不展開設計——**最終正式上線只會二選一**，建議先把 2D 像素版做完、實際用起來，再評估是否要做或換成 3D，不必兩套同時維護。

### 2D 像素編輯器

- 畫布是固定大小的網格（例如 16×16 或 32×32，視覺上像復古像素圖），朋友用滑鼠/觸控點格子上色，旁邊給一個固定色盤（不開放任意色相選擇也可以，色盤本身就是一種風格控制）。
- `data jsonb` 直接存朋友畫出來的座標與顏色，採「只存有上色的格子」的稀疏陣列，空白格不用存：

  ```json
  {
    "grid": 16,
    "pixels": [
      { "x": 3, "y": 2, "color": "#ff0000" },
      { "x": 4, "y": 2, "color": "#ff0000" }
    ]
  }
  ```

- 即使整張畫滿（16×16 = 256 格），JSON 大小也只有幾 KB，遠低於 jsonb 欄位限制，不需要 Storage。
- 列表頁/朋友畫廊要顯示縮圖時，直接拿 `pixels` 在一個小 `<canvas>` 上用 `fillRect` 重繪每個像素即可（見 §6.1：縮圖不需預先產生，因為資料本身就是圖）。

### 3D 小怪獸（暫緩）

目前沒有具體想法，先不設計資料結構或互動方式。如果之後決定往這個方向走，再回頭參考 React Three Fiber + 參數化部件的做法（用滑桿/選項調整形狀與顏色，`data` 存部件 ID 而非任意模型檔案），但這不是現在的優先事項。

### 內容風險

固定網格 + 固定色盤本身就把「能畫出什麼」限制在很小的範圍內（最壞情況也只是一張低解析度像素圖），不需要額外的審核機制；`is_visible` 欄位還是留著，萬一真的有需要還是能手動關閉個別作品。

---

## 8. 專案目錄結構建議

```
/
├── public/
│   ├── gallery/              # 畫廊縮圖 + hover 預覽影片
│   └── images/               # 人生區、讀書心得等的靜態圖片
├── content/                   # §3 的「Git 內容檔」
│   ├── books/*.md
│   ├── dreams.json
│   ├── projects.json
│   └── artworks.json
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx
│   │   │   ├── GalleryDetail.tsx
│   │   │   └── sketches/        # 搬遷後的 p5.js instance-mode 模組
│   │   ├── life/
│   │   ├── books/
│   │   ├── projects/
│   │   ├── dreams/
│   │   ├── tasks/
│   │   └── friends/
│   │       ├── InviteGate.tsx
│   │       ├── Creator2D.tsx        # 像素編輯器，見 §7；3D 暫緩，未實作
│   │       └── FriendGallery.tsx
│   ├── components/             # NavBar、Card、Loading 等共用元件
│   ├── hooks/                  # useLifeEvents、useTasks 等資料 hook
│   └── types/
├── supabase/
│   └── migrations/             # §4、§5 的 SQL，用 Supabase CLI 管理版本
├── .github/workflows/deploy.yml
├── vite.config.ts
└── package.json
```

---

## 9. 部署流程

1. GitHub Actions（`.github/workflows/deploy.yml`）：push 到 `main` 時跑 `npm run build`，將 `dist/` 部署到 `gh-pages` 分支（用 `actions/deploy-pages` 或 `peaceiris/actions-gh-pages`）。
2. 環境變數：`VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` 存成 GitHub repo secrets，build 時注入。anon key 設計上就是可公開的（安全性由 RLS 保證），放進前端 bundle 沒問題。
3. 因為是 `*.github.io` user page，網站會直接吃根網域，路由不需要 basename。

---

## 10. 分階段路線圖

| 階段    | 內容                                                                                 |
| ------- | ------------------------------------------------------------------------------------ |
| Phase 1 | Vite + React 骨架、路由、Tailwind、GitHub Actions 部署打通（先讓一個空殼網站能上線） |
| Phase 2 | 讀書心得/夢想/專案區（§3-A 的 git 內容檔），先把「靜態內容類」頁面做完               |
| Phase 3 | Supabase 專案建立、§4 schema + RLS 上線，人生區、任務區接上即時資料                  |
| Phase 4 | 藝術畫廊：先搬 3-5 個 OpenProcessing sketch 驗證 instance-mode 遷移 + hover 預覽機制 |
| Phase 5 | 朋友創作功能（邀請碼 RPC + 2D 像素編輯器）                                           |
| Phase 6 | 視覺風格打磨（含畫廊聚光燈效果）、SEO/OG meta、響應式                                |

建議優先度：Phase 1-3 是地基，Phase 4、5 可以對調順序，依你想先看到哪個成果決定。

---

## 11. 待你後續決定的開放問題

- 像素網格的具體尺寸與色盤（16×16？32×32？色盤要幾色、要不要包含黑/白/透明）。
- 是否真的要做 3D 小怪獸這個替代方向，還是直接定案只做 2D 像素版。
- 整體（非畫廊、非朋友創作區）的基礎視覺風格：色調、字體、是否要深色模式。

已決定不做／暫不考慮：訪客流量統計、第三方追蹤、邀請碼外流的速率限制（目前「一碼一用」的設計已足夠）。

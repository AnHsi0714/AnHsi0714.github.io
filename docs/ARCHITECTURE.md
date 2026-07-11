# 個人網站架構規劃

## 2026-06-20

> 基於 React + Supabase，部署目標假設為 GitHub Pages（`AnHsi0714.github.io`，根網域靜態站）。
> 核心前提：**網站本身不做登入系統**。你自己的內容透過 Supabase Studio（你自己的 Supabase 帳號）直接管理；朋友功能用邀請碼，不建帳號系統。

---

## 0. 核心決策摘要

| 問題                 | 決定                                                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 後台/登入系統        | 不做。網站對外永遠是「唯讀」的，你自己的資料透過 Supabase Studio 的 Table Editor 增刪改                                                  |
| 朋友 2D/3D 創作身份  | 邀請碼機制，不建帳號系統，只需暱稱                                                                                                       |
| 內容區塊範圍         | 不做獨立任務區；書籍區擴展為文章區（`type: book\|note`），可容納雜記／影評／技術筆記；夢想區只存「想做的事＋為什麼」靜態清單，無狀態欄位 |
| 朋友創作風格         | 2D 像素風（存座標 + 顏色），3D 方向未定；正式上線最終只會二選一其一                                                                      |
| 畫廊視覺氛圍         | 寧靜展覽感＋單一聚光燈；與其他區塊風格分開處理而非統一視覺語言（見 §6.1）                                                                |
| 訪客統計／第三方追蹤 | 不做，不導入任何分析工具                                                                                                                 |

這三個決定的共同結果：**整個網站只有一種寫入路徑需要對外開放**——朋友創作功能（透過邀請碼），其餘所有資料的寫入都只發生在 Supabase Studio（用你自己的帳號登入 Supabase 後台，跟網站本身的訪客是兩個世界），網站前端對 Supabase 只做 `select`。

---

## 1. 技術棧總覽

| 分類       | 選擇                                                  | 理由                                                             |
| ---------- | ----------------------------------------------------- | ---------------------------------------------------------------- |
| 前端框架   | React + Vite + TypeScript                             | 輕量、無需 SSR，適合純前端打包後丟 GitHub Pages                  |
| 路由       | React Router（純前端路由）                            | user page 部署在根網域，不需要 basename                          |
| 樣式       | Tailwind CSS                                          | 大量卡片/網格版面（畫廊、專案、夢想清單）用 utility class 開發快 |
| 資料抓取   | `@tanstack/react-query` + `@supabase/supabase-js`     | 統一處理 loading/error/cache，避免每頁手刻 fetch 邏輯            |
| 2D 繪製    | Canvas（像素網格編輯器，網格尺寸可選，存座標 + 顏色） | 資料即視覺，縮圖可直接從資料重繪，不用額外存圖（見 §7）          |
| 3D 製作    | 方向未定，暫緩（最終 2D/3D 二選一，見 §0、§7）        | 先把 2D 像素版做出來再評估是否要換方向，不同時維護兩套           |
| p5.js 畫廊 | p5.js instance mode                                   | 多個 sketch 共存不衝突、可隨路由掛載/卸載                        |
| 2D 物理    | matter-js                                             | 「金屬碰撞」單件作品的剛體模擬，只有該 sketch 模組引用           |
| 後端       | Supabase（Postgres + Storage + RPC function）         | 你已指定；只在「朋友創作」這個真正需要動態寫入的功能上發揮價值   |
| 部署       | GitHub Actions → GitHub Pages                         | repo 本身就是 `*.github.io`，免額外網域設定                      |

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
                    │   邀請碼、審核朋友創作           │
                    └─────────────────────────────┘
```

網站完全不知道「登入」這件事——對訪客來說所有頁面都公開可看；你管理資料時走的是 Supabase 自己的後台，跟網站程式碼無關。

---

## 3. 內容資料分類與儲存策略

你提到「不確定用 Supabase 還是直接 commit push」。建議依「資料變動頻率」與「是否由你獨自產生」分兩類：

### A. Git 內容檔（Markdown/JSON，跟著程式碼一起 commit）

適合：你自己慢慢寫、不常變動、寫起來像「文章」的內容。

| 區塊               | 格式建議                                                                                                                                                                                                                                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 文章（含讀書心得） | 每篇一個 `.md`（frontmatter：`type: book\|note`、標題/日期；`author`/`rating` 只有 book 才填；`excerpt` 可選，沒填就自動從正文萃取前 100 字）；渲染為詳細頁 `/articles/:slug`，支援篩選器（標題、分類、評分、日期）                                                                                                                                                          |
| 夢想清單           | 一個 `dreams.json`（陣列，每項含 title/desc，無狀態欄位）                                                                                                                                                                                                                                                                                                                    |
| 專案區             | 一個 `projects.json`（`slug/name/desc/date/status: todo\|in-progress\|done/tags/collaborators/period/advisor/screenshotUrl/githubUrl`）；長文寫法另外放 `content/projects/<slug>.md`（選填，渲染為詳細頁 `/projects/:slug`）；MD H2 標題統一為：專案簡介、相關連結、系統架構、核心功能、心得                                                                                 |
| 經歷               | 硬寫在 `src/pages/experience/Experience.tsx`（條目不多、不需動態資料），渲染為 `/experience` 時間軸頁                                                                                                                                                                                                                                                                        |
| 藝術畫廊 metadata  | 一個 `artworks.json`（slug/title/date/縮圖路徑陣列/`openProcessingUrl` 原稿連結），sketch 程式碼本來就要進 repo；沒有另外的 sketch slug 欄位，`sketches/index.ts` 直接拿 artwork 的 `slug` 當 key 對應到 sketch factory，兩者共用同一個 slug。列表頁支援篩選器（標題、日期、互動類型、最新/最久排序），互動類型取自 `SketchEntry.interactions`，未移植的作品歸為「靜態展示」 |

優點：零後端延遲、版本控制、改完 `git push` 自動觸發部署，不用碰 Supabase。

### B. Supabase 資料表（透過 Supabase Studio 管理）

適合：變動頻率較高、或本質上是「執行期、多方寫入」的資料。

| 區塊                     | 為什麼放 Supabase                                                                         |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| 朋友 2D/3D 創作 + 邀請碼 | **必須**是資料庫——這是執行期、由不特定第三方（朋友）寫入的資料，沒有任何方式能用 git 處理 |

切換成本低：兩種方式在前端都只是「換一個 data fetching hook」（讀本地 JSON or 讀 Supabase），之後想把某區從 A 搬到 B（或反過來）都很容易，不是不可逆的決定。

---

## 4. Supabase 資料庫設計

只列出「會放進 Supabase 的部分」：朋友創作 + 邀請碼。

```sql
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

-- Supabase 專案建立時關閉了「Automatically expose new tables」（手動控制授權），
-- 表不會自動授權給 Data API 角色，需要手動 grant；
-- invite_codes 刻意不給任何權限（anon 連 select 都不行，只能走 RPC 兌換）
grant select on friend_creations to anon;
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

**邀請碼產生方式**：沒有管理介面（刻意的，見 §1），要發碼時在 Supabase Studio 的 SQL Editor 執行：

```sql
-- 指定一個好唸的碼（發給特定朋友）
insert into invite_codes (code) values ('abc123');

-- 或一次產 5 個 8 碼隨機碼
insert into invite_codes (code)
select substr(md5(random()::text), 1, 8)
from generate_series(1, 5)
returning code;

-- 需要限時的話帶 expires_at
insert into invite_codes (code, expires_at)
values ('party-2026', now() + interval '7 days');
```

`returning code` 會直接把產出的碼列出來，複製後私訊給朋友即可；發出去的碼用 `select * from invite_codes order by created_at desc;` 隨時可查用掉了沒（`is_used`／`used_by_nickname`）。

---

## 6. 藝術畫廊（OpenProcessing 搬遷）：效能設計

你提到的需求：「移動到該位置或 hover 播放 gif，點進去可執行操作（避免效能吃太多）」。設計如下：

1. **列表頁（grid）**：每個作品是一張靜態縮圖（poster frame）。
2. **hover/移入觸發預覽**：**建議用短秒數、無聲、循環播放的 `<video muted loop playsinline>` 取代真正的 .gif**——同樣的視覺效果下，影片檔案小很多、CPU 解碼負擔遠低於 GIF，且可以用 JS 精準控制 `play()`/`pause()`（滑出就暫停，不會所有卡片同時播放吃效能）。手機上沒有 hover，改用「滾動進入可視範圍」觸發播放。
3. **點進去才執行真正的 p5.js**：列表頁**完全不掛載任何即時 canvas**，只有進到 `/gallery/:slug` 詳細頁時才動態 `import()` 對應的 sketch 模組、用 **instance mode** `new p5(sketchFn, containerRef)` 掛載；離開頁面時呼叫 `p5Instance.remove()` 卸載。整個網站任何時刻最多只有一個活著的 p5 canvas，避免多個 WebGL/canvas context 同時跑造成的效能問題。
4. **OpenProcessing 程式碼遷移**：OpenProcessing 上的 sketch 預設是 global mode（`function setup(){}` 直接寫在頂層），搬過來時要重寫成 instance mode（包進 `(p) => { p.setup = ...; p.draw = ... }`），否則多個 sketch 的全域 `setup`/`draw` 會互相覆蓋衝突。

**實作現況備註：**

- 列表頁最後做成「橫向展場房間」（`GalleryGrid.tsx`）而非 grid：每件作品是一張隨機挑選的靜態截圖掛在畫框裡（呼應生成式作品每次執行都不同），滾輪垂直捲動轉橫向、scroll-snap 置中、聚光燈點亮中央那件；第 2 點的 hover 影片預覽**未實作**（靜態截圖＋燈光氛圍已足夠，先不做）。房間高度鎖一個視窗高（無頁面垂直捲軸）、畫框中心對齊視窗正中、橫向捲軸貼齊視窗底邊。
- `SketchEntry` 除了 `factory`/`aspect` 還宣告 `interactions`（`click-regenerate`／`drag-draw`／`keyboard-game`／`button-game`／`drag-physics`）與 `saveKey`（存檔鍵覆寫，預設 S），詳細頁據此組出操作提示文字；互動類型同時是列表頁篩選器的分類來源。
- 「金屬碰撞」引入 matter-js（npm 依賴，非 CDN 注入）做剛體物理；物理引擎只靠 draw() 裡的 `Engine.update()` 驅動、不跑 Runner，p5 instance `remove()` 後整個物理世界跟著被 GC，不需要額外清理。

你想要的效果是「安靜的展場 + 一盞聚光燈打在作品上」，這跟朋友創作區的像素風（鮮豔、方塊、活潑）在視覺語言上確實會衝突——**不需要勉強統一成一套風格**，把它們當成網站裡兩個不同的「房間」即可，只靠 NavBar/字體等少數元素維持整站的一致感，背景氛圍各自獨立：

- **列表頁**：偏中性即可（不用太暗），重點是縮圖卡片本身清楚好掃視。
- **詳細頁（`/gallery/:slug`，看單一作品時）**：才真正進入「展覽感」——背景轉成接近黑/深藍的純色，畫作/canvas 容器置中，用一個以 canvas 為中心的 `radial-gradient`（暖白光，由內向外漸暗）疊出聚光燈效果，四周加一點 vignette 讓視線聚焦在作品上；導覽列等 UI chrome 淡化或縮到最小，只留返回的路徑。這些單靠 CSS（`radial-gradient` + 深色背景 + 適度的 `box-shadow`）就能做到，不需要額外的燈光特效函式庫。
- 朋友創作區維持自己原本明亮、方塊感的調色，兩邊互不影響。

**實作備註（`GalleryDetail.module.scss`）：**

- 詳細頁背景色改用 `--stage-bg` 變數而非寫死同一個純黑：日間模式（淺色 NavBar）用較柔和的深灰 `#2e2e35`，避免淺色 NavBar 直接撞上純黑展場的斷層感；夜間模式（`:global(.dark) &`）才是真正的近黑 `#0a0a0d`，跟夜間版 NavBar 反差本來就小。
- 全版背景（延伸到 NavBar 後方、貼齊頁尾）沿用列表頁 `GalleryGrid.module.scss` 的 `margin-top: -5rem; padding-top: 5rem`（抵銷 `main` 的 `pt-20`）＋`margin-bottom: -2rem`（抵銷 `main` 的 `pb-8`）full-bleed 手法；兩者缺一都會導致背景沒貼齊視窗邊緣，或底部露出一截 `main` 預設背景色可以被捲動到。
- 因為 `.stage` 用了上述負 margin 手法，`position: absolute` 的返回連結（`.back`）量測基準點也跟著往上位移了 5rem（藏到固定 NavBar 底下），`top` 必須再加回那 5rem 才會落在 NavBar 下方實際可見的區域，否則會被 NavBar 蓋住。
- 不同作品的 sketch 畫布寬高比不同（例如「纏繞」「山與月」原稿就是正方形 `size×size`；「POP」「觸手」「音頻」原稿是拿 `windowWidth`/`windowHeight` 畫滿整個瀏覽器視窗，比較接近寬螢幕），所以 `sketches/index.ts` 的 `SketchEntry` 除了 `factory` 還多帶一個 `aspect`（寬高比），沒有整站統一寫死成正方形。`GalleryDetail.tsx` 把 `aspect` 透過 inline style 寫進 CSS 變數 `--sketch-aspect`，`.canvasHost` 用 `width: min(900px, 88vw, calc(68vh * var(--sketch-aspect)))` 同時被寬度上限跟高度上限夾住，避免寬螢幕或正方形作品在小螢幕上被裁切或超出視窗。

---

## 7. 朋友 2D/3D 創作功能：像素編輯器設計

已定案方向：**2D 像素風**，朋友在一個固定尺寸的像素網格上點選顏色作畫，存的就是「座標 + 顏色」這種最直接的結構。3D 小怪獸暫無具體想法，先不展開設計——**最終正式上線只會二選一**，建議先把 2D 像素版做完、實際用起來，再評估是否要做或換成 3D，不必兩套同時維護。

### 2D 像素編輯器

- 畫布是像素網格（已決定：**網格尺寸由朋友自選**，例如 16×16 / 32×32 擇一，開始作畫後鎖定；`data.grid` 欄位本來就帶尺寸，資料格式不用改），朋友用滑鼠/觸控點格子上色，配色採**自由選色**（color picker 任意色相），不做固定色盤。
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

低解析度像素網格本身就把「能畫出什麼」限制在很小的範圍內（即使自由選色，最壞情況也只是一張低解析度像素圖），不需要額外的審核機制；`is_visible` 欄位還是留著，萬一真的有需要還是能手動關閉個別作品。

---

## 8. 專案目錄結構建議

```
/
├── public/
│   ├── gallery/              # 畫廊縮圖 + hover 預覽影片
│   └── images/               # 文章、關於等的靜態圖片
├── content/                   # §3 的「Git 內容檔」
│   ├── articles/*.md
│   ├── projects/*.md          # 專案長文寫法，選填，檔名＝projects.json 裡的 slug
│   ├── dreams.json
│   ├── projects.json          # 含 tags/collaborators/period/advisor/date 欄位
│   └── artworks.json
├── docs/
│   ├── ARCHITECTURE.md
│   ├── templates/
│   │   └── project-template.md  # 新專案 md 文件範本（不在 content/ 故不被 glob 載入）
│   └── progress/
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── router.tsx
│   ├── lib/
│   │   ├── supabaseClient.ts
│   │   ├── markdown.ts          # frontmatter parser + 摘要萃取，articles/projects 共用
│   │   ├── articles.ts
│   │   └── projects.ts
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx
│   │   │   ├── GalleryDetail.tsx
│   │   │   └── sketches/        # 搬遷後的 p5.js instance-mode 模組
│   │   ├── articles/
│   │   │   ├── Articles.tsx
│   │   │   └── ArticleDetail.tsx    # /articles/:slug，markdown 正文渲染
│   │   ├── projects/
│   │   │   ├── Projects.tsx         # 含 tag/status/日期篩選器
│   │   │   └── ProjectDetail.tsx    # /projects/:slug，markdown 正文渲染（若有對應 .md）
│   │   ├── experience/
│   │   │   └── Experience.tsx       # /experience，垂直時間軸
│   │   ├── dreams/
│   │   └── friends/
│   │       ├── Friends.tsx          # 創作牆（carousel + 邀請碼入口）
│   │       ├── InviteGate.tsx       # 邀請碼＋暱稱表單
│   │       └── Creator2D.tsx        # 像素編輯器，見 §7；3D 暫緩，未實作
│   ├── components/             # NavBar、Card、Loading、MarkdownContent 等共用元件
│   ├── hooks/                  # useFriendCreations 等資料 hook
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
| Phase 2 | 文章/夢想/專案區（§3-A 的 git 內容檔），先把「靜態內容類」頁面做完                   |
| Phase 3 | Supabase 專案建立、§4 schema + RLS 上線（`feat/supabase-setup`）                     |
| Phase 4 | 藝術畫廊：先搬 3-5 個 OpenProcessing sketch 驗證 instance-mode 遷移 + hover 預覽機制 |
| Phase 5 | 朋友創作功能（邀請碼 RPC + 2D 像素編輯器）                                           |
| Phase 6 | 視覺風格打磨（含畫廊聚光燈效果）、SEO/OG meta、響應式                                |

建議優先度：Phase 1-3 是地基，Phase 4、5 可以對調順序，依你想先看到哪個成果決定。

---

## 11. 待你後續決定的開放問題

- 是否真的要做 3D 小怪獸這個替代方向，還是直接定案只做 2D 像素版。

已決定（2026-07-11）：像素網格尺寸由朋友自選（`data.grid` 帶尺寸）；色盤採自由選色（color picker），不做固定色盤。

已決定不做／暫不考慮：訪客流量統計、第三方追蹤、邀請碼外流的速率限制（目前「一碼一用」的設計已足夠）。

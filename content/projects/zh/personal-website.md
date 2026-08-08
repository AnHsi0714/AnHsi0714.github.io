# 個人網站

## 專案簡介

想要一個能長期累積內容的地方，記錄做過的專案、讀過與寫過的文章，以及朋友的創作——不依賴任何固定模板或部落格系統（不是 Notion、不是 WordPress），從路由、版面到互動元件全部自己刻。設計上刻意不做登入系統：網站對訪客永遠是唯讀的，自己撰寫的內容透過 git commit／Supabase Studio 後台管理，唯一對外開放的寫入路徑是朋友創作功能（邀請碼機制，不建帳號）。

<figure>
  <img src="/images/projects/personal-website/home.png" alt="首頁畫面（替換成實際截圖）" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">首頁畫面（替換成實際截圖）</figcaption>
</figure>

## 技術架構

### 前端

- **React + Vite + TypeScript**：純前端打包，`npm run build` 是 `tsc --noEmit` 型別檢查再接 `vite build`，產物是純靜態檔案，適合丟 GitHub Pages，不需要 SSR。
- **React Router**：純前端路由，因為部署在 `*.github.io` 根網域，不需要處理 `basename`。
- **Tailwind CSS v4**：大量卡片／網格版面（專案列表、畫廊、朋友創作牆）用 utility class 開發，另外少數需要複雜狀態選取器（`:global(.dark) &`、負 margin 版面手法）的頁面用 CSS Modules（`.module.scss`）搭配。
- **TanStack Query**：統一處理 Supabase 資料的 loading／error／cache，避免每個頁面手刻 fetch 邏輯與重複的 loading state。
- **react-markdown + remark-gfm + rehype-raw**：文章與專案長文（`content/articles/*.md`、`content/projects/*.md`）以 Markdown 撰寫、frontmatter 記標題／日期／分類，`rehype-raw` 允許在 Markdown 裡內嵌原生 HTML（例如置中的 `<figure>`、名詞解釋用的 `<span data-term>`），支援度比純 Markdown 語法更彈性。
- **p5.js（instance mode）**：藝術畫廊區塊，20 件從 OpenProcessing 搬遷過來的生成藝術／互動作品；用 instance mode 而非 global mode，是因為多個 sketch 共存時 global 模式的 `setup`/`draw` 會互相覆蓋，instance mode 才能讓每個作品獨立掛載、`p5Instance.remove()` 乾淨卸載，確保任何時刻網站最多只有一個活著的 canvas。
- **matter-js**：畫廊裡「金屬碰撞」一件作品用到的 2D 剛體物理引擎，正式作為 npm 依賴管理（而非原稿在 OpenProcessing 上用的 CDN 注入），只有該 sketch 模組引用。
- **React Three Fiber + drei + three.js**：朋友創作區的 3D 怪獸塗色編輯器與展示、`/dev/creature-builder` 雕刻工具；用 <span data-term="instancing">Instancing</span> 做大量體素方塊的渲染，並自行處理鏡頭質心計算、<span data-term="intersection-observer">IntersectionObserver</span> 掛載/卸載 WebGL context 等效能細節。
- **FontAwesome**：圖示（About 頁興趣列表、UI 控制項等）。

### 內容管理策略：兩種資料，兩條路

網站的內容分成「自己慢慢寫、不常變動」與「執行期、由第三方寫入」兩類，各自對應不同的儲存與更新方式：

| 分類 | 儲存方式 | 更新方式 |
| --- | --- | --- |
| 文章、專案、夢想、畫廊 metadata、名詞解釋 | Git 內容檔（`content/*.json`、`content/**/*.md`） | 跟程式碼一起 commit，push 後由 CI 自動 build 部署 |
| 朋友的 2D／3D 創作 | Supabase（Postgres + RLS） | 朋友透過邀請碼即時寫入；審核（`is_visible`）走 Supabase Studio |

這個切分的好處是零後端延遲（大部分內容都是打包進 bundle 的靜態資料，不用等 API）、天生有版本控制（誰在什麼時候寫了什麼一目了然），而且切換成本低——之後若想把某個區塊從 Git 檔改成 Supabase 或反過來，前端只是換一個 data-fetching hook，不是不可逆的架構決定。

### Supabase：唯一的動態寫入功能

網站唯一需要「執行期、多方寫入」的功能是朋友創作——這是不特定第三方（朋友）會寫入的資料，沒有任何方式能單純用 git 處理。設計上：

- **前端對 Supabase 只做 `select`**，不會直接 `insert`／`update`；唯一的寫入口是兩個 <span data-term="security-definer">Security Definer</span> 的 RPC function（`redeem_invite_and_create`、`update_creation_with_code`），把「邀請碼驗證 + 標記已用 + 寫入創作」包成原子操作，避免多人同時搶用同一組碼的 <span data-term="race-condition">Race Condition</span>（用 `for update` 鎖住該列）。
- **邀請碼即編輯憑證**：兌換過的碼同時也是該作品的永久編輯憑證，朋友想改自己的作品只要再輸入同一組碼即可，不需要帳號系統。
- <span data-term="rls">RLS</span>：`friend_creations` 只公開 `is_visible = true` 的列給 anon 角色；`invite_codes` 完全不給任何 policy，anon 連 `select` 都看不到，只能透過 RPC 間接兌換。
- **零額外儲存成本**：2D 像素與 3D 怪獸塗色的資料都是「只存有上色的格子」的稀疏座標陣列（JSON 幾 KB），縮圖／預覽直接用這份資料即時重繪，不需要另外存圖檔或跑預渲染。
- **個資最小化**：整個流程只收「暱稱」，沒有 email、沒有密碼、沒有帳號系統，邀請碼私下發給朋友（不在網站上公開列出）。

### 部署

GitHub Actions（`.github/workflows/deploy.yml`）在 push 到 `main` 時自動跑 `npm run build`，把 `dist/` 部署到 GitHub Pages；Supabase 的 URL／anon key 存成 GitHub repo secrets，build 時注入前端 bundle（anon key 設計上就是可公開的，安全性由 RLS 保證）。

## 各區塊功能

- **首頁 `/`**：Hero 區塊（姓名、定位標語、簡短 bio）＋研究興趣標籤（點擊可導到「關於」頁對應錨點）；精選專案卡片（只挑研究向的兩個專案，工程性質較重的專案留到「全部專案」頁再看）；導覽卡片連到經歷／文章／畫廊／全部專案；頁尾放 GitHub、OpenProcessing 外部連結。
- **關於 `/about`**：專業技能（依 Programming／Data & Visualization／Frontend／Others／專業方向分組）、學歷（含可展開的逐學期成績與排名）、研究興趣（Core／Methods／Applied 三層）、學術成果、競賽與經歷精選（連到完整經歷頁）、休閒興趣、履歷下載入口。
- **經歷 `/experience`**：垂直時間軸頁，含主要與次要經歷兩類條目，各自標註時間、標籤（Chip）與重點說明；純靜態資料（`content/experience.json`），條目不多，不需要動態抓取。
- **文章 `/articles`**：讀書心得與科普／技術筆記（`type: book | note` 判別），支援標題、分類、評分、日期篩選；正文渲染為 `/articles/:slug` 詳細頁，可內嵌名詞解釋（見下）。
- **專案 `/projects`**：專案列表支援標籤、狀態、日期篩選；`projects.json` 之外若有對應的 `content/projects/<slug>.md` 長文，會渲染成 `/projects/:slug` 詳細頁，統一用「專案簡介、系統架構、核心功能、結論」（或研究型專案的「研究背景、方法、結果、結論」）幾個小節組織。
- **名詞解釋 Glossary**：文章／專案長文裡的專有名詞（ELO Rating、AST、Cosine Similarity、CKIP、Zero-Shot、RLS 等）標記成可點擊的詞彙，點開彈出卡片顯示「通用定義」＋「在這個專案裡實際怎麼被用」兩段說明——不是把讀者導去外部維基，而是把名詞收斂回「這個專案為什麼需要它」，方便不熟悉背景的讀者在不離開頁面的情況下看懂研究向專案的技術內容。
- **藝術畫廊 `/gallery`**：20 件從 OpenProcessing 搬遷、重寫成 p5.js instance mode 的生成藝術與互動作品，列表頁做成「橫向展場房間」——每件作品掛在畫框裡、滾輪垂直捲動轉橫向捲動、置中作品被聚光燈點亮；支援標題、日期、互動類型（點擊重繪／拖曳作畫／鍵盤操作／按鈕回合制／拖曳物理）篩選與最新／最久排序。點進單一作品的詳細頁才真正動態載入該 sketch 模組並掛載 canvas，背景轉為深色展覽氛圍（CSS `radial-gradient` 疊出聚光燈效果），離開頁面立即卸載，確保同時最多只有一個活著的 p5 canvas。
- **夢想 `/dreams`**：想做的事＋為什麼想做的靜態清單，部分項目附進度條（如果有可量化的目標）。
- **朋友創作 `/friends`**：創作牆用 carousel 呈現朋友的 2D 像素畫與 3D 怪獸塗色作品，3D 卡片只在捲進可視範圍時才即時掛載 Three.js 場景（IntersectionObserver 控制掛載／卸載，避免同時存在的 WebGL context 超過瀏覽器上限）；點擊置中且附有敘述的作品會開啟整頁遮罩放大檢視。`/friends/create` 是完整的創作流程：輸入邀請碼與暱稱 → 驗證（`unused`／`used`＋原作品／`invalid` 三種狀態）→ 選 2D 或 3D（選定即鎖，二次編輯不能換類型）→ 對應編輯器作畫（自由選色、油漆桶、undo/redo 以「一次拖曳」為單位、200 字以內的選填作品敘述）→ 送出寫入 Supabase。
- **`/dev` 拋棄式開發工具**：不對外曝光的內部工具，例如 `/dev/creature-builder`（堆積木雕刻 3D 怪獸形狀、輸出座標貼回程式碼）與 `/dev/creature`（驗證走路動畫），純粹是開發過程中用完即丟的輔具，不接 Supabase、不寫檔案系統。

## 結論與貢獻

這個專案不只是一個作品集網站，而是一次「刻意不做什麼」的取捨練習——不做登入系統、不做訪客流量統計與第三方追蹤、朋友創作不做審核機制（低解析度像素網格與固定形狀塗色本身就把「能畫出什麼」限制在很小範圍，多一層審核反而是過度設計）。這類先想清楚要不要做、再決定怎麼做的過程，比單純堆疊功能更接近實際專案裡常見的架構取捨。

技術貢獻主要有三點：其一，p5.js 從 OpenProcessing 的 global mode 完整遷移到 instance mode，讓 20 件生成藝術作品能在同一個 SPA 裡共存而不互相污染全域狀態，任何時刻整站只有一個活著的 canvas；其二，朋友創作系統用 Postgres 的 <span data-term="security-definer">Security Definer</span> RPC 搭配 `for update` 鎖列，在無帳號系統的前提下解決邀請碼的 <span data-term="race-condition">Race Condition</span>，並讓「邀請碼」同時身兼一次性憑證與長期編輯憑證兩種角色；其三，2D 像素與 3D 體素塗色共用同一套「稀疏座標陣列」資料模型與 undo/redo 架構，兩種創作型態的資料量與內容風險維持同一等級，也讓資料庫 schema 從一開始就不需要因為新增類型而改動。

網站目前完成的部分涵蓋所有靜態內容區塊（首頁、關於、經歷、文章、專案、夢想、畫廊）與朋友創作的完整流程（邀請碼兌換、2D／3D 編輯器、二次編輯、undo/redo）；名詞解釋 glossary 功能已接上文章與專案長文，用於降低研究向專案內容的閱讀門檻。

之後想做的事：

1. 視覺風格持續打磨
2. 補上履歷 PDF 與實際截圖，取代目前的佔位圖與「待補上」文字

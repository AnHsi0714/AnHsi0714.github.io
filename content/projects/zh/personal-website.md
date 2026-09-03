# 個人網站

## 專案簡介

想要一個能長期累積內容的地方，記錄做過的專案、讀過與寫過的文章，以及朋友的創作，從路由、版面到互動元件全部自己刻。設計上刻意不做登入系統：網站對訪客永遠是唯讀的，自己撰寫的內容透過 git/Supabase 管理。

<figure>
  <img src="/images/projects/personal-website/home.png" alt="個人網站首頁畫面，包含姓名、定位標語、研究興趣標籤與精選專案卡片" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">首頁畫面：Hero 區塊、研究興趣標籤與精選專案卡片</figcaption>
</figure>

## 技術架構

### 前端

- **React + Vite + TypeScript**：純前端打包，`npm run build` 是 `tsc --noEmit` 型別檢查再接 `vite build`，產物是純靜態檔案，適合丟 GitHub Pages，不需要 SSR。
- **React Router**：純前端路由，因為部署在 `*.github.io` 根網域，不需要處理 `basename`。
- **Tailwind CSS v4**：大量卡片／網格版面（專案列表、畫廊、朋友創作牆）用 utility class 開發，另外少數需要複雜狀態選取器（`:global(.dark) &`、負 margin 版面手法）的頁面用 CSS Modules（`.module.scss`）搭配。
- **TanStack Query**：統一處理 Supabase 資料的 loading／error／cache，避免每個頁面手刻 fetch 邏輯與重複的 loading state。
- **react-markdown + remark-gfm + rehype-raw**：文章與專案長文（`content/articles/*.md`、`content/projects/*.md`）以 Markdown 撰寫、frontmatter 記標題／日期／分類，`rehype-raw` 允許在 Markdown 裡內嵌原生 HTML（例如置中的 `<figure>`、名詞解釋用的 `<span data-term>`），支援度比純 Markdown 語法更彈性。
- **p5.js（instance mode）**：藝術畫廊區塊，30 件從 OpenProcessing 搬遷過來的生成藝術／互動作品；用 instance mode 而非 global mode，是因為多個 sketch 共存時 global 模式的 `setup`/`draw` 會互相覆蓋，instance mode 才能讓每個作品獨立掛載、`p5Instance.remove()` 乾淨卸載，確保任何時刻網站最多只有一個活著的 canvas。
- **matter-js**：畫廊裡「金屬碰撞」一件作品用到的 2D 剛體物理引擎，正式作為 npm 依賴管理（而非原稿在 OpenProcessing 上用的 <span data-term="cdn">CDN</span> 注入），只有該 sketch 模組引用。
- **React Three Fiber + drei + three.js**：朋友創作區的 3D 怪獸塗色編輯器與展示、`/dev/creature-builder` 雕刻工具；用 <span data-term="instancing">Instancing</span> 做大量體素方塊的渲染，並自行處理鏡頭質心計算、<span data-term="intersection-observer">IntersectionObserver</span> 掛載/卸載 WebGL context 等效能細節。
- **FontAwesome**：圖示（About 頁興趣列表、UI 控制項等）。

### 內容管理策略：兩種資料，兩條路

網站的內容分成「自己慢慢寫、不常變動」與「執行期、由第三方寫入」兩類，各自對應不同的儲存與更新方式：

| 分類                                      | 儲存方式                                          | 更新方式                                                       |
| ----------------------------------------- | ------------------------------------------------- | -------------------------------------------------------------- |
| 文章、專案、夢想、畫廊 metadata、名詞解釋 | Git 內容檔（`content/*.json`、`content/**/*.md`） | 跟程式碼一起 commit，push 後由 CI 自動 build 部署              |
| 朋友的 2D／3D 創作                        | Supabase（Postgres + RLS）                        | 朋友透過邀請碼即時寫入；審核（`is_visible`）走 Supabase Studio |

這個切分的好處：

- **零後端延遲**：大部分內容都是打包進 bundle 的靜態資料，不用等 API。
- **天生有版本控制**：誰在什麼時候寫了什麼一目了然。
- **切換成本低**：之後若想把某個區塊從 Git 檔改成 Supabase 或反過來，前端只是換一個 data-fetching hook，不是不可逆的架構決定。

### Supabase：唯一的動態寫入功能

網站唯一需要「執行期、多方寫入」的功能是朋友創作：這是不特定第三方（朋友）會寫入的資料，沒有任何方式能單純用 git 處理。設計上：

- **前端對 Supabase 只做 `select`**，不會直接 `insert`／`update`；唯一的寫入口是兩個 <span data-term="security-definer">Security Definer</span> 的 RPC function（`redeem_invite_and_create`、`update_creation_with_code`），把「邀請碼驗證 + 標記已用 + 寫入創作」包成原子操作，避免多人同時搶用同一組碼的 <span data-term="race-condition">Race Condition</span>（用 `for update` 鎖住該列）。
- **邀請碼即編輯憑證**：兌換過的碼同時也是該作品的永久編輯憑證，朋友想改自己的作品只要再輸入同一組碼即可，不需要帳號系統。
- <span data-term="rls">RLS</span>：`friend_creations` 只公開 `is_visible = true` 的列給 anon 角色；`invite_codes` 完全不給任何 policy，anon 連 `select` 都看不到，只能透過 RPC 間接兌換。
- **零額外儲存成本**：2D 像素與 3D 怪獸塗色的資料都是「只存有上色的格子」的稀疏座標陣列（JSON 幾 KB），縮圖／預覽直接用這份資料即時重繪，不需要另外存圖檔或跑預渲染。
- **個資最小化**：整個流程只收「暱稱」，沒有 email、沒有密碼、沒有帳號系統，邀請碼私下發給朋友（不在網站上公開列出）。

### 部署

GitHub Actions（`.github/workflows/deploy.yml`）在 push 到 `main` 時自動跑 `npm run build`，把 `dist/` 部署到 GitHub Pages；Supabase 的 URL／anon key 存成 GitHub repo secrets，build 時注入前端 bundle（anon key 設計上就是可公開的，安全性由 <span data-term="rls">RLS</span> 保證）。

## 各區塊功能

### 首頁 `/`

Hero 區塊（姓名、定位標語、簡短 bio）＋研究興趣標籤（連到 `/knowledge?category=RESEARCH`，篩選出對應分類的名詞條目，不是連到「關於」頁錨點）；精選專案／精選文章各自的 carousel（依 `projects.json`／文章 frontmatter 的 `featured` 旗標決定，不是自動判斷研究向或工程向，目前精選專案是「個人網站」本身與 CodePulse）；導覽卡片連到經歷／文章／畫廊／全部專案／小作品；頁尾放 GitHub、OpenProcessing、email 外部連結。

<figure>
  <img src="/images/projects/personal-website/home.png" alt="首頁畫面，包含姓名、定位標語、研究興趣標籤與精選專案卡片" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">首頁：Hero 區塊、研究興趣標籤與精選專案卡片</figcaption>
</figure>

### 關於 `/about`

專業技能（依 Programming／Data & Visualization／Frontend／Others／專業方向分組）、學歷（含可展開的逐學期成績與排名）、研究興趣（Core／Methods／Applied 三層）、學術成果、競賽與經歷精選（連到完整經歷頁）、休閒興趣、履歷下載（連到 `public/resume.pdf`）。

<figure>
  <img src="/images/projects/personal-website/about.png" alt="關於頁畫面，左側大字 About Me、右側研究興趣分層清單" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">關於：研究興趣分層清單</figcaption>
</figure>

### 經歷 `/experience`

垂直時間軸頁，含主要與次要經歷兩類條目，各自標註時間、標籤（Chip）與重點說明；純靜態資料（`content/experience.json`），條目不多，不需要動態抓取。

<figure>
  <img src="/images/projects/personal-website/experience.png" alt="經歷頁畫面，垂直時間軸列出主要與次要經歷條目" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">經歷：垂直時間軸</figcaption>
</figure>

### 文章 `/articles`

讀書心得與科普／技術筆記（`type: book | note` 判別），支援標題、分類、評分、日期篩選；正文渲染為 `/articles/:slug` 詳細頁，可內嵌名詞解釋（見下）。

<figure>
  <img src="/images/projects/personal-website/articles.png" alt="文章列表頁畫面，含分類與篩選 chip" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">文章列表：分類與篩選 chip</figcaption>
</figure>

### 專案 `/projects`

專案列表支援標籤、狀態、日期篩選；`projects.json` 之外若有對應的 `content/projects/<slug>.md` 長文，會渲染成 `/projects/:slug` 詳細頁，統一用「專案簡介、系統架構、核心功能、結論」（或研究型專案的「研究背景、方法、結果、結論」）幾個小節組織。

<figure>
  <img src="/images/projects/personal-website/projects.png" alt="專案列表頁畫面，含標籤與狀態篩選" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">專案列表：標籤與狀態篩選</figcaption>
</figure>

### 名詞解釋 Glossary

文章／專案長文裡的專有名詞（<span data-term="elo-rating">ELO Rating</span>、<span data-term="ast">AST</span>、<span data-term="cosine-similarity">Cosine Similarity</span>、<span data-term="ckip">CKIP</span>、<span data-term="zero-shot">Zero-Shot</span>、<span data-term="rls">RLS</span> 等）標記成可點擊的詞彙，點開彈出卡片顯示「通用定義」＋「在這個情境裡實際怎麼被用」兩段說明；同一個詞被多個專案／文章共用時，「怎麼被用」那段會依目前所在的專案或文章分開挑對應的說明顯示，不會把不相關的用法混在一起。不是把讀者導去外部維基，而是把名詞收斂回「這裡為什麼需要它」，方便不熟悉背景的讀者在不離開頁面的情況下看懂研究向專案的技術內容。彈窗本身是跨頁面重複出現的元件，沒有自己的獨立畫面；但獨立的 `/knowledge` 列表頁可用關鍵字與分類篩選所有詞條，點進 `/knowledge/:slug` 看單一詞條的完整說明與關聯專案／文章，部分詞條另外掛一篇完整長文（`content/knowledge/{zh,en}/*.md`），沒有長文的詞條維持原本的精簡卡片。

<figure>
  <img src="/images/projects/personal-website/knowledge-term.png" alt="知識點詳細頁畫面，含通用定義、在此專案中的說明，以及該詞條的長文內容" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">知識點詳細頁：通用定義、情境化說明與長文內容</figcaption>
</figure>

### 知識關聯圖 `/knowledge/graph`（實驗性）

把詞條之間的 prerequisite／related／applies_to／contrasts_with 關聯畫成力導向圖，預設只顯示分類 hub，點開才展開成個別詞條，可同時展開多個分類，也支援手動拖曳調整位置。平移、拖曳這類操作在手機窄螢幕不好用，`sm` 以下改顯示文字提示，請使用者改用平板或電腦。

<figure>
  <img src="/images/projects/personal-website/knowledge-graph.png" alt="知識關聯圖畫面，展開一個分類後顯示個別詞條與連線" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">知識關聯圖：展開分類後的力導向佈局</figcaption>
</figure>

### 藝術畫廊 `/gallery`

30 件從 OpenProcessing 搬遷、重寫成 p5.js instance mode 的生成藝術與互動作品，列表頁做成「橫向展場房間」：每件作品掛在畫框裡、滾輪垂直捲動轉橫向捲動、置中作品被聚光燈點亮；支援標題、日期、互動類型（點擊重繪／拖曳作畫／鍵盤操作／按鈕回合制／拖曳物理）篩選與最新／最久排序。點進單一作品的詳細頁才真正動態載入該 sketch 模組並掛載 canvas，背景轉為深色展覽氛圍（CSS `radial-gradient` 疊出聚光燈效果），離開頁面立即卸載，確保同時最多只有一個活著的 p5 canvas。

<figure>
  <img src="/images/projects/personal-website/gallery.png" alt="藝術畫廊列表頁畫面，橫向展場房間排列多件生成藝術作品縮圖" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">藝術畫廊：橫向展場房間</figcaption>
</figure>

### Playground `/playground`

收攏「比較個人、還在玩的東西」的入口頁，目前連到夢想、小作品，以及開發用工具 `/dev/components`（UI 組件庫預覽）。朋友創作與另外兩個 3D 怪獸開發工具（`/dev/creature` 走路動畫驗證、`/dev/creature-builder` 堆積木雕刻）的入口卡片先從這頁拔掉，相關功能還在另一條分支上繼續做；路由本身沒刪，之後要復原只要把連結加回來。

<figure>
  <img src="/images/projects/personal-website/playground.png" alt="Playground 頁畫面，連到夢想、小作品、組件預覽三張卡片" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Playground：入口卡片</figcaption>
</figure>

### 夢想 `/dreams`

想做的事的靜態清單，部分項目附進度條（如果有可量化的目標）。

<figure>
  <img src="/images/projects/personal-website/dreams.png" alt="夢想頁畫面，想做的事的靜態清單" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">夢想：想做的事清單</figcaption>
</figure>

### 小作品 `/playground/mini-works`

課堂作業、CodePen 練習等小型互動作品的清單頁，點進 `/playground/mini-works/:slug` 看單一作品。

<figure>
  <img src="/images/projects/personal-website/mini-works.png" alt="小作品列表頁畫面" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">小作品：清單頁</figcaption>
</figure>

> 朋友創作 `/friends` 的完整流程（邀請碼兌換、2D／3D 編輯器、二次編輯）已經寫完，但目前站上沒有任何入口連過去，所以不列在上面的區塊清單裡；細節見下方「結論與貢獻」。

## 結論與貢獻

這個專案不只是一個作品集網站，而是一次「刻意不做什麼」的取捨練習：不做登入系統、不做訪客流量統計與第三方追蹤、朋友創作不做審核機制（低解析度像素網格與固定形狀塗色本身就把「能畫出什麼」限制在很小範圍，多一層審核反而是過度設計）。這類先想清楚要不要做、再決定怎麼做的過程，比單純堆疊功能更接近實際專案裡常見的架構取捨。

技術貢獻主要有四點：

- **p5.js instance mode 遷移**：從 OpenProcessing 的 global mode 完整遷移到 instance mode，讓 30 件生成藝術作品能在同一個 SPA 裡共存而不互相污染全域狀態，任何時刻整站只有一個活著的 canvas。
- **邀請碼 Race Condition**：朋友創作系統用 Postgres 的 <span data-term="security-definer">Security Definer</span> RPC 搭配 `for update` 鎖列，在無帳號系統的前提下解決邀請碼的 <span data-term="race-condition">Race Condition</span>，並讓「邀請碼」同時身兼一次性憑證與長期編輯憑證兩種角色。
- **統一的塗色資料模型**：2D 像素與 3D 體素塗色共用同一套「稀疏座標陣列」資料模型與 undo/redo 架構，兩種創作型態的資料量與內容風險維持同一等級，也讓資料庫 schema 從一開始就不需要因為新增類型而改動。
- **情境化名詞解釋**：同一個詞被多個專案／文章共用時，「怎麼被用」的說明改成依目前所在的情境分開挑對應段落顯示，不再混成一句話；部分詞條另外掛一篇完整長文，並新增一個把詞條關聯畫成力導向圖的實驗性檢視（`/knowledge/graph`）。

網站目前完成的部分涵蓋所有靜態內容區塊（首頁、關於、經歷、文章、專案、名詞解釋、畫廊、Playground、夢想、小作品），名詞解釋 glossary 功能已接上文章與專案長文，支援情境化說明、部分詞條長文與關聯圖檢視，用於降低研究向專案內容的閱讀門檻。

朋友創作的完整流程（邀請碼兌換、2D／3D 編輯器、二次編輯、undo/redo）程式碼已完成，但目前站上沒有任何入口連過去，等相關工作在另一條分支收斂後再重新接上。

之後想做的事：

1. 視覺風格持續打磨
2. 知識關聯圖：依關聯類型（prerequisite／related／applies_to／contrasts_with）上色區分，並補上行動版的瀏覽方式
3. 朋友創作功能重新接上主要導覽入口

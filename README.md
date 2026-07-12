# AnHsi0714.github.io

個人網站。整體架構、各區塊規劃與資料庫設計見 [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)；每日進度記錄在 `docs/progress/<年-月>/<當週週一日期>.md`（每月一個資料夾，每週一個檔案）。

## 技術棧

- React + Vite + TypeScript
- Tailwind CSS v4
- React Router
- TanStack Query
- Supabase（Postgres + RLS + RPC，前端只做唯讀，寫入方式見 ARCHITECTURE.md）
- react-markdown + remark-gfm + rehype-raw（文章／專案長文渲染，內嵌 HTML 用於名詞解釋等互動元件）
- p5.js（藝術畫廊，instance mode 掛載/卸載）、matter-js（畫廊中一件 2D 剛體物理作品）
- React Three Fiber + drei + three.js（朋友創作區的 3D 怪獸塗色、`/dev` 雕刻工具）

## 開發

```bash
npm install
npm run dev      # 本機開發伺服器
npm run build    # 型別檢查 + build
npm run preview  # 預覽 build 結果
```

## 環境變數

複製 `.env.example` 為 `.env`，填入自己 Supabase 專案的值：

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## 部署

push 到 `main` 後由 GitHub Actions（`.github/workflows/deploy.yml`）自動 build 並部署到 GitHub Pages。

**第一次設定**：到 repo 的 Settings → Pages，將 Source 改成「GitHub Actions」；並在 Settings → Secrets and variables → Actions 新增 `VITE_SUPABASE_URL`、`VITE_SUPABASE_ANON_KEY` 兩個 secrets。

## 目錄結構

- `src/pages/` 各區塊頁面（關於、經歷、文章、專案、畫廊、夢想、朋友創作、`dev/` 拋棄式開發工具）
- `src/pages/gallery/sketches/` 搬遷後的 p5.js instance-mode 作品模組
- `src/pages/friends/` 邀請碼兌換與 2D 像素／3D 怪獸塗色編輯器
- `content/` 自己撰寫的靜態內容（文章、專案、夢想、畫廊 metadata、名詞解釋 glossary）
- `supabase/migrations/` 資料庫 schema（用 Supabase CLI 或直接貼到 Supabase Studio SQL Editor 執行）
- `docs/` 架構規劃與每日進度

# 個人網站

## 專案簡介

想要一個能長期累積內容的地方，記錄做過的專案、讀過的書，以及朋友的創作——不依賴任何固定模板的「個人主頁產生器」，全部自己刻。

<figure>
  <img src="/images/projects/personal-website/home.png" alt="首頁畫面（替換成實際截圖）" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">首頁畫面（替換成實際截圖）</figcaption>
</figure>

## 技術架構

整體刻意保持輕量，沒有後台、沒有登入系統：

- **前端**：React + Vite + TypeScript，純前端打包後丟 GitHub Pages
- **內容**：能交給 git 管理的內容（文章、專案、夢想）直接寫成 Markdown / JSON，跟程式碼一起 commit
- **動態資料**：朋友創作這類「執行期、第三方寫入」的內容才用 Supabase

> 後台管理流程刻意不做登入系統——自己的內容透過 Supabase Studio 直接管理，朋友功能則用邀請碼，不建帳號。

## 目前進度

文章/專案/夢想等靜態內容區塊已經做完，畫廊與朋友創作功能還在進行中。

之後想做的事：

1. 把 OpenProcessing 上的舊作品搬過來（p5.js instance mode）
2. 朋友 2D 像素創作功能（邀請碼機制）
3. 視覺風格打磨、深色模式

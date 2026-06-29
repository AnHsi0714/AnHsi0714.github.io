# 飲料電商平台 SilkRoad — 資料庫系統開發紀錄

合作者：郭O暘、郭O帆、陳O佑、黃O安、鄭安琋、林O安<br>
2026 年 3 月 資料庫系統期末專案

## 影片連結

demo: https://youtu.be/oEN80YCLeAc
(目前資料庫未啟用，因此網頁無法運作)

## 專案目的

資料庫系統的期末專案，目標是把所學的資料庫設計與需求文件撰寫實際應用在一個完整系統上。題目選定為「SilkRoad 飲品電商平台」，一個 B2C 的線上飲品交易平台，讓飲品的上架、銷售、付款、配送整個流程都能在線上完成——顧客省時間，店家多一個銷售管道，管理員則負責維護平台的公平與安全。

依角色拆出三種使用情境：

- **顧客**：瀏覽/搜尋已上架商品、購買並管理訂單、享有會員優惠與折扣
- **店家**：上架與管理飲料商品、設定價格與折扣方案、檢視銷售狀況與顧客回饋
- **管理員**：發布公告、保障資訊安全、協助系統管理

## 系統架構

採用前後端分離架構：

- 前端：React + Next.js
- 後端：依需求選用 Node.js（Express/NestJS）或 Python（Django/Flask）
- 資料庫：MySQL

分層方式：用戶端（個人電腦/行動設備）→ 前端應用層（網頁平台）→ 連接層（API）→ 服務層 → 資料層（MySQL）。服務層底下再拆成八個子系統，主系統「線上訂購系統（OOS）」統籌：

| 子系統       | 代號 | 負責範圍                     |
| ------------ | ---- | ---------------------------- |
| 管理員管理   | AM   | 公告發布、權限管控、封鎖紀錄 |
| 店家管理     | VMS  | 商家資訊、商品上下架入口     |
| 顧客管理     | CMS  | 會員資料、登入狀態           |
| 購物車       | SCS  | 暫存商品，結帳前置           |
| 商品管理     | PMS  | 商品 CRUD、客製化選項        |
| 財務管理     | FMS  | 金流交易、折扣、退款         |
| 商店評價管理 | SRRS | 顧客評分與評論               |
| 訂單配送管理 | ODMS | 訂單狀態、配送資訊           |

## 商業規則重點

系統設計時定下的限制條件，確保資料的完整性與商業邏輯一致：

- 商品金額、折扣金額皆不可為負數，折扣率不得超過 100%
- 交易記錄禁止刪除，只能標記「退款」，且退款金額不可大於原始付款金額
- 同一商品庫存不可小於 0；訂單總金額必須大於 0
- 使用者帳號不可重複，密碼需加密保存
- 店家僅能管理「自家」商品，不可刪除已有交易紀錄的商品，只能下架
- 管理員可審核/凍結違規店家帳號，但無法直接修改交易金額

## 資料庫設計

最大的設計挑戰是飲品特有的「多重客製化屬性」：同一杯飲料有甜度、冰塊、容量三種選項，而容量還牽涉加價。為了在正規化與查詢效能間取得平衡，最後把這些選項拆成獨立的 `SUGAR_OPTIONS`、`ICE_OPTIONS`、`SIZES_OPTIONS` 子表（皆以 `product_id` 為 FK），讓每個商品可以有各自的選項組合，`SIZES_OPTIONS` 再額外帶一個 `price_step` 處理容量加價。

下單時，`CART_ITEM` / `ORDER_ITEM` 會把當時選擇的 `selected_sugar` / `selected_ice` / `selected_size` 與成交價格 `price` 直接存一份快照，而不是即時參照 `PRODUCT` 當前設定——這樣即使店家之後更動商品選項或價格，已成立的歷史訂單也不會被意外連動改變。

角色設計上，`USER` 是共用基底資料表，`ADMIN` / `CUSTOMER` / `VENDOR` 用 1:1 的 PK-FK 關聯去模擬繼承。`VENDOR` 另外拉出 `VENDOR_MANAGER` 實體，因為同一位店家負責人可能名下管理多間分店（例如「50 嵐 - 大安店」與「可不可 - 信義店」可能同屬一位區經理）。

<figure>
  <img src="/images/projects/silkroad/erdplus.png" alt="SilkRoad ER Model" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">SilkRoad ER Model</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/schema.png" alt="SilkRoad Logical Database Schema" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">SilkRoad Logical Database Schema</figcaption>
</figure>

## 實作的系統功能

前後端分離下，前端負責直覺的選購介面與動態價格顯示，後端專注資料驗證、商業邏輯與資料庫存取。

### 顧客端

商品頁可直接選大小、冰塊、糖度並即時看到加價後的金額，加入購物車後可切換自取/外送、選擇付款方式，訂單成立後在訂單紀錄頁用左右捲動的卡片瀏覽每一筆訂單明細。

<figure>
  <img src="/images/projects/silkroad/buy-drink.png" alt="商品客製化選項（大小/冰塊/糖度）" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">商品客製化選項（大小/冰塊/糖度）</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/cart.png" alt="購物車與配送方式選擇" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">購物車與配送方式選擇</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/order.png" alt="訂單紀錄" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">訂單紀錄</figcaption>
</figure>

### 店家端

店家可在商品管理頁直接編輯上下架狀態、價格、客製化選項；折扣管理中心則彙總目前所有折扣的進行狀態，並提供表單建立新的折扣碼（百分比或固定金額、最低消費、最高折抵、會員資格限制）。

<figure>
  <img src="/images/projects/silkroad/product-manage.png" alt="商品管理" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">商品管理</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/discount-manage.png" alt="折扣管理中心" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">折扣管理中心</figcaption>
</figure>

<figure>
  <img src="/images/projects/silkroad/post-discount.png" alt="發布新折扣" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">發布新折扣</figcaption>
</figure>

### 管理員端

管理員可在使用者管理頁切換查看顧客/商家列表，依姓名或 Email 搜尋，並對異常帳號執行封鎖。

<figure>
  <img src="/images/projects/silkroad/user-manage.png" alt="使用者管理" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">使用者管理</figcaption>
</figure>

其餘還實作了首頁商家瀏覽、關於我們、登入/註冊（含 Email 驗證碼）、各角色個人資料頁、顧客儲值中心、顧客評論專區（可依星等、日期篩選）與系統公告管理等等頁面。

## 心得

從最初的 ER Model 設計到拆分客製化屬性關聯表，這次專題讓我們直接體會到 schema 設計怎麼影響後端 API 的邏輯複雜度，以及前端使用者的操作體驗；也提早體驗了前後端分離下的協作模式——串接 API 時常因資料格式轉換或訪客／會員購物車狀態不同步而卡關，靠團隊密切溝通與除錯逐一解決。

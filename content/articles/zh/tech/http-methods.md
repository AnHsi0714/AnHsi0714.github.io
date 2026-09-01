---
type: tech
title: HTTP Method 不只是 CRUD：理解 GET、POST、PUT、PATCH、DELETE
date: 2026-09-01
categories: [筆記, Web, 技術]
excerpt: 理解 GET/POST/PUT/DELETE 實際用意，改用「我想對 Resource 做什麼」的角度理解，此外探討 PUT 和 PATCH 差異。
---

> 撰寫期間：2026-08-29 – 2026-09-01

## 前情提要

過往我遇到 Web API 時，只知道有 GET/POST/PUT/DELETE 這幾種，常常連 POST 和 PUT 都分不清意思。

很多初學者會直接把這四種方法對應到 <span data-term="crud">CRUD</span>，我當初也是這樣記憶：

- GET => READ
- POST => CREATE
- PUT => UPDATE
- DELETE => DELETE

在近期實習時剛好遇到要串接 API，因此也複習了下內容，才發現這樣記雖然方便，但不夠精確。

更好的方式，是從「我想對 Resource 做什麼」來理解它們：

- GET → Get
- POST → Create / Command
- PUT → Set
- PATCH → Modify
- DELETE → Remove

## GET：Get

GET 的概念最簡單：

> 把這個 Resource 傳給我。

例如：

```
GET /users/123
```

意思是：取得 ID 為 123 的 User 的資料。Server 可能回傳：

```json
{
  "id": 123,
  "name": "Tom",
  "email": "tom@example.com"
}
```

GET 的重點是取得資料，而不是修改資料。例如：

- 取得商品列表

```
GET /products
```

- 取得單一商品

```
GET /products/123
```

GET 通常具有 <span data-term="safe">Safe</span> 和 <span data-term="idempotent">Idempotent</span> 的特性（後面會另外解釋這兩個詞的意思）。也就是說，重複 GET 同一個 Resource，不應該因為 GET 本身而改變資料。

## POST：Create / Command

POST 常被理解成：

> 建立一筆新的資料。

例如：

```
POST /users

{
  "name": "Tom",
  "email": "tom@example.com"
}
```

Server 可以建立該 `User` Tom 的資料。

這裡有一個重要的特性：POST 通常由 Server 決定新 Resource 的 ID。所以：

```
POST /users
```

比較像是在說「請你幫我建立一個新的 User」，而不是「我要建立 ID = 123 的 User」。

像我當初在實習時，發現做 POST 時不需要傳 id，但 GET 回來就自己出現 id 資料。

這通常是因為 id 欄位在資料庫裡設成 Auto Increment（自動遞增）的主鍵，新增一筆資料時由資料庫自動產生下一個號碼，不用應用端自己指定，實際情況要看該欄位的設計。

因此 POST 不應該只被理解成 Create，它也常用來表示「請 Server 執行一個操作」。例如：

```
POST /orders/123/cancel
```

這並不是單純建立一筆 Order，而是在要求 Server 執行「取消訂單」這個 Command。

所以可以把 POST 理解成：

**POST → Create / Command**

## PUT：Set

PUT 是最容易被誤解的。很多人會記成 `PUT = Update`，但更好的理解方式是 `PUT = Set`，也就是：

> 讓這個 Resource 最終變成我指定的狀態。

例如：

```
PUT /users/123/settings

{
  "language": "zh-TW",
  "theme": "dark",
  "notification": true
}
```

意思不是單純「修改 language、theme、notification」，而比較接近「User 123 的 settings，完整狀態就是這樣」。

因此 PUT 很適合用來表示：

> 我要這個 Resource 變成這個狀態。

PUT 也具有一個非常重要的特性：**Idempotent（冪等）**。假設：

```
PUT /users/123/settings

{
  "theme": "dark"
}
```

送一次 `theme = dark` 和送十次 `theme = dark` ，最後狀態仍然是一樣的。

所以 PUT 很適合表示「設定成某個狀態」。

另外要補充一點：PUT 不是只能拿來「更新」。

如果 `PUT /users/123` 的 `User 123` 原本不存在，Server 也可以選擇直接依照這次送來的內容建立一筆新的資料，讓 `User 123` 從此存在，這種行為稱作 Upsert（Update + Insert）。

這也是為什麼 PUT 需要 Client 自己指定 Resource 的 ID（例如網址上的 `123`），因為不管這筆資料原本存不存在，呼叫結果都要是「User 123 變成指定的狀態」，這正好符合 PUT = Set 的語意；相對地，POST 是交給 Server 決定新 ID，所以無法用同樣的方式表示「新增」。

## PATCH：Modify

PATCH 是我在讀過相關內容後學到的，先來看下它的定義和用法。

PATCH 比較像：

> 修改這個 Resource 的一部分。

例如：

```
PATCH /users/123

{
  "name": "John"
}
```

意思是「把 User 123 的 name 改成 John，其他資料保持不變」。假設原本是：

```json
{
  "name": "Tom",
  "email": "tom@example.com",
  "phone": "0912345678"
}
```

PATCH：

```json
{
  "name": "John"
}
```

結果變成：

```json
{
  "name": "John",
  "email": "tom@example.com",
  "phone": "0912345678"
}
```

只有 name 被修改。因此可以把 PATCH 記成：

**PATCH → Modify**

### PUT 和 PATCH 到底差在哪？

最簡單的 mental model 是：

- PUT → 「變成這樣」
- PATCH → 「改這裡」

例如 User：

```json
{
  "name": "Tom",
  "email": "tom@example.com",
  "phone": "0912345678"
}
```

如果使用 `PUT /users/123`，概念上是「User 123 → 完整設定成指定的 Resource」；而 `PATCH /users/123` 則是「User 123 → 只修改指定的欄位」。

所以 PUT 並不是「比較舊的 PATCH」，兩者是在表達不同的語意。

當初讀到這裡時產生一個疑惑

Q：那為什麼不能直接用 PATCH 取代 PUT？

A：實際上可以取代，因為 PATCH 不只能部分修改，也能拿來取代整筆資料。

但兩者在語意上的不同，才是 PUT 仍然存在的原因：PUT 是「設定成某個最終狀態」，如果全部都用 PATCH 表示，語意會變得混亂，因為 PATCH 傳達的是「改動這幾個欄位」，而不是「這就是最終狀態」。

## DELETE：Remove

DELETE 就是：

> 讓這個 Resource 不存在。

例如：

```
DELETE /users/123
```

意思是：移除 User 123。DELETE 同樣具有 Idempotent 的特性。

- 第一次執行 delete，`User 123` 被刪除
- 第二次，`User 123` 已經不存在
- 第三次，`User 123` 還是不存在

最後的狀態都是「User 123 不存在」。

所以 DELETE 可以記成：

**DELETE → Remove**

## Safe 與 Idempotent 是什麼

前面提到 GET、PUT、DELETE 具有 <span data-term="safe">Safe</span> 或 <span data-term="idempotent">Idempotent</span> 的特性。

Safe 保證「呼叫不會改變資料」，Idempotent 保證「呼叫幾次，最後結果都一樣」。

正因為 Safe 方法保證沒有副作用，才能被 <span data-term="proxy">Proxy</span>、<span data-term="cdn">CDN</span> 這類中間層放心快取，甚至被瀏覽器拿去做 <span data-term="prefetch">prefetch（預先載入）</span>。

Idempotent 這個特性在實務上很重要：假設 Client 呼叫 API 時遇到網路逾時，不確定 Request 有沒有送達 Server，這時如果該 Method 是 Idempotent，Client 就可以放心重送一次，不用擔心造成重複的副作用（例如重複扣款、重複新增一筆一樣的資料）。

這也是為什麼 POST 通常不建議自動重試，而 PUT、DELETE 可以。

這裡也能看出理解這兩個特性前後的差別：

- 理解前（只用 CRUD 對應）：只知道 `POST = 新增`、`PUT = 更新`，遇到「網路逾時要不要重送」這種問題時，完全沒有依據判斷。
- 理解後（掌握 Safe / Idempotent）：知道 PUT、DELETE 可以放心重送，POST 不行，因為它們在冪等性上的保證不同。這才是設計重試機制、查 API 文件時真正需要的知識。

## 表格統整

| Method | Mental Model     | Safe | Idempotent | 常見用途                 |
| ------ | ---------------- | ---- | ---------- | ------------------------ |
| GET    | Get              | 是   | 是         | 取得 Resource            |
| POST   | Create / Command | 否   | 否         | 建立 Resource、執行操作  |
| PUT    | Set              | 否   | 是         | 設定 Resource 的完整狀態 |
| PATCH  | Modify           | 否   | 視實作而定 | 修改 Resource 的部分內容 |
| DELETE | Remove           | 否   | 是         | 移除 Resource            |

PATCH 的 Idempotent 欄位寫「視實作而定」，是因為 PATCH 語意上是「修改」，如果修改的內容是固定值（例如把 `name` 設成 `"John"`），重送幾次結果都一樣，算 Idempotent；但如果是像「數量 +1」這種相對修改，重送就會讓結果一直改變，不算 Idempotent。

不要只記 `POST = Create`、`PUT = Update`，而應該理解成：

- GET → 「給我」
- POST → 「幫我建立／執行」
- PUT → 「讓它變成這狀態」
- PATCH → 「修改這裡」
- DELETE → 「讓它消失」

## 最後：為什麼這對 Rails 很重要？

<span data-term="rails">Rails</span> 的 <span data-term="rails-restful-routing">RESTful routing</span> 正好把這些 HTTP Method 和 Controller Action 串在一起。例如：

```ruby
resources :users
```

Rails 就可以建立：

```
GET       /users
POST      /users

GET       /users/:id
PATCH     /users/:id
PUT       /users/:id
DELETE    /users/:id
```

然後對應到：

```
GET    → index / show
POST   → create
PATCH  → update
PUT    → update
DELETE → destroy
```

這時候就可以理解，Rails 並不是單純把 HTTP Method 對應到 CRUD，它其實是在利用 HTTP 本身對 Resource 的語意，建立一套一致的 Web API 結構。

所以真正值得記住的是：

- GET → Get
- POST → Create / Command
- PUT → Set
- PATCH → Modify
- DELETE → Remove

當用這種方式理解 HTTP，之後再看 API Method，就會比較容易理解「為什麼這個 API 要用 POST，而不是 PUT」。

參考文獻：[ihower - HTTP Verbs: POST, PUT, PATCH](https://ihower.tw/blog/6483-http-verbs-post-put-patch)

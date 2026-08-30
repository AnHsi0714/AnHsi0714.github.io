---
type: tech
title: HTTP Method 不只是 CRUD：理解 GET、POST、PUT、PATCH、DELETE
date: 2026-08-29
categories: [筆記, Web, 技術]
excerpt: 別再把 GET/POST/PUT/DELETE 死背成查詢、新增、更新、刪除，改用「我想對 Resource 做什麼」的角度理解，順便搞懂 PUT 和 PATCH 到底差在哪。
status: draft
---

在開發 Web API 時，我們經常會看到這幾個 HTTP Method：

- GET
- POST
- PUT
- PATCH
- DELETE

很多初學者會直接把它們記成：

```
GET    = 查詢
POST   = 新增
PUT    = 更新
DELETE = 刪除
```

這樣記雖然方便，但不夠精確。

更好的方式，是從「我想對 Resource 做什麼」來理解它們：

- GET → Get
- POST → Create / Command
- PUT → Set
- PATCH → Modify
- DELETE → Remove

## GET：Get

GET 的概念最簡單：

> 把這個 Resource 給我。

例如：

```
GET /users/123
```

意思是：取得 ID 為 123 的 User。Server 可能回傳：

```json
{
  "id": 123,
  "name": "Tom",
  "email": "tom@example.com"
}
```

GET 的重點是取得資料，而不是修改資料。例如：

```
GET /products
```

取得商品列表；

```
GET /products/123
```

取得單一商品。

GET 通常具有 Safe 和 Idempotent 的特性。也就是說，重複 GET 同一個 Resource，不應該因為 GET 本身而改變資料。

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

Server 可以建立 `User #123`。

這裡有一個重要的特性：POST 通常由 Server 決定新 Resource 的 ID。所以：

```
POST /users
```

比較像是在說「請你幫我建立一個新的 User」，而不是「我要建立 ID = 123 的 User」。

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

送一次，`theme = dark`；送十次，`theme = dark`。最後狀態仍然是一樣的。

所以 PUT 很適合表示「設定成某個狀態」。

## PATCH：Modify

PATCH 則比較像：

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

## DELETE：Remove

DELETE 就是：

> 讓這個 Resource 不存在。

例如：

```
DELETE /users/123
```

意思是：移除 User 123。DELETE 同樣具有 Idempotent 的特性。

第一次，`User 123 → 被刪除`；第二次，`User 123 → 已經不存在`；第三次，`User 123 → 還是不存在`。最後的狀態都是「User 123 不存在」。

所以 DELETE 可以記成：

**DELETE → Remove**

## 用一個表格快速理解

| Method | Mental Model     | 常見用途                 |
| ------ | ---------------- | ------------------------ |
| GET    | Get              | 取得 Resource            |
| POST   | Create / Command | 建立 Resource、執行操作  |
| PUT    | Set              | 設定 Resource 的完整狀態 |
| PATCH  | Modify           | 修改 Resource 的部分內容 |
| DELETE | Remove           | 移除 Resource            |

不要只記 `POST = Create`、`PUT = Update`，而應該理解成：

- GET → 「給我」
- POST → 「幫我建立／執行」
- PUT → 「讓它變成這樣」
- PATCH → 「修改這裡」
- DELETE → 「讓它消失」

## 最後：為什麼這對 Rails 很重要？

Rails 的 RESTful routing 正好把這些 HTTP Method 和 Controller Action 串在一起。例如：

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

所以真正值得記住的不是：

```
GET    = Read
POST   = Create
PUT    = Update
PATCH  = Update
DELETE = Delete
```

而是：

- GET → Get
- POST → Create / Command
- PUT → Set
- PATCH → Modify
- DELETE → Remove

當你用這種方式理解 HTTP，之後再看 Rails Controller、REST API、Frontend fetch() 或第三方 API，就會比較容易理解「為什麼這個 API 要用 POST，而不是 PUT」。

參考文獻：[ihower - HTTP Verbs: POST, PUT, PATCH](https://ihower.tw/blog/6483-http-verbs-post-put-patch)

---
type: tech
title: "HTTP Methods Aren't Just CRUD: Understanding GET, POST, PUT, PATCH, DELETE"
date: 2026-08-29
categories: [Notes, Web, Technical]
excerpt: Stop memorizing GET/POST/PUT/DELETE as read/create/update/delete. Think in terms of "what do I want to do to this Resource" instead, and finally get straight on what actually separates PUT from PATCH.
status: draft
---

When building web APIs, we constantly run into these HTTP methods:

- GET
- POST
- PUT
- PATCH
- DELETE

Many beginners just memorize them as:

```
GET    = Read
POST   = Create
PUT    = Update
DELETE = Delete
```

That's convenient, but not precise enough.

A better way is to understand them through the lens of "what do I want to do to this Resource":

- GET → Get
- POST → Create / Command
- PUT → Set
- PATCH → Modify
- DELETE → Remove

## GET: Get

GET is the simplest to grasp:

> Give me this Resource.

For example:

```
GET /users/123
```

This means: fetch the User with ID 123. The server might respond:

```json
{
  "id": 123,
  "name": "Tom",
  "email": "tom@example.com"
}
```

The point of GET is retrieving data, not modifying it. For example:

```
GET /products
```

fetches a list of products;

```
GET /products/123
```

fetches a single product.

GET is generally Safe and Idempotent. In other words, repeating a GET on the same Resource shouldn't change any data because of the GET itself.

## POST: Create / Command

POST is often understood as:

> Create a new piece of data.

For example:

```
POST /users

{
  "name": "Tom",
  "email": "tom@example.com"
}
```

The server might create `User #123`.

Here's an important trait: the server usually decides the ID of the new Resource under POST. So:

```
POST /users
```

reads more like "please create a new User for me" rather than "I want to create a User with ID = 123."

Because of this, POST shouldn't be understood as Create alone. It's also commonly used to mean "please have the server execute an operation." For example:

```
POST /orders/123/cancel
```

This isn't creating an Order at all. It's asking the server to execute the "cancel order" Command.

So POST is best understood as:

**POST → Create / Command**

## PUT: Set

PUT is the most commonly misunderstood one. Many people remember it as `PUT = Update`, but a better mental model is `PUT = Set`, meaning:

> Make this Resource end up in exactly the state I specify.

For example:

```
PUT /users/123/settings

{
  "language": "en-US",
  "theme": "dark",
  "notification": true
}
```

This doesn't just mean "modify language, theme, and notification." It's closer to "here is the complete state that User 123's settings should be."

That's why PUT is well suited to expressing:

> I want this Resource to become this state.

PUT also has a critically important trait: **idempotency**. Suppose:

```
PUT /users/123/settings

{
  "theme": "dark"
}
```

Send it once, `theme = dark`. Send it ten times, `theme = dark`. The end state is still the same.

So PUT is a good fit for "set to a given state."

## PATCH: Modify

PATCH, by contrast, is closer to:

> Modify part of this Resource.

For example:

```
PATCH /users/123

{
  "name": "John"
}
```

This means "change User 123's name to John, and leave everything else untouched." Suppose the original data was:

```json
{
  "name": "Tom",
  "email": "tom@example.com",
  "phone": "0912345678"
}
```

PATCH with:

```json
{
  "name": "John"
}
```

results in:

```json
{
  "name": "John",
  "email": "tom@example.com",
  "phone": "0912345678"
}
```

Only `name` gets modified. So PATCH can be remembered as:

**PATCH → Modify**

### What's the actual difference between PUT and PATCH?

The simplest mental model is:

- PUT → "become this"
- PATCH → "change this part"

Take this User, for example:

```json
{
  "name": "Tom",
  "email": "tom@example.com",
  "phone": "0912345678"
}
```

If you use `PUT /users/123`, conceptually that's "User 123 → gets fully set to the specified Resource." Whereas `PATCH /users/123` is "User 123 → only the specified fields get modified."

So PUT isn't "an older version of PATCH." The two express different semantics entirely.

## DELETE: Remove

DELETE simply means:

> Make this Resource no longer exist.

For example:

```
DELETE /users/123
```

This means: remove User 123. DELETE is also idempotent.

First call: `User 123 → deleted`. Second call: `User 123 → already doesn't exist`. Third call: `User 123 → still doesn't exist`. The end state is always "User 123 doesn't exist."

So DELETE can be remembered as:

**DELETE → Remove**

## A quick-reference table

| Method | Mental Model | Common Use |
| --- | --- | --- |
| GET | Get | Fetch a Resource |
| POST | Create / Command | Create a Resource, or execute an operation |
| PUT | Set | Set the complete state of a Resource |
| PATCH | Modify | Modify part of a Resource |
| DELETE | Remove | Remove a Resource |

Don't just memorize `POST = Create` and `PUT = Update`. Instead, think of it as:

- GET → "give me"
- POST → "create / execute this for me"
- PUT → "make it become this"
- PATCH → "change this part"
- DELETE → "make it disappear"

## Finally: why this matters for Rails

Rails' RESTful routing ties these HTTP methods directly to controller actions. For example:

```ruby
resources :users
```

lets Rails build:

```
GET       /users
POST      /users

GET       /users/:id
PATCH     /users/:id
PUT       /users/:id
DELETE    /users/:id
```

which then maps to:

```
GET    → index / show
POST   → create
PATCH  → update
PUT    → update
DELETE → destroy
```

At this point it becomes clear that Rails isn't simply mapping HTTP methods onto CRUD. It's actually leveraging HTTP's own semantics around Resources to build a consistent web API structure.

So what's actually worth remembering isn't:

```
GET    = Read
POST   = Create
PUT    = Update
PATCH  = Update
DELETE = Delete
```

but rather:

- GET → Get
- POST → Create / Command
- PUT → Set
- PATCH → Modify
- DELETE → Remove

Once you start understanding HTTP this way, Rails controllers, REST APIs, frontend `fetch()` calls, and third-party APIs all become a lot easier to read, and questions like "why does this API use POST instead of PUT" stop being mysterious.

Reference: [ihower - HTTP Verbs: POST, PUT, PATCH](https://ihower.tw/blog/6483-http-verbs-post-put-patch)

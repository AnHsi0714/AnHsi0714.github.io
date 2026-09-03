---
type: tech
title: "HTTP Methods Aren't Just CRUD: Understanding GET, POST, PUT, PATCH, DELETE"
date: 2026-09-01
categories: [Notes, Web, Technical]
excerpt: Stop memorizing GET/POST/PUT/DELETE as read/create/update/delete. Think in terms of "what do I want to do to this Resource" instead, and finally get straight on what actually separates PUT from PATCH.
---

> Writing period: 2026-08-29 – 2026-09-01

## Backstory

When I first started working with web APIs, all I knew was that there were methods like GET/POST/PUT/DELETE, and I'd often mix up what POST and PUT even meant.

Many beginners memorize them straight as <span data-term="crud">CRUD</span>, and that's how I originally learned it too:

- GET => READ
- POST => CREATE
- PUT => UPDATE
- DELETE => DELETE

During a recent internship I happened to need to integrate with an API, so I went back and reviewed this, and realized that while this way of memorizing it is convenient, it isn't precise enough.

A better way is to understand them through the lens of "what do I want to do to this Resource":

- GET → Get
- POST → Create / Command
- PUT → Set
- PATCH → Modify
- DELETE → Remove

## GET: Get

GET is the simplest to grasp:

> Give this Resource to me.

For example:

```
GET /users/123
```

This means: fetch the data of the User with ID 123. The server might respond:

```json
{
  "id": 123,
  "name": "Tom",
  "email": "tom@example.com"
}
```

The point of GET is retrieving data, not modifying it. For example:

- Fetching the product list

```
GET /products
```

- Fetching a single product

```
GET /products/123
```

GET generally has the properties of <span data-term="safe">Safe</span> and <span data-term="idempotent">Idempotent</span> (explained in more detail later on). In other words, repeating a GET on the same Resource shouldn't change any data because of the GET itself.

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

The server can create that `User` Tom's data.

Here's an important trait: POST usually lets the server decide the ID of the new Resource. So:

```
POST /users
```

reads more like "please help me create a new User" rather than "I want to create a User with ID = 123."

Back when I was interning, I noticed that with POST I didn't need to pass an id, but GET would return one automatically.

That's usually because the id column is set up as an auto-increment primary key in the database, so the database generates the next number itself when a row is inserted, and the application doesn't need to specify one. The exact behavior really depends on how that column is designed.

Because of this, POST shouldn't be understood as Create alone. It's also commonly used to mean "please have the Server execute an operation." For example:

```
POST /orders/123/cancel
```

This isn't creating an Order at all. It's asking the server to execute the "cancel order" Command.

So POST can be understood as:

**POST → Create / Command**

## PUT: Set

PUT is the most commonly misunderstood one. Many people remember it as `PUT = Update`, but a better mental model is `PUT = Set`, meaning:

> Make this Resource end up in the exact state I specify.

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

PUT also has a critically important trait: **<span data-term="idempotent">Idempotent</span>**. Suppose:

```
PUT /users/123/settings

{
  "theme": "dark"
}
```

Sending it once gives `theme = dark`, and sending it ten times also gives `theme = dark`; the final state stays the same.

So PUT is a good fit for "set to a given state."

Another thing worth adding: PUT isn't only for "updating."

If the `User 123` targeted by `PUT /users/123` doesn't already exist, the server can also choose to create a new record directly from the content sent, so that `User 123` now exists. This behavior is called an Upsert (Update + Insert).

This is also why PUT requires the Client to specify the Resource's ID itself (e.g. the `123` in the URL): regardless of whether the record already existed, the result of the call has to be "User 123 becomes this specified state," which fits PUT = Set's semantics exactly. POST, by contrast, leaves the new ID up to the server to decide, so it can't express "create" the same way.

## PATCH: Modify

PATCH is something I learned after reading up on this topic, so let's look at its definition and usage first.

PATCH is closer to:

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

So PUT isn't "an older version of PATCH." The two express entirely different semantics.

A question came up for me at this point.

Q: So why can't PATCH just replace PUT entirely?

A: It actually can, since PATCH is capable of both partially modifying and fully replacing an entire record.

But the difference in semantics between them is exactly why PUT still exists: PUT means "set to this final state." If everything were expressed through PATCH, the semantics would get muddled, because PATCH conveys "change these few fields," not "this is the final state."

## DELETE: Remove

DELETE simply means:

> Make this Resource no longer exist.

For example:

```
DELETE /users/123
```

This means: remove User 123. DELETE is also <span data-term="idempotent">Idempotent</span>.

- First call: `User 123` gets deleted
- Second call: `User 123` already doesn't exist
- Third call: `User 123` still doesn't exist

The end state is always "User 123 doesn't exist."

So DELETE can be remembered as:

**DELETE → Remove**

## What Safe and Idempotent Actually Mean

Earlier I mentioned that GET, PUT, and DELETE have the property of being <span data-term="safe">Safe</span> or <span data-term="idempotent">Idempotent</span>.

Safe guarantees "calling it won't change any data." Idempotent guarantees "no matter how many times you call it, the end result is the same."

It's precisely because Safe methods are guaranteed to have no side effects that they can be safely cached by intermediaries like a <span data-term="proxy">Proxy</span> or a <span data-term="cdn">CDN</span>, and even be used by the browser to <span data-term="prefetch">prefetch</span> content ahead of time.

Idempotency matters a lot in practice: suppose a Client calls an API and hits a network timeout, unsure whether the Request actually reached the Server. If that Method is Idempotent, the Client can safely resend it once without worrying about a duplicate side effect (like a duplicate charge or inserting the same record twice).

This is also why POST generally isn't recommended for automatic retries, while PUT and DELETE are fine.

Here's where you can also see the difference between understanding this before and after:

- Before (only mapping to <span data-term="crud">CRUD</span>): all I knew was `POST = create` and `PUT = update`. Faced with a question like "should I resend this after a network timeout," I had no basis to decide.
- After (understanding Safe / Idempotent): I know PUT and DELETE can be safely resent, but POST can't, because their guarantees around idempotency are different. This is the knowledge that actually matters when designing a retry mechanism or reading API docs.

## Summary Table

| Method | Mental Model     | Safe | Idempotent | Common Use                          |
| ------ | ---------------- | ---- | ---------- | ----------------------------------- |
| GET    | Get              | Yes  | Yes        | Fetch a Resource                    |
| POST   | Create / Command | No   | No         | Create a Resource, or run an action |
| PUT    | Set              | No   | Yes        | Set a Resource's complete state     |
| PATCH  | Modify           | No   | Depends    | Modify part of a Resource           |
| DELETE | Remove           | No   | Yes        | Remove a Resource                   |

PATCH's <span data-term="idempotent">Idempotent</span> column is marked "Depends," because PATCH is semantically about "modifying": if the modification is a fixed value (e.g. setting `name` to `"John"`), resending it multiple times gives the same result, so it counts as Idempotent. But if it's a relative modification, like "quantity += 1," resending it keeps changing the result, so it isn't Idempotent.

Don't just memorize `POST = Create` and `PUT = Update`. Instead, think of it as:

- GET → "give me"
- POST → "create / run this for me"
- PUT → "make it become this"
- PATCH → "change this part"
- DELETE → "make it disappear"

## Finally: why this matters for Rails

<span data-term="rails">Rails</span>' <span data-term="rails-restful-routing">RESTful routing</span> ties these HTTP methods directly to controller actions. For example:

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

At this point it becomes clear that Rails isn't simply mapping HTTP methods onto <span data-term="crud">CRUD</span>. It's actually leveraging HTTP's own semantics around Resources to build a consistent web API structure.

So what's actually worth remembering is:

- GET → Get
- POST → Create / Command
- PUT → Set
- PATCH → Modify
- DELETE → Remove

Once you understand HTTP this way, it becomes a lot easier to read API methods later on, and to understand questions like "why does this API use POST instead of PUT."

Reference: [ihower - HTTP Verbs: POST, PUT, PATCH](https://ihower.tw/blog/6483-http-verbs-post-put-patch)

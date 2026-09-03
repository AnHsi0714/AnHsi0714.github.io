---
type: tech
title: "Which RxJS Operator Should I Use: A Question-to-Answer Cheat Sheet"
date: 2026-09-02
categories: [Notes, Web, Technical]
excerpt: "A practical RxJS reference built from real Angular internship experience: which operator flattens nested Observables, how to transform and filter data, handle errors, and control subscriptions, organized as a lookup table."
---

> Writing period: 2026-09-02

## Backstory

While doing Angular frontend development during my internship at Sun Bird Software, the codebase used <span data-term="rxjs">RxJS</span> heavily to handle async events and API calls. I kept seeing <span data-term="concat-map">concatMap</span>, <span data-term="switch-map">switchMap</span>, <span data-term="merge-map">mergeMap</span>, and <span data-term="exhaust-map">exhaustMap</span> show up interchangeably, and couldn't tell when to use which, at one point I even assumed they were just different ways of writing the same thing. It turned out they're different strategies for the same underlying problem, and picking the wrong one causes real <span data-term="race-condition">race conditions</span> or UX bugs.

## The problem itself: why "flattening" is needed

When a user action (a click, typing) triggers a new Observable (usually an API call), and that action can fire more than once, you end up with a nested structure: an outer Observable that emits inner Observables. All three operators do the same job, flattening that nesting into one level, they just differ in the strategy they use to do it.

## mergeMap: run everything in parallel, independently

<span data-term="merge-map">mergeMap</span> lets every trigger fire its own request independently, running in parallel. Results come back in whatever order they finish, and nothing gets cancelled.

Good for cases where each trigger is independent and order doesn't matter, like firing off several unrelated requests at once. The downside: if a user triggers it multiple times in quick succession, older requests aren't cancelled, responses can come back out of order, and the screen might not end up showing the result of the most recent action.

```ts
deleteClicks$
  .pipe(mergeMap((itemId) => deleteItem(itemId)))
  .subscribe((itemId) => removeFromList(itemId));
```

A user clicks "Delete A," "Delete B," "Delete C" in a row: all three delete requests go out at once, and whichever comes back first gets removed from the screen first, no queueing.

## concatMap: queue up, preserve order

<span data-term="concat-map">concatMap</span> queues each new inner Observable and waits for the previous one to finish before starting the next, so processing order always matches trigger order.

Good for cases where order can't be scrambled, submitting several form entries in sequence, or a step that must only run after the previous one succeeds. The cost: if one trigger is slow or stuck, everything after it has to wait, which can feel sluggish to the user.

```ts
checkoutSteps$
  .pipe(concatMap((step) => submitStep(step)))
  .subscribe((result) => updateCheckoutStatus(result));
```

Sending `'create-order'` → `'charge'` → `'notify-shipping'` in sequence: they always finish in that order, so even if "charge" is slow, "notify-shipping" waits for it to finish before starting, it never jumps ahead.

## switchMap: keep only the latest, cancel the rest

<span data-term="switch-map">switchMap</span> cancels whatever inner Observable is still in flight the moment a new trigger comes in, keeping only the result of the most recent one.

Good for cases where only the latest result matters and older ones can just be thrown away, which is exactly why it's the default choice for search boxes and filters, situations where a user's next action supersedes their previous intent. By the time someone's typed a fifth character, the first four search requests are already meaningless, so cancelling them is the right call.

```ts
searchInput$
  .pipe(switchMap((keyword) => searchApi(keyword)))
  .subscribe((results) => showResults(results));
```

A user types `'r'` → `'re'` → `'react'`: the screen ends up showing only the `'react'` results, the first two requests get cancelled while still in flight, so there's no chance of the `'re'` results coming back late and overwriting the correct ones.

## exhaustMap: ignore new triggers while busy

When a new trigger comes in, <span data-term="exhaust-map">exhaustMap</span> ignores it outright if the previous inner Observable hasn't finished yet, and only starts accepting new triggers once the current one completes. It's the mirror image of <span data-term="switch-map">switchMap</span>: switchMap lets the new one override the old, exhaustMap lets whatever's already running finish untouched and drops the new one.

Good for cases where you don't want an in-flight operation interrupted or duplicated, like a submit button: while the request from the first click is still in flight, a second click shouldn't fire another request, otherwise you risk double-submitting a form or double-charging a payment.

```ts
submitClick$
  .pipe(exhaustMap(() => submitOrder(orderPayload)))
  .subscribe((result) => showConfirmation(result));
```

A user clicks "Submit" again before the first order request has come back: the second click is simply dropped, only one order shows up on screen, and the next click only takes effect once the first request has finished.

All four snippets share the same skeleton: a source Observable → pipe through one flattening operator → subscribe to handle the result. What actually decides the behavior is which operator sits in the middle, and how it treats an old, still-in-flight request when a new trigger comes in.

## How the four compare

| Operator | When a new inner Observable arrives | Best for |
| --- | --- | --- |
| mergeMap | Runs in parallel, unaffected by each other | Independent triggers, order doesn't matter |
| concatMap | Queues behind the previous one | Order must be preserved |
| switchMap | Cancels the previous one, keeps only the latest | Only the latest result matters |
| exhaustMap | Ignores new ones until the current finishes | Shouldn't be interrupted while running |

## debounceTime: a different problem entirely

<span data-term="debounce-time">debounceTime</span> often shows up right next to <span data-term="switch-map">switchMap</span> (`debounceTime(300), switchMap(...)`), but it's solving a different layer of the problem: debounceTime decides how long to wait with no new events before letting the next step happen at all, whether to emit this trigger in the first place. switchMap decides what to do with the previous in-flight request once a new trigger does happen. One throttles the input events themselves; the other is a strategy for flattening nested Observables. The two stack together, but each is solving a separate problem.

Because they're so often seen together, debounceTime gets mistaken for a member of the switchMap family, but it isn't in the same category as <span data-term="concat-map">concatMap</span>, switchMap, or <span data-term="merge-map">mergeMap</span> at all: one controls trigger frequency, the others decide the flattening strategy.

```ts
searchInput$
  .pipe(
    debounceTime(300),
    switchMap((keyword) => searchApi(keyword)),
  )
  .subscribe((results) => showResults(results));
```

## Common operators at a glance

Beyond flattening strategy, a handful of other operators show up constantly in day-to-day <span data-term="rxjs">RxJS</span>: <span data-term="map">map</span> transforms data, <span data-term="filter">filter</span> filters it, <span data-term="tap">tap</span> runs a side effect, <span data-term="distinct-until-changed">distinctUntilChanged</span> drops repeated values, <span data-term="catch-error">catchError</span> catches errors, <span data-term="retry">retry</span> retries automatically, <span data-term="fork-join">forkJoin</span> waits for several sources to all complete, <span data-term="take-one">take(1)</span> subscribes exactly once, and <span data-term="take-until">takeUntil</span> keeps subscribing until some other event fires. None of these are as easy to mix up as the flattening operators, but the syntax and the right moment to reach for each one are easy to forget before they're second nature, so here's a lookup table.

Every "Example" row below uses the same scenario: `users$` is an Observable that emits user objects (like `{ id: 1, name: 'Tom', active: true }`), written as "input → operator → output" so it's obvious what the operator actually does to the data instead of just showing bare syntax.

| Operator | What it does | When to use it | Example |
| --- | --- | --- | --- |
| map | Transforms each value into a new one, one to one | The API response needs reshaping into what the view needs | `{ id: 1, name: 'Tom' }` → `map(u => u.name)` → `'Tom'` |
| filter | Only lets values matching a condition through | You only want the values in the stream that meet some condition | `{ active: true }` → `filter(u => u.active)` → passes through; `{ active: false }` → dropped |
| tap | Doesn't change the data, just runs a side effect (like logging) partway through | You want to log or debug as data flows by without affecting the data itself | `'Tom'` → `tap(u => console.log(u))` → `'Tom'` (unchanged, just an extra console line) |
| distinctUntilChanged | Skips a value if it's the same as the previous one | Avoid triggering downstream logic again for the same value | `'vue'` → `'vue'` → `'react'` → `distinctUntilChanged()` → `'vue'` → `'react'` (the repeated second `'vue'` is dropped) |
| catchError | Catches an error and swaps in a new Observable so the stream doesn't just die | An API call fails and you don't want the whole stream to break, you want to catch it and keep going | throws a 500 → `catchError(() => of([]))` → `[]` (stream stays alive, falls back to a default) |
| retry | Automatically resubscribes to the original Observable a few times when an error occurs | A network request occasionally fails and you want an automatic retry before showing an error | attempt 1 fails → `retry(2)` → automatically resends, up to 2 times, until it succeeds or gives up |
| forkJoin | Waits for every Observable passed in to complete, then delivers all their final results at once | You need several API calls to finish before the screen can render | `getUser()` succeeds, `getOrders()` fails → `forkJoin([...])` → the whole thing fails, `getUser()`'s already-successful result gets thrown away too (more below) |
| take(1) | Takes only the first value, then unsubscribes automatically | You only need to subscribe once, no ongoing listening needed | `'dark'` → `'light'` → `take(1)` → only `'dark'` comes through, then it unsubscribes |
| takeUntil | Keeps subscribing until another Observable emits, then unsubscribes automatically | A component needs to cancel all its subscriptions on destroy | mouse keeps emitting coordinates → `takeUntil(destroy$)` → stops emitting once the component is destroyed |

One more thing about forkJoin: the first instinct was to bundle several API calls into one forkJoin, fire them all at once, and render the screen after everything came back, which seemed harmless enough. Code review pointed out the catch: forkJoin fails entirely the moment any one source errors, and even results from sources that had already succeeded get thrown away with it, so the screen ends up with nothing. It got reworked so each API call catches its own error with catchError and falls back to a default, guaranteeing forkJoin itself always completes, worst case one field shows a default value instead of the whole page breaking:

```ts
forkJoin([
  getUser().pipe(catchError(() => of(null))),
  getOrders().pipe(catchError(() => of([]))),
]).subscribe(([user, orders]) => renderPage(user, orders));
```

## Takeaway

Which operator to pick comes down to one question: when this action fires again, what do you want to happen to the previous one? Don't care, use <span data-term="merge-map">mergeMap</span>. Order matters, use <span data-term="concat-map">concatMap</span>. Only the latest matters, use <span data-term="switch-map">switchMap</span>. Don't want it interrupted while running, use <span data-term="exhaust-map">exhaustMap</span>. <span data-term="debounce-time">debounceTime</span> sits a layer earlier, deciding whether this trigger even gets sent at all. The more basic operators, transforming, filtering, error handling, subscription control, are the ones used every day and also the easiest to forget the syntax for, so just check the table above when you run into a problem.

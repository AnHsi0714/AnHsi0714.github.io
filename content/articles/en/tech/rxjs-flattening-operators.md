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

mergeMap lets every trigger fire its own request independently, running in parallel. Results come back in whatever order they finish, and nothing gets cancelled.

Good for cases where each trigger is independent and order doesn't matter, like firing off several unrelated requests at once. The downside: if a user triggers it multiple times in quick succession, older requests aren't cancelled, responses can come back out of order, and the screen might not end up showing the result of the most recent action.

## concatMap: queue up, preserve order

concatMap queues each new inner Observable and waits for the previous one to finish before starting the next, so processing order always matches trigger order.

Good for cases where order can't be scrambled, submitting several form entries in sequence, or a step that must only run after the previous one succeeds. The cost: if one trigger is slow or stuck, everything after it has to wait, which can feel sluggish to the user.

## switchMap: keep only the latest, cancel the rest

switchMap cancels whatever inner Observable is still in flight the moment a new trigger comes in, keeping only the result of the most recent one.

Good for cases where only the latest result matters and older ones can just be thrown away, which is exactly why it's the default choice for search boxes and filters, situations where a user's next action supersedes their previous intent. By the time someone's typed a fifth character, the first four search requests are already meaningless, so cancelling them is the right call.

## exhaustMap: ignore new triggers while busy

When a new trigger comes in, exhaustMap ignores it outright if the previous inner Observable hasn't finished yet, and only starts accepting new triggers once the current one completes. It's the mirror image of switchMap: switchMap lets the new one override the old, exhaustMap lets whatever's already running finish untouched and drops the new one.

Good for cases where you don't want an in-flight operation interrupted or duplicated, like a submit button: while the request from the first click is still in flight, a second click shouldn't fire another request, otherwise you risk double-submitting a form or double-charging a payment.

## How the four compare

| Operator | When a new inner Observable arrives | Best for |
| --- | --- | --- |
| mergeMap | Runs in parallel, unaffected by each other | Independent triggers, order doesn't matter |
| concatMap | Queues behind the previous one | Order must be preserved |
| switchMap | Cancels the previous one, keeps only the latest | Only the latest result matters |
| exhaustMap | Ignores new ones until the current finishes | Shouldn't be interrupted while running |

## debounceTime: a different problem entirely

<span data-term="debounce-time">debounceTime</span> often shows up right next to switchMap (`debounceTime(300), switchMap(...)`), but it's solving a different layer of the problem: debounceTime decides how long to wait with no new events before letting the next step happen at all, whether to emit this trigger in the first place. switchMap decides what to do with the previous in-flight request once a new trigger does happen. One throttles the input events themselves; the other is a strategy for flattening nested Observables. The two stack together, but each is solving a separate problem.

Because they're so often seen together, debounceTime gets mistaken for a member of the switchMap family, but it isn't in the same category as concatMap, switchMap, or mergeMap at all: one controls trigger frequency, the others decide the flattening strategy.

## Common operators at a glance

Beyond flattening strategy, a handful of other operators show up constantly in day-to-day RxJS: <span data-term="map">map</span> transforms data, <span data-term="filter">filter</span> filters it, <span data-term="tap">tap</span> runs a side effect, <span data-term="distinct-until-changed">distinctUntilChanged</span> drops repeated values, <span data-term="catch-error">catchError</span> catches errors, <span data-term="retry">retry</span> retries automatically, <span data-term="fork-join">forkJoin</span> waits for several sources to all complete, <span data-term="take-one">take(1)</span> subscribes exactly once, and <span data-term="take-until">takeUntil</span> keeps subscribing until some other event fires. None of these are as easy to mix up as the flattening operators, but the syntax and the right moment to reach for each one are easy to forget before they're second nature, so here's a lookup table.

| Operator | What it does | When to use it |
| --- | --- | --- |
| map | Transforms each value into a new one, one to one | The API response needs reshaping into what the view needs |
| filter | Only lets values matching a condition through | You only want the values in the stream that meet some condition |
| tap | Doesn't change the data, just runs a side effect (like logging) partway through | You want to log or debug as data flows by without affecting the data itself |
| distinctUntilChanged | Skips a value if it's the same as the previous one | Avoid triggering downstream logic again for the same value |
| catchError | Catches an error and swaps in a new Observable so the stream doesn't just die | An API call fails and you don't want the whole stream to break, you want to catch it and keep going |
| retry | Automatically resubscribes to the original Observable a few times when an error occurs | A network request occasionally fails and you want an automatic retry before showing an error |
| forkJoin | Waits for every Observable passed in to complete, then delivers all their final results at once | You need several API calls to finish before the screen can render |
| take(1) | Takes only the first value, then unsubscribes automatically | You only need to subscribe once, no ongoing listening needed |
| takeUntil | Keeps subscribing until another Observable emits, then unsubscribes automatically | A component needs to cancel all its subscriptions on destroy |

This table is more of a dictionary than lived experience, whether I'd actually reach for the right one in practice still depends on having hit that specific wall before. Right now the flattening operators above are the ones I can point to a concrete scenario for, the rest are reference for now until a real case sends me back to them.

## Takeaway

Which operator to pick comes down to one question: when this action fires again, what do you want to happen to the previous one? Don't care, use mergeMap. Order matters, use concatMap. Only the latest matters, use switchMap. Don't want it interrupted while running, use exhaustMap. debounceTime sits a layer earlier, deciding whether this trigger even gets sent at all. The more basic operators, transforming, filtering, error handling, subscription control, are the ones used every day and also the easiest to forget the syntax for, so the table above is there to check back against.

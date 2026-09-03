---
type: tech
title: "What NgRx Actually Does: State Management in Angular"
date: 2026-09-02
categories: [Notes, Web, Technical]
excerpt: "From encountering NgRx during an internship: breaking down Store, Action, Reducer, Effect, and Selector, why an Angular app needs a separate state-management layer at all, and which state doesn't need to go through the Store, Signal handles that instead."
status: draft
---

> Writing period: 2026-09-02

## Backstory

While doing Angular frontend development during my internship at Sun Bird Software, the app's state management ran mainly through <span data-term="ngrx">NgRx</span>. At first I couldn't see why you wouldn't just keep data on the component itself, or stash a variable in a service. It only clicked once I saw multiple components in the actual codebase that needed to read and stay in sync with the exact same piece of data.

## The problem without centralized state

When the same piece of data (user info, a list's filter state) needs to be read or changed by several components that aren't in a direct parent-child relationship, having each one keep its own copy in a service quickly leads to two places holding data that's out of sync, or to components becoming tightly coupled just to stay in sync, knowing about each other and calling each other's methods directly.

<span data-term="ngrx">NgRx</span>'s approach is to separate "what does this data currently look like" from "who's allowed to change it," and centralize both in one place. Components don't talk to each other directly, instead, each one sends a signal to that central place saying what it wants to happen, and separately subscribes to what the current data looks like.

## The core pieces

- **Store**: the single source of truth for the whole app's state. Think of it as a global, read-only object that any component can subscribe to for the current state.
- **Action**: a message describing "something happened," like "the user clicked the filter button." An action doesn't change any data by itself, it just declares that an event occurred.
- **Reducer**: takes an action and computes what the new state should look like. It's a pure function, the same input always produces the same output, with no side effects.
- **Effect**: handles logic with side effects, most commonly calling an API. It listens for a specific action, runs the async work, then dispatches another action to feed the result back into the Store.
- **Selector**: pulls out just the slice of the Store a given component actually needs, and memoizes it, so a change anywhere in the Store doesn't force every subscribed component to recompute.

## How the five fit together

A typical flow: a component dispatches an action (say, "user submitted a search") → an effect picks up that action and calls the API → once the API responds, the effect dispatches another action ("search results came back") → a reducer computes the new Store state from that action → the component, subscribed via a selector, receives the new data and the view updates automatically.

The component never needs to know how the data got updated. It only has two jobs: announce what it wants to happen, and display whatever the current data looks like.

## What tripped me up

The part that was easiest to mix up early on was the difference between an action and calling a function directly. An action declares that an event happened, it isn't a command telling something to do a specific thing. The same action can be listened to in multiple places and trigger multiple downstream effects, which is a different mental model from calling a function directly, where the caller knows exactly what will run. That took me the longest to get used to.

## OnPush: why a reducer has to return a new object

Angular's <span data-term="onpush">ChangeDetectionStrategy.OnPush</span> is a performance optimization. By default, Angular checks the entire component tree for re-rendering after any event; a component set to OnPush only gets re-checked in a handful of cases, most commonly when an incoming @Input is compared with === and found to be a different reference.

That's also why an <span data-term="ngrx">NgRx</span> reducer has to return a brand-new object instead of mutating the existing state directly: if a reducer mutated the original object in place and returned it, the reference never changes, so an OnPush component comparing with === sees "nothing changed" and never re-renders, even though the data is actually different now. Keeping reducers immutable is, in a sense, playing along with OnPush's reference-only comparison.

That's conceptually close to <span data-term="rxjs">RxJS</span>'s <span data-term="distinct-until-changed">distinctUntilChanged</span>: both compare once and skip doing the next thing if nothing "changed," and both default to a === check rather than actually comparing the contents of an object. The only difference is which layer they operate on, one drives Angular's change detection, the other drives the data stream itself.

## Signal: not every piece of state belongs in the Store

Besides <span data-term="ngrx">NgRx</span>'s Store, Angular has its own separate reactivity mechanism called <span data-term="signal">Signal</span>: signal() creates a readable, writable state container, computed() creates a derived value that automatically recomputes when the signals it depends on change, and a template that reads a signal directly re-renders whenever the value changes, no Store, no subscribing to an Observable.

It's easy to assume early on that "this codebase already uses NgRx, so every piece of state should go through the Store," but the two solve problems at a different scope. Signal fits state that only matters inside a single component and doesn't need to be shared with components outside its parent-child chain, like whether a form section is expanded or collapsed. Forcing that kind of state into NgRx just adds unnecessary Action/Reducer boilerplate. NgRx's Store is for the data that genuinely needs to be shared and kept in sync across components. The test is simple: does only this component care about this state, or do unrelated components need to read it too?

## Takeaway

<span data-term="ngrx">NgRx</span> trades centralized state plus one-directional data flow for decoupling between components: components don't need to know about each other, they just signal and subscribe to the same Store. The cost is an extra layer of abstraction and boilerplate, which can be overkill for a small project, but in a codebase where multiple components share the same piece of complex state, that cost is worth paying. For state only one component cares about, <span data-term="signal">Signal</span> handles it fine, there's no need to route everything through the Store just for consistency's sake.

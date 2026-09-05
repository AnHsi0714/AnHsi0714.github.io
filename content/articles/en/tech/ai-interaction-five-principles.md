---
type: tech
title: Five Principles for Designing AI Systems
date: 2026-09-04
categories: [Notes, HCI, AI]
excerpt: "Course notes: how a smart system should tell users what it can do, how well it can do it, and what its part in every step of the interaction actually means."
---

**Course source**: [Introduction to Human-Computer Interaction: Exploring New Ways of Thinking Where People Meet Technology](https://www.youtube.com/watch?v=lVGyhEqkPFQ&list=PLQn99bzkJv9xK8KR9foKdNC3dLyL77u3Y&index=16), lecture 3-4, "Five Principles for Designing AI Systems"

## Backstory

Before this, whenever I thought about design principles for "smart systems," my first instinct was to ask whether the model was accurate, whether the algorithm was good. This lecture's five principles take a different angle: they're not about the model itself, but about the process of interaction between the user and the system. How much does the system know, how much does the user know, and are the two sides' understandings actually aligned? I turned it into notes, and along the way tried to think of a few everyday examples.

## Principle 1: Let users know what the system can do, and how well it can do it

A smart system is often a black box: at first, the user has no idea where its capability boundaries actually lie, and can only feel them out through trial and error.
Users should know which situations the system tends to get wrong, and when they shouldn't fully rely on it and should step in to override its decision, instead of only discovering they'd been overestimating what the system could do after it's already gone wrong.

Some systems annotate the basis for a result, so users know where it came from, and can tell more easily when they're outside the system's ideal use case if something goes wrong.

For example:

1. A recommendation list notes "based on what you've watched," so users know the result came from their own history rather than a guess.
2. Face recognition and scanning features prompt "please use in a well-lit area," so users know the system's judgment can be affected by environmental conditions.

## Principle 2: Surface information relevant to the current context

The same feature can mean different things to a user depending on the context. A smart system should use whatever context it can recognize (time, location, what the user is currently doing, prior actions) instead of giving the same generic response every time.

For example, when you search for a movie title, Google shows nearby theaters and showtimes sorted by distance, instead of listing every showtime at every theater in the world for the user to filter through themselves.
These results work by folding the user's location and the current time into the context.

## Principle 3: When the system isn't sure what the user wants, offer the possible options for the user to choose from

When the system isn't confident about what the user actually wants, rather than guessing and just acting on that guess, it's better to lay out the possible options and let the user pick. The benefit is that it hands the "decision" back to the user, and lets the user see that the system is "uncertain" rather than simply "wrong," two states that get very different reactions from users.

For example:

1. When you make a typo, a search engine doesn't just silently search the misspelled term. Instead it lists a "did you mean" suggestion alongside the results for what you actually typed, letting the user decide which one they meant.
2. When Claude Code runs into something that needs a user's decision during a task, it may ask a question and wait for the user to confirm the direction, rather than making an assumption on the user's behalf and proceeding.

## Principle 4: Learn from user behavior

Personalization: every action a user takes (a click, a skip, an edit, doing the same thing again) is a signal the system can use to understand what this particular person actually wants. A good smart system collects these signals and adjusts its future behavior accordingly, instead of treating every interaction as brand new and resetting its state each time.

For example:

1. Spotify's recommendations gradually reduce how often a given artist or genre shows up after a user keeps skipping them.
2. Spam filters incorporate the messages a user manually marks "not spam" into how they judge future mail.
3. An input method gradually raises the ranking of words a user has typed often in the past among its candidate suggestions.

## Principle 5: Communicate the consequences of a user's actions

If a user doesn't know what will happen before taking an action, they can only guess, and only find out after the fact whether the outcome was what they actually wanted. When a user's action has a real effect, the system needs to communicate that effect **immediately**, or at least leave a window in which it can still be undone, instead of leaving the user to guess what just happened.

For example:

1. Gmail briefly shows a "Sent, Undo" prompt after sending an email, turning what would otherwise be an irreversible send into something you have a few seconds to reconsider.
2. When a file is deleted to the Recycle Bin, the operating system tells you where it went instead of just making it disappear, so you know it can still be recovered.

## Takeaways

All five principles are really about the same thing: the gap in understanding between a smart system and its user. Principle 1 is about whether the user knows what the system can do; principle 2 is about whether the system understands the current context; principle 3 is about whether the system hands the decision back to the user when it isn't sure what they want; principles 4 and 5 are, respectively, about whether the system can keep learning from the interaction, and whether the consequences of an action are communicated clearly.

These aren't purely questions of model capability, they're questions of interaction design. A good smart system doesn't just "produce the right answer," it also lets the user know what it can do, why it did something a certain way, where it's uncertain, and what effect their own actions will have. Only when users have an accurate understanding of a system's capabilities and state can the two sides actually build a good collaborative relationship.

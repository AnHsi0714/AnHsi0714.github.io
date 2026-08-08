---
type: journal
title: Learning "Good Design" Through CodePulse
date: 2026-08-08
categories: [Reflection, HCI]
excerpt: Using five elements of good design — affordance, signifiers, feedback, mapping, and discoverability — to look back at the interface design of my capstone project, CodePulse.
---

> Written on 2026-08-08

This piece is a companion to [Discovering HCI: The Problem I Cared About Already Had a Name](/articles/exploring-hci). It records what I took away from a series of introductory videos on human-computer interaction[^1] about what makes a design "good," and the process of using those concepts to look back at CodePulse's interface.

## Affordance

The actual properties of an object, or the conditions of the environment it sits in, that let a user understand — naturally and intuitively — how to use it. More precisely, it's how the qualities carried by an object and its environment get perceived and understood by the user.

To borrow an example from the videos: a flat surface affords support, so when a user sees a chair, they instinctively know to sit on its seat. The Recycle Bin on a computer desktop works the same way — dragging a file into it mirrors the real-world act of tossing something into a trash can.

In a digital interface, physical affordance doesn't necessarily exist directly, so users typically have to rely on visual or interactive cues — signifiers — to understand what actions a given element supports.

## Signifiers

These tell the user which part of an object to act on, and what action to take there.

For example, a keyboard labels both Zhuyin and Latin letters, telling the user which character a key will produce when pressed. Key shape is itself a signal too — typing keys are small squares, while function keys are longer. The layout — main keys, function-key cluster, numeric pad — also lets users roughly guess a key's purpose even on an unlabeled keyboard.

Another example is a door handle: a handle that sticks out invites you to pull instinctively, while a flat plate implies you should push.

Websites work the same way: interactive elements often signal, through hover changes in color, shape, or cursor, that "this is interactive."

The first time a user enters a CodePulse level, a guided tour walks them through how to interact with it (Figure 1); buttons also use the pointer cursor to signal that they're clickable.

<figure>
  <img src="/images/articles/code-pulse-good-design/codepulse-guide-tour.png" alt="A guided-tour tooltip shown on the CodePulse platform the first time a user enters a level" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 1: The guided tour that appears on first entering a level, explaining that a button can swap the left/right panel layout</figcaption>
</figure>

## Feedback

This lets the user know a device is responding to their input. Feedback needs to be given immediately after an action, and it needs to accurately convey the result of that action.

For example, an automatic door flashes an LED or chimes, and a bus's stop-request bell has both a sound and a light.

While CodePulse is analyzing code, a loading label appears, letting the user know the system is at work (Figure 2). Without that feedback, users would have no way to tell whether the system was computing, unresponsive, or had hit an error.

<figure>
  <img src="/images/articles/code-pulse-good-design/codepulse-loading-state.png" alt="The CodePulse platform showing a 'Waiting for analysis...' state while analyzing submitted code" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 2: After submitting code, the screen shows an in-progress analysis state, letting the user know the system is working on it</figcaption>
</figure>

## Mapping

This connects how a device operates, how the user acts on it, and the effect that action produces.

For example, a retractable pen is pressed from top to bottom, and the tip also extends downward — the direction matches, which helps users understand and remember the interaction. A light switch works on the same principle: flipping it up implies "stronger, bigger," flipping it down implies "weaker, smaller," which mirrors how the light itself brightens or dims — that's mapping created by a similarity in meaning. The counterexample is the all-too-common panel of light switches where each switch's position doesn't line up with the actual light it controls — a clear case of missing mapping.

Having gone back over CodePulse again, I still haven't landed on a mapping example clear enough to point to. That's also made me realize that not every HCI concept applies cleanly to every interface — rather than forcing an example just to fill out the category, figuring out whether a concept genuinely applies in the first place might be the more worthwhile question.

## Discoverability

When affordance, signifiers, mapping, and feedback are all done well, users can genuinely "discover" what actions are available. It's the combined result of those four elements working together, not a separate fifth element.

> A good design tends to have several of these elements working well at once; a bad one tends to be missing several of them at once.

On the whole, most actions in CodePulse can be naturally discovered by users — but does that alone make it a good design?

Looking back over it again, I noticed that CodePulse's animated lessons can actually be watched freely, in any order, while the quiz levels must be unlocked sequentially. Because both are rendered with the same node style, an animation-lesson node visually looks just as "locked" as a quiz level, so users can easily assume they need to clear a level first before they're allowed to watch the animation. This actually runs into two problems at once: first, the signifier sends the wrong message (the lock icon implies "not interactive," when it actually is); second, the state shown on screen doesn't line up consistently with the actual interaction rules — so the mental model users form ends up being wrong.

<figure>
  <img src="/images/articles/code-pulse-good-design/lock.png" alt="CodePulse's learning-path node map, where Stack, Queue, and Linked List show a lock icon because their quizzes aren't unlocked yet, while only Array shows a playable icon" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 3: The lock icon marks a node whose quiz is still locked (the design centers progression on the quiz), but the animated lesson under that same node is actually unrestricted and can still be watched freely — something users rarely notice</figcaption>
</figure>

Seeing the lock icon, users naturally form the mental model that levels "must be unlocked in order" — but the actual interaction doesn't require that at all. When what a signifier communicates doesn't match the system's real behavior, it can create a barrier to understanding even when the underlying functionality is working just fine.

As for mapping, I'm still not sure whether this case really belongs under that label. What's clearer is that the state the interface presents doesn't match the actual interaction rules, and that mismatch is what leads users to build the wrong mental model.

Going back over CodePulse this way also showed me that HCI isn't just about slapping a few labels onto interface problems — it's a way of analyzing them. Where I used to just say "this design is easy to misread," I can now push further: which signifier is creating what perception? What mental model does the user end up building from it? And where exactly does that model diverge from how the system actually behaves?

[^1]: [Introduction to Human-Computer Interaction video playlist](https://www.youtube.com/watch?v=pR-kh31zIUo&list=PLQn99bzkJv9xK8KR9foKdNC3dLyL77u3Y)

---
type: journal
title: Discovering HCI, the Interaction Between the Living and the Non-Living
date: 2026-07-26
categories: [Reflection, HCI]
excerpt: How I went from feeling out of place in CS to stumbling into HCI, and used design elements like affordance, signifiers, and mapping to look back at my capstone project and my own work.
---

> Written between 2026-07-25 and 2026-07-26

This is a piece recording my journey into HCI and what I've taken away from it so far.

## Origins

I've been in the CS department for a bit over three years now, and if I count the three years before that in the vocational information-tech track, it's been more than six years. Through all of it, I kept feeling out of place — the electronics and soldering of the vocational track, the operating systems and computer organization of the CS degree — none of these areas ever managed to spark real passion in me. It wasn't until I recently started preparing my graduate school application materials that I stumbled onto the field of HCI.

What I actually enjoy is exploring the interaction between people and technology: whether it was, back when I first entered the information-tech track, simply wanting to build a game idea I'd cooked up with a middle-school classmate; or discovering, during the summer after my first year of college, Professor Wu Che-Yu's online courses on front-end web design and generative art, which showed me the side of technology that meets the humanities; or that small pang of regret I always feel when I see an odd color scheme or a poorly designed interface. All of these moments led me to realize that there was, in fact, a corner of computer science that matched my interests all along.

## An Unexpected Discovery

HCI stands for Human-Computer Interaction. At first I was wondering how I'd even find a project to get into this field — only to realize my capstone project had already brushed up against it: a DSA (Data Structures & Algorithms) visualization learning platform. Beyond building out the platform's core functionality, I wanted to know whether the amount of information on screen felt overwhelming to users, and whether the pace of learning and exploration could be improved. So I designed an A/B pre/post-test with crossover groups, plus a user feedback survey.

A clear interface communicates information to users more smoothly, and with that goal in mind, I originally added a guided tour to the animation interface, hoping it would improve the experience. But it turned out that too much information at once actually hurt this part's feedback score (a modest 3.14 out of 5). Later, I added a setting so the pseudocode panel only opens while an animation is playing, and auto-scrolls to the relevant variable section during playback — letting users focus more directly on the operation and the change happening in front of them, and understand each step more intuitively.

## The Elements of Good Design

I later watched a series of introductory videos on human-computer interaction[^1], and after finishing them, I came away with a rough understanding of what makes a design "good" and what elements a good design should have:

- **Affordance**: the actual properties of an object, or the conditions of the environment it sits in, that let a user understand — naturally and intuitively — how to use it. More precisely, it's how the qualities carried by an object and its environment get perceived and understood by the user.
  To borrow an example from the videos: a flat surface affords support, so when a user sees a chair, they instinctively know to sit on its seat. The Recycle Bin on a computer desktop works the same way — dragging a file into it mirrors the real-world act of tossing something into a trash can.
- **Signifiers**: these tell the user which part of an object to act on, and what action to take there.
  For example, a keyboard labels both Zhuyin and Latin letters, telling the user which character a key will produce when pressed. Key shape is itself a signal too — typing keys are small squares, while function keys are longer. The layout — main keys, function-key cluster, numeric pad — also lets users roughly guess a key's purpose even on an unlabeled keyboard.
  Another example is a door handle: a handle that sticks out invites you to pull instinctively, while a flat plate implies you should push.
  Websites work the same way: interactive elements usually change on hover — in color, size, shape, or sound — all of which tell the user "this is interactive," whether by click or drag.
- **Feedback**: this lets the user know a device is responding to their input. Feedback needs to be given immediately after an action, and it needs to accurately convey the result of that action.
  For example, an automatic door flashes an LED or chimes, and a bus's stop-request bell has both a sound and a light.
- **Mapping**: this connects how a device operates, how the user acts on it, and the effect that action produces.
  For example, a retractable pen is pressed from top to bottom, and the tip also extends downward — the direction matches, which helps users understand and remember the interaction. A light switch works on the same principle: flipping it up implies "stronger, bigger," flipping it down implies "weaker, smaller," which mirrors how the light itself brightens or dims — that's mapping created by a similarity in meaning. The counterexample is the all-too-common panel of light switches where each switch's position doesn't line up with the actual light it controls — a clear case of missing mapping.
- **Discoverability**: when affordance, signifiers, mapping, and feedback are all done well, users can genuinely "discover" what actions are available. It's the combined result of those four elements working together, not a separate fifth element.

> A good design tends to have several of these elements working well at once; a bad one tends to be missing several of them at once.

Next, I tried applying these elements to CodePulse:

- **Affordance**: in a purely digital interface, affordance in the physical sense barely applies. A button's "clickability" is essentially a perception simulated by signifiers (a shadow, a cursor style) rather than a real physical property.
- **Signifiers**: the first time a user enters a level, a guided tour walks them through how to interact with it (Figure 1); buttons also use the pointer cursor to signal that they're clickable.

<figure>
  <img src="/images/articles/exploring-hci/codepulse-guide-tour.png" alt="A guided-tour tooltip shown on the CodePulse platform the first time a user enters a level" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 1: The guided tour that appears on first entering a level, explaining that a button can swap the left/right panel layout</figcaption>
</figure>

- **Feedback**: while the algorithm is still analyzing code, a loading label appears, letting the user know the system is at work (Figure 2).

<figure>
  <img src="/images/articles/exploring-hci/codepulse-loading-state.png" alt="The CodePulse platform showing a 'Waiting for analysis...' state while analyzing submitted code" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 2: After submitting code, the screen shows an in-progress analysis state, letting the user know the system is working on it</figcaption>
</figure>

- **Mapping**: I haven't found a clear example of this one yet.

Finally, discoverability: on the whole, most actions can be naturally discovered by users — but does that alone make it a good design?

Looking back over it again, I noticed that CodePulse's animated lessons can actually be watched freely, in any order, while the quiz levels must be unlocked sequentially. Because both are rendered with the same node style, an animation-lesson node visually looks just as "locked" as a quiz level, so users can easily assume they need to clear a level first before they're allowed to watch the animation. This actually runs into two problems at once: first, the signifier sends the wrong message (the lock icon implies "not interactive," when it actually is); second, the mapping is misaligned — the constraint shown on screen (sequential order) doesn't match the system's real logic (the animations have no such constraint) — so the mental model users form ends up being wrong.

<figure>
  <img src="/images/articles/exploring-hci/lock.png" alt="CodePulse's learning-path node map, where Stack, Queue, and Linked List show a lock icon because their quizzes aren't unlocked yet, while only Array shows a playable icon" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 3: The lock icon marks a node whose quiz is still locked (the design centers progression on the quiz), but the animated lesson under that same node is actually unrestricted and can still be watched freely — something users rarely notice</figcaption>
</figure>

To be continued...

[^1]: [Introduction to Human-Computer Interaction video playlist](https://www.youtube.com/watch?v=pR-kh31zIUo&list=PLQn99bzkJv9xK8KR9foKdNC3dLyL77u3Y)

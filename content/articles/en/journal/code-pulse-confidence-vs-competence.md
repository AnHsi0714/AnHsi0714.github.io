---
type: journal
title: "What CodePulse Taught Me: Confidence Isn't the Same as Learning"
date: 2026-09-01
categories: [Reflection, HCI]
excerpt: "Untangling three easily-conflated concepts, learning confidence, self-reported confidence, and self-perceived learning effectiveness, starting from two similar-looking items on CodePulse's own survey, to show that feeling better doesn't always mean learning better."
---

> Written on 2026-09-01 - 2026-09-02

## Backstory

While writing up the results in [A User Study, Seen Through CodePulse](/articles/code-pulse-user-study), I ran into a problem:

The survey was originally designed with these two items:

- Before using CodePulse, I found algorithms very intimidating and hard to approach.
- After using CodePulse, I feel confident I can go on to learn harder algorithms.

The intent was to compare users' learning confidence before and after. But after talking it through with an AI, it turned out not to be that simple. The two items look alike, both about "confidence," but they don't actually measure the same thing.

## These two items aren't actually asking the same question

Laid side by side:

- "Before using CodePulse, I found algorithms very intimidating and hard to approach" asks about **fear** toward the subject of algorithms as a whole, an affective, emotional response.
- "After using CodePulse, I feel confident I can go on to learn harder algorithms" asks about **confidence** in one's future ability to learn, a forward-looking self-efficacy judgment.

Low fear doesn't automatically mean high confidence. These two items aren't a clean "before" and "after" of the same construct, they're two related but distinct things: one is an emotional reaction to a subject, the other is a judgment about one's own ability.

When analyzing the data, to pair these two items up as a pre/post measure and compute a "confidence change" score, the fear item was reverse-scored (on a 5-point scale, reverse-scoring means 6 minus the raw score) and treated as a "converted pre-use confidence" value, then subtracted from the post-use confidence score. That conversion carries an assumption worth stating plainly: **"not afraid" is being treated as equivalent to "confident."** The two are probably correlated, but they're still different things, and it turns out to be the same problem as "confidence isn't competence," discussed below, wearing a different hat.

There's also a design issue that's easy to overlook: both items were answered on the same survey, at the same point in time (right after using the platform and finishing the pre/post quiz). The first item asks about feelings "before" using the platform, but participants were actually recalling that, after the fact. This design is called a <span data-term="retrospective-pre-post">**retrospective pre-post**</span>, and it's not the same as a true pre-post measured at two separate points in time. It's prone to having the "current" feeling color the recollection of the "past" one, what's called <span data-term="response-shift-bias">response-shift bias</span> in the literature.

That's the part I hadn't noticed going in: the two items don't just measure different constructs, the timing of the measurement itself isn't a clean before-and-after comparison either.

## Learning confidence: believing you can, versus actually being able to

<span data-term="learning-confidence">Learning confidence</span> is a learner's subjective belief in their own ability to complete a learning task, understand the material, or solve a problem. It answers "do I believe I can do this?", not "can I actually do this?" The CodePulse survey item "I feel confident I can go on to learn harder algorithms" is asking exactly this, a belief about future learning ability, not a general impression of whether algorithms as a subject are likeable.

The key point here: **having confidence doesn't mean you actually have the ability**. Believing you can do something doesn't mean you actually can, and the reverse is also true, a real skill gap doesn't always show up as low confidence. The two can come apart, and that reverse-scoring conversion above (treating "not afraid" as "confident") is the same trap showing up in a different spot.

## Self-reported confidence: a measurement method, not a third construct

Next is "self-reported confidence," and there's an easy mix-up worth clearing up first: <span data-term="self-reported-confidence">self-reported confidence</span> is not a separate psychological construct sitting alongside learning confidence. It's **the method used to measure learning confidence**.

You can't directly observe how much someone believes in their own ability, so research typically measures it through a self-report questionnaire, having participants respond on a Likert scale. That's exactly how CodePulse's survey works: whether the item asks "how afraid were you" or "how confident are you," both are rated on a 1-5 scale, and what the respondent gives is their own subjective sense of the moment, not a score derived from being tested.

In CodePulse's user study, we also collected participants' self-assessments through a survey to understand how their subjective sense of their own learning changed before and after using the system.

You can't say "the survey measured learning effectiveness." The more precise statement is that **the survey measured participants' subjective perception of their own learning**. The two sentences make entirely different research claims.

## Self-perceived learning effectiveness vs. objective learning outcomes: the part most likely to get conflated

The third layer, and the one this whole piece is really about: "I feel like I learned it" and "I actually learned it" are two different things.

- <span data-term="self-perceived-learning-effectiveness">**Self-perceived learning effectiveness**</span>: whether the user themselves believes their learning improved, answering "do I feel like I learned better?"
- **Objective learning outcomes**: judged from data like test scores, task performance, or pre/post-test results, answering "did I actually learn it?"

CodePulse's survey has two items in this category: "Compared to traditional textbooks and slides, CodePulse made learning feel more intuitive," and "Using CodePulse saved me time in understanding data structures / algorithms / tracing code." Both ask what participants "felt" about the platform's usefulness, not a result derived independently.

CodePulse's results turned out to be a clean case study for exactly this. After using the system, participants' self-reported learning confidence rose significantly (university p < 0.001, high-school p = 0.021). But their pre/post-test scores, while trending positive, didn't reach statistical significance. At the same time, users broadly felt CodePulse was more intuitive than a traditional textbook or slide deck, and felt it saved them time too.

That means users subjectively felt more confident, found the material easier to follow, and felt they saved time, but that feeling can't be read directly as a significant gain in objective learning outcomes.

## How the three relate

| Concept | Core question | Nature | CodePulse survey item |
| --- | --- | --- | --- |
| <span data-term="learning-confidence">Learning confidence</span> | Do I believe I can learn or complete this task? | Psychological belief, subjective | "After using it, I feel confident I can go on to learn harder algorithms" |
| <span data-term="self-reported-confidence">Self-reported confidence</span> | What confidence level does the participant report? | A measurement method, not a construct | "Before using it, I found algorithms very intimidating" |
| <span data-term="self-perceived-learning-effectiveness">Self-perceived learning effectiveness</span> | Do I feel like I learned better? | Subjective judgment of the outcome | "CodePulse made learning feel more intuitive," "CodePulse saved me time understanding the material" |

Summing up the logic behind that table in one line:

A user's subjective experience splits into:

- Learning confidence (I believe I can do it)
- Self-perceived learning effectiveness (I feel like I learned better)

Both are measured through self-report surveys, and neither is necessarily equal to objective learning outcomes (did they actually learn it: pre/post tests, task performance).

## Takeaway

A survey tells you how the user feels. A test tells you how the user actually performed. Both matter, but they answer different questions.

CodePulse's results make that point directly: user confidence in learning rose significantly, but the objective test results didn't reach statistical significance. Reading the survey alone might suggest "CodePulse clearly improved learning outcomes." Combined with the objective test data, a more careful reading is that CodePulse clearly improved users' learning confidence and subjective experience, while its effect on objective learning outcomes still needs more evidence.

Looking back at that conversion from "not afraid" to "confident," it's an extension of the same reminder: every transformation and assumption made while analyzing data deserves to be written down and examined, not just used to compute a number that looks reasonable and left at that.

That conclusion is a lot more grown-up than just saying "our system works," and it's part of why I want to keep going deeper into <span data-term="human-computer-interaction">HCI</span>, user studies, and <span data-term="information-visualization">information visualization</span>, the threads I laid out in [Exploring HCI: From "Is It Usable" to "Why"](/articles/exploring-hci).

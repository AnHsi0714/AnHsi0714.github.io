---
type: journal
title: A User Study, Seen Through CodePulse
date: 2026-08-08
categories: [Reflection, HCI]
excerpt: Breaking down a user study from my capstone project CodePulse — the research question, A/B pre/post-test design, user feedback, statistical results, an information-load finding, and the design iteration that followed.
status: draft
---

> Written on 2026-08-08 – 2026-08-08

This piece is about a user study I designed and ran on CodePulse, my capstone project — it's a companion piece to [Discovering HCI: The Problem I Cared About Already Had a Name](/articles/exploring-hci).

On the team, I was mainly responsible for front-end interaction and animation design, as well as designing, running, and analyzing the user study's pre/post-tests.

## Research Question

Beyond building out the platform's core functionality, what I really wanted to know was: does this interaction design actually help users learn?

## A/B Test Design

If the pre-test and post-test used the exact same questions, participants might do better simply from remembering the questions or answers — a practice effect. So I designed two versions, A and B, of the quiz: both measured the same concepts, but expressed the questions differently.

For example, the same algorithm concept might be presented by changing the numeric values, swapping between a DFS and a BFS scenario, or switching the question format between reading code and reading its execution result. Participants took one version as the pre-test, then used CodePulse before taking the other version as the post-test.

What I wanted to observe wasn't just whether they got the same question right, but whether they could transfer the concepts they picked up while using the tool to a similar but different new problem.

## Pre/Post-Test

The goal was to see whether, after using CodePulse, users could transfer what they'd learned to a new problem.

## User Feedback

Quiz scores trended upward but didn't reach statistical significance. Looking back at participants' performance, I started to think this might not simply mean CodePulse had no learning effect — it could also have to do with question difficulty and participants' prior knowledge.

Some higher-performing participants could already answer the easier questions correctly on the pre-test, so even if their understanding shifted after using CodePulse, that change was hard to show up as a clear score improvement. On the other end, some questions may have been beyond what participants with weaker prior knowledge could grasp to begin with, so a single short session wasn't enough to translate into better quiz performance.

This was the first time it really hit me that an experiment's result isn't just about whether it's statistically significant or not. Participants' prior knowledge, question difficulty, test duration, and question design can all shape the effect you end up observing.

## Results

The result caught me off guard: users' confidence in their ability to go on and learn harder algorithms improved significantly (p < 0.001), but their quiz scores only trended upward without reaching statistical significance. Separately, users also tended to feel that CodePulse made learning more intuitive compared to traditional textbooks and slides. These results were the first time it hit me that a user "feeling like they'd learned more," rating the interface as "more intuitive," and an actual improvement in test performance are results operating at different levels — each needs to be validated with its own metric.

## Information Load

The feedback survey also surfaced another problem: while visualization makes an algorithm's execution easier to follow, presenting animation, variables, and other information all at once can also leave users feeling like there's too much to take in. That got me thinking that a more complete interface isn't necessarily a better one — striking the balance between providing enough information and avoiding cognitive overload is itself a problem interaction design has to deal with.

## Design Iteration

A clear interface communicates information to users more smoothly, and with that goal in mind, I originally added a guided tour to the animation interface, hoping it would improve the experience. But too much information at once actually hurt that part's feedback score — on the survey question "While watching the animation and tracking variables, did I feel like there was too much information to take in?", the average rating came out to 3.14 (where 5 meant "very effortful"). So I added a setting so the pseudocode panel only opens while an animation is playing, and made it auto-scroll to the relevant variable section during playback, so users could stay focused on the current execution step.

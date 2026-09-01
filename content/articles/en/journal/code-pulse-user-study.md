---
type: journal
title: A User Study, Seen Through CodePulse
date: 2026-08-08
categories: [Reflection, HCI]
excerpt: "Breaking down a user study from my capstone project CodePulse: the research question, the design and execution of the A/B pre/post-test, test performance and why it wasn't significant, the survey's learning-confidence and information-load findings, study limitations, and a closing reflection."
---

> Written on 2026-08-08 – 2026-08-08

This piece is about a user study I designed and ran on CodePulse, my capstone project; it's a companion piece to [Exploring HCI: From "Is It Usable" to "Why"](/articles/exploring-hci).

On the team, I was mainly responsible for front-end interaction and animation design, as well as designing, running, and analyzing the user study's pre/post-tests.

## Research Question

Beyond building out the platform's core functionality, what I really wanted to know was: **does this interaction design actually help users learn**?

## Study Design: An A/B Pre/Post-Test

We ran a single-group pre/post-test design with 56 participants, split into a high-school group (11th graders who had taken a programming course) and a university group (sophomores who had taken data structures and programming courses).

If the pre-test and post-test used the exact same questions, participants might do better simply from remembering the questions or answers, a practice effect. So I designed two versions, A and B, of the quiz: both measured the same concepts, but expressed the questions differently. For example, the same algorithm concept might be presented by changing the numeric values, swapping between a DFS and a BFS scenario, or switching the question format between reading code and reading its execution result. Participants alternated which version they got as pre-test versus post-test.

These variations were all designed around keeping the solving steps identical, changing a numeric value from small to large, say, always shifted the whole set together, so the underlying solving process stayed the same. The goal was to keep participants from noticing the two versions were really the same quiz and answering from memory alone.

Given participants' limited available time, they used the platform for about 20–30 minutes before completing the post-test and survey. What I wanted to observe wasn't just whether they got the same question right, but whether they could transfer the concepts they picked up while using the tool to a similar but different new problem.

## Test Performance

Test performance, measured with <span data-term="normalized-gain">Normalized Gain</span>, trended positive in both groups but didn't reach statistical significance in either.

<figure>
  <img src="/images/projects/code-pulse/test-score.png" alt="Pre/post test-score comparison" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Pre/post test-score comparison</figcaption>
</figure>

### Why the Test Scores Weren't Significant

Looking back at participants' performance, I started to think this might not simply mean CodePulse had no learning effect: it could also have to do with question difficulty and participants' prior knowledge.

Some higher-performing participants (the university sophomores) could already reliably answer the easier questions on the pre-test. For the harder questions, participants who already understood a concept tended to get it right on both tests, and those who didn't tended to get it wrong on both, a ceiling effect that left little room for scores to move regardless of what they picked up from the platform.

The high-school group, by contrast, was more prone to guessing, which made their pre/post scores less stable to begin with and further weakened the scores' ability to reflect actual learning. Separately, some questions may have been beyond what participants with weaker prior knowledge could grasp to begin with, so a single short session wasn't enough to translate into better quiz performance.

This was the first time it really hit me that an experiment's result isn't just about whether it's statistically significant or not. Participants' prior knowledge, question difficulty, test duration, and question design can all shape the effect you end up observing.

## Feedback Survey

By contrast, users' <span data-term="learning-confidence">learning confidence</span>, their confidence in being able to go on and learn harder algorithms, reached statistical significance in both groups (university p < 0.001; high-school p = 0.021). That confidence was measured through a Likert-scale item participants self-rated on the survey, a form of <span data-term="self-reported-confidence">self-reported confidence</span>.

<figure>
  <img src="/images/projects/code-pulse/confidence-score.png" alt="Pre/post learning-confidence comparison" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Pre/post learning-confidence comparison</figcaption>
</figure>

On a separate item, users also tended to feel that CodePulse <span data-term="self-perceived-learning-effectiveness">made learning more intuitive</span> compared to traditional textbooks and slides, a subjective sense that this style of teaching helped more than the traditional one.

These results were the first time it hit me that a user "feeling like they'd learned more," rating the interface as "more intuitive," and an actual improvement in test performance are results operating at different levels: each needs to be validated with its own metric.

### Information Load

A clear interface communicates information to users more smoothly, and with that goal in mind, I originally added a guided tour to the animation interface, hoping it would improve the experience. But while visualization does make an algorithm's execution easier to follow, presenting animation, variables, and other information all at once can also leave users feeling like there's too much to take in. On the survey question "While watching the animation and tracking variables, did I feel like there was too much information to take in?", the average rating came out to 3.14 (where 5 meant "very effortful"), one of the lower-rated items in the survey.

That got me thinking that a more complete interface isn't necessarily a better one: striking the balance between providing enough information and avoiding cognitive overload is itself a problem interaction design has to deal with.

So I added a setting so the pseudocode panel only opens while an animation is playing, and made it auto-scroll to the relevant variable section during playback, so users could stay focused on the current execution step.

## Study Limitations

This study used a single-group pre/post-test design without a control group, so it can't rule out confounds like test familiarity, short-term learning, or novelty effects.

Participants also didn't necessarily experience the system the way it was intended: during the high-school group's sessions, for instance, some fell asleep, and others didn't stick to the intended scope (since session time was short, I'd hoped participants would focus on the material the quiz actually covered). Whether to exclude that kind of behavior or try to control for it is still an open question.

## Closing Thoughts

This was the first time I really used a research method to test whether an interface design worked, instead of just going on intuition. The whole process was my first hands-on experience with a common <span data-term="human-computer-interaction">HCI</span> user-research method, and it made me realize that "users reporting more confidence" and "a statistically significant test-score improvement" are two pieces of evidence that can't substitute for each other, a distinction I pull apart in more detail in [What CodePulse Taught Me: Confidence Isn't the Same as Learning](/articles/code-pulse-confidence-vs-competence). If I extend this study further, adding a control group and lengthening the session would be the first things I'd want to test.

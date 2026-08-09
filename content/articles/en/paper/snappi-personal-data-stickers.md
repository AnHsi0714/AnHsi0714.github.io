---
type: paper
title: "2022 Paper Notes on 《SnapPI: Understanding the Everyday Use of Personal Informatics Stickers on Ephemeral Social Media》: Data Isn't Just Data: SnapPI and Personal Data Sharing in Social Contexts"
date: 2026-08-08
categories: [Paper, HCI, Social Media]
featured: true
coverUrl: /images/articles/snappi-personal-data-stickers/sticker-creation-flow.png
excerpt: How do people use personal data stickers in everyday social contexts? What do these stickers help with when it comes to sharing personal data, and what problems might they bring?
---

> Written between: 2026-08-08 – 2026-08-09

**Original paper**: [SnapPI: Understanding the Everyday Use of Personal Informatics Stickers on Ephemeral Social Media](https://denniswang.net/static/wang2022.pdf)

## Introduction

Prior work suggests that ephemeral sharing is a good channel for sharing personal data: it lets people filter who sees it and avoids the awkwardness of data lingering long-term, and according to the ephemeral-sharing literature, people are more likely to bring up substantial topics like health and well-being through it.

How do people use personal data stickers in everyday social contexts? What do these stickers help with when it comes to sharing personal data, and what problems might they bring?

## Methodology

This study builds on sticker designs Epstein et al. developed through a survey in earlier work, and the team built its own app, SnapPI, letting users create and share stickers in a real setting (Snapchat). Because so little prior research has looked at how personal data stickers get used in everyday social contexts, the team wanted to understand when they get used, what benefits they bring, and what challenges might come up.

Users design their own sticker appearance[^1] and personal data (e.g., step count, calories), across five data domains (steps, heart rate, food, time, and music) with three presentation styles (simple, analogy, decorative), for 39 unique stickers in total. Users can import existing data or manually enter values, customize units, and convert between units; stickers also support pulse, shake, incrementing-number, or no-animation effects. See Figure 1 for the full creation-to-sharing flow.

<figure>
  <img src="/images/articles/snappi-personal-data-stickers/sticker-creation-flow.png" alt="Screenshot of the SnapPI flow from selecting a sticker to sharing it on Snapchat" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 1: SnapPI's flow from creating to sharing a sticker — (a) pick a style and data type from the sticker gallery, (b) edit the value and goal, either (c) importing from HealthKit or (d) entering it manually, (e) share to Snapchat once it's ready, (f)(g) the sticker sits over the camera view and gets posted as a Snap</figcaption>
</figure>

Once a goal is set, SnapPI fills in the sticker's color in proportion to how much of that goal the user has reached. See Figure 2.

<figure>
  <img src="/images/articles/snappi-personal-data-stickers/goal-progress-color-fill.png" alt="Screenshot of the sticker-editing interface for adjusting animation, color, units, and goal value" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 2: The sticker-editing interface lets users adjust (b) animation style, (c) color, (d) units and custom units, and (e) the goal value; once a goal is set, the sticker's color gradually fills in based on progress (as with the sneaker sticker on the left)</figcaption>
</figure>

The study recruited 21 participants (frequent Snapchat users who send at least two Snaps a day) and tracked how often they used these stickers and how they felt about them over a two-week period.

- Technical issues were resolved through online meetings, participants were reminded to keep up their sending frequency, and everyone was compensated $10 for their time.
- 24 people were originally recruited; one had technical issues and two didn't respond. The overall pool skewed young: everyone was under 30, and 15 were between 18–22.

The team used <span data-term="reflexive-thematic-analysis">reflexive thematic analysis</span>: the first author coded interview transcripts and the Snap screenshots participants sent back, and the team refined and consolidated themes through ongoing discussion, eventually arriving at <span data-term="thematic-coding">9 codes and 3 core themes</span>.

## Findings

The study's main findings were threefold: personal data stickers lower the burden of sharing data, they encourage deeper social conversation topics, and sticker design needs to match the platform's visual style and social norms.

Feedback from participants:

- Stickers feel more approachable and less like showing off than screenshots from other personal-data-tracking apps
- Seeing a number gives people something to start a conversation about
- They quantify things that were previously hard to put into words, e.g., expressing how much you like a song through play count
- Stickers cut down on text and let people share in a more fun way
- People shared different data domains with different friends depending on the friendship
- They help people track their own progress
- Analogies help communicate data to people who don't know what a number means, e.g., relating 10,000-plus steps to the length of the Golden Gate Bridge
- When bored, people could switch which value they were sharing: sometimes steps, sometimes heart rate

Some users fabricated or exaggerated their data, or simply didn't care about accuracy: for example, exaggerating a heart rate to convey nervousness, or using a value of 0 as a joke.

This made me notice that "data" in this study doesn't necessarily equal "fact" from the user's point of view. In a social context, data can also become a medium for expressing emotion, humor, or self-presentation. So if designers treat data accuracy as the core goal, they may end up missing the actual social reason people use the feature in the first place.

Some users cared more about efficiency than self-presentation, and would just use default stickers, which made me think that if a user's main need is to share quickly, offering a randomly suggested sticker set could lower the cost of creating one even further.

In my view, these stickers cut down the friction of hunting for an image the way people used to: instead of spending time finding a suitable picture and then adding data to it yourself, being able to quickly generate a sticker makes sharing personal data feel much less burdensome.

## Limitations

The authors note that participants skewed young, matching Snapchat's user base, and that older users might feel differently about sharing personal data.

There were also some practical limitations during the study:

- Technical issues kept some participants from being able to post stickers, which affected the initial willingness of people who wanted to
- The two-week window may have inflated usage frequency beyond what's typical day-to-day, due to novelty and the demands of participating in a study

Beyond that, I think the results are also limited by being tested on a single platform. The paper repeatedly points to Snapchat's fun, interaction-driven social character and how well stickers fit its visual style. Whether the same design would hold up on a platform with different interaction patterns and social norms (Instagram, say) still needs further testing.

## Conclusion & Future Directions

This study shows that personal data isn't only for recording or monitoring your own state: it can also become a medium for social interaction and self-expression. Personal data stickers let users share their lives in a way that's more fun and less burdensome than text or a plain data screenshot, and that may open up conversations about health, well-being, and personal interests that would otherwise be harder to bring up.

The authors also suggest further exploring the differences between short-term and long-term sharing contexts, and how to lower the barrier to making editable stickers. Short-term sharing may lean more on fun and self-expression, while long-term sharing may care more about data accuracy; sharing frequency is also a variable worth studying further.

On lowering the barrier to sticker creation, the current process still requires fairly complex masking work, and text and numeric values need to be constrained in position to keep things readable and visually clean. The researchers suggest that information-visualization techniques could be used to redesign existing stickers going forward.

This part made me realize that data visualization can also serve social sharing, which gave me a deeper appreciation for it: data visualization doesn't have to serve "understanding data" alone; it can also serve "communicating data to others."

## Reading Notes

This study, through long-term use in a real social setting, digs into how users perceive personal data stickers and how they shape sharing behavior. With only 21 participants, it stands in sharp contrast to the previous paper's study of over 8,500 people: the former prioritizes user experience and context, while the latter can observe broader trends through a much larger sample. Seeing these two different scales and methods made me realize that HCI research doesn't always aim for the biggest sample possible: it depends on what kind of evidence the research question actually calls for.

This was the second paper I've read, and the first time reading a longer one (about 23 pages of actual content), a different experience from the previous paper's much more compact presentation. Following a reading strategy an AI suggested, I tried splitting it into two passes: first reading the Intro and Results to get a handle on the research question, methods, and main findings, then going back to read the Discussion and Related Work once I already understood the overall structure, so I could dig into how the authors interpreted their results. This approach made it easier to avoid getting stuck in details on the first pass.

[^1]: Five colors are offered to preserve readability and avoid custom colors; this only applies to the badge and decorative styles.

[^2]: To protect privacy, a time window is chosen first when setting up a sticker, and users can adjust the data themselves to avoid skewed or missing values affecting it.

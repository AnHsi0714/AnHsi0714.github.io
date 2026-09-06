---
type: paper
title: "2025 Paper Notes on 《Understanding How Personal Activities Are Shared In Short-form Videos》: Activity Sharing and Narrative Strategies in Short-form Video"
date: 2026-09-07
categories: [Paper, HCI, Social Media]
excerpt: Analyzing TikTok short-form videos across running, sketching, and studying, looking at how sharers use narrative strategies like goal presentation, progress stamps, and numerical summaries to serve sharing goals such as informational support, emotional support, accountability, and self-presentation.
---

> Written between: 2026-09-03 – 2026-09-07

**Original paper**: [Understanding How Personal Activities Are Shared In Short-form Videos](https://denniswang.net/static/wang2025.pdf) (Dennis Wang, Jun Zhu, Daniel A. Epstein, CSCW 2025)

## Introduction

This paper looks at how people share their own activities through short-form video, and what narrative strategies they use to present activity information before, during, and after the activity.

The core questions the study wants to answer: what activity information do people share in short-form videos, what strategies do they use to present that information, and how do those strategies support different sharing goals?

## Background

People share activities for five main goals:

1. Seeking informational support (getting advice)
2. Seeking emotional support
3. Seeking motivation and accountability (declaring something publicly so you follow through, letting others hold you to it)
4. Motivating or inspiring others (the reverse of #3: influencing others instead)
5. Self-presentation (building or maintaining a particular self-image through sharing the activity and its results)

Sharing isn't limited to a single goal at a time; a single post can serve multiple goals at once. The study wants to know what sharing strategies people use on short-form video platforms, and whether those strategies support or work against these five goals.

Short-form video has three defining traits:

1. Short runtime (15 seconds to 5 minutes)
2. Built for mobile viewing
3. Personalized algorithmic recommendation

### Methodology

The team qualitatively coded 420 TikTok videos across three domains: running, sketching, and studying.

#### Selecting Domains

The authors checked whether each candidate domain had enough content on the platform to support analysis, and whether that content actually shared activity information frequently. They ultimately picked the three domains above because each surfaces this information in a different way:

| Domain | Example | How progress/activity information is typically shown |
| --- | --- | --- |
| Physical Activity | Running | Numbers, distance, time, pace |
| Creativity | Sketching | Work-in-progress changes, production stages |
| Productivity | Studying | Time, to-do lists, the study process |

In other domains, such as cycling or digital music production, the authors found that content skewed tutorial-style rather than being about sharing the activity itself.

This raised a question for me: the authors stress that this kind of research shouldn't be confined to a specific domain, yet they still ended up choosing only Physical Activity, Creativity, and Productivity. These three domains add variety across activity types, but is that enough to represent activity-sharing as a whole?

On keyword choice, the authors used #runtok instead of #run or #marathon, since they needed to stay focused on the domain while excluding unrelated content (running away, dogs running) and avoiding keywords that narrow the activity too much (running → marathon).

The team used the TikTok API to collect US videos, to keep the content in English and make sure the US-based researchers had enough cultural context to interpret it. Collection was spread across five dates over ten days, to reduce the influence of <span data-term="micro-trends">micro-trends</span> (like a one-week sketching challenge happening around a weekly event) while still capturing activities people might complete within a week. In total they collected 3,569 videos: 1,750 running, 936 sketching, 883 studying.

I found this detail genuinely interesting: when collecting data, the instinct is usually to just search a plain keyword, but the authors used domain-specific hashtags instead, which spared them a lot of complicated data cleaning later on — a small trick worth learning from. The timing choice was similarly deliberate, balancing the need to reduce micro-trends against the need to capture recurring weekly activities by sampling across multiple points in time. It made me realize that data quality is often already shaped by the collection strategy, well before analysis even begins.

#### Data Collection

1. 3,569 initial videos
2. Filtered down to candidate videos (300 running, 250 each for sketching and studying — 800 total)
3. Removed videos that weren't in English or weren't about activity-sharing (40 videos), leaving 760 (273 running, 245 sketching, 242 studying)
4. Randomly sampled 420 videos, 140 per domain[^2]

Most videos had relatively low view counts. No more than two videos were included per account, and only a small number were flagged as being from influencer-type accounts, with over 5,000 views.

#### Data Analysis

The team used a mixed <span data-term="inductive-reasoning">inductive</span> and <span data-term="deductive-reasoning">deductive</span> approach to thematic analysis.

Inductively reviewing videos → coding activity information (timing turned out to matter a lot, so the analysis was organized around it).

They arrived at 17 final codes, organized around three dimensions of how data appears in a video:

1. The modality the information takes (e.g., video, text, audio, image)
2. The form the information is presented in (e.g., voice narration, showing footage of a tracking app)
3. The strategy for sharing data (e.g., presenting a goal before the activity, giving live commentary during it)

## Findings

The study makes three main contributions:

- It identifies three phases in which sharers share: preparation (before the activity), in-process (during the activity), and post-activity (after the activity)[^1]
- It surfaces common strategies sharers use to present information, such as progress stamps and numerical summaries
- It offers design takeaways and ideas that could help build tools that support sharing

### Preparation

People share events or plans from before the activity happened, and keep disclosing their goals and progress along the way.

#### Goal Presentation

Larger goals tend to get spread across multiple videos.

**My guess**: short-form video simply doesn't give sharers enough runtime to tell a full story, and spreading a goal across multiple videos may also help hold viewers' attention over time, keeping them coming back to follow along.

Goals fall into two scales:

1. **Video-scale goals**: goals achievable within a single video, e.g., a morning run, one study session, a timelapse sketch
2. **Broader-scale goals**: ongoing, more significant goals that won't be completed within the video, usually take multiple sessions, and are more abstract with no clear-cut **end** event — e.g., improving at math, running every day until you can finish a half marathon

When a video presents both scales of goal, it typically describes the broader-scale goal first, then introduces the video-scale goal.

Videos more often present video-scale goals than broader-scale goals, and this trend holds across all three domains:

The percentages below are how often each goal type appears within a domain's videos; the categories aren't mutually exclusive, so they can add up to more than 100%.

| Goal scale | Running | Studying | Sketching |
| --- | --- | --- | --- |
| Video-scale goal | 81.18% | 94.12% | 70% |
| Broader-scale goal | 63.77% | 23.53% | 30% |
| Both scales presented together | 44.93% | 17.65% | 30% |

How often both scales show up together varies quite a bit by domain: 44.93% of running videos present both, compared to 17.65% for studying and 30% for sketching.

For example: a video might open by establishing it's part of half-marathon training, then caption it "Week 9, Day 62."
Some videos only introduce the broader-scale goal, e.g., "studying together for [some exam]," without stating a concrete video-scale goal.

Most videos (around 80% or more) include text describing the goal. People also tend to describe how they plan to reach the goal, in one of two ways:

1. Showing the equipment or tools needed
2. Breaking the goal into sub-goals, which happens at both scales — e.g., a target pace/distance for a run, or a study checklist

People also often explain why they set the goal, or what factors might affect whether they reach it.

### In-Process

#### Progress Stamps

Sharers commonly use progress stamps to indicate how far along they are toward their goal within the video. These can take the form of a clip of footage (e.g., a runner gesturing how many laps they've done, a timer visible during a study session), a text annotation, or spoken narration, and can be either <span data-term="quantitative-data">quantitative</span> (numbers) or <span data-term="qualitative-data">qualitative</span> (description):

| Domain | Share of videos presenting progress numerically |
| --- | --- |
| Running | 22.86% |
| Studying | 12.86% |
| Sketching | 0.72% |

#### Live Commentary

Sharers provide details about the activity through text or audio, expressing how they feel, including reflection and motivation.

Videos often combine both progress stamps and live commentary: one communicates progress, the other communicates content.

### Post-Activity

#### Conclusive Numerical Summarization

This is used to wrap up progress, usually through text or voice. Across the three domains, 69 videos used a conclusive numerical summary, and running accounted for the vast majority of them:

| Domain | Videos using a conclusive numerical summary | Share of those 69 videos |
| --- | --- | --- |
| Running | 62 | 89.95% |
| Studying | 6 | 8.70% |
| Sketching | 1 | 1.45% |

(This is the breakdown of which domain each of the 69 videos using this technique came from — it is not the rate at which videos within a given domain use this technique.)

#### Post-activity Reflection

This covers takeaways and feelings about the activity looking forward. Overall, 41.8% of videos that used a conclusive numerical summary also included some reflection.

Separately, how often sharers revisit the goal they originally set as part of their post-activity reflection varies a lot by domain:

| Domain | Share revisiting their original goal in post-activity reflection |
| --- | --- |
| Running | 24/56 videos (47.86%) |
| Studying | 4/32 videos (12.5%) |
| Sketching | 1/14 videos (7.14%) |

Among runners, videos presenting both a video-scale and a broader-scale goal revisit that goal even more often (15/31 videos, 48.39%), compared to videos presenting only a video-scale goal (9/25 videos, 36%).

### How Narrative Strategies Support Different Sharing Goals

The paper draws on Epstein et al.'s framework for personal-data sharing goals, examining how the narrative strategies common to each phase (goal presentation, progress stamps, live commentary, numerical summaries, post-activity reflection) help or hinder sharers in achieving their sharing goals. The original framework lists five sharing goals, but in this part of the paper the authors combine "seeking emotional support" and "self-presentation" into a single category, "receiving emotional support and managing impressions," so the table below groups them into four categories. Using "+" for benefits and "−" for concerns:

| Sharing goal | Before the activity | During the activity | After the activity |
| --- | --- | --- | --- |
| Receiving informational support | + Presenting a goal helps clarify the ask when seeking informational support later. | + Progress stamps and live commentary encourage sharing more activity detail, giving viewers enough to offer specific suggestions.<br>− Key points or questions can get buried in a longer narrative. | + Numerical summaries and post-activity reflection prompt sharers to spell out what feedback or advice would help.<br>− Key points or questions can still get buried in a longer narrative. |
| Receiving emotional support and managing impressions | + Presenting a goal helps convey doubts or concerns about the activity, in exchange for emotional support. | + Progress stamps and live commentary let sharers more fully express challenges and emotion while the activity is happening, helping convey a need for support.<br>− Social comparison pressure may push sharers to put more effort into polishing their visual image, a concern that may not weigh as heavily in other sharing media. | + Post-activity reflection helps convey the emotional support needed to follow through on a goal commitment, and offers a chance to celebrate the outcome. |
| Seeking motivation and accountability from the audience | + Presenting a goal publicly before the activity strengthens the commitment. | + Progress stamps prove the activity actually happened; progress stamps and live commentary encourage more detail, helping viewers understand the effort the activity took. | + Numerical summaries showcase the outcome of the commitment, helping sustain accountability. |
| Motivating, informing, or influencing others | + Presenting a goal helps describe steps or strategies viewers can learn from. | + Progress stamps describe how the activity is being carried out, along with the positive feelings that come with doing it. | + Post-activity reflection helps highlight the positive feelings that follow completing the activity. |

In short: short-form video's typical narrative rhythm — state the goal, update live during the activity, wrap up with a summary and reflection — helps with all four sharing goals overall, and the main cost is concentrated in the "during" phase: once content gets compressed and split into clips, key points are more easily diluted, or sharers end up spending extra effort polishing their visual image just to hold attention.

## Limitations

- The authors note that the videos are concentrated in the US, so caution is needed before generalizing the findings to other regions
- The unit of analysis is the video, not the account, so the study observes sharing patterns across many people rather than any one person's pattern
- A single video may only capture one phase of an activity's process
  - Sampling a video that only shows one phase risks a distorted picture
  - Some goals may be pursued across a chain of multiple videos, so the study can miss longer-term development
- Does this generalize to other platforms?
  - The authors think most findings likely transfer, but platform-specific traits could still matter; for instance, Instagram and Facebook emphasize a feed-watcher's experience, weighted more toward followers and algorithmic push, so short-form video there may not be designed for the kind of curated audience this study assumes
- Other domains may call for different metrics
  - E.g., auditory or tactile information, or metrics tied to reducing or increasing a number (personal finance, esports)
- Because content surfaces through an algorithmically curated feed, sharers may adjust how they share in response to what performs well
  - The authors compared the narrative strategies used in more- and less-popular videos and found no significant difference between them — the main difference was in production polish and the quality of the activity itself (e.g., how good the sketch was, how scenic the running route looked). Still, the recommendation algorithm may shape what sharers are exposed to over time and how they imitate it, so this remains a factor worth considering.

The authors touch on a lot of angles here, including the regional limitation I wrote about in 〈[Do More Likes and Shares Make a Post More Credible?](/articles/social-engagement-misinformation)〉.

## Conclusion & Future Directions

Short-form video sharing happens across three phases (preparation, in-process, post-activity), and the paper looks at how sharers weave activity information into each phase across three domains.

Suggestions for short-form video creation tools:

- Encourage narrative-structure features more (the downside being a risk of feeling too formulaic, so preserving personal style still matters)
- Let tracking features support pulling data directly into the video
- Help sharers zero in on and present key points (challenges, open questions)
- Suggest sharers list out their goal (either scale discussed above works) and describe the equipment and tools they're using
- Highlight or tag content based on goals and open questions, to support search

Tighten the integration between video-editing and activity-tracking tools:

- Data should be formatted, or presented through screenshots or screen recordings of tracking data, to reduce the cognitive load on viewers

## Reading Notes

After finishing this paper, another possible research direction occurred to me. If you moved the setting from a public platform like TikTok to a smaller community where members share a common goal — a book club, an investing group, a self-improvement community — would sharing behavior look different? For example, would willingness to share, sharing frequency, how much detail gets included, and how members interact with each other be shaped by the group's size or its shared goal?

[^1]: Not every video goes through all three phases; in practice, many videos only cover part of them, e.g., a video that's just a post-activity reflection.

[^2]: The authors note that they settled on a sample of 420 videos (140 per domain) because prior qualitative studies of TikTok video content in HCI/CSCW have typically analyzed between 100 and 300 videos; they deliberately aimed for the high end of that range, landing on 420.

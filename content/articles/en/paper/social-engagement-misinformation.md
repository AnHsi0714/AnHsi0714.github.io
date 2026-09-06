---
type: paper
title: "2020 Paper Notes on 《Exposure to Social Engagement Metrics Increases Vulnerability to Misinformation》: Do More Likes and Shares Make a Post More Credible?"
date: 2026-07-25
categories: [Paper, HCI, Social Media]
featured: true
coverUrl: /images/articles/social-engagement-misinformation/fakey-interface.png
excerpt: Through an analysis of social engagement metrics on social platforms, examining how they affect people's trust in a piece of content, their motivation to fact-check, and their willingness to share low-credibility content.
---

**Original paper**: [Exposure to Social Engagement Metrics Increases Vulnerability to Misinformation](https://arxiv.org/pdf/2005.04682) (Mihai Avram, Nicholas Micallef, Sameer Patil, Filippo Menczer, HKS Misinformation Review 2020)

## Introduction

We already know most misinformation is deliberately spread by bad actors, but what actually lets it travel far is real users choosing to share it. Through an analysis of social engagement metrics on social platforms, this paper examines how those metrics affect people's trust in a piece of content, whether they lower people's motivation to fact-check, and whether they make people more willing to share low-credibility content.

## Methodology

The core question this paper studies is whether engagement metrics on a post (like counts, shared counts, and so on[^1]) affect how much users trust and share what they read. The researchers built a media-literacy game called Fakey that simulates the dynamics of a social feed: it shows articles from two kinds of sources (mainstream and low-credibility) alongside randomized engagement metrics value, to test whether users are swayed by how high or low those numbers are. Within the game, users could take one of the following actions: **share** (endorse the info and share it with the world), **like** (endorse the info), **fact-check** (distrust the info), or skip the post / use a hint. See Figure 1. The study ran for 19 months, with over 8,500 users and roughly 120,000 articles, making it a mid-sized deployment.

<figure>
  <img src="/images/articles/social-engagement-misinformation/fakey-interface.png" alt="Mockup of a Fakey post layout" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Figure 1: Fakey's layout for a single post — photo, headline, and description from top to bottom, engagement counts below that, and five action buttons at the bottom: share, like, fact-check, hint, and skip</figcaption>
</figure>

## Findings

The researchers explain why high-engagement content boosts perceived credibility through complex contagion theory: in short, seeing the same piece of information shared by multiple different sources raises its perceived credibility, even without anyone actually verifying it. The analysis found high social engagement significantly positively correlated with liking/sharing, and significantly negatively correlated with fact-checking.

## Limitations

The researchers point out that a game is never quite the same experience as a real platform: a game can only approximate it, not fully replace it. The 50/50 split between mainstream and low-credibility sources also doesn't reflect the real-world proportion of misinformation, and a fact-checking game may make players more alert to spotting misinformation than they'd normally be.

From my own reading, the paper doesn't really dig into whether different interface designs could reduce this effect, though it does point toward a few directions: hiding posts, reducing the visibility of engagement metrics, identifying fake accounts that share a common pattern of promoting misinformation, and treating information differently depending on whether its source concerns a major issue. These read as future directions rather than answers.

Another thing worth discussing is that users were overwhelmingly concentrated in the US (78% of Google Play accounts) and other Western regions. It's worth asking whether this kind of intervention would carry over to Taiwan or other East Asian cultural contexts.

## Conclusion

Through a simple design, this paper studies how the level of engagement metrics actually shapes people's cognitive judgment. In a place like ours, where we're constantly on guard against misinformation from every direction, the question worth asking is: is it bot accounts flooding the feed with information faster, or is it us, real people, hitting "share" with our own hands that's driving this phenomenon?

## Reading Notes

This was the first time I actually sat down and read a paper, and the first time I turned that into a note like this. The paper is fairly short (9 pages), which made it a good first one to read. I liked that the researchers used a game instead of a real social platform: besides recruiting a large user base for free, it also sidesteps the risk of having to deal directly with social media companies. This got me thinking further: beyond content and source affecting how people judge and verify information, when even a purely statistical number like an engagement count can shape cognition, what should we choose to keep on an interface, and how do we strike a balance between fighting cognitive warfare and commercial incentives?

[^1]: The like and share counts shown in the interface are totals from both, meant to reduce users' cognitive load.

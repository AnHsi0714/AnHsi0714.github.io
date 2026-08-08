# ABSA Pipeline — CodePulse User Feedback Sentiment Analysis

## Background and Motivation

This research applies two parallel approaches — a rule-based NLP pipeline and Gemini zero-shot prompting — to Aspect-Based Sentiment Analysis (ABSA) on user feedback surveys for the [CodePulse](https://code-pulse.cc/) platform, breaking free-text feedback like "the animation is smooth, but submitting a quiz lags" down into actionable quadruplets such as (animation, ANIMATION, smooth, positive) and (submitting a quiz, QUIZ, lags, negative). Unlike traditional sentiment analysis, which can only judge a whole sentence as good or bad, ABSA pinpoints exactly which feature is being evaluated and how, letting the development team map feedback directly onto concrete things to fix. On the same hand-annotated ground truth, Gemini's zero-shot pipeline outperforms the rule-based pipeline across the board on full-quadruplet extraction (Partial F1, +0.207), with the gap driven mainly by Gemini's ability to recover implicit attributes. Even so, the rule-based pipeline retains real advantages — zero API cost, high interpretability, and the ability to run entirely locally in privacy-sensitive settings — so the two approaches complement rather than simply replace each other.

Survey feedback is free text, which makes it hard to analyze systematically: which feature most needs improvement? What do users actually care about? Which aspect has a concrete problem?

## Research Questions

1. Which aspect does a piece of feedback text belong to?
2. Is the user's sentiment toward each aspect positive or negative?
3. How large is the quality gap between the two methods?

> Input: "The animation is smooth, but submitting a quiz lags."<br>
> Output: (animation, ANIMATION, smooth, pos), (submitting a quiz, QUIZ, lags, neg)

## Dataset

- Source: A Google Forms survey of CodePulse users, roughly 55 responses
- Fields: one free-text field for positive feedback, one for improvement suggestions
- Preprocessing: merged both fields, split on commas into clauses, filtered out non-answers like "none," "n/a"
- Final dataset: 50 rows × 2 fields = 100 sentences

Six aspect categories (defined by the platform's feature modules, not derived from the data):

| Key | Label | Representative Seed Words |
| --- | --- | --- |
| UI_UX | Interface & Experience | interface, screen, buttons, interaction, look and feel, design |
| ANIMATION | Animation & Demonstration | animation, demonstration, step-by-step, visualization, playback |
| CONTENT | Learning Content | code, time complexity, tutorial, explanation, translation |
| QUIZ | Quiz System | quiz, question, analysis, walkthrough, answering |
| PERFORMANCE | System Performance | submit, records, latency, lag, failure |
| GAMIFICATION | Gamified Interaction | sandbox, game, easter egg, whack-a-mole, challenge |

## What Is ABSA

Traditional sentiment analysis stops at the sentence level, only able to judge a comment as good or bad overall — which easily loses the details. Aspect-Based Sentiment Analysis (ABSA) is fine-grained analysis that can pin down exactly which specific attribute a user is praising or complaining about.

For example, "The food tasted great, but service was really slow":

- Traditional analysis: judged as "neutral" overall → the owner thinks the customer had no complaints
- ABSA: [food taste, tasted great] → positive; [service speed, really slow] → negative

A complete ABSA quadruplet has four elements:

1. **Aspect Term**: the specific noun being commented on (e.g. "screen resolution")
2. **Aspect Category**: normalizing the aspect term into one of the six predefined categories
3. **Opinion Term**: the adjective/verb phrase carrying the subjective evaluation (e.g. "very clear")
4. **Sentiment Polarity**: whether that aspect is judged positive or negative

## Experiment A — Rule-Based ABSA Quadruplet Pipeline

A five-stage rule-based pipeline that assembles a complete ABSA quadruplet from scratch:

1. Split compound sentences into clauses using punctuation and transition conjunctions, so each semantic unit stands independently
2. <span data-term="ckip">CKIP</span> (BERT-base) part-of-speech tagging merges adjacent nouns (Na/Nb/Nv) into compound Aspect Term candidates, and keeps stative verbs (VH/VJ/VK) as Opinion Term candidates
3. <span data-term="stanza">Stanza</span> dependency parsing (nsubj / amod) pairs (Aspect, Opinion) terms; when the dependency relation is insufficient, it falls back to clause-boundary pairing, with negation cues attached as a polarity hint
4. SBERT (multilingual semantic embeddings) computes <span data-term="cosine-similarity">Cosine Similarity</span> between each Aspect Term and a set of hand-defined seed-word anchors, classifying it into one of the six core categories
5. Negation-cue polarity hints are used first when available; otherwise <span data-term="distilbert">DistilBERT</span> classifies the Opinion Term's sentiment

| Model | Purpose | Stage |
| --- | --- | --- |
| CKIP (bert-base-chinese) | Chinese word segmentation + POS tagging | 1, 3, 4 |
| Stanza (zh-hant) | Dependency parsing (nsubj / amod / advmod) | 4 |
| MiniLM (paraphrase-multilingual-L12) | Semantic embeddings, aspect context → category anchor | 2 |
| DistilBERT (lxyuan multilingual) | Sentiment classification (pos/neg) | 5 |

### Why Pure Clustering Was Abandoned

We initially tried <span data-term="agglomerative-clustering">Agglomerative Clustering</span> to group feedback into categories automatically, but traditional clustering only looks at raw geometric distance and ignores business logic, which easily blurs semantic boundaries (for instance, UI and Animation differed in similarity by only 0.007). Switching to an anchor-guided classification approach — using hand-defined seed words to plant clear semantic landmarks in the vector space — kept high interpretability and removed the need to guess an "optimal number of clusters" via a silhouette score.

### From ACSA to ABSA Quadruplets

The first version only produced (category, sentiment) pairs — ACSA — with no span localization, so it couldn't answer "which word made the user unhappy?" Upgrading to (aspect_term, aspect_category, opinion_term, polarity) made it possible to give actionable, fine-grained improvement suggestions — moving from "animation sentiment is positive" to "animation (ANIMATION) is positive because it's smooth."

### Final Results by Stage

| Stage | Task | Approach | Partial F1 |
| --- | --- | --- | --- |
| 1 | Aspect Term Extraction | A4 (compound-noun merging + verb whitelist) | 0.7351 |
| 2 | Category Mapping | Combo (seed-word expansion, thr=0.30) | 0.5691 |
| 3 | Opinion Term Extraction | C2+ (negation-prefix merging + neutral-word filtering) | 0.8630 |
| 4 | Aspect-Opinion Pairing | D4 (dependency tree + clause-boundary fallback) | 0.6111 |
| 5 | Sentiment Classification | F3 | 0.9000 (accuracy) |
| E2E | True Quadruplet | Full pipeline | Quad F1 = 0.3459 |

Stage 3 (Opinion) was the easiest to optimize; Stage 4 (Pairing) had the lowest ceiling, mostly bottlenecked on implicit aspects/opinions and cross-clause semantics — a structural limit of rule-based methods, and the main motivation for building Track B.

## Experiment B — LLM Zero-Shot (Gemini)

Track A's ceiling: implicit aspects/opinions make up roughly 25% of the ground truth, rules can't parse cross-clause semantics, and sentiment classification lacks context. Track B switches to Gemini 3.1 Flash Lite, letting the LLM read the entire sentence at once and directly output quadruplets in the exact same format as Track A, for a head-to-head comparison on the same task.

The prompt design bakes the six category definitions, polarity rules (pros = pos; cons/suggestions = neg), and an implicit rule (fill in "implicit" when no concrete term can be extracted) directly into the system prompt, and requires the model to return only a JSON array.

Pipeline: user feedback text → system prompt → Gemini API (rate_delay = 6s, ~5 minutes for 50 rows) → JSON parsing + field validation → caching → Quadruplet Partial F1 computed against the same ground truth used for Track A.

After adding the category definitions' seed words into the prompt, Track B's Category macro F1 rose from 0.6094 to 0.7881, and Quad <span data-term="partial-f1">Partial F1</span> rose along with it from 0.4155 to 0.5352.

## Comparing the Two Tracks

Evaluated on the same 101-tuple hand-labeled ground truth, using the same Quadruplet Partial F1 metric:

| Metric | Track A (Rule-Based) | Track B (Gemini) | Δ |
| --- | --- | --- | --- |
| Aspect Partial F1 | 0.6256 | 0.8357 | ▲ +0.2101 |
| Opinion Partial F1 | 0.7179 | 0.7981 | ▲ +0.0802 |
| Pair Partial F1 | 0.5128 | 0.7136 | ▲ +0.2008 |
| Quad Partial F1 | 0.3282 | 0.5352 | ▲ +0.2070 |

| Dimension | Track A | Track B |
| --- | --- | --- |
| Requires API | No (local) | Yes (cost + privacy) |
| Inference speed | Fast (< 1 s/row) | Slower (API latency, ~344 s for 50 rows) |
| Interpretability | High (step-by-step traceable) | Low (black box) |
| Handling implicit terms | Rules can't recover them | LLM semantic reasoning can recover them |

Gemini wins across the board on this task, with the gap driven mostly by its ability to recover implicit aspects and its higher aspect recall — the LLM reads whole passages of meaning and isn't constrained by word-segmentation or POS rules the way Track A is. Still, Track A retains real value: it's fully white-box, has zero API cost, can run entirely locally in privacy-sensitive settings, and the process of iteratively optimizing five stages was itself a complete exercise in NLP pipeline design.

## Interactive Visualization

We turned the results of both pipelines into a D3 force-directed bubble-chart viewer: each aspect gets its own bubble chart, where bubble size represents word frequency and color represents sentiment (green = more positive, red = more negative). You can toggle between Track A and Track B to compare how the same feedback is interpreted differently by each method.

<figure>
  <img src="/images/projects/absa-wordcloud/trackA.png" alt="Track A (Rule-Based) bubble chart for the Interface & Experience aspect" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Track A (Rule-Based) bubble chart for the Interface & Experience aspect</figcaption>
</figure>

<figure>
  <img src="/images/projects/absa-wordcloud/trackB.png" alt="Track B (Gemini) bubble chart for the Interface & Experience aspect" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Track B (Gemini) bubble chart for the Interface & Experience aspect</figcaption>
</figure>

Demo: [sengq1011.github.io/absa-wordcloud](https://sengq1011.github.io/absa-wordcloud/)

## Conclusion and Contributions

1. Term-level ABSA quadruplets give developers far more precise, actionable insight than category-level ACSA alone — they show exactly which word was evaluated and how.
2. We used systematic per-stage iteration: each stage changed exactly one variable at a time, so every improvement could be explained.
3. Gemini's <span data-term="zero-shot">Zero-Shot Learning</span> approach outperforms the rule-based pipeline on the same quadruplet task (+0.2070 Quad F1), with its main advantages being implicit-aspect recovery and higher aspect recall.
4. We built and open-sourced the full stack: a 5-stage rule-based ABSA pipeline, a Gemini zero-shot pipeline, a 101-tuple hand-labeled ground truth, a per-stage quantitative evaluation framework, and a D3 interactive visualization.

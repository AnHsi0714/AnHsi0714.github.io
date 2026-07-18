# CodePulse — Data Structures & Algorithms Visualization Learning Platform

## Related Links

Website: [code-pulse.cc](https://code-pulse.cc)

## Project Overview

CodePulse is a data-structures-and-algorithms learning platform that combines interactive visualization, code execution tracing, and AI-based algorithm recognition. Beyond following pre-built animated lessons, learners can paste in their own Python code and have the system analyze and visualize exactly how it runs. Its core design is a two-tier visualization mechanism that automatically switches between "high-level semantic animation" and "generic control-flow graphs" based on the recognizer's confidence score, balancing pedagogical structure with the flexibility to explore arbitrary code. A pre/post user study showed that, even over a short session, the tool significantly boosted learners' confidence (university group p < 0.001, high-school group p = 0.021) — though test scores only trended positive without reaching statistical significance. That gap between the interface's psychological benefit and its measurable learning gains is itself a direction worth digging into further.

Traditional data-structures-and-algorithms instruction has long relied on text and static diagrams, but the dynamic behavior of running code — changing variable states, function-call relationships, data-structure operations — is hard to observe directly. As a result, beginners struggle to build an accurate mental model of program execution, and run into difficulty understanding control flow, function calls, and data-structure manipulation.

Existing code-visualization tools each make their own trade-offs: low-barrier animation tools (like VisuAlgo) mostly show only predefined algorithms and can't analyze a learner's own code, while traditional debuggers are thorough but present information from a developer's point of view, which is a heavier lift for beginners. CodePulse tries to capture the strengths of both, balancing pedagogical structure against the flexibility to explore arbitrary code.

## System Architecture

Built with a decoupled frontend/backend, split into four layers: the presentation layer (Code Editor, Visualization Renderer, Learning Dashboard, and other components), the application layer (authentication, user management, execution management, analytics management, practice and progress management), the infrastructure layer (an async task queue, sandboxed execution isolation, an execution-tracing engine), and the data persistence layer (PostgreSQL). It also integrates external services — Gemini API, Cloudinary, and SMTP — for AI analysis, media, and notifications.

The production deployment runs the frontend on Cloudflare Pages, with an Nginx reverse proxy on a GCP e2-micro instance forwarding traffic via an SSH reverse tunnel to Flask + Gunicorn, Celery, Redis, a Docker sandbox, and PostgreSQL running on a lab machine (WSL2), all deployed automatically via GitHub Actions.

<figure>
  <img src="/images/projects/code-pulse/system-architecture.png" alt="System architecture diagram" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">System architecture diagram</figcaption>
</figure>

## Guided Learning Mode

Presents algorithm execution "step by step": once a topic is selected, code, animation, and step explanations are shown in sync, with the visualization style adapted to the data structure (array sorting shows index swaps and value changes; linked lists show pointer changes). The animation highlights the corresponding pseudocode line as it plays, paired with a "knowledge corner" that covers concept explanations, complexity analysis, classic problem patterns, and real-world applications.

<figure>
  <img src="/images/projects/code-pulse/linked-list-operation.png" alt="Linked-list guided mode: step-by-step node insertion animation" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Linked-list guided mode: step-by-step node insertion animation</figcaption>
</figure>

<figure>
  <img src="/images/projects/code-pulse/bubble-sort-operation.png" alt="Bubble Sort guided-mode visualization" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Bubble Sort guided-mode visualization</figcaption>
</figure>

<figure>
  <img src="/images/projects/code-pulse/array-introduction.png" alt="Knowledge corner: array complexity analysis" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Knowledge corner: array complexity analysis</figcaption>
</figure>

After finishing guided lessons, learners move to practice mode: single-choice, multiple-choice, fill-in-the-code, and code-tracing questions (including question sets), with difficulty dynamically adjusted via an <span data-term="elo-rating">ELO Rating</span>-based skill-assessment mechanism. A <span data-term="k-factor">K-factor</span> decay and a "first blood" (first-attempt) rule keep repeated attempts from continually inflating a user's rating, while still preserving XP rewards to keep motivation high.

<figure>
  <img src="/images/projects/code-pulse/practice-page.png" alt="Practice mode: answering a question" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Practice mode: answering a question</figcaption>
</figure>

<figure>
  <img src="/images/projects/code-pulse/practice-result.png" alt="Quiz results and rank rating" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Quiz results and rank rating</figcaption>
</figure>

## Exploratory Learning Mode: Lab and Playground

**Lab** provides side-by-side comparisons of multiple sorting algorithms (Bubble / Selection / Insertion / Merge / Quick Sort), showing execution time, comparison count, and move count simultaneously, so learners can directly see behavioral differences between algorithms rather than just memorizing time complexities.

<figure>
  <img src="/images/projects/code-pulse/lab-page.png" alt="Lab mode: side-by-side comparison of multiple algorithms" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Lab mode: side-by-side comparison of multiple algorithms</figcaption>
</figure>

**Playground** is the core technical challenge of this project: it lets users submit arbitrary Python code. The system statically builds a <span data-term="cfg">Control Flow Graph (CFG)</span> via <span data-term="ast">AST</span> analysis, then dynamically traces execution events inside a Docker sandbox using `sys.settrace` to capture variable state and function-call relationships.

### Two-Tier Visualization Mechanism

To balance "recognized standard algorithms" against "arbitrary user code," the system uses a two-tier visualization scheme:

- **Level 1 (high-level semantic visualization)**: When a standard algorithm is recognized, shows high-level animations like array swaps or pointer movement, synced to pseudocode lines
- **Level 2 (generic flow visualization)**: When recognition confidence is low or the code isn't a standard implementation, falls back to a CFG / call graph — retaining execution detail at a lower level of abstraction

<figure>
  <img src="/images/projects/code-pulse/playground-page.png" alt="Playground: CFG / call graph visualization" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Playground: CFG / call graph visualization</figcaption>
</figure>

### Algorithm Recognition: Comparing Semantic Embedding Models

The recognition pipeline converts a user's code into a vector and compares it against a prebuilt library of reference algorithm vectors using <span data-term="cosine-similarity">Cosine Similarity</span>. We compared five candidate embedding models (CodeBERT, GraphCodeBERT, UniXcoder, MiniLM-L6-v2, Jina-Code v2) and tested three identifier-normalization strategies — none, partial, and full. Full normalization erases variable names too, which actually made the similarity distributions of known and unknown cases overlap more; no normalization, on the other hand, let the model get thrown off by function naming. Partial normalization (normalizing only function and parameter names while keeping internal variable names intact) struck the best balance across most models.

We ultimately went with **Jina-Code v2 + partial normalization**: 100% recognition accuracy on known algorithms, holding at 100% even for multi-function cases involving helper functions, with the recognition threshold set at 0.80 as the trigger for Level 1 animation. Below that threshold, or when the code structure doesn't match a known template, the system doesn't force a semantic animation — it falls back to the more conservative CFG visualization instead, with Gemini generating a code summary, complexity explanation, and learning feedback.

## User Study

We ran a single-group pre/post-test design, using an A/B question-set crossover to reduce memory effects from repeated testing, across both a university group and a high-school group. Participants used the platform for 20–30 minutes before completing the post-test and survey.

| Metric | University Group | High-School Group |
| --- | --- | --- |
| Test score <span data-term="normalized-gain">Normalized Gain</span> | 0.222 (p = 0.292, not significant) | 0.230 (p = 0.214, not significant) |
| Learning confidence gain | p < 0.001 (significant) | p = 0.021 (significant) |

Test scores trended positive but didn't reach statistical significance, likely due to the short session length and limited sample size; learning confidence, however, improved significantly in both groups, suggesting the dynamic visualization genuinely reduced participants' psychological burden around learning algorithms.

<figure>
  <img src="/images/projects/code-pulse/test-score.png" alt="Pre/post test-score comparison" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Pre/post test-score comparison</figcaption>
</figure>

<figure>
  <img src="/images/projects/code-pulse/confidence-score.png" alt="Pre/post learning-confidence comparison" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Pre/post learning-confidence comparison</figcaption>
</figure>

In survey feedback, "step-by-step execution animation" was the highest-rated visualization feature (4.18/5), followed closely by "helped me understand abstract data-structure operations" (4.11/5). Open-ended feedback noted that the platform still has a noticeable learning curve on first use, and that some features aren't positioned intuitively.

## Conclusion and Future Directions

CodePulse demonstrates that combining static analysis, dynamic tracing, semantic embedding models, and LLM-assisted analysis into a single pipeline is workable — able to teach like a traditional animation tool while also analyzing arbitrary code like a debugger. One of the more interesting findings was that the value of the identifier-normalization strategy isn't really about raising accuracy per se, but about finding the right balance between "naming noise" and "preserving semantic features."

The main limitations are the small sample size and short testing window, Playground currently supporting only Python, and the lack of large-scale concurrency stress testing.<br>

Future directions:

1. Extend support to more languages (C / C++ / Java / JavaScript)
2. Finer-grained adaptive guidance and personalized learning paths
3. Expand the reference algorithm-vector library to improve recognition of unfamiliar code
4. Scale up the participant pool and observation window to validate long-term learning outcomes

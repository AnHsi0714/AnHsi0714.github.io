# CodePulse: Data Structures & Algorithms Visualization Learning Platform

## Related Links

Website: [code-pulse.cc](https://code-pulse.cc)

## Problem

Traditional data-structures-and-algorithms instruction has long relied on text and static diagrams, but the dynamic behavior of running code (changing variable states, function-call relationships, data-structure operations) is hard to observe directly. As a result, beginners struggle to build an accurate mental model of program execution, and run into difficulty understanding control flow, function calls, and data-structure manipulation.

Existing code-visualization tools each make their own trade-offs: low-barrier animation tools (like VisuAlgo) mostly show only predefined algorithms and can't analyze a learner's own code, while traditional debuggers are thorough but present information from a developer's point of view, which is a heavier lift for beginners.

## Research Question

The core problem CodePulse set out to solve: could learners get more than pre-built animated lessons, actually pasting in their own Python code and having the system analyze and visualize how it really executes, while still keeping the pedagogical structure that makes animated tutorials effective?

That breaks down into two concrete research questions:

1. How do you design a mechanism that automatically distinguishes "recognized standard algorithms" from "arbitrary user code" and switches to the appropriate visualization style?
2. Does this kind of dynamic visualization system meaningfully improve learners' confidence and test performance around data structures and algorithms?

## System Design

### System Architecture

Built with a decoupled frontend/backend, split into four layers: the presentation layer (Code Editor, Visualization Renderer, Learning Dashboard, and other components), the application layer (authentication, user management, execution management, analytics management, practice and progress management), the infrastructure layer (an async task queue, sandboxed execution isolation, an execution-tracing engine), and the data persistence layer (PostgreSQL). It also integrates external services (Gemini API, Cloudinary, and SMTP) for AI analysis, media, and notifications.

The production deployment runs the frontend on Cloudflare Pages, with an Nginx reverse proxy on a GCP e2-micro instance forwarding traffic via an SSH reverse tunnel to Flask + Gunicorn, Celery, Redis, a Docker sandbox, and PostgreSQL running on a lab machine (WSL2), all deployed automatically via GitHub Actions.

<figure>
  <img src="/images/projects/code-pulse/system-architecture.png" alt="System architecture diagram" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">System architecture diagram</figcaption>
</figure>

### Two-Tier Visualization Mechanism

To balance "recognized standard algorithms" against "arbitrary user code," Playground statically builds a <span data-term="cfg">Control Flow Graph (CFG)</span> via <span data-term="ast">AST</span> analysis, then dynamically traces execution events inside a Docker sandbox using `sys.settrace` to capture variable state and function-call relationships, then automatically switches visualization tiers based on the recognizer's confidence score:

- **Level 1 (high-level semantic visualization)**: When a standard algorithm is recognized, shows high-level animations like array swaps or pointer movement, synced to pseudocode lines
- **Level 2 (generic flow visualization)**: When recognition confidence is low or the code isn't a standard implementation, falls back to a CFG / call graph, retaining execution detail at a lower level of abstraction

<figure>
  <video controls preload="metadata" width="1728" height="1080" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
    <source src="/videos/projects/code-pulse/playground.mp4" type="video/mp4" />
  </video>
  <figcaption style="text-align: center;">Playground: CFG / call graph visualization (demo)</figcaption>
</figure>

### Algorithm Recognition: Comparing Semantic Embedding Models

The recognition pipeline converts a user's code into a vector and compares it against a prebuilt library of reference algorithm vectors using <span data-term="cosine-similarity">Cosine Similarity</span>. We compared five candidate embedding models (CodeBERT, GraphCodeBERT, UniXcoder, MiniLM-L6-v2, Jina-Code v2) and tested three identifier-normalization strategies: none, partial, and full. Full normalization erases variable names too, which actually made the similarity distributions of known and unknown cases overlap more; no normalization, on the other hand, let the model get thrown off by function naming. Partial normalization (normalizing only function and parameter names while keeping internal variable names intact) struck the best balance across most models.

We ultimately went with **Jina-Code v2 + partial normalization**: 100% recognition accuracy on known algorithms, holding at 100% even for multi-function cases involving helper functions, with the recognition threshold set at 0.80 as the trigger for Level 1 animation. Below that threshold, or when the code structure doesn't match a known template, the system doesn't force a semantic animation: it falls back to the more conservative CFG visualization instead, with Gemini generating a code summary, complexity explanation, and learning feedback.

## Interaction Design

### Guided Learning Mode

Presents algorithm execution "step by step": once a topic is selected, code, animation, and step explanations are shown in sync, with the visualization style adapted to the data structure (array sorting shows index swaps and value changes; linked lists show pointer changes). The animation highlights the corresponding pseudocode line as it plays, paired with a "knowledge corner" that covers concept explanations, complexity analysis, classic problem patterns, and real-world applications.

<figure>
  <img src="/images/projects/code-pulse/bubble-sort-operation.png" alt="Bubble Sort guided-mode visualization" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Bubble Sort guided-mode visualization</figcaption>
</figure>

<figure>
  <video controls preload="metadata" width="1920" height="1200" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
    <source src="/videos/projects/code-pulse/tutorial.mp4" type="video/mp4" />
  </video>
  <figcaption style="text-align: center;">Knowledge corner: array complexity analysis (demo)</figcaption>
</figure>

After finishing guided lessons, learners move to practice mode: single-choice, multiple-choice, fill-in-the-code, and code-tracing questions (including question sets), with difficulty dynamically adjusted via an <span data-term="elo-rating">ELO Rating</span>-based skill-assessment mechanism. A <span data-term="k-factor">K-factor</span> decay and a "first blood" (first-attempt) rule keep repeated attempts from continually inflating a user's rating, while still preserving XP rewards to keep motivation high.

<figure>
  <video controls preload="metadata" width="1728" height="1080" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
    <source src="/videos/projects/code-pulse/practice.mp4" type="video/mp4" />
  </video>
  <figcaption style="text-align: center;">Practice mode: answering a question (demo)</figcaption>
</figure>

### Exploratory Learning Mode: Lab and Playground

**Lab** provides side-by-side comparisons of multiple sorting algorithms (Bubble / Selection / Insertion / Merge / Quick Sort), showing execution time, comparison count, and move count simultaneously, so learners can directly see behavioral differences between algorithms rather than just memorizing time complexities.

<figure>
  <video controls preload="metadata" width="1728" height="1080" style="display: block; margin: 0 auto; max-width: 100%; height: auto;">
    <source src="/videos/projects/code-pulse/lab.mp4" type="video/mp4" />
  </video>
  <figcaption style="text-align: center;">Lab mode: side-by-side comparison of multiple algorithms (demo)</figcaption>
</figure>

**Playground** is the core technical challenge of this project: it lets users submit arbitrary Python code and immediately see it visualized as it actually runs, showing a semantic animation when the code is recognized as a known algorithm and a flow graph otherwise. The recognition logic and technical implementation behind this are covered in the System Design section above.

## User Study

### Study Design

We ran a single-group pre/post-test design with 56 participants, split into a high-school group (11th graders who had taken a programming course) and a university group (sophomores who had taken data structures and programming courses).

If the pre-test and post-test used the exact same questions, participants might do better simply from remembering the questions or answers, a practice effect. So the test was designed as two versions, A and B, covering the same concepts but expressing the questions differently, changing numeric values, swapping between a DFS and a BFS scenario, or switching the question format between reading code and reading its execution result, while keeping the underlying solving steps identical so participants couldn't tell the two versions were really the same quiz and answer from memory alone. Participants alternated which version they got as pre-test versus post-test.

Given participants' limited available time, they used the platform for about 20–30 minutes before completing the post-test and survey.

Test performance was measured with Normalized Gain:

`g = (Posttest score - Pretest score) / (Max score - Pretest score)`

| Metric | University Group | High-School Group |
| --- | --- | --- |
| Test score <span data-term="normalized-gain">Normalized Gain</span> | 0.222 (p = 0.292, not significant) | 0.230 (p = 0.214, not significant) |
| <span data-term="learning-confidence">Learning confidence</span> gain | p < 0.001 (significant) | p = 0.021 (significant) |

### Test Performance

Normalized Gain was 0.230 for the high-school group and 0.222 for the university group, both trending positive, but neither pre/post difference reached statistical significance (high-school p = 0.214; university p = 0.292). This is likely influenced by the limited sample size and short session length, so the results don't yet support a claim that the platform significantly improves test performance.

<figure>
  <img src="/images/projects/code-pulse/test-score.png" alt="Pre/post test-score comparison" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Pre/post test-score comparison</figcaption>
</figure>

Looking back at participants' performance, this might not simply mean CodePulse had no learning effect: it could also have to do with question difficulty and participants' prior knowledge. Some higher-performing participants (the university sophomores) could already reliably answer the easier questions on the pre-test. For the harder questions, participants who already understood a concept tended to get it right on both tests, and those who didn't tended to get it wrong on both, a ceiling effect that left little room for scores to move regardless of what they picked up from the platform. The high-school group, by contrast, was more prone to guessing, which made their pre/post scores less stable to begin with and further weakened the scores' ability to reflect actual learning. Separately, some questions may have been beyond what participants with weaker prior knowledge could grasp to begin with, so a single short session wasn't enough to translate into better quiz performance.

### Learning Confidence and Survey Feedback

By contrast, <span data-term="learning-confidence">learning confidence</span> improved significantly in both groups (university p < 0.001; high-school p = 0.021). That confidence was measured through a Likert-scale item participants self-rated on the survey, a form of <span data-term="self-reported-confidence">self-reported confidence</span>, indicating participants felt more confident about learning algorithms after using the platform. This is an early signal that the dynamic visualization may help build learners' confidence and motivation around algorithm concepts.

<figure>
  <img src="/images/projects/code-pulse/confidence-score.png" alt="Pre/post learning-confidence comparison" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Pre/post learning-confidence comparison</figcaption>
</figure>

In survey feedback, "step-by-step execution animation" was the highest-rated visualization feature (4.18/5), followed closely by <span data-term="self-perceived-learning-effectiveness">"helped me understand abstract data-structure operations"</span> (4.11/5), a self-perceived learning effectiveness item asking whether participants felt the platform helped them learn better, evidence that stands separately from the objective learning outcome shown in the test scores. Open-ended feedback noted that the platform still has a noticeable learning curve on first use, and that some features aren't positioned intuitively.

### Information Load

The survey also showed that while visualization makes an algorithm's execution easier to follow, presenting animation, variables, and other information all at once can leave users feeling like there's too much to take in. On the item "While watching the animation and tracking variables, did I feel like there was too much information to take in?", the average rating came out to only 3.14 (where 5 meant "very effortful"), one of the lower-rated items in the survey. In response, a setting was added so the pseudocode panel only opens while an animation is playing, auto-scrolling to the relevant variable section during playback so users could stay focused on the current execution step.

### Study Limitations

This study used a single-group pre/post-test design without a control group, so we can't rule out confounds like test familiarity, short-term learning, or novelty effects; the gains in test performance and learning confidence can't be directly attributed to the platform intervention alone. Participants also didn't necessarily experience the system the way it was intended: during the high-school group's sessions, for instance, some fell asleep, and others didn't stick to the intended scope (since session time was short, the goal was for participants to focus on the material the quiz actually covered). Whether to exclude that kind of behavior or try to control for it remains an open question. Future work could add a control group and extend session time to further validate the platform's learning outcomes.

## What I Learned

CodePulse demonstrates that combining static analysis, dynamic tracing, semantic embedding models, and LLM-assisted analysis into a single pipeline is workable: able to teach like a traditional animation tool while also analyzing arbitrary code like a debugger. One of the more interesting findings was that the value of the identifier-normalization strategy isn't really about raising accuracy per se, but about finding the right balance between "naming noise" and "preserving semantic features."

The user study also surfaced a gap worth thinking about: the interface's psychological benefit (a significant boost in <span data-term="learning-confidence">learning confidence</span>) didn't fully line up with its measurable learning gains (test scores only trended positive). That gap is what later pushed me to pull apart learning confidence, <span data-term="self-reported-confidence">self-reported confidence</span>, and <span data-term="self-perceived-learning-effectiveness">self-perceived learning effectiveness</span> as three distinct things. A short visualization session seems to meaningfully ease learning anxiety, but turning that into measurable knowledge gains probably needs longer practice time, a control-group design, or more precisely targeted guidance.

Beyond the methodological limits of the user study itself, the platform currently supports only Python, and hasn't been stress-tested at scale for concurrency.

## Future Work

1. Extend support to more languages (C / C++ / Java / JavaScript)
2. Finer-grained adaptive guidance and personalized learning paths
3. Expand the reference algorithm-vector library to improve recognition of unfamiliar code
4. Scale up the participant pool and observation window to validate long-term learning outcomes

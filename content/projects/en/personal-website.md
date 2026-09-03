# Personal Website

## Project Overview

I wanted a place to accumulate content over the long term (documenting projects I've built, articles I've read and written, and my friends' creative work) without relying on any off-the-shelf template or blogging system (not Notion, not WordPress). Everything from routing to layout to interactive components is hand-built. By design, the site has no login system: it is always read-only for visitors, my own content is managed through git commits and the Supabase Studio dashboard, and the only externally exposed write path is the friend-creation feature (an invite-code mechanism with no account system).

<figure>
  <img src="/images/projects/personal-website/home.png" alt="The personal website's home page, showing the name, positioning statement, research-interest tags, and featured project cards" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Home page: hero section, research-interest tags, and featured project cards</figcaption>
</figure>

## Technical Architecture

### Frontend

- **React + Vite + TypeScript**: A purely front-end build: `npm run build` runs `tsc --noEmit` type checking followed by `vite build`, producing static output that's a good fit for GitHub Pages and doesn't need SSR.
- **React Router**: Client-side routing only; since the site is deployed at the root of `*.github.io`, there's no `basename` to worry about.
- **Tailwind CSS v4**: Used for the many card/grid layouts (project list, gallery, friends' creation wall) with utility classes; a handful of pages that need more complex state selectors (`:global(.dark) &`, negative-margin layout tricks) fall back to CSS Modules (`.module.scss`).
- **TanStack Query**: Handles loading/error/cache state for Supabase data uniformly, so every page doesn't need to hand-roll its own fetch logic and repeated loading states.
- **react-markdown + remark-gfm + rehype-raw**: Articles and long-form project write-ups (`content/articles/*.md`, `content/projects/*.md`) are written in Markdown with frontmatter for title/date/category; `rehype-raw` allows raw HTML embedded inside the Markdown (e.g. centered `<figure>` elements, `<span data-term>` glossary markers), which is more flexible than plain Markdown syntax alone.
- **p5.js (instance mode)**: Powers the art gallery: 30 generative-art and interactive pieces migrated over from OpenProcessing. Instance mode was chosen over global mode because, with multiple sketches coexisting, global mode's `setup`/`draw` functions would clobber each other; instance mode lets each piece mount independently and unmount cleanly via `p5Instance.remove()`, guaranteeing at most one live canvas on the site at any time.
- **matter-js**: The 2D rigid-body physics engine behind one gallery piece ("Metal Collision"), now managed as a proper npm dependency (rather than injected via <span data-term="cdn">CDN</span> as in the original OpenProcessing version), and imported only by that one sketch module.
- **React Three Fiber + drei + three.js**: Powers the friends' 3D creature-painting editor and viewer, plus the `/dev/creature-builder` sculpting tool. It uses <span data-term="instancing">Instancing</span> to render large numbers of voxel cubes, and handles performance details like camera centroid computation and mounting/unmounting the WebGL context via <span data-term="intersection-observer">IntersectionObserver</span>.
- **FontAwesome**: Icons (the interests list on the About page, UI controls, etc.).

### Content Management Strategy: Two Kinds of Data, Two Paths

The site's content splits into two categories ("written slowly by me, rarely changes" and "runtime data written by third parties"), each mapped to a different storage and update mechanism:

| Category                                                     | Storage                                                 | Update Method                                                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Articles, projects, dreams, gallery metadata, glossary terms | Git content files (`content/*.json`, `content/**/*.md`) | Committed alongside code; pushed changes are auto-built and deployed by CI                            |
| Friends' 2D/3D creations                                     | Supabase (Postgres + RLS)                               | Friends write in real time via invite code; moderation (`is_visible`) is done through Supabase Studio |

Benefits of this split:

- **Zero backend latency**: most content is static data baked into the bundle, no API round-trip needed.
- **Built-in version history**: who wrote what, when, is always traceable.
- **Low switching cost**: if I later decide to move a section from a Git file to Supabase, or the other way around, the frontend just swaps out a data-fetching hook rather than committing to an irreversible architecture.

### Supabase: The Only Dynamic Write Feature

The only feature on the site that needs "runtime, multi-party writes" is friend creations: data written by an unspecified set of third parties (friends), which simply can't be handled through git alone. By design:

- **The frontend only ever `select`s from Supabase**: it never `insert`s or `update`s directly. The sole write path is two <span data-term="security-definer">Security Definer Function</span> RPCs (`redeem_invite_and_create`, `update_creation_with_code`) that bundle "validate invite code + mark as used + write the creation" into a single atomic operation, avoiding a <span data-term="race-condition">Race Condition</span> where multiple people redeem the same code at once (enforced with a `for update` row lock).
- **The invite code doubles as an editing credential**: once redeemed, the same code becomes a permanent editing credential for that piece; a friend who wants to revise their work just re-enters the same code, with no account system required.
- <span data-term="rls">RLS</span>: `friend_creations` only exposes rows where `is_visible = true` to the anon role; `invite_codes` has no policy open to any role at all: anon can't even `select` from it, and codes can only be redeemed indirectly through an RPC.
- **Zero extra storage cost**: both 2D pixel art and 3D creature-painting data are stored as sparse coordinate arrays containing only the painted cells (a few KB of JSON); thumbnails and previews are redrawn live directly from this data, with no separate image files or pre-rendering step needed.
- **Minimal personal data**: the whole flow only collects a nickname: no email, no password, no account system. Invite codes are shared privately with friends and never listed publicly on the site.

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) automatically runs `npm run build` on every push to `main` and deploys `dist/` to GitHub Pages. Supabase's URL and anon key are stored as GitHub repo secrets and injected into the frontend bundle at build time (the anon key is designed to be public: security is enforced by <span data-term="rls">RLS</span>, not secrecy).

## Features by Section

### Home `/`

A hero section (name, positioning statement, short bio) plus research-interest tags (linking to `/knowledge?category=RESEARCH`, filtered to the matching glossary category, not an anchor on the About page); separate featured-project and featured-article carousels (driven by the `featured` flag in `projects.json` / article frontmatter, not any research-vs-engineering heuristic, currently the featured projects are the personal website itself and CodePulse); navigation cards linking to Experience/Articles/Gallery/All Projects/Mini Works; a footer with external links to GitHub, OpenProcessing, and email.

<figure>
  <img src="/images/projects/personal-website/home.png" alt="The home page, showing the name, positioning statement, research-interest tags, and featured project cards" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Home: hero section, research-interest tags, and featured project cards</figcaption>
</figure>

### About `/about`

Professional skills (grouped by Programming / Data & Visualization / Frontend / Others / research direction), education (with expandable per-semester grades and rank), research interests (in three tiers: Core / Methods / Applied), academic output, selected competitions and experience (linking to the full experience page), personal interests, and a résumé download (links to `public/resume.pdf`).

<figure>
  <img src="/images/projects/personal-website/about.png" alt="The About page, large 'About Me' text on the left with a tiered research-interest list on the right" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">About: tiered research-interest list</figcaption>
</figure>

### Experience `/experience`

A vertical timeline page with primary and secondary entries, each tagged with a date, chips, and a summary of highlights; purely static data (`content/experience.json`), there aren't enough entries to justify dynamic fetching.

<figure>
  <img src="/images/projects/personal-website/experience.png" alt="The Experience page, a vertical timeline of primary and secondary entries" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Experience: vertical timeline</figcaption>
</figure>

### Articles `/articles`

Book notes and popular-science/technical notes (distinguished by `type: book | note`), filterable by title, category, rating, and date; body content renders on a `/articles/:slug` detail page and can embed glossary terms (see below).

<figure>
  <img src="/images/projects/personal-website/articles.png" alt="The Articles list page, showing category and filter chips" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Articles list: category and filter chips</figcaption>
</figure>

### Projects `/projects`

A project list filterable by tag, status, and date; if a project has a matching long-form write-up at `content/projects/<slug>.md` in addition to its `projects.json` entry, it renders as a `/projects/:slug` detail page, organized under a consistent set of sections: "Project Overview, System Architecture, Core Features, Conclusion" (or "Background, Methods, Results, Conclusion" for research-style projects).

<figure>
  <img src="/images/projects/personal-website/projects.png" alt="The Projects list page, showing tag and status filters" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Projects list: tag and status filters</figcaption>
</figure>

### Glossary

Technical terms that appear in articles and long-form project write-ups (<span data-term="elo-rating">ELO Rating</span>, <span data-term="ast">AST</span>, <span data-term="cosine-similarity">Cosine Similarity</span>, <span data-term="ckip">CKIP</span>, <span data-term="zero-shot">Zero-Shot</span>, <span data-term="rls">RLS</span>, and others) are marked as clickable, clicking one opens a popover card with two sections: a "general definition" and "how it's actually used here." When the same term is shared across multiple projects/articles, the "how it's used" section picks the passage matching whichever project or article you're currently on, instead of mixing in unrelated usages. Rather than sending readers off to an external wiki, it folds the term back into "why this place needed it," letting readers unfamiliar with the background follow the technical content of research-oriented projects without leaving the page. The popover itself is a component that recurs across pages, so it has no standalone screen of its own; but there's also a standalone `/knowledge` list page filterable by keyword and category, and opening `/knowledge/:slug` shows a single term's full definition plus its related projects/articles, with some terms also carrying a full-length write-up (`content/knowledge/{zh,en}/*.md`), while terms without one keep the plain compact card.

<figure>
  <img src="/images/projects/personal-website/knowledge-term.png" alt="A knowledge-term detail page, showing the general definition, the context-specific application note, and the term's long-form write-up" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Knowledge term detail page: general definition, context-aware application, and long-form content</figcaption>
</figure>

### Knowledge Graph `/knowledge/graph` (experimental)

Renders the prerequisite/related/applies_to/contrasts_with relationships between glossary terms as a force-directed graph. By default only category hubs are shown; clicking one expands it into individual terms, several categories can be expanded at once, and nodes can be manually dragged into place. Panning and dragging don't work well on a narrow phone screen, so below the `sm` breakpoint it shows a text hint pointing users to a tablet or desktop instead.

<figure>
  <img src="/images/projects/personal-website/knowledge-graph.png" alt="The Knowledge Graph page, with one category expanded showing individual term nodes and edges" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Knowledge Graph: force-directed layout with a category expanded</figcaption>
</figure>

### Art Gallery `/gallery`

30 generative-art and interactive pieces migrated from OpenProcessing and rewritten in p5.js instance mode. The list page is styled as a "horizontal exhibition room": each piece hangs in a frame, vertical scroll wheel input is converted to horizontal scrolling, and the centered piece is lit up like it's under a spotlight. Supports filtering by title, date, and interaction type (click-to-redraw / drag-to-paint / keyboard-controlled / button-based turns / drag physics), plus newest/oldest sorting. Only when you open a single piece's detail page does its sketch module actually load and mount a canvas; the background switches to a dark exhibition mood (a CSS `radial-gradient` layered to fake a spotlight), and everything unmounts the instant you leave the page, so at most one p5 canvas is ever alive at a time.

<figure>
  <img src="/images/projects/personal-website/gallery.png" alt="The Art Gallery list page, a horizontal exhibition room of generative-art thumbnails" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Art Gallery: horizontal exhibition room</figcaption>
</figure>

### Playground `/playground`

A hub page for "things that are more personal or still evolving," currently linking to Dreams, Mini Works, and one dev tool: `/dev/components` (a UI component-library preview). The cards linking to Friends' Creations and the two 3D creature dev tools (`/dev/creature` for walking-animation checks, `/dev/creature-builder` for stacking cubes to sculpt a shape) have been pulled from this page while that work continues on a separate branch; the routes themselves are still there, ready to be relinked later.

<figure>
  <img src="/images/projects/personal-website/playground.png" alt="The Playground page, with cards linking to Dreams, Mini Works, and the component preview" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Playground: entry cards</figcaption>
</figure>

### Dreams `/dreams`

A static list of things I want to do, with some items showing a progress bar where there's a quantifiable goal.

<figure>
  <img src="/images/projects/personal-website/dreams.png" alt="The Dreams page, a static list of things I want to do" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Dreams: list of things I want to do</figcaption>
</figure>

### Mini Works `/playground/mini-works`

A list of small interactive pieces (class assignments, CodePen practice, and the like) with `/playground/mini-works/:slug` showing a single piece.

<figure>
  <img src="/images/projects/personal-website/mini-works.png" alt="The Mini Works list page" style="display: block; margin: 0 auto; max-width: 100%;" />
  <figcaption style="text-align: center;">Mini Works: list page</figcaption>
</figure>

> The full `/friends` creation flow (invite-code redemption, 2D/3D editors, re-editing) is already built, but nothing on the site currently links to it, so it's left out of the section list above. See "Conclusion and Contributions" below for details.

## Conclusion and Contributions

This project isn't just a portfolio site; it's an exercise in deliberately deciding what _not_ to build: no login system, no visitor traffic analytics or third-party tracking, no moderation queue for friend creations (the low-resolution pixel grid and fixed creature shape already constrain "what can be drawn" to a small enough range that an extra moderation layer would be over-engineering). Thinking through whether to build something before deciding how to build it turned out to be closer to the kind of architectural trade-off you actually run into on real projects than simply stacking on features would have been.

There are four main technical contributions:

- **p5.js instance-mode migration**: migrating p5.js entirely from OpenProcessing's global mode to instance mode, letting 30 generative-art pieces coexist in the same SPA without polluting each other's global state, so the whole site never has more than one live canvas at a time.
- **Invite-code race condition**: the friend-creation system uses Postgres <span data-term="security-definer">Security Definer Function</span> RPCs combined with `for update` row locking to resolve the invite-code <span data-term="race-condition">Race Condition</span> without any account system, while letting a single invite code serve double duty as both a one-time redemption token and a long-term editing credential.
- **A unified painting data model**: 2D pixel art and 3D voxel painting share the same "sparse coordinate array" data model and undo/redo architecture, keeping data volume and content risk at the same level across both creation types, so the database schema never needed to change to accommodate a new creation type.
- **Context-aware glossary**: when a term is shared across multiple projects/articles, its "how it's used" text now picks the passage matching the current context instead of merging everything into one sentence; some terms also carry a full write-up, and there's a new experimental force-directed view of term relationships (`/knowledge/graph`).

What's currently finished covers all the static content sections (Home, About, Experience, Articles, Projects, Glossary, Gallery, Playground, Dreams, Mini Works); the glossary feature is wired into both articles and project write-ups, with context-aware descriptions, long-form entries for some terms, and the graph view, all aimed at lowering the barrier to reading research-oriented project content.

The full friend-creation flow (invite-code redemption, 2D/3D editors, re-editing, undo/redo) is code-complete, but nothing on the live site currently links to it; it'll be reconnected once that work converges on its own branch.

What's next:

1. Keep refining the visual design
2. Knowledge graph: color-code edges by relationship type (prerequisite/related/applies_to/contrasts_with), and add a way to browse it on mobile
3. Reconnect the friend-creation feature to a main navigation entry point

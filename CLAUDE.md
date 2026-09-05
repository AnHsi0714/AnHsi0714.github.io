# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

### Bilingual content: two different mechanisms, not one

- JSON content (`projects.json`, `dreams.json`, `artworks.json`, `knowledge.json`, `experience.json`, `namecard.json`) ships as **paired files**: `foo.json` (zh) and `foo.en.json` (en), same shape, matched by **array index**, not by slug — editing one language's array without mirroring the same-index edit in the other desyncs them.
- Markdown content (`content/articles/`, `content/projects/`, `content/knowledge/`) is **folder-split**: `zh/<category>/<slug>.md` and `en/<category>/<slug>.md` as separate files sharing the same slug (not a `.en.md` suffix). `src/lib/markdown.ts` has the shared frontmatter parser used by `lib/articles.ts` and `lib/projects.ts`.
- Which language renders is `useLocalized(zh, en)` (`src/lib/localized.ts`), reading `LanguageContext`. This is unrelated to UI-string i18n: `src/i18n/strings.ts` is a single large bilingual object of interface strings (labels, buttons, filter text), consumed via `useTranslation()` — content localization and UI-string i18n are two separate systems that happen to both key off the same `LanguageContext`.

### Naming convention: kebab-case for string-literal values that mirror stored data

When a TS string-literal union's *values* represent something stored as data (a status field, a relation type, a filter value written into JSON content or a Supabase `jsonb` column), multi-word values use kebab-case — e.g. `ProjectStatus`'s `"in-progress"`, `KnowledgeRelationType`'s `"applies-to"`/`"contrasts-with"`. This only applies to the string values themselves; the TS identifiers (type names, variable/function/prop names) stay ordinary camelCase/PascalCase as usual. Purely in-memory identifiers that are never serialized (e.g. `LegName` in `src/lib/creatureBody.ts`) aren't bound by this.

Known exception not yet fixed: `VoxelRegion` (also in `creatureBody.ts`) uses camelCase (`legFrontLeft`, etc.) despite being persisted into Supabase's `friend_creations.data` jsonb column (see `src/types/friends.ts`). Fixing it means a data migration for already-saved rows, not just a type rename — treat it as a separate, deliberate piece of work if it's ever done, not something to "clean up" incidentally.

## Repo-specific skills

`.claude/skills/` has project-specific skills worth knowing about: `design-audit` (compute-don't-eyeball WCAG contrast audits over the color token system in `src/styles/theme.css`/`tokens.scss`), `knowledge-coverage` (QA pass over an article's `data-term` glossary-link coverage against `knowledge.json`), and `pr-content` (this repo's required PR title/body format and workflow — plain-text draft only, no `gh pr create`, no Claude attribution).

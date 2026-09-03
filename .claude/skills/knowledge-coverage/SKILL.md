---
name: knowledge-coverage
description: Audit one article's data-term links against content/knowledge.json and content/knowledge.en.json — coverage (is every relevant term linked, in both languages, in every section that mentions it) and hygiene (does any term link twice inside the same section). Use when the user asks to check knowledge point coverage, 知識點覆蓋, confirm all knowledge points, verify each section links a term on its first mention, or audit data-term tags for an article.
---

# Knowledge coverage check

A content-QA pass over one article's `<span data-term="...">` links, not a build tool. Run it ad hoc with Bash/Grep/Read against the article's zh and en files plus `content/knowledge.json` / `content/knowledge.en.json`. Report findings as a checklist; don't edit anything unless the user asks you to act on a specific finding.

## Steps

1. **Locate the pair.** Find the target article's zh and en files: `content/articles/zh/**/<slug>.md` and `content/articles/en/**/<slug>.md`. If the user names a topic instead of a slug, search for it first.

2. **Extract tagged terms per section.** Pull every `data-term="..."` id from both files in document order, and record which `##`/`###` heading each occurrence falls under.

3. **Per-section tagging check.** The site convention is: a term is tagged on its *first* mention within *every* `##`/`###` section that mentions it by name — including a section named after the term itself (e.g. the `## mergeMap: ...` section still tags `mergeMap` the first time that section's body text says "mergeMap"). Two things to flag here:
   - **Duplicate-in-section**: the same id tagged more than once inside one section. Only the first mention in a section should carry the tag; later mentions in that same section stay plain text.
   - **Missing-in-section**: a term's name appears as plain text in a section but was never tagged there, because it happens to already be tagged in an earlier section. This is the easy mistake to make — tagging a term once near the top (e.g. in the backstory paragraph) and then treating it as "already covered" for the rest of the article is wrong. Check every section independently: read each section's body text (skip code fences and table cells — those stay plain) for the *first* plain-text mention of any id already known in this run (from step 2's ids, or from any `content/knowledge.json` term name), and confirm that specific mention carries the tag.

4. **zh/en parity.** The set of ids used in the zh file and the en file should match exactly. Flag anything present in one language and missing in the other — a common cause is a section added to one language and not mirrored to the other.

5. **Existence check.** Every id used must have an entry in both `content/knowledge.json` and `content/knowledge.en.json`. Flag any id that's tagged in the article but has no matching key in either file — this breaks the term popover silently (it degrades to plain text instead of erroring, so it's easy to miss without this check).

6. **Back-reference check.** For every entry in `content/knowledge.json` whose `relatedArticles` array includes this article's slug, confirm that id is actually tagged somewhere in the article body. Flag entries that claim the article via `relatedArticles` but are never linked from it — a stale or aspirational reference.

7. **Untagged-but-known candidates.** Scan the article's prose (skip code fences and the frontmatter) for other `content/knowledge.json` term names or ids that appear as literal text but aren't wrapped in a `data-term` span anywhere in the article. Report these as candidates for the user to decide on — don't add the tag yourself unless asked, since not every mention of a known term is worth a popover.

8. **New-term candidates.** Note technical proper nouns, library/API names, or jargon in the article that have no `content/knowledge.json` entry under any id. List them as candidates for a new knowledge node, but do not create entries automatically: a real entry needs a genuine "application" detail from the user's own experience (this project's articles are first-person accounts, not textbook definitions — see the site's existing knowledge entries for the pattern), so surface the term and ask rather than invent one.

## Reporting

Summarize as a short checklist, grouped by severity:

- ⚠ duplicate-in-section (step 3)
- ⚠ missing-in-section (step 3)
- ⚠ zh/en mismatch (step 4)
- ⚠ missing knowledge entry (step 5)
- ⚠ stale relatedArticles (step 6)
- 💡 untagged-but-known (step 7)
- 💡 new-term candidate (step 8)

If a category is clean, say so briefly rather than omitting it — "no duplicates found" is a useful result, not a non-result.

---
name: knowledge-coverage
description: Audit one article's data-term links against content/knowledge.json and content/knowledge.en.json — coverage (is every relevant term linked, in both languages) and hygiene (does any term link twice inside the same section). Use when the user asks to check knowledge point coverage, 知識點覆蓋, confirm all knowledge points, verify each section only links a term once, or audit data-term tags for an article.
---

# Knowledge coverage check

A content-QA pass over one article's `<span data-term="...">` links, not a build tool. Run it ad hoc with Bash/Grep/Read against the article's zh and en files plus `content/knowledge.json` / `content/knowledge.en.json`. Report findings as a checklist; don't edit anything unless the user asks you to act on a specific finding.

## Steps

1. **Locate the pair.** Find the target article's zh and en files: `content/articles/zh/**/<slug>.md` and `content/articles/en/**/<slug>.md`. If the user names a topic instead of a slug, search for it first.

2. **Extract tagged terms per section.** Pull every `data-term="..."` id from both files in document order, and record which `##`/`###` heading each occurrence falls under.

3. **Duplicate-in-section check.** For each section, flag any `data-term` id that appears more than once. The site convention is: a term links on its first occurrence within a section; later mentions in the *same* section stay plain text. Being tagged again in a *different*, later section (reintroducing it there) is fine and not a violation.

4. **zh/en parity.** The set of ids used in the zh file and the en file should match exactly. Flag anything present in one language and missing in the other — a common cause is a section added to one language and not mirrored to the other.

5. **Existence check.** Every id used must have an entry in both `content/knowledge.json` and `content/knowledge.en.json`. Flag any id that's tagged in the article but has no matching key in either file — this breaks the term popover silently (it degrades to plain text instead of erroring, so it's easy to miss without this check).

6. **Back-reference check.** For every entry in `content/knowledge.json` whose `relatedArticles` array includes this article's slug, confirm that id is actually tagged somewhere in the article body. Flag entries that claim the article via `relatedArticles` but are never linked from it — a stale or aspirational reference.

7. **Untagged-but-known candidates.** Scan the article's prose (skip code fences and the frontmatter) for other `content/knowledge.json` term names or ids that appear as literal text but aren't wrapped in a `data-term` span anywhere in the article. Report these as candidates for the user to decide on — don't add the tag yourself unless asked, since not every mention of a known term is worth a popover.

8. **New-term candidates.** Note technical proper nouns, library/API names, or jargon in the article that have no `content/knowledge.json` entry under any id. List them as candidates for a new knowledge node, but do not create entries automatically: a real entry needs a genuine "application" detail from the user's own experience (this project's articles are first-person accounts, not textbook definitions — see the site's existing knowledge entries for the pattern), so surface the term and ask rather than invent one.

## Reporting

Summarize as a short checklist, grouped by severity:

- ⚠ duplicate-in-section (step 3)
- ⚠ zh/en mismatch (step 4)
- ⚠ missing knowledge entry (step 5)
- ⚠ stale relatedArticles (step 6)
- 💡 untagged-but-known (step 7)
- 💡 new-term candidate (step 8)

If a category is clean, say so briefly rather than omitting it — "no duplicates found" is a useful result, not a non-result.

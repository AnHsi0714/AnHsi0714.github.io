---
name: pr-content
description: Draft PR title and body text for this repo. Use when the user asks to generate/write/draft PR content, PR description, or PR 內容/文案. Does not create or open the actual PR.
---

# PR content

Draft pull request text for this repo (`AnHsi0714.github.io`) as plain text output in the chat — never as a `gh pr create` call, and never with a compare/create URL. The user opens the PR themselves and pastes this in.

## Steps

1. Find the PR's commit range: `git merge-base main HEAD`, then `git log --oneline <merge-base>..HEAD` and `git diff --stat <merge-base>..HEAD` to see everything the PR would contain.
2. Read the actual diffs/commit messages for anything not already obvious from this conversation — don't guess at scope.
3. Check the progress log covers this PR: open the current week's file (`docs/progress/<YYYY-MM>/<週一日期>.md`, one file per week, day sections inside) and compare against the PR's range. If work in this PR isn't recorded yet, add the missing day-section entries in the same style/depth as existing ones — record decision context and dead ends, not just outcomes. Edit the file only; do not commit (progress notes are committed on the feature branch itself, by the user). Mention in the reply that the log was updated.
4. Write the title and body per the format below.
5. Output the draft as plain text in the reply. Do not run `gh pr create`. Do not compute or paste a compare/create URL (`.../compare/main...branch`) unless the user separately asks for one.

## Format

**Title:** Conventional-commit style, in English: `feat: XXX` (use `fix:`/`docs:`/`refactor:` etc. instead of `feat:` when that better matches the actual change type — `feat:` is the default, not a hard rule).

**Body:** Traditional Chinese. Structure:

```markdown
## Summary

- 條列這次 PR 實際做了什麼（依主題分組，不是逐 commit 翻譯）
- ...
```

- No "Test plan" section — omit it entirely, even as an empty checklist.
- No links, badges, or "🤖 Generated with Claude Code" footer.
- No Co-Authored-By or any Claude/Anthropic attribution anywhere in the draft.
- Keep bullets grouped by theme/feature, not one bullet per commit — squash trivial/fixup commits into the feature they belong to.
- If part of the commit range predates this conversation (i.e. you don't have first-hand context for why it was done), say so plainly instead of inventing a rationale.

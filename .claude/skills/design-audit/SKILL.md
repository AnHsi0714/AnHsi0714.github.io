---
name: design-audit
description: Scan the site's design system for WCAG design-requirement violations — color contrast today, extensible to font size / tap target / other checks. Use when the user asks to audit color contrast, check WCAG compliance, scan for accessibility/design issues site-wide, or "check all colors" / "掃描設計需求" / "檢查對比度".
---

# Design requirements audit

A design-QA pass over `src/styles/theme.css` + `src/styles/tokens.scss` (the token source of truth) and every component/page that consumes them. Not a build tool — run it ad hoc with Grep/Read/Bash, fix what's safe to fix, flag what needs a judgment call. This repo has already been through one full pass (see `fix/a11y-heading-structure` branch history for real examples of every fix category below).

## Why grep the tokens instead of trusting them

`theme.css` pairs are not automatically consistent with each other — a token can be well-intentioned and still fail in practice depending on *which* other token it gets placed against. The only ground truth is real usage: grep for how each token is actually consumed, not just what pairs look plausible on paper.

## 1. Color contrast

### Method: compute, don't eyeball

WCAG 2.1 relative luminance and contrast ratio, implemented exactly (do this in a throwaway Node script, not by memory):

```js
function relLum(hex) {
  const c = hex.replace("#", "");
  const full = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
  const lin = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [R, G, B] = [r, g, b].map(lin);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}
function contrast(a, b) {
  const L1 = relLum(a), L2 = relLum(b);
  const [hi, lo] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (hi + 0.05) / (lo + 0.05);
}
```

Thresholds: **4.5:1** for normal text, **3:1** for large text (≥18.66px bold or ≥24px regular) and for non-text UI components (borders, focus rings, icons that carry meaning). When in doubt about a given piece of text's size, check the actual `font-size` class/rule rather than assuming — this repo's smallest body text (`text-xs`, `0.7rem`/`0.75rem` scale) is always "normal text," never "large text."

### Finding real pairs (not theoretical ones)

```
grep -rn "color:\s*(\$color-\|var(--color-" src   # every place a token is used as text color
```

For each hit, find its *actual* background — same rule block's `background-color`, or (if none) whatever ancestor supplies one (often the page background / `--color-surface`, sometimes a component-scoped custom property block like `--room-*` or `--stage-bg`). Don't stop at `src/styles/` — component-scoped hardcoded hex (`grep -rn "color:\s*#" src`) catches pages that opted out of the shared token system for a fixed local palette (exhibition-room dark themes, mini-work recreations of an external design, etc.).

### The two roles every "hue" token secretly plays

This project's danger/success/info tokens each get used two structurally different ways, and a fix for one silently breaks the other if you're not tracking both:

- **Role A — colored text/border directly on the page background.** Needs to be *dark* in light mode, *light* in dark mode (same direction the page's own text/text-muted tokens already go).
- **Role B — near-white or near-black text sitting on a *filled* version of the hue** (Alert, Badge, filled Chip, solid Button). This needs the hue itself to stay dark-and-saturated **regardless of theme** — a light/pastel shade that's perfect for Role A in dark mode (e.g. a pastel red for text-on-black) fails badly here, because now it's the *background* under white text, and light-on-light never passes.

Practical upshot: Role A wants a per-theme pair (dark value / light value). Role B wants a single theme-agnostic dark value reused in both `:root` and `.dark`. If a token is currently doing both jobs with one value, that's very likely the bug — split it into two tokens (see `--color-success-outline` vs `--color-success-bg`, `--color-danger` vs `--color-danger-bg` in `theme.css` for the resolved examples) rather than trying to find one value that satisfies both roles.

Decorative-only color (illustration fills, animated gradient borders like Chip's `--chip-gradient`, an icon that's purely ornamental) is out of scope — WCAG contrast applies to text and *meaningful* UI, not artwork.

### What to fix vs. what to flag

Fix directly: anything using the shared token system (`$color-*` / `var(--color-*)`) or a page-scoped design token block (`--room-*`, `--stage-bg`, and similar) that's clearly meant to represent *this site's* current design. Darken/lighten the specific failing value using the same computation above; verify the fix against every background that token is actually paired with (a value fixed for one background can still fail a different one — e.g. a color used in both a "day" and "night" variant of the same component needs to pass against both).

Flag instead of fixing: components explicitly documented as recreating a specific external design (grep for comments like "還原原稿" / "recreation of" — this repo's mini-works pages under `src/pages/playground/miniworks/` and `BrandStyleGuide` are OpenProcessing/CodePen ports). Changing their colors would misrepresent what was actually built. Report the failing ratio and let the user decide.

## 2. Font size

No single hard WCAG minimum, but check for:
- Body/label text set via a fixed small size (this repo's floor is `text-xs` / `0.7rem`–`0.75rem`; anything smaller, or a raw `font-size: <10px>` outside that pattern, is worth flagging).
- Fixed `px` font sizes that would block browser zoom/reflow (WCAG 1.4.4) — this repo uses Tailwind's rem-based scale almost everywhere; a raw `px` font-size in a `.module.scss` is the exception worth grepping for (`grep -rn "font-size:\s*[0-9]*px" src`).

## 3. Tap targets

Interactive elements (buttons, links acting as controls, chip toggles) should have a hit area of roughly 24×24px minimum (WCAG 2.5.8), 44×44px recommended for primary actions. Check padding/min-height on custom-styled clickable elements, not just icon-only buttons — a small icon button with generous padding can still pass even if the icon itself is tiny.

## 4. Anything else the user names

This skill's job is to hold the *method*, not a fixed checklist — if the user asks about a design requirement not listed above (focus indicators, motion/`prefers-reduced-motion`, touch gesture conflicts, whatever), apply the same discipline: find the actual token/value, compute or verify against the real spec threshold, fix what's safely within the shared system, flag what requires a visual/creative judgment call.

## Reporting

Group findings by severity, same shape as other audits in this repo:
- ⚠ fails the hard threshold (4.5:1 text / 3:1 UI / etc.) — fix now
- ⚠ marginal fail (within ~0.3 of the threshold) — still fix, but call out that it was close
- 💡 flagged, not fixed (external-design recreation, or a real visual-design tradeoff you shouldn't make unilaterally) — describe the ratio and let the user decide

If a category comes back clean, say so briefly rather than omitting it.

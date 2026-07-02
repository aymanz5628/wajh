---
name: wajh_article_deck
description: Builds interactive slide-based article presentations (True Slide Deck) for Wajh articles using rawhtml with exact CSS/JS tokens that avoid conflicts with React and ArticleBody.
---

# Wajh Article Deck Skill

When requested to convert or design an article as an interactive presentation deck (`rawhtml` slide deck) for the Wajh platform, ALWAYS follow these structural and architectural rules:

## 1. Class Names & Structure
- NEVER use `.slide` as a class name on presentation slides, because React's `ArticleBody.tsx` has a legacy intersection observer tailored specifically for `.slide` that interferes with custom decks.
- ALWAYS use `.wdeck` as the parent wrapper ID and class, and `.wdeck-slide` for individual slide containers.
- Each slide MUST have:
  - `.wdeck-bg` containing an `<img>` tag with the slide background image.
  - `.wdeck-content` containing headers (`.wdeck-h1`, `.wdeck-h2`), paragraphs (`.wdeck-p`), tags (`.wdeck-tag`), or glass cards (`.wdeck-glass`).

## 2. Navigation & Scripting
- Ensure all Javascript is contained within `<script>` tags inside the `rawhtml` payload. `ArticleBody.tsx` will explicitly extract and execute any `<script>` tags when rendering `rawHtml`.
- Bind navigation buttons via `onclick="wdeckNav(1)"` and `onclick="wdeckNav(-1)"`.
- Attach event listeners (`wheel`, `touchstart`, `touchend`, `keydown`) directly to `window` with `e.preventDefault()` inside the script to intercept user scroll attempts before the outer Next.js application layout (`ScrollProgress`) can capture them.

## 3. Reference Template
You can always reference or copy the base HTML template from:
`templates/deck_template.html`

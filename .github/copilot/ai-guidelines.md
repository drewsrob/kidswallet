# AI Guidelines

## HTML5 Guidelines

### Semantic Principles

- Always use semantic elements when they express the meaning and structure of the content
- Do NOT use `<div>` or `<span>` when a semantic element conveys the intent
- Avoid **over-nesting**; keep your structure shallow and readable
  - Over-nesting makes HTML harder to maintain and can negatively affect accessibility and performance
- Be **consistent** in how you use semantic elements across your entire site
  - Example: If blog posts use `<article>`, _all_ blog posts should use `<article>`
- Adopt **accessibility best practices**
  - Prefer native semantic elements over ARIA roles unless absolutely needed
  - Provide meaningful alt text for images and descriptive link text
  - Regularly test accessibility with tools such as WAVE, AXE, and Lighthouse
- Use elements based on their **true semantic purpose**, not for styling or layout
- Ensure the document structure is understandable for both humans and machines (SEO, accessibility, screen readers)
- Each page must have a clear, logical content hierarchy

### Structural Elements

- **`<header>`** — Use for page or section headers, branding, slogans, or intro navigation
- **`<footer>`** — Use for closing content such as copyright, contact info, or secondary navigation
- **`<main>`** — Use **exactly once** per page for the primary content
- **`<section>`** — Use for logically grouped content that requires its own heading
- **`<article>`** — Use for standalone, self-contained content (blog posts, news, cards)
- **`<aside>`** — Use for supplementary content not central to the page’s main flow (sidebars, highlights)
- **`<nav>`** — Use strictly for blocks of navigation links (menus, tables of contents)
- **`<hgroup>`** — Use to group multiple levels of headings that belong to the same content block

### Text & Inline Semantics

- Use **`<strong>`** to indicate important content, not just bold styling
- Use **`<em>`** for semantic emphasis affecting meaning
- Use **`<time>`** for machine-readable dates and times
- Use **`<abbr>`** for abbreviations with a descriptive `title`
- Use **`<code>`**, **`<pre>`**, **`<kbd>`**, **`<samp>`** for code and technical notation

### Media & Content Semantics

- **`<figure>`** — Use for self-contained media (images, diagrams, charts)
- **`<figcaption>`** — Provide captions for figures
- **`<picture>`** — Use for responsive image sources
- **`<video>`** / **`<audio>`** — Use with fallback content
- **`<table>`** — Use exclusively for tabular data
- **`<details>`** — Use for expandable/collapsible additional information
- **`<summary>`** — Provide a summary for a `<details>` block

### Form Semantics

- Use input types such as `email`, `url`, `number`, `date`, etc. for the correct semantics and validation
- Always pair `<label>` with controls using the `for` attribute
- Use `<fieldset>` and `<legend>` to group related form inputs
- Prefer native HTML validation attributes (`required`, `pattern`, `min`, `max`) before custom JS validation

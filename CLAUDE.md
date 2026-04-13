# Bearing Freedom Site

## Project

Astro 6 static site for the Bearing Freedom YouTube channel. 2nd Amendment commentary and opinion content.

## Tech Stack

- Astro 6 + TypeScript (strict)
- Tailwind CSS 4 (via Vite plugin)
- Netlify deployment with serverless functions
- Pagefind for static search
- Voyage AI for semantic search embeddings
- Markdown content collections with Zod validation

## Commands

- `npm run dev` — Start dev server (localhost:4321)
- `npm run build` — Build search index + Astro build + Pagefind index
- `npm run preview` — Preview production build
- `npx astro check` — TypeScript type checking

## Architecture

src/
content/ # Markdown content collections (articles, books)
pages/ # Astro page routes
components/ # Reusable Astro components
layouts/ # Base layout (nav, footer, head)
styles/ # global.css with Tailwind theme
netlify/functions/ # Serverless functions (chatbot)
scripts/ # Build-time scripts (search index)

## Content Schema (articles)

Fields: title, date, youtube_url, youtube_id, thumbnail, duration, author, topics[], states[], content_type[], tags[], image_prompt (optional, drives thumbnail generation)

## Conventions

- Components are .astro files (no React/Vue)
- Styling via Tailwind utility classes in components
- Custom theme colors: navy, gold, cream, paper, ink (defined in global.css)
- Fonts: Playfair Display (headings), Newsreader (body), DM Sans (UI)
- All content is markdown with Zod-validated frontmatter

## Article Generation Pipeline

Full docs: `docs/article-pipeline.md`

1. Get video IDs from YouTube channel (UCmuwdcAbeBR16b8q6CBUsTw) via yt-dlp
2. Download transcripts, clean VTT artifacts
3. Generate articles via parallel sonnet agents — agents use video as topic/stance source ONLY, research independently, write original editorials
4. **ALWAYS humanize** every article with `/humanizer` skill before committing — strips AI writing patterns
5. Validate with `npm run build`
6. Generate stock images via xAI (XAI_API_KEY in .env) — prompts must be short, positive-only, no negative prompting
7. Rebuild vector search index (VOYAGE_API_KEY)

## Article Writing Voice

- Standalone opinion pieces, NOT video recaps or transcript rewrites
- Pro-2A, opinionated, direct, knowledgeable but accessible
- First person ("I think", "in my view")
- No both-sides hedging
- No YouTube references (subscribe, like, channel names)
- Sentence-case headings, no em dashes, no rule-of-three, no signposting phrases

## Rules

- Use plan mode for any task with 3+ steps
- Use subagents liberally to preserve context
- Never mark tasks complete without verification
- Run `npx astro check` after modifying .astro or .ts files
- Run `npm run build` to verify before claiming build works
- Keep components small and focused — one file per component
- Follow existing naming patterns (PascalCase components, kebab-case content files)
- Increment version on every update (current: v0.0.4)

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
  content/         # Markdown content collections (articles, books)
  pages/           # Astro page routes
  components/      # Reusable Astro components
  layouts/         # Base layout (nav, footer, head)
  styles/          # global.css with Tailwind theme
netlify/functions/ # Serverless functions (chatbot)
scripts/           # Build-time scripts (search index)

## Content Schema (articles)
Fields: title, date, youtube_url, youtube_id, thumbnail, duration, author, topics[], states[], content_type[], tags[]

## Conventions
- Components are .astro files (no React/Vue)
- Styling via Tailwind utility classes in components
- Custom theme colors: navy, gold, cream, paper, ink (defined in global.css)
- Fonts: Playfair Display (headings), Newsreader (body), DM Sans (UI)
- All content is markdown with Zod-validated frontmatter

## Rules
- Use plan mode for any task with 3+ steps
- Use subagents liberally to preserve context
- Never mark tasks complete without verification
- Run `npx astro check` after modifying .astro or .ts files
- Run `npm run build` to verify before claiming build works
- Keep components small and focused — one file per component
- Follow existing naming patterns (PascalCase components, kebab-case content files)

# Bearing Freedom Site — Setup Design Spec

## Overview

Fork the `memfactorduke/four-boxes-blog` Astro site and adapt it as the foundation for the "Bearing Freedom" YouTube channel's website. Same 2nd Amendment space, but more opinion-driven and less legal analysis than the original.

## Goals

1. Clean fork with all original features preserved but rebranded
2. Simplified content schema (less legal metadata)
3. Full Claude Code best-practices toolchain
4. Ready for content creation and branding customization

## Tech Stack (unchanged)

- Astro 6, TypeScript (strict), Tailwind CSS 4
- Netlify deployment with serverless functions
- Pagefind static search + Voyage AI semantic search
- Markdown content collections with Zod validation

## 1. Repository Setup

- Clone `memfactorduke/four-boxes-blog` into project directory
- Detach from original remote, init fresh git repo
- Create `memfactorduke/bearing-freedom-site` on GitHub, set as origin
- Remove all content: `src/content/articles/*.md`, `src/content/books/*.md`
- Remove `public/images/` article/book thumbnails
- Remove `data/` (pre-built vector index)
- Keep all code: components, layouts, pages, scripts, functions, config

## 2. Content Schema Changes

### Articles — `content.config.ts`

**Keep:**
- `title`, `date`, `youtube_url`, `youtube_id`, `thumbnail`, `duration`
- `author` (default: "Bearing Freedom")
- `tags[]`, `content_type[]`

**Replace legal fields with:**
- `topics[]` — free-form strings (e.g., "concealed carry", "red flag laws", "self defense", "constitutional carry")
- `states[]` — keep as-is, useful for state-level 2A coverage

**Drop:**
- `cases_discussed[]` (name, citation, court objects)
- `court_level[]`, `circuits[]`, `case_status[]`, `federal`

### Books — no schema changes needed

Already generic (title, author, cover, amazon_url, summary, etc.)

## 3. Page & Routing Updates

| Original Route | New Route | Notes |
|---|---|---|
| `/circuits/[circuit]` | Remove | Not needed |
| `/cases/[case]` | Remove | Not needed |
| `/topics/[topic]` | Keep | Primary filter |
| `/articles/[...slug]` | Keep | Core content |
| `/books/[...slug]` | Keep | Unchanged |
| `/videos` | Keep | Unchanged |
| `/search` | Keep | Unchanged |
| `/rss.xml` | Keep | Unchanged |
| `/states/[state]` | Add | State-level filtering |

### Component Updates

- `MetadataSidebar.astro` — Remove cases/circuits sections, show topics and states
- `SearchFilters.astro` — Update filter options to match new schema
- `ChatBot.astro` — Rename "Professor 2A" to "BF Assistant" (placeholder)
- `BaseLayout.astro` — Replace "Four Boxes" branding with "Bearing Freedom" placeholders
- `ArticleCard.astro` — Update metadata display

## 4. Branding Placeholders

All branding is placeholder — design/colors/fonts will be customized later:
- Site title: "Bearing Freedom"
- Author default: "Bearing Freedom"
- Chatbot name: "BF Assistant"
- Keep existing color scheme as placeholder (navy/gold)
- Keep existing fonts as placeholder
- Update `package.json` name and site URL fields

## 5. Claude Code Best Practices

### CLAUDE.md (~100 lines)
- Build/test/lint commands
- Architecture overview (Astro pages → content collections → components)
- Code conventions (TypeScript strict, Astro components, Tailwind utility classes)
- Behavioral rules ("use plan mode for 3+ step tasks", "verify before marking complete")

### Hooks (`.claude/settings.json`)
- **PostToolUse auto-format**: Run Prettier after file edits
- **PreToolUse file protection**: Block edits to `.env`, `package-lock.json`, `.git/`
- **Notification**: Alert when Claude needs input

### Slash Commands (`.claude/commands/`)
- `/dev` — Start dev server
- `/build` — Build and verify
- `/new-article` — Scaffold article with frontmatter template

### Git Setup
- Fresh `.gitignore` (node_modules, dist, .env, .netlify)
- Initial commit with clean fork

## 6. Netlify Configuration

- Keep existing `netlify.toml` (well-configured)
- Update any hardcoded site references
- Chat function preserved, branding updates deferred

## Out of Scope (for now)

- Visual design / branding / color scheme selection
- Actual content creation
- Domain setup
- Chatbot personality/prompt engineering
- Analytics configuration

# Bearing Freedom Site Setup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fork the four-boxes-blog into a clean Bearing Freedom site with simplified content schema, rebranded placeholders, and full Claude Code best-practices toolchain.

**Architecture:** Clone → strip content → update schema → rebrand → remove unused pages → add new pages → set up Claude Code toolchain (CLAUDE.md, hooks, slash commands) → init git repo with initial commit.

**Tech Stack:** Astro 6, TypeScript, Tailwind CSS 4, Netlify, Pagefind, Voyage AI

---

### Task 1: Clone Repo and Strip Content

**Files:**
- Clone: entire `four-boxes-blog` repo into `/Users/memfactor/Desktop/Bearing Freedom Site/`
- Delete: `src/content/articles/*.md` (all 151 articles)
- Delete: `src/content/books/*.md` (all 7 books)
- Delete: `public/images/` contents (article/book thumbnails)
- Delete: `data/` directory (pre-built vector index)
- Delete: `.git/` (detach from original repo)

- [ ] **Step 1: Clone the repo into project directory**

```bash
cd /Users/memfactor/Desktop
git clone https://github.com/memfactorduke/four-boxes-blog.git Bearing-Freedom-Site-tmp
cp -r Bearing-Freedom-Site-tmp/. "Bearing Freedom Site/"
rm -rf Bearing-Freedom-Site-tmp
```

- [ ] **Step 2: Remove old git history and content**

```bash
cd "/Users/memfactor/Desktop/Bearing Freedom Site"
rm -rf .git
rm -rf src/content/articles/*.md
rm -rf src/content/books/*.md
rm -rf public/images/*
rm -rf data/
```

- [ ] **Step 3: Verify clean state**

Run: `ls src/content/articles/ && ls src/content/books/ && ls public/images/ && ls data/ 2>&1`
Expected: Empty directories or "No such file or directory" for data/

---

### Task 2: Update Content Schema

**Files:**
- Modify: `src/content.config.ts`

- [ ] **Step 1: Update articles schema — replace legal fields with simplified fields**

Replace the full content of `src/content.config.ts` with:

```typescript
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    date: z.string(),
    youtube_url: z.string().url(),
    youtube_id: z.string(),
    thumbnail: z.string(),
    duration: z.string(),
    author: z.string().default('Bearing Freedom'),
    topics: z.array(z.string()).default([]),
    states: z.array(z.string()).default([]),
    content_type: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    author: z.string().default('Bearing Freedom'),
    cover_image: z.string(),
    amazon_url: z.string().url(),
    publish_date: z.string(),
    publisher: z.string().optional(),
    pages: z.number().optional(),
    isbn: z.string().optional(),
    summary: z.string(),
    amazon_rating: z.number().optional(),
    amazon_ratings_count: z.number().optional(),
    endorsements: z.array(z.object({
      quote: z.string(),
      source: z.string(),
    })).default([]),
    topics: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
  }),
});

export const collections = { articles, books };
```

- [ ] **Step 2: Verify file saved correctly**

Run: `cat src/content.config.ts | head -5`
Expected: Shows `import { defineCollection, z } from 'astro:content';`

---

### Task 3: Update ArticleCard Component

**Files:**
- Modify: `src/components/ArticleCard.astro`

- [ ] **Step 1: Replace legal_topics and court_level with topics**

Replace the full Props interface and destructuring (lines 1-13) with:

```astro
---
interface Props {
  title: string;
  date: string;
  slug: string;
  thumbnail: string;
  duration: string;
  topics: string[];
  content_type: string[];
}

const { title, date, slug, thumbnail, duration, topics, content_type } = Astro.props;
```

- [ ] **Step 2: Remove court_level display from the card body**

In the card body, remove the court_level conditional block (lines 50-55 in original):
```astro
        {court_level[0] && (
          <>
            <span class="w-1 h-1 rounded-full bg-gray-light"></span>
            <span class="text-[11px] text-navy/60 font-medium">{court_level[0]}</span>
          </>
        )}
```

- [ ] **Step 3: Replace legal_topics with topics in the tag display**

Change `legal_topics.slice(0, 3)` to `topics.slice(0, 3)` in the tag loop at the bottom of the card.

---

### Task 4: Update MetadataSidebar Component

**Files:**
- Modify: `src/components/MetadataSidebar.astro`

- [ ] **Step 1: Replace the entire component with simplified version**

Replace the full content of `src/components/MetadataSidebar.astro` with:

```astro
---
interface Props {
  topics: string[];
  states: string[];
  content_type: string[];
  tags: string[];
  youtube_url: string;
  date: string;
  duration: string;
}

const {
  topics,
  states,
  content_type,
  tags,
  youtube_url,
  date,
  duration,
} = Astro.props;

function formatTopic(topic: string): string {
  return topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

const formattedDate = new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<aside class="rounded-xl border border-gray-100 overflow-hidden">
  <!-- Watch on YouTube CTA -->
  <a
    href={youtube_url}
    target="_blank"
    rel="noopener"
    class="group flex items-center gap-3 bg-navy p-4 text-white hover:bg-navy-light transition-colors"
  >
    <div class="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-gold/20 transition-colors">
      <svg class="w-4 h-4 text-gold" viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.38.55A3.02 3.02 0 00.5 6.19 31.97 31.97 0 000 12a31.97 31.97 0 00.5 5.81 3.02 3.02 0 002.12 2.14c1.88.55 9.38.55 9.38.55s7.5 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.97 31.97 0 0024 12a31.97 31.97 0 00-.5-5.81zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/></svg>
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-sm font-semibold">Watch on YouTube</div>
      <div class="text-[11px] text-white/40">{duration} &middot; {formattedDate}</div>
    </div>
    <svg class="w-4 h-4 text-white/30 group-hover:text-gold group-hover:translate-x-0.5 transition-all shrink-0" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M5 12h14m-7-7 7 7-7 7"/></svg>
  </a>

  <div class="p-5 space-y-6 bg-cream/50">
    <!-- Topics -->
    {topics.length > 0 && (
      <div>
        <h3 class="text-[11px] font-bold text-navy/50 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"/><path d="M6 6h.008v.008H6V6Z"/></svg>
          Topics
        </h3>
        <div class="flex flex-wrap gap-1.5">
          {topics.map(topic => (
            <a href={`/topics/${topic}`} class="bg-gold/10 text-gold-dark px-2.5 py-1 rounded text-[11px] font-semibold hover:bg-gold/20 transition-colors capitalize">
              {formatTopic(topic)}
            </a>
          ))}
        </div>
      </div>
    )}

    <!-- States -->
    {states.length > 0 && (
      <div>
        <h3 class="text-[11px] font-bold text-navy/50 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24"><path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"/></svg>
          States
        </h3>
        <div class="flex flex-wrap gap-1.5">
          {states.map(state => (
            <a href={`/states/${state.toLowerCase().replace(/\s+/g, '-')}`} class="bg-white border border-gray-200 px-2.5 py-1 rounded text-[11px] font-medium text-navy hover:border-gold/50 hover:bg-gold/5 transition-all">
              {state}
            </a>
          ))}
        </div>
      </div>
    )}

    <!-- Content Type -->
    {content_type.length > 0 && (
      <div>
        <h3 class="text-[11px] font-bold text-navy/50 uppercase tracking-[0.15em] mb-3">Content Type</h3>
        <div class="flex flex-wrap gap-1.5">
          {content_type.map(type => (
            <span class="bg-navy text-white px-2.5 py-1 rounded text-[11px] font-semibold capitalize">{type.replace(/-/g, ' ')}</span>
          ))}
        </div>
      </div>
    )}

    <!-- Tags -->
    {tags.length > 0 && (
      <div>
        <h3 class="text-[11px] font-bold text-navy/50 uppercase tracking-[0.15em] mb-3">Tags</h3>
        <div class="flex flex-wrap gap-1.5">
          {tags.map(tag => (
            <span class="bg-white border border-gray-100 px-2 py-0.5 rounded text-[11px] text-gray-warm">{tag}</span>
          ))}
        </div>
      </div>
    )}
  </div>
</aside>
```

---

### Task 5: Update Article Detail Page

**Files:**
- Modify: `src/pages/articles/[...slug].astro`

- [ ] **Step 1: Remove court_level display from article header**

Remove lines 43-47 (the court_level.map block):
```astro
          {data.court_level.map(level => (
            <span class="bg-white/10 text-white/70 text-[10px] font-bold px-2.5 py-1 rounded uppercase tracking-wider">
              {level}
            </span>
          ))}
```

- [ ] **Step 2: Update author avatar initials**

Change the author avatar from hardcoded "MS" to dynamic initials. Replace line 57:
```astro
              <span class="text-[10px] text-gold font-bold">MS</span>
```
With:
```astro
              <span class="text-[10px] text-gold font-bold">{data.author.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}</span>
```

- [ ] **Step 3: Update MetadataSidebar props**

Replace the MetadataSidebar invocation (lines 115-127) with:
```astro
        <MetadataSidebar
          topics={data.topics}
          states={data.states}
          content_type={data.content_type}
          tags={data.tags}
          youtube_url={data.youtube_url}
          date={data.date}
          duration={data.duration}
        />
```

---

### Task 6: Remove Cases and Circuits Pages, Add States Page

**Files:**
- Delete: `src/pages/cases/[case].astro`
- Delete: `src/pages/circuits/[circuit].astro`
- Create: `src/pages/states/[state].astro`

- [ ] **Step 1: Delete cases and circuits pages**

```bash
rm -rf src/pages/cases/
rm -rf src/pages/circuits/
```

- [ ] **Step 2: Create states filter page**

Create `src/pages/states/[state].astro`:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import ArticleCard from '../../components/ArticleCard.astro';
import { getCollection } from 'astro:content';

export async function getStaticPaths() {
  const articles = await getCollection('articles');
  const allStates = [...new Set(articles.flatMap(a => a.data.states))];

  return allStates.map(state => {
    const slug = state.toLowerCase().replace(/\s+/g, '-');
    return {
      params: { state: slug },
      props: {
        stateName: state,
        articles: articles
          .filter(a => a.data.states.includes(state))
          .sort((a, b) => b.data.date.localeCompare(a.data.date)),
      },
    };
  });
}

const { stateName, articles } = Astro.props;
---

<BaseLayout title={stateName} description={`Second Amendment coverage in ${stateName}`}>
  <div class="bg-navy">
    <div class="max-w-7xl mx-auto px-5 lg:px-8 py-12">
      <nav class="text-xs text-white/40 mb-4 flex items-center gap-2 animate-fade-in">
        <a href="/" class="hover:text-gold transition-colors">Home</a>
        <svg class="w-3 h-3 text-white/20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        <span>States</span>
        <svg class="w-3 h-3 text-white/20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg>
        <span class="text-white/60">{stateName}</span>
      </nav>
      <h1 class="font-[Playfair_Display] text-3xl font-bold text-white tracking-tight animate-fade-up">{stateName}</h1>
      <p class="text-white/50 mt-2 text-sm animate-fade-up stagger-1">{articles.length} article{articles.length !== 1 ? 's' : ''}</p>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-5 lg:px-8 py-10">
    <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
      {articles.map((article, i) => (
        <div data-animate class={`stagger-${Math.min(i + 1, 6)}`}>
          <ArticleCard
            title={article.data.title}
            date={article.data.date}
            slug={article.id}
            thumbnail={article.data.thumbnail}
            duration={article.data.duration}
            topics={article.data.topics}
            content_type={article.data.content_type}
          />
        </div>
      ))}
    </div>
  </div>
</BaseLayout>
```

---

### Task 7: Update Topics Pages

**Files:**
- Modify: `src/pages/topics/[topic].astro`
- Modify: `src/pages/topics/index.astro`

- [ ] **Step 1: Update topic detail page to use `topics` instead of `legal_topics`**

In `src/pages/topics/[topic].astro`, change `a.data.legal_topics` to `a.data.topics` on line 8 and line 16. Update the ArticleCard props to pass `topics` instead of `legal_topics` and remove `court_level`:

Replace the ArticleCard invocation with:
```astro
          <ArticleCard
            title={article.data.title}
            date={article.data.date}
            slug={article.id}
            thumbnail={article.data.thumbnail}
            duration={article.data.duration}
            topics={article.data.topics}
            content_type={article.data.content_type}
          />
```

- [ ] **Step 2: Update topics index page to use `topics` instead of `legal_topics`**

In `src/pages/topics/index.astro`, change `article.data.legal_topics` to `article.data.topics` on line 12. Update the description to remove "Second Amendment legal analysis" references:

Change line 23:
```astro
<BaseLayout title="Topics" description="Browse Second Amendment legal analysis by topic">
```
To:
```astro
<BaseLayout title="Topics" description="Browse Bearing Freedom articles by topic">
```

---

### Task 8: Update Home Page

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Replace `legal_topics` references with `topics`**

Change line 11:
```javascript
const allTopics = [...new Set(articles.flatMap(a => a.data.legal_topics))];
```
To:
```javascript
const allTopics = [...new Set(articles.flatMap(a => a.data.topics))];
```

- [ ] **Step 2: Remove `totalCases` stat and update stats bar**

Remove line 12:
```javascript
const totalCases = [...new Set(articles.flatMap(a => a.data.cases_discussed.map(c => c.name)))].length;
```

Replace the stats bar (lines 54-69) with just Articles and Topics:
```astro
          <div class="animate-fade-up stagger-4 flex items-center gap-4 sm:gap-6 mt-10 pt-8 border-t border-white/10">
            <div>
              <div class="text-xl sm:text-2xl font-bold font-[Playfair_Display] text-gold">{articles.length}</div>
              <div class="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">Articles</div>
            </div>
            <div class="w-px h-8 sm:h-10 bg-white/10"></div>
            <div>
              <div class="text-xl sm:text-2xl font-bold font-[Playfair_Display] text-gold">{allTopics.length}</div>
              <div class="text-[10px] sm:text-xs text-white/40 uppercase tracking-wider">Topics</div>
            </div>
          </div>
```

- [ ] **Step 3: Update hero text for Bearing Freedom**

Replace the hero content — change "Constitutional Law" label to "Second Amendment", title to "Bearing Freedom", description to reference the channel. Update YouTube link to placeholder.

- [ ] **Step 4: Update filter bar — replace `court_level` filter with `topics` filter**

Remove the court_level filter buttons (lines 147-152) and replace with topic filters. Change `data-courts` to `data-topics` in article items. Update the `applyFilters` JS to handle `topic:` filters instead of `court:`.

- [ ] **Step 5: Update ArticleCard props throughout home page**

Replace all ArticleCard invocations to pass `topics` instead of `legal_topics` and remove `court_level`:
```astro
          <ArticleCard
            title={article.data.title}
            date={article.data.date}
            slug={article.id}
            thumbnail={article.data.thumbnail}
            duration={article.data.duration}
            topics={article.data.topics}
            content_type={article.data.content_type}
          />
```

---

### Task 9: Update Videos, Search, and RSS Pages

**Files:**
- Modify: `src/pages/videos.astro`
- Modify: `src/pages/search.astro`
- Modify: `src/pages/rss.xml.ts`

- [ ] **Step 1: Update videos page**

In `src/pages/videos.astro`:
- Change `a.data.legal_topics` to `a.data.topics` on line 8
- Change "Four Boxes Diner" to "Bearing Freedom" in descriptions
- Change "Mark W. Smith" to "Bearing Freedom" on line 16
- Remove `court_level` display from video cards (lines 61-65)

- [ ] **Step 2: Update search page**

In `src/pages/search.astro`:
- Change `a.data.legal_topics` to `a.data.topics` on lines 11 and 14
- Change "Second Amendment legal analysis articles" to "Bearing Freedom articles"

- [ ] **Step 3: Update RSS feed**

In `src/pages/rss.xml.ts`:
- Change title from `'The Four Boxes Diner'` to `'Bearing Freedom'`
- Change description to `'Second Amendment commentary and analysis'`

---

### Task 10: Update BaseLayout — Rebrand Navigation and Footer

**Files:**
- Modify: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: Update meta and head**

- Change default description (line 11) from `'Second Amendment legal analysis from The Four Boxes Diner'` to `'Second Amendment commentary and analysis from Bearing Freedom'`
- Change RSS title (line 22) from `"The Four Boxes Diner"` to `"Bearing Freedom"`
- Change `<title>` tag (line 31) from `The Four Boxes Diner` to `Bearing Freedom`
- Remove or comment out GoatCounter analytics script (line 48) — will set up own analytics later

- [ ] **Step 2: Update navigation branding**

- Change logo text from `"4B"` to `"BF"` (line 65)
- Change site name from `"The Four Boxes Diner"` to `"Bearing Freedom"` (line 68)
- Change subtitle from `"Legal Analysis"` to `"2A Commentary"` (line 69)
- Change version to `v0.1.0` (line 71)
- Update YouTube link from `@TheFourBoxesDiner` to a placeholder `#` (line 90)
- Change "Ask Professor 2A" button text to "Ask BF Assistant" (lines 87, 118)
- Change chatbot "2A" badge text to "BF" (lines 88, 119)

- [ ] **Step 3: Update footer**

- Change logo text `"4B"` to `"BF"` (line 145)
- Change `"The Four Boxes Diner"` to `"Bearing Freedom"` (line 148)
- Change `"Est. by Mark W. Smith"` to `"2A Commentary"` (line 149)
- Update description paragraph (line 152)
- Update YouTube link to placeholder (line 170)
- Remove "Official Website" link (line 171)
- Change copyright text (line 179)
- Change legal disclaimer (line 178)

---

### Task 11: Update ChatBot Component

**Files:**
- Modify: `src/components/ChatBot.astro`

- [ ] **Step 1: Rebrand chatbot**

Throughout `src/components/ChatBot.astro`:
- Change `"Professor 2A"` to `"BF Assistant"` in all text
- Change the FAB button text from `"2A"` to `"BF"`
- Change aria-label from `"Open Professor 2A chat"` to `"Open BF Assistant chat"`
- Change `"AI Legal Analysis"` subtitle to `"AI Assistant"`
- Update chat disclaimer text to reference Bearing Freedom instead of Four Boxes

---

### Task 12: Update Package.json and Astro Config

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`

- [ ] **Step 1: Update package.json**

Change:
- `"name"` from `"four-boxes-blog"` to `"bearing-freedom-site"`
- Keep all scripts, dependencies, and engines as-is

- [ ] **Step 2: Update astro.config.mjs**

Change:
- `site` from `'https://2ablog.com'` to `'https://bearingfreedom.com'` (placeholder)

---

### Task 13: Create CLAUDE.md

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Write CLAUDE.md**

Create `CLAUDE.md` in project root:

```markdown
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
```
src/
  content/         # Markdown content collections (articles, books)
  pages/           # Astro page routes
  components/      # Reusable Astro components
  layouts/         # Base layout (nav, footer, head)
  styles/          # global.css with Tailwind theme
netlify/functions/ # Serverless functions (chatbot)
scripts/           # Build-time scripts (search index)
```

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
```

---

### Task 14: Set Up Hooks

**Files:**
- Create: `.claude/settings.json`

- [ ] **Step 1: Create Claude Code hooks config**

Create `.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "npx prettier --write \"$CLAUDE_FILE_PATH\" 2>/dev/null || true"
      }
    ],
    "PreToolUse": [
      {
        "matcher": "Edit|Write",
        "command": "echo \"$CLAUDE_FILE_PATH\" | grep -qE '\\.(env|lock)$|\\.git/' && echo '{\"decision\": \"block\", \"reason\": \"Protected file\"}' || true"
      }
    ],
    "Notification": [
      {
        "command": "osascript -e 'display notification \"Claude Code needs your attention\" with title \"Claude Code\"' 2>/dev/null || true"
      }
    ]
  }
}
```

---

### Task 15: Create Slash Commands

**Files:**
- Create: `.claude/commands/dev.md`
- Create: `.claude/commands/build.md`
- Create: `.claude/commands/new-article.md`

- [ ] **Step 1: Create /dev command**

Create `.claude/commands/dev.md`:

```markdown
Start the Astro dev server. Run `npm run dev` and confirm it starts on localhost:4321.
```

- [ ] **Step 2: Create /build command**

Create `.claude/commands/build.md`:

```markdown
Build and verify the site:
1. Run `npx astro check` to verify types
2. Run `npm run build` to build the site
3. Report any errors found
```

- [ ] **Step 3: Create /new-article command**

Create `.claude/commands/new-article.md`:

```markdown
Create a new article markdown file. Ask for the title if not provided via $ARGUMENTS.

Generate the file at `src/content/articles/YYYY-MM-DD-<slug>.md` with this frontmatter template:

---
title: "<title>"
date: "YYYY-MM-DD"
youtube_url: ""
youtube_id: ""
thumbnail: "/images/<slug>.jpg"
duration: ""
author: "Bearing Freedom"
topics: []
states: []
content_type: ["commentary"]
tags: []
---

Then remind the user to fill in the youtube_url, youtube_id, duration, topics, and tags.
```

---

### Task 16: Install Dependencies and Add Prettier

**Files:**
- Modify: `package.json` (add prettier dev dependency)

- [ ] **Step 1: Install dependencies**

```bash
cd "/Users/memfactor/Desktop/Bearing Freedom Site"
npm install
```

- [ ] **Step 2: Add Prettier for auto-formatting hook**

```bash
npm install --save-dev prettier prettier-plugin-astro
```

- [ ] **Step 3: Create Prettier config**

Create `.prettierrc` in project root:
```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-astro"],
  "overrides": [
    {
      "files": "*.astro",
      "options": {
        "parser": "astro"
      }
    }
  ]
}
```

---

### Task 17: Initialize Git and Create Initial Commit

**Files:**
- Create: `.gitignore` (already exists from clone, verify it's complete)

- [ ] **Step 1: Update .gitignore**

Verify `.gitignore` includes these entries (add if missing):
```
dist/
.astro/
node_modules/
.env
.env.production
.DS_Store
.idea/
.netlify/
```

- [ ] **Step 2: Initialize git repo**

```bash
cd "/Users/memfactor/Desktop/Bearing Freedom Site"
git init
git add -A
git commit -m "Initial commit: Bearing Freedom site forked from four-boxes-blog

Stripped content, simplified schema (removed legal metadata),
rebranded to Bearing Freedom placeholders, added Claude Code
toolchain (CLAUDE.md, hooks, slash commands).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 3: Verify build**

```bash
npx astro check
npm run build
```

Expected: Clean type check and successful build (may warn about empty content collections, which is fine)

---

### Task 18: Create GitHub Repo and Push

- [ ] **Step 1: Create GitHub repo**

```bash
gh repo create memfactorduke/bearing-freedom-site --public --source=. --remote=origin
```

- [ ] **Step 2: Push initial commit**

```bash
git push -u origin main
```

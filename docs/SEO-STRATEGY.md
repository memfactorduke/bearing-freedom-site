# Bearing Freedom SEO Strategy

## Executive summary

Bearing Freedom is a Second Amendment commentary site with 115+ articles, a YouTube-to-article pipeline, and a growing newsletter. The site runs on Astro 6 (static) deployed to Netlify. The competitive advantage is depth on Virginia gun law, a unique video-first content model, and an authentic young voice that fills the gap between paywalled journalism and institutional alerts.

This plan prioritizes technical SEO fixes that unlock Google's rich results, then builds topical authority through a Virginia content fortress, and finally scales with evergreen guides and interactive tools.

## Current state

### What's working

- Clean URL structure: `/articles/[slug]`, `/topics/[topic]`, `/states/[state]`
- Auto-generated sitemap via `@astrojs/sitemap`
- RSS feed at `/rss.xml`
- Canonical URLs on every page
- Open Graph and Twitter Card meta tags
- Strong internal linking (topic pages, state pages, breadcrumbs)
- Pagefind static search
- Fast static site (no server rendering, no ads)
- 115+ articles with consistent Zod-validated frontmatter

### What's missing

- **No JSON-LD structured data** (biggest gap: no Article, Organization, VideoObject, or BreadcrumbList schema)
- **No robots.txt** (relying on Astro defaults)
- **No analytics at all** (zero tracking)
- **No author/about pages** (E-E-A-T gap)
- **og:type hardcoded to "article"** on every page including non-article pages
- **No responsive images** (no srcset/sizes, no WebP)
- **No VideoObject schema** on YouTube embeds
- **No article:published_time OG tags**

## Competitive landscape

### Top competitors

| Site                 | DA       | Publishing pace  | Strength                                          |
| -------------------- | -------- | ---------------- | ------------------------------------------------- |
| NRA-ILA (nraila.org) | ~80      | Daily            | State-by-state bill tracking, institutional trust |
| The Truth About Guns | ~79      | Multiple daily   | Broadest keyword coverage (reviews + politics)    |
| AmmoLand             | ~76      | Daily, 17+ years | Enormous archive, contributor network             |
| Bearing Arms         | ~75      | 5-10/day         | Townhall Media backlink network                   |
| The Reload           | Lower DA | 3-5/week         | Cited by NYT/WSJ, premium E-E-A-T, paywalled      |

### Where Bearing Freedom wins

**1. Virginia depth.** No competitor owns Virginia 2A content. NRA-ILA covers it as one of 50 states. Bearing Freedom already has 40+ Virginia-specific articles and can build an unmatched state-level hub.

**2. Video-to-article double indexing.** Most competitors are text-only. Every Bearing Freedom topic gets indexed on YouTube search AND Google organic. Embedding the video in articles improves dwell time.

**3. Accessible legal explainers.** The Reload is paywalled. Bloomberg Law writes for attorneys. There is a clear gap for "what does Bruen mean for gun owners" content that is authoritative but readable.

**4. Speed on Virginia legislation.** Single-state focus enables same-day coverage when bills are signed or vetoed, before the big outlets react.

**5. Interactive tools.** The Virginia gun law tier list is already a differentiator. Tools earn backlinks and time-on-site that pure article sites cannot match.

## Keyword strategy

### Tier 1: Virginia gun law queries (own these)

- "Virginia gun laws 2026"
- "Virginia concealed carry permit"
- "Virginia assault weapons ban"
- "Virginia ghost gun laws"
- "can I carry a gun in Virginia"
- "Virginia concealed carry reciprocity 2026"
- "Virginia gun buy back program"

### Tier 2: Court case / legal explainers

- "Bruen ruling explained"
- "Bruen what it means for gun owners"
- "assault weapons ban court cases 2026"
- "Second Amendment court cases"

### Tier 3: Practical "can I" queries (high intent, low competition)

- "can I carry in [state]"
- "how to get a concealed carry permit in Virginia"
- "what guns are banned in Virginia"
- "Virginia gun show rules"

### Tier 4: Breaking news / legislative

- "[bill number] Virginia"
- "Spanberger gun control"
- "Virginia gun control bills 2026"

## Content pillars

### 1. Virginia gun law hub (pillar page + spokes)

A comprehensive `/virginia` or `/states/virginia` page that links to all Virginia articles, organized by subtopic: concealed carry, assault weapons, ghost guns, reciprocity, legislative tracker. This becomes the topical authority page.

### 2. Legal explainers (evergreen)

Deep-dive articles on landmark cases: Bruen, Heller, McDonald, Bianchi. Written for gun owners, not lawyers. These pages attract backlinks from forums and other 2A sites.

### 3. State-specific guides (scale later)

Once Virginia is locked down, expand to Maryland, West Virginia, North Carolina. Each gets a hub page + state-specific articles.

### 4. Interactive tools

- Concealed carry reciprocity checker
- "Know your rights" quiz
- State comparison tool
- Expand the tier list concept to other states

### 5. Breaking commentary (the current model)

Continue the YouTube-to-article pipeline for same-day legislative coverage. This is the engine that feeds the other pillars with fresh content.

## E-E-A-T plan

### Experience

- First-person voice already established ("I", "in my view")
- Personal anecdotes from the author's experiences with gun laws
- Video content showing the author discussing issues directly

### Expertise

- Create an author page at `/about/author` with bio, credentials, areas of focus
- Link every article to the author page
- Add Person schema with sameAs links to YouTube, social profiles

### Authoritativeness

- Build backlinks by being first on Virginia gun law news
- Get cited by other 2A outlets (AmmoLand, GOA, FPC)
- Create quotable data (tier list rankings, bill trackers)

### Trustworthiness

- Add editorial policy page explaining the site's commentary nature
- Add corrections page (even if empty, it signals professionalism)
- Clear "this is commentary, not legal advice" disclaimers (already present)
- HTTPS (already via Netlify)

## Technical SEO priorities

### P0: Do immediately

1. Add `robots.txt` with sitemap reference
2. Add JSON-LD Article schema to every article page
3. Add JSON-LD Organization schema to homepage
4. Add `article:published_time` OG meta tag
5. Fix `og:type` to vary by page type (website for home, article for articles)
6. Add analytics (Plausible or Netlify Analytics)

### P1: Do within 2 weeks

7. Add BreadcrumbList schema
8. Add VideoObject schema to YouTube embeds
9. Add author meta tag and link to author page
10. Create robots.txt
11. Create author/about page
12. Add responsive images (srcset/sizes)

### P2: Do within 1 month

13. Create Virginia hub/pillar page
14. Add FAQ schema to legal explainer articles
15. Implement WebP image format
16. Add `llms.txt` for AI crawler accessibility
17. Create editorial policy and corrections pages

## KPI targets

| Metric                             | Baseline (now)         | 3 months           | 6 months            | 12 months           |
| ---------------------------------- | ---------------------- | ------------------ | ------------------- | ------------------- |
| Indexed pages                      | 115                    | 140                | 200                 | 350                 |
| Organic traffic                    | Unknown (no analytics) | Establish baseline | +50% from baseline  | +200% from baseline |
| Newsletter signups/month           | Unknown                | Establish baseline | +100% from baseline | +300% from baseline |
| Google News inclusion              | No                     | Submit             | Included            | Consistent          |
| Rich results (articles)            | 0                      | 100% of articles   | 100%                | 100%                |
| Virginia keyword rankings (top 20) | Unknown                | 10 keywords        | 25 keywords         | 50 keywords         |
| AI citation appearances            | Unknown                | Monitor            | 5+ citations/month  | 15+ citations/month |

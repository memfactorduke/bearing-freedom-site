# SEO Implementation Roadmap

## Phase 1: Foundation (weeks 1-2)

These are zero-content changes that unlock rich results and crawlability immediately.

### 1.1 Add robots.txt

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://bearingfreedom.com/sitemap-index.xml
```

### 1.2 Add JSON-LD Article schema to article pages

Edit `src/pages/articles/[...slug].astro` to inject structured data in the `<head>`:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "{title}",
  "datePublished": "{date}T00:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Bearing Freedom",
    "url": "https://bearingfreedom.com/about"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Bearing Freedom",
    "url": "https://bearingfreedom.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://bearingfreedom.com/favicon.svg"
    }
  },
  "image": "https://bearingfreedom.com{thumbnail}",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://bearingfreedom.com/articles/{slug}"
  }
}
```

### 1.3 Add Organization schema to homepage

Edit `src/pages/index.astro` or `BaseLayout.astro` (conditional on homepage):

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Bearing Freedom",
  "url": "https://bearingfreedom.com",
  "logo": "https://bearingfreedom.com/favicon.svg",
  "sameAs": ["https://www.youtube.com/channel/UCmuwdcAbeBR16b8q6CBUsTw"],
  "description": "Second Amendment commentary and analysis"
}
```

### 1.4 Fix OG meta tags

In `BaseLayout.astro`:

- Change `og:type` from hardcoded `"article"` to dynamic: `"website"` for home/topic/state pages, `"article"` for article pages
- Add `article:published_time` for article pages
- Add `article:author` meta tag

### 1.5 Add analytics

Option A (recommended): Plausible Analytics (privacy-focused, no cookie banner needed, $9/mo)

- Add script tag to BaseLayout.astro: `<script defer data-domain="bearingfreedom.com" src="https://plausible.io/js/script.js"></script>`

Option B: Netlify Analytics (built-in, server-side, $9/mo, no script needed)

- Enable in Netlify dashboard under Site settings > Analytics

Option C (free): Umami self-hosted or cloud free tier

### 1.6 Add BreadcrumbList schema

Already have visual breadcrumbs on article pages. Add the matching schema:

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://bearingfreedom.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Articles",
      "item": "https://bearingfreedom.com/articles"
    },
    { "@type": "ListItem", "position": 3, "name": "{title}" }
  ]
}
```

---

## Phase 2: E-E-A-T and author authority (weeks 3-4)

### 2.1 Create author/about page

Create `src/pages/about.astro` with:

- Author photo and bio
- Areas of expertise (Virginia gun law, Second Amendment litigation, legislative analysis)
- YouTube channel link
- Links to recent articles
- Person schema with `sameAs` links

### 2.2 Create editorial policy page

Create `src/pages/about/editorial-policy.astro`:

- Explain the site is opinion/commentary, not news reporting
- "This is not legal advice" disclosure
- How articles are researched (transcripts + independent research)
- Corrections process

### 2.3 Link author from every article

Add author byline linking to `/about` on each article page. Update the Article schema `author.url` to point to the about page.

### 2.4 Add VideoObject schema

On article pages with embedded YouTube videos, add:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "{title}",
  "description": "{article description}",
  "thumbnailUrl": "https://img.youtube.com/vi/{youtube_id}/maxresdefault.jpg",
  "uploadDate": "{date}T00:00:00Z",
  "contentUrl": "https://www.youtube.com/watch?v={youtube_id}",
  "embedUrl": "https://www.youtube-nocookie.com/embed/{youtube_id}",
  "duration": "PT{duration in ISO}"
}
```

---

## Phase 3: Content fortress (weeks 5-12)

### 3.1 Build Virginia hub page

Create `/states/virginia` as a comprehensive pillar page (not just an article listing):

- Overview of Virginia gun law landscape in 2026
- Section: Current laws (concealed carry, open carry, assault weapons, ghost guns)
- Section: Recent legislation (2026 session summary with links to articles)
- Section: Court challenges (pending litigation)
- Section: Concealed carry guide (permits, reciprocity, restricted locations)
- Internal links to every Virginia-tagged article
- Update monthly

### 3.2 Create evergreen legal explainer articles

Target high-volume, low-competition queries:

- "What does the Bruen ruling mean for gun owners" (1000-1500 words, FAQ schema)
- "Virginia concealed carry permit guide 2026" (step-by-step, how-to schema)
- "Virginia assault weapons ban explained" (what's banned, penalties, exemptions)
- "Virginia ghost gun law: what you need to know" (HB40 explainer)
- "Concealed carry reciprocity: which states honor Virginia permits"

### 3.3 Add FAQ schema to explainer articles

For articles structured as Q&A or "what you need to know":

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Can I carry a concealed weapon in Virginia?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

### 3.4 Implement responsive images

Update the image pipeline to generate WebP versions and add srcset:

- Generate 640w, 960w, 1024w versions of article thumbnails
- Use `<picture>` element with WebP + JPEG fallback
- Add `sizes` attribute for proper responsive loading

### 3.5 Add llms.txt

Create `public/llms.txt` for AI crawler accessibility:

```
# Bearing Freedom
> Second Amendment commentary and analysis

## About
Bearing Freedom covers gun rights, legislation, and court cases with a focus on Virginia.

## Content
- Articles: https://bearingfreedom.com/articles/
- Topics: https://bearingfreedom.com/topics/
- RSS: https://bearingfreedom.com/rss.xml

## Contact
- YouTube: https://www.youtube.com/channel/UCmuwdcAbeBR16b8q6CBUsTw
```

---

## Phase 4: Scale and authority (months 4-12)

### 4.1 Expand to adjacent states

Build hub pages for Maryland, West Virginia, North Carolina. Target:

- "[State] gun laws 2026"
- "[State] concealed carry reciprocity"
- "Can I carry in [state]"

### 4.2 Build interactive tools

- **Concealed carry reciprocity checker**: Select your state, see which states honor your permit. Earns backlinks.
- **"Am I legal?" quiz**: Walk through a scenario, get a plain-English answer. High engagement, shareable.
- **State comparison tool**: Compare gun laws across states side by side.

### 4.3 Newsletter landing page

Create a dedicated `/newsletter` page optimized for:

- "gun rights newsletter"
- "Second Amendment news email"
- Social proof (subscriber count), preview of recent issues

### 4.4 Link building through speed

When Virginia legislation breaks:

1. Publish same-day article via the YouTube pipeline
2. Share on 2A forums (Reddit r/VAGuns, ar15.com, TheHighRoad)
3. Tag relevant accounts on X/Twitter
4. Submit to Google News via News sitemap

Being first and substantive earns natural backlinks from other 2A outlets.

### 4.5 Google News optimization

- Add `news_sitemap.xml` with article publication dates
- Ensure consistent publishing cadence (3+ articles/week)
- Use clear, factual headlines (not YouTube clickbait style)
- Article titles in sentence case (already done)

---

## Implementation checklist

### Week 1

- [ ] Create `public/robots.txt`
- [ ] Add Article JSON-LD schema to `src/pages/articles/[...slug].astro`
- [ ] Add Organization JSON-LD to homepage
- [ ] Fix `og:type` to vary by page
- [ ] Add `article:published_time` OG tag
- [ ] Set up analytics (Plausible or Netlify)

### Week 2

- [ ] Add BreadcrumbList schema
- [ ] Add VideoObject schema to article pages
- [ ] Add author meta tag

### Week 3-4

- [ ] Create `/about` author page with Person schema
- [ ] Create `/about/editorial-policy` page
- [ ] Link author from every article
- [ ] Add author byline component

### Month 2-3

- [ ] Build Virginia hub pillar page
- [ ] Write 5 evergreen legal explainer articles
- [ ] Add FAQ schema to explainers
- [ ] Implement responsive images (WebP + srcset)
- [ ] Create `public/llms.txt`

### Month 4-6

- [ ] Expand to Maryland and West Virginia hubs
- [ ] Build concealed carry reciprocity checker
- [ ] Create newsletter landing page
- [ ] Submit to Google News

### Month 7-12

- [ ] Build remaining interactive tools
- [ ] Expand to 5+ state hubs
- [ ] Target 50 Virginia keyword rankings in top 20
- [ ] Pursue backlink opportunities through original research/data

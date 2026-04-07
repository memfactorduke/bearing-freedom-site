# Article Generation Pipeline for Bearing Freedom

## Overview

Converts YouTube videos from the Bearing Freedom channel into standalone opinion/commentary articles for the Astro blog. Each video becomes a markdown article with frontmatter, editorial content, and an AI-generated stock image.

## Prerequisites

- `yt-dlp` installed (`brew install yt-dlp`)
- `perl` available (for deduplication — macOS awk has issues with `!seen[$0]++`)
- `XAI_API_KEY` env var (for grok-imagine-image stock photos)
- `VOYAGE_API_KEY` env var (for semantic search embeddings)
- Node.js 22+

## Step 1: Get Unprocessed Video IDs

```bash
cd "/Users/memfactor/Desktop/Bearing Freedom Site"

# Build list of already-processed YouTube IDs
grep -h "youtube_id:" src/content/articles/*.md 2>/dev/null | sed 's/.*youtube_id: "//;s/".*//' | sort > /tmp/existing-ids.txt

# Get channel video IDs, filter out existing
yt-dlp --flat-playlist --print "%(id)s" "https://www.youtube.com/channel/UCmuwdcAbeBR16b8q6CBUsTw/videos" \
  | grep -v -F -f /tmp/existing-ids.txt \
  | head -25 > /tmp/new-ids.txt
```

## Step 2: Get Video Metadata

```bash
cat /tmp/new-ids.txt | while read id; do
  yt-dlp --print "%(upload_date)s|%(id)s|%(title)s|%(duration_string)s" \
    "https://www.youtube.com/watch?v=$id" 2>/dev/null
done | tee /tmp/video-meta.txt
```

Output format: `20260406|XT8aYQ7ZzQw|VIDEO TITLE HERE|19:02`

**IMPORTANT:** The dates from yt-dlp are correct. Use them as-is. The current year is 2026. NEVER change a 2026 date to 2025.

## Step 3: Download & Clean Transcripts

```bash
mkdir -p /tmp/bf-transcripts

cat /tmp/new-ids.txt | while read id; do
  # Skip if already cached
  [ -f "/tmp/bf-transcripts/${id}.txt" ] && echo "CACHED: $id" && continue

  # Download auto-generated subtitles
  yt-dlp --write-auto-sub --sub-lang en --sub-format vtt --skip-download \
    -o "/tmp/bf-transcripts/${id}" \
    "https://www.youtube.com/watch?v=${id}" 2>/dev/null

  if [ -f "/tmp/bf-transcripts/${id}.en.vtt" ]; then
    # Clean VTT: remove timestamps, metadata, deduplicate lines
    sed '/^$/d; /^[0-9]/d; /-->/d; /WEBVTT/d; /Kind:/d; /Language:/d' \
      "/tmp/bf-transcripts/${id}.en.vtt" \
      | perl -ne 'print unless $seen{$_}++' \
      > "/tmp/bf-transcripts/${id}.txt"
    echo "OK: ${id} ($(wc -l < /tmp/bf-transcripts/${id}.txt) lines)"
  else
    echo "FAIL: ${id} (no subtitles)"
  fi
done
```

Note: ~2-5% of videos have no auto-generated subtitles. Skip those. Also skip very short videos (<2 min) like holiday greetings or promos.

## Step 4: Generate Articles via Parallel Agents

Launch **sonnet** agents in batches of ~8 articles each. Do NOT use haiku — it produces low-quality writing.

### The Agent Prompt Template

For each batch, provide a list of videos and this exact prompt:

```
Generate N standalone opinion/commentary articles for the Bearing Freedom blog.
Read each transcript and write to the specified file.

VIDEOS:
1. Date: YYYY-MM-DD, ID: VIDEO_ID, Dur: MM:SS, Transcript: /tmp/bf-transcripts/VIDEO_ID.txt, File: /path/to/src/content/articles/YYYY-MM-DD-slug.md
[repeat for each video]

RESEARCH: For each article, use WebSearch to find additional context — recent
court rulings, state legislation, related news — to enrich the piece beyond
what's in the transcript. Cite specific sources where relevant.

EXACT FRONTMATTER SCHEMA (ONLY these fields — NO description, slug, category,
excerpt, draft, featured, subtitle, or any other fields):
---
title: "Strong Editorial Title"
date: "YYYY-MM-DD"
youtube_url: "https://www.youtube.com/watch?v=VIDEO_ID"
youtube_id: "VIDEO_ID"
thumbnail: "/images/articles/FILENAME.jpg"
duration: "MM:SS"
author: "Bearing Freedom"
topics:
  - "concealed-carry"
states:
  - "Texas"
content_type:
  - "commentary"
tags:
  - "Second Amendment"
---

CRITICAL PROCESS:
1. Read the transcript to understand the TOPIC and STANCE only
2. Do NOT follow the video's structure, talking points, or argument order
3. Research the topic independently via WebSearch
4. Write a completely original editorial that stands on its own — a reader
   who never saw the video should find this compelling and complete

CRITICAL WRITING RULES:
1. These are STANDALONE OPINION PIECES. NOT video recaps, NOT transcript
   rewrites, NOT summaries. The video gives you the topic and position.
   You write a fresh editorial from scratch using your own research.
2. VOICE: Knowledgeable but accessible. Strong takes, not hedged. Think
   editorial columnist who knows the law but writes for real people.
   "Here's the thing..." "This is a big deal because..." "Make no mistake..."
3. DO NOT both-sides it. These articles take a clear pro-Second Amendment,
   pro-individual-rights position. Call out bad policy, bad rulings, and
   anti-2A overreach directly.
4. Use first person: "I think..." "In my view..." "What strikes me about
   this is..."
5. NEVER include: YouTube intros, "subscribe", "like and share", "hit the
   bell", channel names, sign-offs, "welcome to", or ANY reference to it
   being a video/show. NEVER reference "the video" or "as discussed."
6. Structure: ## The Bottom Line (2-3 punchy sentences) → --- separator →
   attribution line → --- → then YOUR OWN editorial structure. Use section
   headers that fit the piece. Do NOT use a formulaic template — each
   article should feel like its own unique column.
7. Attribution line: *This article is based on analysis from
   [Bearing Freedom](https://www.youtube.com/channel/UCmuwdcAbeBR16b8q6CBUsTw).
   [Watch the original video](https://www.youtube.com/watch?v=VIDEO_ID).
   This is commentary, not legal advice.*
8. Bold all case names. Include citations where available but don't force
   legalese — "the **Bruen** decision" is fine, full bluebook cite optional.
9. topics must be kebab-case. tags must be Title Case. states are full
   state names.
10. DO NOT generate images. thumbnail path = /images/articles/[same-as-filename].jpg
11. Date must be quoted string: "2026-01-15" not bare 2026-01-15
12. Lean heavily on your research. Pull in stats, legislative history,
    related cases, and recent developments. The transcript is a starting
    point, not the source material.
```

### Key Rules for Agents

- DO NOT let agents generate images — they don't know the xAI pipeline
- DO NOT let agents run `npm run build` — parallel builds conflict
- Provide the video ID, URL, date, and duration in the prompt — agents can't look these up
- Use `run_in_background: true` so they run in parallel

## Step 4b: Humanize Articles

After agents generate articles, run the humanizer skill on each one to strip AI writing patterns. Use `/humanizer` or invoke it directly on each article file.

The humanizer catches: em dash overuse, significance inflation, rule-of-three lists, signposting phrases, negative parallelisms, synonym cycling, bold+colon lists, persuasive authority tropes, and generic dramatic closers.

This step is not optional. AI-generated opinion writing is especially prone to these patterns.

## Step 5: Validate Frontmatter

After all agents complete:

```bash
npm run build 2>&1 | grep -i "error\|invalid\|does not match"
```

Common agent mistakes to check for:
- `pubDate`, `publishDate` instead of `date`
- `videoId`, `video_id` instead of `youtube_id`
- Extra fields: `description`, `excerpt`, `slug`, `category`, `draft`, `featured`, `subtitle`
- `image` instead of `thumbnail`
- Missing `youtube_url` field
- Missing `duration` field
- Unquoted dates
- Thumbnail path with `.md.jpg` instead of `.jpg`
- `legal_topics` instead of `topics` (old schema)
- `cases_discussed`, `court_level`, `circuits` (old schema fields)

Fix any issues before proceeding.

## Step 6: Generate Stock Images

```bash
XAI_API_KEY="your-key" node scripts/generate-article-images.mjs
```

The script:
- Scans all articles for missing thumbnail images
- Reads article content to determine subject matter
- Generates content-aware stock photos via xAI grok-imagine-image
- Only generates missing images (safe to re-run)

## Step 7: Rebuild Vector Search Index

```bash
VOYAGE_API_KEY="your-key" node scripts/build-search-index.mjs
```

- Chunks articles into 150-word overlapping windows (30-word overlap)
- Generates Voyage AI embeddings (voyage-3-lite, 512 dimensions)
- Falls back to TF-IDF if no Voyage key
- Output: `data/article-chunks.json` + `data/vector-index.json`

## Step 8: Build, Commit, Push

```bash
npm run build  # Verify no errors
git add -A
git commit -m "Add N new articles (date range)"
git push origin main
```

The Netlify build also needs `VOYAGE_API_KEY` set so it rebuilds the index on deploy.

## Content Schema Reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| title | string | yes | Strong editorial title, NOT YouTube clickbait |
| date | string | yes | "YYYY-MM-DD" quoted |
| youtube_url | string | yes | Full YouTube URL |
| youtube_id | string | yes | Just the video ID |
| thumbnail | string | yes | /images/articles/FILENAME.jpg |
| duration | string | yes | "MM:SS" |
| author | string | no | Default: "Bearing Freedom" |
| topics | string[] | no | kebab-case |
| states | string[] | no | Full state names |
| content_type | string[] | no | e.g. "commentary", "news-analysis", "deep-dive" |
| tags | string[] | no | Title Case |

## Topic Conventions

**topics (kebab-case):** second-amendment, concealed-carry, constitutional-carry, red-flag-laws, self-defense, assault-weapons-ban, magazine-bans, gun-control, open-carry, stand-your-ground, castle-doctrine, firearms-regulation, supreme-court, bruen, heller, state-preemption, background-checks, ghost-guns, atf, executive-action, sensitive-places, nfa

**tags (Title Case):** Second Amendment, SCOTUS, Bruen, Heller, Constitutional Law, AR-15, Magazine Ban, ATF, DOJ, Concealed Carry, Red Flag Laws, Self Defense, Gun Control, Constitutional Carry, State Rights, Open Carry

## Voice & Tone

Bearing Freedom is a Second Amendment commentary channel. The articles should:

- Be written in first person — "I", "in my view", "what I think"
- Be opinionated and direct — no wishy-washy "both sides have a point" hedging
- Be knowledgeable — cite cases, reference legislation, know the legal landscape
- Be accessible — write for gun owners, not law professors
- Bold all case names: **Bruen**, **Heller**, **McDonald**
- Include specific citations where they add credibility, but don't force legalese
- Take strong positions on gun control, anti-2A legislation, and court rulings
- Connect news and events back to what they mean for gun owners' rights

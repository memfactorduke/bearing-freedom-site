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
# Note: handles BOTH single- and double-quoted youtube_id values. Existing
# articles use single quotes (the agent that wrote them defaulted to single);
# new agent runs default to double. Without the permissive regex, the dedup
# misses the entire single-quoted backlog and reprocesses videos.
grep -h "^youtube_id:" src/content/articles/*.md 2>/dev/null \
  | sed -E "s/^youtube_id:[[:space:]]*[\"']?([^\"']+)[\"']?[[:space:]]*$/\1/" \
  | sort -u > /tmp/existing-ids.txt

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
image_prompt: "a specific, unique, editorial scene description for THIS article"
---

IMAGE PROMPT RULES:
The image_prompt field is critical. It drives the thumbnail image generation.
Each article MUST have a unique, specific image_prompt that an editor would
pick to make someone click on THIS specific story. Think like a photo editor
at a news site choosing the lead image.
- Be SPECIFIC to the article content, not generic
- Describe a real-world scene a photographer could capture
- Include lighting, setting, and mood details
- Every article should have a DIFFERENT image prompt
- Good: "a crowded Virginia statehouse hallway with lobbyists and staffers, fluorescent overhead light, someone carrying a stack of papers, tense atmosphere"
- Good: "a college campus quad at night, empty except for one student walking past a locked bulletin board, cold blue streetlight"
- Good: "close-up of a man's hands field-stripping a Glock on a garage workbench, warm overhead shop light, oil and tools scattered around"
- Bad: "a gun on a table" (boring, generic)
- Bad: "the Virginia state capitol" (same image for every Virginia article)

TRANSCRIPT IDENTITY:
The person speaking in the transcript IS the article author. First person
("I", "my", "me") in the transcript stays first person in the article.
However, the host sometimes plays clips from politicians, news anchors,
or other people. Figure out from context who is speaking. If someone is
being quoted or referenced ("he said", "she argued", "the delegate
stated"), that's a clip — attribute it to the other person. If it's
the main voice giving opinions and analysis, that's the author.

CRITICAL PROCESS:
1. Read the transcript to understand the TOPIC, STANCE, and PERSONAL
   EXPERIENCES the author shares (these are gold — use them)
2. Do NOT follow the video's structure or argument order
3. Research the topic independently via WebSearch
4. Write a fresh piece that stands on its own, but keep the author's
   personal angles and experiences from the transcript

WHO IS THE AUTHOR:
A highly intelligent, passionate, right-wing 22-year-old who knows
gun law, constitutional history, and the political landscape extremely
well. He is genuinely angry about what is happening to the Second
Amendment and to conservative values in America. He writes with
conviction and fire. He is not a journalist and not an academic, but
he is well-read, articulate, and willing to go deep on the substance.
He speaks to his audience as peers who share his values and his fury.

CRITICAL WRITING RULES:
1. STANDALONE PIECES. Not video recaps. The transcript gives you the
   topic, your personal experience with it, and your position. You
   write a fresh, substantive piece using heavy independent research
   to back it up. Aim for 1000-1500 words. Go deep on the facts,
   the legal background, the political context. More substance, more
   research, more depth than a quick hot take.
2. VOICE: Passionate, convicted, direct. This person genuinely cares
   about these issues and it comes through in every paragraph. He is
   slightly more formal than a Reddit post but way less formal than
   a newspaper column. Think: a well-spoken young conservative who
   could hold his own on a panel but would rather just tell you
   straight. Righteous anger, not performative rage.
   BAD: "That's not pluralism. It's gatekeeping dressed up as
   administration." (sounds like AI or a polished journalist)
   GOOD: "They don't want us there. That's really what this comes
   down to, and they've built a system that lets them say no without
   ever having to admit why."
   BAD: "The constitutional implications are significant."
   GOOD: "This is unconstitutional. I don't think that's a close
   call. And the people who wrote this bill know it."
   The voice is real but not sloppy. Impassioned but substantive.
   He backs up his anger with facts, citations, and legal reasoning.
3. DO NOT both-sides it. Deeply pro-2A, pro-individual-rights,
   right-wing. Call out bad policy with force and specificity. Name
   the politicians responsible. Cite the bills by number. Make the
   case aggressively but credibly.
4. First person throughout. "I think", "I've been saying", "what
   concerns me most about this". Keep personal anecdotes from the
   transcript when they exist, they add authenticity.
5. NEVER include: YouTube intros, "subscribe", "like and share",
   channel names, sign-offs, or ANY reference to it being a video.
6. Structure: ## The bottom line (2-3 punchy sentences) → --- →
   attribution → --- → YOUR OWN structure. No formulaic template.
   Each article should feel different. Use section headings that
   are specific to the content, not generic.
7. Attribution line: *This article is based on analysis from
   [Bearing Freedom](https://www.youtube.com/channel/UCmuwdcAbeBR16b8q6CBUsTw).
   [Watch the original video](https://www.youtube.com/watch?v=VIDEO_ID).
   This is commentary, not legal advice.*
8. Bold case names. Include real citations where they strengthen the
   argument. Reference specific bill numbers, vote counts, dates,
   and named legislators. The research should be visible.
9. topics kebab-case, tags Title Case, states full names.
10. DO NOT generate images. thumbnail = /images/articles/[same-as-filename].jpg
11. Dates must be quoted strings.
12. RESEARCH HEAVILY. Every article should contain facts, stats, bill
    numbers, vote tallies, legal precedents, or historical context
    that the reader couldn't get from just watching the video. This
    is what makes the articles valuable as standalone pieces. Pull
    from NRA-ILA, state legislature sites, court filings, FIRE,
    GOA, and news sources. Cite them.
13. NO em dashes. NO rule-of-three. NO signposting phrases. NO negative
    parallelism. NO bold+colon lists. NO title-case headings. NO clever
    workshop-polished turns of phrase. Write like a real person with
    strong convictions, not like a prompt following instructions.
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

| Field        | Type     | Required | Notes                                           |
| ------------ | -------- | -------- | ----------------------------------------------- |
| title        | string   | yes      | Strong editorial title, NOT YouTube clickbait   |
| date         | string   | yes      | "YYYY-MM-DD" quoted                             |
| youtube_url  | string   | yes      | Full YouTube URL                                |
| youtube_id   | string   | yes      | Just the video ID                               |
| thumbnail    | string   | yes      | /images/articles/FILENAME.jpg                   |
| duration     | string   | yes      | "MM:SS"                                         |
| author       | string   | no       | Default: "Bearing Freedom"                      |
| topics       | string[] | no       | kebab-case                                      |
| states       | string[] | no       | Full state names                                |
| content_type | string[] | no       | e.g. "commentary", "news-analysis", "deep-dive" |
| tags         | string[] | no       | Title Case                                      |

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

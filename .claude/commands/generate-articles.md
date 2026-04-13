Generate articles from Bearing Freedom YouTube videos.

Follow the Article Generation Pipeline documented in `docs/article-pipeline.md`.

If $ARGUMENTS contains a number, process that many new videos. Otherwise default to 10.

Steps:

1. Get unprocessed video IDs from the channel
2. Fetch video metadata (dates, titles, durations)
3. Download and clean transcripts
4. Generate articles via parallel sonnet agents (batches of ~8)
5. Validate frontmatter with `npm run build`
6. Generate stock images (if XAI_API_KEY is set)
7. Rebuild vector search index (if VOYAGE_API_KEY is set)
8. Build, verify, and report results

Do NOT commit automatically — report what was generated and let the user review first.

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

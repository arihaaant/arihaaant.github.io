# arihaaant.github.io

Lab-notebook portfolio. Pushes to `main` deploy to GitHub Pages automatically.

## Add an entry

Create `src/content/work/<slug>.md`:

```yaml
---
title: LLM eval platform with CI regression gates
kind: project            # project | case-study | write-up
status: running          # shipped | running | planned | archived
date: 2026-10-15         # where it sits on the timeline
tags: [evals, data]      # evals | data | agents | ml | infra
summary: One or two sentences shown on the timeline.
metrics:                 # optional, first 3 show on the timeline
  - { value: '−2%', label: 'regression blocked by the CI gate' }
stack: [Python, Dagster, Iceberg]
repo: https://github.com/arihaaant/...
period: Sep – Nov 2026   # optional
org: Siemens             # optional
draft: false             # true hides it
---

## Goal
## Setup
## Results
## Errata
```

Entries are numbered automatically, oldest first. Running entries also show in the "On the bench now" line.

## Develop

```bash
npm install
npm run dev
```

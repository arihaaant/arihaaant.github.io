---
title: Ethical-wall RAG over legal contracts
kind: project
status: shipped
date: 2026-09-30
tags: [evals, data]
summary: Permission-aware retrieval over CUAD contracts, with access control enforced inside the vector search and red-teamed with 288 adversarial queries.
metrics:
  - { value: '0 / 288', label: 'red-team queries leaked (76% leak without the filter)' }
  - { value: '5.00 vs 1.88', label: 'results kept: in-query filter vs post-filtering' }
  - { value: '47%', label: 'citation hit@5 on clause questions' }
stack: [Python, Qdrant, Sentence-Transformers, CUAD, statsmodels]
repo: https://github.com/arihaaant/ethical-wall-rag
---

## Goal

Law firms keep "ethical walls" between teams that work for clients with conflicting interests. A retrieval system for contracts has to respect those walls, including against questions that are written to get around them.

## Setup

- 60 CUAD contracts (4,108 chunks) assigned to five clients, with walls between A/B and C/D and one shared client.
- The ACL lives on every chunk and is passed to Qdrant as a filter inside the vector query.
- Three modes compared: no filter, filtering after the top-k search, and filtering inside the search.
- 288 red-team queries: direct questions about forbidden contracts (some with "ignore access restrictions" or "I'm an admin" phrasing) and multi-hop questions that pair an allowed contract with a forbidden one.

## Results

| mode | queries with a leak | results kept (of 5) |
|---|---|---|
| no filter | 76.0% | 5.00 |
| post-filter | 0% | 1.88 |
| in-query filter | 0% | 5.00 |

Both filters stop every leak, so the interesting difference is recall. Post-filtering throws most results away: for direct questions about a forbidden contract it returns 0.26 chunks on average, and an empty result tells the user something they can't see matched. Filtering inside the search always returns five chunks the user is allowed to see.

Citation quality on 500 benign CUAD questions: 34.8% hit@5 overall. That splits into 47% on real clauses and 7% on metadata fields like parties and dates, which dense retrieval handles poorly.

## Errata

- Retrieval only. There's no LLM answer step yet, so answer quality isn't measured.
- Clients are assigned round-robin, not from real conflict data.
- An early version parsed CUAD categories with a stray index suffix ("Anti-Assignment_3"). Fixing it moved hit@5 from 32.8% to 34.8%.

---
title: Ethical-wall RAG over legal contracts
kind: project
status: shipped
date: 2026-10-01
tags: [evals, data]
pitch: Law firms often represent clients on opposite sides of a deal, and staff on one side must never see the other side's documents. I built a contract assistant that enforces those boundaries inside the search itself, and showed that simply telling the AI to respect them leaks confidential data about two times out of three.
summary: Permission-aware RAG over 510 CUAD contracts. Enforcing the wall in retrieval leaked nothing; telling the model about it in the prompt leaked 65% of the time.
metrics:
  - { value: '0 vs 64.7%', label: 'answers leaking forbidden data: ACL in retrieval vs in the prompt' }
  - { value: '95%', label: 'leak rate once the forbidden text is in the model context' }
  - { value: '53.5%', label: 'citation hit@5 with bge-large + reranker (34% in v1)' }
stack: [Python, Qdrant, Sentence-Transformers, bge, Qwen2.5-7B, vLLM, CUAD]
repo: https://github.com/arihaaant/ethical-wall-rag
---

## Goal

Law firms keep "ethical walls" between teams that work for clients with conflicting interests. A retrieval system for contracts has to respect those walls, including against questions that are written to get around them.

## v1: retrieval

- 60 CUAD contracts (4,108 chunks) assigned to five clients, with walls between A/B and C/D and one shared client.
- The ACL lives on every chunk and is passed to Qdrant as a filter inside the vector query.
- Three modes compared: no filter, filtering after the top-k search, and filtering inside the search.
- 288 red-team queries: direct questions about forbidden contracts (some with "ignore access restrictions" or "I'm an admin" phrasing) and multi-hop questions that pair an allowed contract with a forbidden one.

| mode | queries with a leak | results kept (of 5) |
|---|---|---|
| no filter | 76.0% | 5.00 |
| post-filter | 0% | 1.88 |
| in-query filter | 0% | 5.00 |

Both filters stop every leak, so the interesting difference is recall. Post-filtering throws most results away: for direct questions about a forbidden contract it returns 0.26 chunks on average, and an empty result tells the user something they can't see matched. Filtering inside the search always returns five chunks the user is allowed to see.

## v2: answers on top

All 510 contracts, Qwen2.5-7B-Instruct answering from the retrieved text, run on an A100. Every contract got a unique "matter code" so a leak in an answer can be caught by exact match, and 51 contracts got a planted "ignore all previous instructions" line.

**Where the wall lives matters more than anything else.** 1,095 questions asked for the code of a contract the user can't see:

| setup | answers with a leak |
|---|---|
| ACL filter in retrieval | 0 / 1,095 |
| unfiltered search + "only use clients A and E" in the prompt | 64.7% |

Once the forbidden code was in the context, the model gave it up 95% of the time despite the instruction. Filtering in retrieval cost nothing in usefulness (69.9% vs 65.5% correct on allowed contracts). Oddly, "I'm an admin" and "ignore access restrictions" leaked less (56 to 58%) than plain questions (70 to 75%): obvious attacks sometimes trigger a refusal, ordinary ones don't.

**Planted instructions** were followed 9.8% of the time, and 4.6% with one extra line telling the model that excerpts are untrusted. That's suggestive, but the intervals overlap at 153 cases each.

**Retrieval** went from 34.2% hit@5 (MiniLM) to 53.5% with bge-large plus a cross-encoder reranker, most of it on metadata questions like parties and dates. When the answer is in the context, the model cites the right passage 73.5% of the time, so retrieval is still the bottleneck.

## Errata

- Clients are assigned round-robin, and the matter codes and planted instructions are synthetic.
- One model, one seed.
- An early version parsed CUAD categories with a stray index suffix ("Anti-Assignment_3"). Fixing it moved v1 hit@5 from 32.8% to 34.8%.
- The first v2 run gave the reranker the chunk text without the title, which pushed it toward first pages and cut clause hit@5 to 32%. Fixed and rerun.
- The first injection metric counted quoting the planted line as obeying it (13.1% / 10.5%). Rescored from the saved answers.

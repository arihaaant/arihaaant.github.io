---
title: Multi-agent responder for data incidents
kind: project
status: shipped
date: 2026-10-12
tags: [agents, evals, data]
pitch: When a nightly data pipeline breaks, an engineer has to work out what broke, where it started, and whether it is safe to fix or has to go back to whoever owns the data. I built a team of AI agents that does that triage and writes up a fix or an escalation for a person to approve, and tested it on 63 staged incidents. It handled 98% of them, and unlike a single AI agent with the same tools, it never proposed a fix that would have done damage.
summary: LangGraph agents (triage, investigate, fix, review) working on a dbt + DuckDB warehouse through an MCP server. Over three runs of 63 seeded incidents it resolved 98.4%, against 91.5% for a single agent and 33% for dbt alone, and none of its 123 proposed fixes failed the hidden check.
metrics:
  - { value: '98.4%', label: 'incidents resolved, mean of 3 runs (single agent 91.5%, dbt alone 33%)' }
  - { value: '0 vs 10', label: 'bad fixes proposed: multi-agent vs single agent, same model and tools' }
  - { value: '93% vs 73%', label: 'found where the incident started (sign test p = 0.002)' }
stack: [LangGraph, MCP, dbt, DuckDB, sqlglot, gpt-oss-120b, vLLM, Langfuse]
repo: https://github.com/arihaaant/data-incident-responder
---

## Goal

A failed dbt build is a question with several parts: which check fired, where the problem actually started, whether the cause is the incoming data or a model, and whether a change to the warehouse can fix it honestly or the data has to be corrected at the source. The goal was an agent system that answers all of it, never applies anything itself, and can be measured against an answer key.

## Setup

- TPC-H in DuckDB, built with dbt: six staging views with enforced contracts, four marts, 35 checks.
- 63 seeded incidents across renamed or retyped columns, missing values, duplicate rows and late data, each with an answer key. 13 held out during development.
- Four agents in LangGraph. They only see the warehouse through an MCP server: read-only SQL behind a sqlglot guard, lineage from the dbt manifest, a column profiler, and a dry run that builds a patch in a throwaway copy.
- A hidden check the agents never see: a fix only counts if the project builds, the checks are unchanged and the marts match the clean warehouse.
- Baselines: one agent with the same model, tools and budget, and dbt on its own. gpt-oss-120b on vLLM, three runs each.

## Results

| mean of 3 runs | multi-agent | single agent | dbt alone |
|---|---|---|---|
| resolved | 98.4% | 91.5% | 33.3% |
| found where it started | 93.1% | 73.0% | 27.0% |
| held-out resolved (13) | 100% | 94.9% | 38.5% |
| bad fixes proposed | 0 of 123 | 10 of 127 | – |

The single agent gets most incidents right too. The difference is what happens when it's wrong: it submits fixes it has talked itself into, 9 of which didn't even build, and it tries to fix late data that only the source owner can restore. The responder's dry-run gate and reviewer stopped every one of those.

One of the larger gains during development came from a tool rather than a prompt. Both systems kept mishandling type changes, casting prices that had lost their cents or giving up on dates in a different format. A column profiler that checks every value took the responder from 71% to 93% on those incidents.

## Errata

- The 50 development incidents were tuned on over four runs. The 13 held-out ones were resolved in every run, but that's still only 13 incidents.
- One model and one synthetic warehouse. The dry run copies the whole DuckDB file, which a production warehouse would need to replace with a scratch schema.
- Two misses repeat in every run: a missing region key blamed on customers instead of nations, and a date format change attributed to the staging model instead of the source.

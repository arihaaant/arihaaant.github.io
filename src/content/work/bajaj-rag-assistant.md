---
title: Production RAG assistant over 200k+ policy documents
kind: case-study
org: Bajaj Finserv
period: 2023 – 2025
status: shipped
date: 2025-06-01
tags: [evals, agents, data]
summary: A retrieval-augmented knowledge assistant for a regulated lender, adopted by 20+ internal teams daily, with retrieval quality iterated against a curated eval set.
metrics:
  - { value: '200k+', label: 'policy documents indexed' }
  - { value: '20+', label: 'teams using it daily' }
stack: [LangChain, Azure OpenAI, Azure AI Search, Redis, FastAPI]
---

## The problem

Bajaj Finserv is India's largest non-banking financial company. Internal teams needed fast, reliable answers from 200k+ policy documents, in a regulated environment where a wrong or unsourced answer is a real risk.

## What I built

- **Access control before retrieval.** Documents were filtered by the user's access rights *before* they could enter the pipeline. Restricted content never reached the LLM's context, so no prompt, including a prompt-injection attempt, could make the model reveal it.
- **Retrieval layer** on Azure AI Search over the policy corpus.
- **Generation** via Azure OpenAI through LangChain, served as a FastAPI service.
- **Conversation memory** backed by Redis so follow-up questions keep context.
- **Latency tracking**, cut over time with caching.
- **An evaluation loop:** a curated set of evaluation questions plus structured user feedback, used to compare chunking and retrieval changes release over release rather than tuning by feel.

## Results

- Adopted by **20+ teams** for daily use.
- Retrieval quality improved across releases against the curated eval set.
- Access boundaries enforced by construction, not by instructing the model.

## Related work at Bajaj

- **Agentic data-quality monitor** (LangChain Agents, Great Expectations, Azure Data Factory) across 20+ pipelines, auto-generating incident reports for schema drift and anomalies.
- **ETL modernisation:** revamped AWS Glue (PySpark) pipelines for **25% lower cost and 33% faster runtime**; managed analytics pipelines over **1B+ rows** across Azure Synapse and Data Lake.
- **Real-time lead re-engagement** pipeline (Event Hubs + Stream Analytics) that lifted form completions **4%**.

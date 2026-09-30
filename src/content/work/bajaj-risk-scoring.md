---
title: Credit-risk scoring and collections prioritisation at scale
kind: case-study
org: Bajaj Finserv
period: 2022 – 2025
status: shipped
date: 2024-12-01
tags: [ml, data]
summary: An XGBoost risk-scoring pipeline on Databricks with scheduled retraining, extended into a monthly default-prediction model that ranks millions of accounts for collections outreach.
metrics:
  - { value: '+16%', label: 'relative lift in SME portfolio recovery (0.56% → 0.65%)' }
  - { value: '−5%', label: 'relative reduction in default risk' }
  - { value: '+3.2%', label: 'improvement in repayment behaviour' }
stack: [Azure Databricks, XGBoost, Data Factory, Synapse, SQL]
---

## The problem

Collections teams make thousands of outreach calls, and the SME lending portfolio had a recovery rate of 0.56%. Calls were prioritised with a simple rule: longest delinquency and largest outstanding amount first. That rule targets the accounts that look worst on paper, not the ones where a call is most likely to change the outcome.

## What I built

- **Risk-scoring pipeline** on Azure Databricks over 100k+ customer profiles, with scheduled retraining so the model tracks shifts in borrower behaviour.
- **Monthly default-prediction model** scoring millions of accounts, feeding prioritised outreach lists for thousands of collections calls.
- **Production data flow:** pipelines processing millions of rows on a regular schedule, publishing scores and offers to the shared database the backend teams build on.

## Results

- Default risk reduced **5% relative**.
- SME portfolio recovery lifted from **0.56% to 0.65%** (+16% relative).
- Repayment behaviour improved **3.2%** across prioritised accounts.

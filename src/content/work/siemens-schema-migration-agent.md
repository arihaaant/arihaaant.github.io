---
title: Schema-migration agent for a decade of JEDEC JEP30 revisions
kind: case-study
org: Siemens Digital Industries Software
period: May – Aug 2026
status: shipped
date: 2026-08-14
tags: [agents, data]
summary: A multi-agent pipeline that migrates electronic-component files across 12 schema releases, grounded in mappings inferred from ~10,000 production files and validated against each version's XSD.
metrics:
  - { value: '97%', label: 'single-version migration accuracy' }
  - { value: '93%', label: 'full-chain (12 releases) accuracy' }
  - { value: '~10k', label: 'production component files analysed' }
stack: [Python, LLM agents, SciPy, XML/XSD, YAML, C#]
---

## The problem

JEDEC JEP30 PartModel is the industry "digital twin" format for electronic components, backed by 50+ companies including AMD, Intel and NVIDIA. Over a decade it went through 12 schema releases, with fields renamed, split, merged and restructured. Migrating customer data between versions was a manual, UI-driven mapping exercise, and mistakes surfaced as corrupted part data further along the manufacturing process.

## What I built

Two layers: a mapping knowledge base built from real data, and a multi-agent pipeline that uses it to convert files.

**1. Learning the mappings.** The published spec doesn't say where every field went, so I inferred the schema evolution from ~10,000 production component files.

- When several old fields could map to several new ones, candidate pairs were scored and solved as an optimal assignment (Hungarian algorithm via SciPy) rather than greedily.
- The result is a set of YAML rule packs of renames and restructurings. Each rule carries provenance (the files and evidence behind it), so an engineer reviews a diff instead of trusting a black box.

**2. Converting a file.** The design keeps as much work as possible deterministic and gives the LLM only the step that needs judgement:

1. **Extract (deterministic).** Parse the XML and pull out the key values that identify the file.
2. **Route (orchestrator agent).** Work out the source version, which subsections are populated (electrical, thermal, package, …) and the target version, then assign the file to the right workflow.
3. **Gather context (deterministic).** Fetch only the mappings and renames relevant to that version pair and those subsections.
4. **Convert (LLM agent).** Carry out the migration with that focused context.
5. **Validate (deterministic).** Check the output against the target version's XSD. Invalid output never passes.

## Results

- **97%** single-version and **93%** full-chain accuracy.
- Caught real field renames and data-corruption bugs before they reached manufacturing workflows.
- Replaced manual UI-based field mapping with reviewable, versioned rule packs.

I also contributed to a C# rule engine with a web editor that validates files against IPC standards and generates 3D footprints feeding DFM and test-program workflows.

## Errata

- **Not fully deterministic.** Even with narrow context and XSD validation, the conversion agent could produce different outputs for near-identical files. Schema validation catches invalid output, but it can't catch output that is valid and still subtly different.
- **Expensive at batch scale.** An LLM call per file adds up across a large migration. Next time I'd move more of the confident, high-support rules into deterministic transforms and keep the LLM for the ambiguous remainder.

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every notebook entry: open-source projects, industry case studies and write-ups.
// Add a new .md file to src/content/work/ and it appears on the timeline.
const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum(['project', 'case-study', 'write-up']),
    status: z.enum(['shipped', 'running', 'planned', 'archived']),
    date: z.coerce.date(), // placement on the timeline (ship date, or start date if running)
    period: z.string().optional(), // human-readable span, e.g. "2022 – 2025"
    org: z.string().optional(),
    tags: z.array(z.enum(['evals', 'data', 'agents', 'ml', 'infra'])).min(1),
    pitch: z.string().optional(), // the problem and the fix in plain words, shown before the technical summary
    summary: z.string(),
    metrics: z.array(z.object({ value: z.string(), label: z.string() })).default([]),
    stack: z.array(z.string()).default([]),
    repo: z.string().url().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { work };

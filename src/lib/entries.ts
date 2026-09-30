import { getCollection, type CollectionEntry } from 'astro:content';

export type Entry = CollectionEntry<'work'> & { no: string };

/** Published entries, newest first, each numbered in chronological order ("No. 001" = oldest). */
export async function getEntries(): Promise<Entry[]> {
  const all = await getCollection('work', ({ data }) => !data.draft);
  const oldestFirst = [...all].sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  return oldestFirst
    .map((e, i) => ({ ...e, no: String(i + 1).padStart(3, '0') }))
    .reverse();
}

export const STATUS_LABEL = {
  shipped: 'Shipped',
  running: 'Running',
  planned: 'Planned',
  archived: 'Archived',
} as const;

export const KIND_LABEL = {
  project: 'Open source',
  'case-study': 'Industry',
  'write-up': 'Write-up',
} as const;

export const fmtMonth = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });

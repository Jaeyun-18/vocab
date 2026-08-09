import type { Word } from "../types/word";

// Multiple local words pointing at the same Notion page collide on export:
// each PATCH succeeds, but they overwrite one another, so the Notion database
// ends up with fewer distinct pages than the local word count.
export function findDuplicateNotionPageIds(words: Word[]): Word[][] {
  const byPageId = new Map<string, Word[]>();
  for (const word of words) {
    if (!word.notionPageId) continue;
    const group = byPageId.get(word.notionPageId);
    if (group) group.push(word);
    else byPageId.set(word.notionPageId, [word]);
  }
  return [...byPageId.values()].filter((group) => group.length > 1);
}

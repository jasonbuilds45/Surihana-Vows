import type { FamilyPostRow, WeddingRow } from "@/lib/types";

// ─────────────────────────────────────────────────────────────────────────────
// getAnniversaryTimeline
//
// Builds a year-by-year timeline entry for every year from the wedding year
// forward (up to the current year + 2, minimum 3 entries so the vault always
// shows something even before the wedding has happened).
//
// Phase 4.4 change: accepts the real familyPosts array fetched from Supabase
// in family-vault.ts instead of importing demoFamilyPosts. Falls back to
// placeholder text when no post content is available for that year slot.
//
// Matching strategy:
//   1. Look for a post whose created_at year matches the timeline year.
//   2. If multiple posts share that year, use the most recently created one.
//   3. If no post matches, use a year-appropriate placeholder.
// ─────────────────────────────────────────────────────────────────────────────

const PLACEHOLDER_DETAILS = [
  "The vows, the family gathering, and the first chapter of the archive.",
  "A year of new rhythms, shared routines, and the quiet joy of coming home.",
  "Another chapter written together — moments preserved for the years ahead.",
  "The archive grows. Every year a new layer of the story.",
  "Still choosing each other. Still writing the story.",
];

function getPlaceholder(index: number): string {
  return PLACEHOLDER_DETAILS[index % PLACEHOLDER_DETAILS.length] ?? PLACEHOLDER_DETAILS[0];
}

export function getAnniversaryTimeline(
  wedding: WeddingRow,
  familyPosts: FamilyPostRow[] = []
): Array<{ year: string; title: string; detail: string }> {
  const weddingYear = new Date(wedding.wedding_date).getFullYear();
  const currentYear = new Date().getFullYear();

  // Always show at least 3 years; extend to cover the current year + 2
  const totalYears = Math.max(currentYear - weddingYear + 3, 3);
  const years = Array.from({ length: totalYears }, (_, i) => weddingYear + i);

  // Index posts by year for O(1) lookup. Keep only the most-recent post per year.
  const postByYear = new Map<number, FamilyPostRow>();
  for (const post of familyPosts) {
    const postYear = new Date(post.created_at).getFullYear();
    const existing = postByYear.get(postYear);

    if (!existing || new Date(post.created_at) > new Date(existing.created_at)) {
      postByYear.set(postYear, post);
    }
  }

  return years.map((year, index) => {
    const isWeddingYear = index === 0;
    const yearsMarried = index;

    const title = isWeddingYear
      ? "Wedding Year"
      : yearsMarried === 1
        ? "First Anniversary"
        : `${yearsMarried} Year Anniversary`;

    const matchedPost = postByYear.get(year);
    const detail = matchedPost?.content?.trim() || getPlaceholder(index);

    return { year: String(year), title, detail };
  });
}

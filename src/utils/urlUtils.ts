export function generateRecipeSlug(title: string, id: number): string {
  return `${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}-${id}`;
}

export function extractRecipeId(slug: string): string {
  const matches = slug.match(/-(\d+)$/);
  return matches ? matches[1] : slug;
} 
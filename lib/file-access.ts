/**
 * Server-side authoritative version of the gating math that
 * PostDetailClient.tsx uses for display. Given a post's settings and a
 * viewer's access level, decides how many of the (sort_order-ordered)
 * files may have their real file_key/url returned. Anything beyond that
 * count is redacted to a minimal `{ id, post_id, sort_order, locked }`
 * shape — no key, no url — so a locked file can never be reconstructed
 * from the API response, regardless of which endpoint returned it.
 */

interface GatablePost {
  is_nude?: boolean | null;
  is_members_only?: boolean | null;
  is_free_all?: boolean | null;
  free_percent?: number | null;
  forced_members_only?: boolean | null;
}

interface ViewerAccess {
  isOwner: boolean;
  isAdmin: boolean;
  isMember: boolean;
}

export function freeFileCount(post: GatablePost, totalFiles: number, viewer: ViewerAccess): number {
  const canSeeAll = viewer.isOwner || viewer.isAdmin || viewer.isMember;
  if (canSeeAll) return totalFiles;

  const effectiveMembersOnly = !!post.is_members_only || !!post.forced_members_only;
  const gated = effectiveMembersOnly || !!post.is_nude;
  if (!gated) return totalFiles;

  if (post.is_free_all) return totalFiles;

  return Math.max(Math.floor((totalFiles * (post.free_percent || 0)) / 100), 0);
}

export function redactLockedFiles<T extends { id: string; post_id: string; sort_order: number; file_key: string }>(
  files: T[],
  freeCount: number,
  buildUrl: (fileKey: string) => string
): Array<T & { url: string } | { id: string; post_id: string; sort_order: number; locked: true }> {
  return files.map((f, idx) =>
    idx < freeCount
      ? { ...f, url: buildUrl(f.file_key) }
      : { id: f.id, post_id: f.post_id, sort_order: f.sort_order, locked: true as const }
  );
}
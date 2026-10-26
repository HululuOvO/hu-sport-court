// Portfolio mode: only the post-match court is presented.
// Set false to restore the complete site; the preserved modules remain in src/.
export const COURT_ONLY = true;

export function parseShowcaseRoute(hash, fixtures) {
  const route = hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  if (!COURT_ONLY) return route;
  if (route[0] === "courts") return ["courts"];
  if (!route[0]) return [];
  if (route[0] === "court") return route;
  if (route[0] === "match") {
    const match = fixtures.find(m => m.id === route[1]);
    if (match?.state === "finished") return ["court", match.id];
  }
  // Older community, news and ranking bookmarks now open the court lobby.
  return ["courts"];
}

// Prefixes public asset paths with the deployment base path.
// Needed because next/image and plain <img> do not rewrite absolute src
// strings when the app is served from a subpath (GitHub Pages).
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

export function asset(path) {
  return `${BASE_PATH}${path}`;
}

import { ResolverFactory, CachedInputFileSystem } from "enhanced-resolve";
import fs from "node:fs";

// ponytail: enhanced-resolve NUL-escapes "#" in result paths ("\0#") and @tailwindcss/node
// feeds that string straight to fs.readFile → dev crashes when the local path contains "#".
// Vercel paths are clean; this is the official __tw_resolve escape hatch (same lib, same
// options, plus unescape) — delete once the project lives in a "#" free folder.
const resolver = ResolverFactory.createResolver({
  fileSystem: new CachedInputFileSystem(fs, 4000),
  useSyncFileSystemCalls: true,
  extensions: [".css"],
  mainFields: ["style"],
  conditionNames: ["style"],
  modules: ["node_modules"],
});
globalThis.__tw_resolve ??= (id, base) => {
  const p = resolver.resolveSync({}, base, id);
  return typeof p === "string" ? p.replace(/\0(.)/g, "$1") : undefined;
};

const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;

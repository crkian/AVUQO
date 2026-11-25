import {spawnSync} from "node:child_process";
import {pathToFileURL} from "node:url";
const ignored = new Set(["README.md","CHANGELOG.md","docs/AVUQO_ACTIVE_HANDOVER.md","docs/AVUQO_GIT_BRANCH_SOURCE_FEATURE_TRACKER_2026-11-16.md","docs/PROJECT_STATUS.md","docs/AVUQO_PNEUS_COMPACT_STORAGE_PILOT_2026-11-25.md"]);
export function canSkip(paths) {
  return paths.every(p => ignored.has(p) || /^\.github\/workflows\/[^/]+\.ya?ml$/.test(p));
}
export function decision(base, run = (args) => spawnSync("git", args, {encoding:"utf8",maxBuffer:8*1024*1024})) {
  if (!/^[a-f0-9]{40}$/i.test(base || "")) return 1;
  try {
    const ancestry=run(["merge-base","--is-ancestor",base,"HEAD"]);
    if (ancestry.status !== 0) return 1;
    const diff=run(["diff","--name-only","--no-renames","-z",base,"HEAD","--"]);
    if (diff.status !== 0 || typeof diff.stdout !== "string") return 1;
    return canSkip(diff.stdout.split("\0").filter(Boolean)) ? 0 : 1;
  } catch { return 1; }
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode=decision(process.env.VERCEL_GIT_PREVIOUS_SHA);
}

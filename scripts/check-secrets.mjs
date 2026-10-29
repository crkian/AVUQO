// Run on CI to prevent new credential archives or literal secrets being committed.
// Never print a matching line or value to logs.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
const paths = execFileSync("git", ["ls-files","-z"], {encoding:"utf8"}).split("\0").filter(Boolean);
const archive = /(?:^|\/)(?:build|backup|export)(?:[-_.][\w.-]+)?\.(?:zip|tar|tgz|gz)$/i;
const env = /(?:^|\/)(?:\.env(?:\..*)?|[^/]*\.env\.local)$/i;
const secret = /sb_secret_[A-Za-z0-9_-]{24,}/;
const token = /(?:AWIN_ACCESS_TOKEN|SUPABASE_SECRET_KEY|SUPABASE_SERVICE_ROLE_KEY)\s*=\s*["']?(?!REPLACE|EXAMPLE|YOUR_|<)([A-Za-z0-9_.-]{24,})/i;
const bad = [];
for (const path of paths) {
  if (archive.test(path) || (env.test(path) && !/\.example$/i.test(path))) {
    bad.push(path + " (archive/environment file)");
    continue;
  }
  let bytes;
  try { bytes = readFileSync(path); } catch { continue; }
  if (bytes.includes(0)) continue;
  const data = bytes.toString("utf8");
  if (secret.test(data) || token.test(data)) bad.push(path + " (credential pattern)");
}
if (bad.length) {
  process.stderr.write("Secret protection check failed. Investigate these tracked paths without printing credentials:\n");
  bad.forEach(path => process.stderr.write(" - " + path + "\n"));
  process.exitCode = 1;
} else {
  process.stdout.write("Secret protection check passed.\n");
}

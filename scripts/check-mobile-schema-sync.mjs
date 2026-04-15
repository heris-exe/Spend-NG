import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, "..");
const mobileRoot = path.resolve(webRoot, "..", "spendng-mobile");

const webSchemaPath = path.join(webRoot, "supabase", "schema.sql");
const mobileSchemaPath = path.join(mobileRoot, "supabase", "schema.sql");

const hash = (content) =>
  createHash("sha256")
    .update(content.replace(/\r\n/g, "\n"))
    .digest("hex");

const [webSchema, mobileSchema] = await Promise.all([
  readFile(webSchemaPath, "utf8"),
  readFile(mobileSchemaPath, "utf8"),
]);

const webHash = hash(webSchema);
const mobileHash = hash(mobileSchema);

if (webHash === mobileHash) {
  console.log("Schema check passed: mobile schema is in sync with web.");
  console.log(`- web:    ${webSchemaPath}`);
  console.log(`- mobile: ${mobileSchemaPath}`);
  process.exit(0);
}

console.error("Schema check failed: mobile schema is out of sync with web.");
console.error(`- web:    ${webSchemaPath}`);
console.error(`- mobile: ${mobileSchemaPath}`);
console.error("Run `npm run schema:sync-mobile` in spendng-web to update mobile.");
process.exit(1);

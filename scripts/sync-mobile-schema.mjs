import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, "..");
const mobileRoot = path.resolve(webRoot, "..", "spendng-mobile");

const source = path.join(webRoot, "supabase", "schema.sql");
const destinationDir = path.join(mobileRoot, "supabase");
const destination = path.join(destinationDir, "schema.sql");

await mkdir(destinationDir, { recursive: true });
await copyFile(source, destination);

console.log("Synced Supabase schema to spendng-mobile:");
console.log(`- from: ${source}`);
console.log(`- to:   ${destination}`);

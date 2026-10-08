// Preview launcher: membaca APP_PORT dari .env lalu menjalankan `nuxt preview`.
import { existsSync, readFileSync } from "node:fs";
import { spawn } from "node:child_process";

function readEnv(file = ".env") {
  if (!existsSync(file)) return {};
  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^["']|["']$/g, "")];
      })
  );
}

const env = readEnv();
const port = env.APP_PORT || process.env.APP_PORT || "3000";

console.log(`Menjalankan preview di http://localhost:${port}`);

const child = spawn("npx", ["nuxt", "preview", "--port", port], {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 0));

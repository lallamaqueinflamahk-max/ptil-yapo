#!/usr/bin/env node
"use strict";

/**
 * Sube DATABASE_URL desde tu archivo .env a Vercel (Production).
 * Uso: desde la raíz del proyecto, con .env que tenga DATABASE_URL definida:
 *   node scripts/vercel-env-add-database.js
 * o: npm run vercel:env:database
 *
 * Requiere: npx vercel login (una vez) y que el proyecto esté linkeado (vercel link).
 */

const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const envPath = path.join(process.cwd(), ".env");
const envExamplePath = path.join(process.cwd(), ".env.example");

function readDatabaseUrl() {
  if (!fs.existsSync(envPath)) {
    console.error("No se encontró .env en la raíz del proyecto.");
    console.error("Creá .env con DATABASE_URL=postgresql://... (ver .env.example o docs/NEON-SETUP.md)");
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, "utf8");
  const line = content
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.startsWith("DATABASE_URL=") && !l.startsWith("#"));
  if (!line) {
    console.error(".env existe pero no tiene DATABASE_URL.");
    console.error("Agregá una línea: DATABASE_URL=\"postgresql://...\"");
    process.exit(1);
  }
  let value = line.slice("DATABASE_URL=".length).trim();
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }
  if (value.length < 15) {
    console.error("DATABASE_URL en .env parece inválida (muy corta). Revisá la URL de Neon.");
    process.exit(1);
  }
  return value;
}

function runVercelEnvAdd(value) {
  return new Promise((resolve, reject) => {
    const child = spawn("npx", ["vercel", "env", "add", "DATABASE_URL", "production"], {
      stdio: ["pipe", "inherit", "inherit"],
      shell: true,
      cwd: process.cwd(),
    });
    child.stdin.write(value, "utf8", () => {
      child.stdin.end();
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`vercel env add salió con código ${code}`));
    });
    child.on("error", reject);
  });
}

(async () => {
  console.log("Leyendo DATABASE_URL desde .env ...");
  const value = readDatabaseUrl();
  console.log("Subiendo DATABASE_URL a Vercel (Production) ...");
  try {
    await runVercelEnvAdd(value);
    console.log("Listo. DATABASE_URL está en Vercel → Production.");
    console.log("Hacé un Redeploy en Vercel (Deployments → ⋮ → Redeploy) para que tome la variable.");
  } catch (e) {
    console.error("Error:", e.message);
    console.error("Asegurate de: 1) npx vercel login  2) npx vercel link (en este proyecto)");
    process.exit(1);
  }
})();

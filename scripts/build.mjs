#!/usr/bin/env node
// 白标构建：把 src/ 里的单一内容源，按品牌替换占位符，生成一套完整 Mintlify 站点。
// 用法：
//   node scripts/build.mjs            构建全部品牌
//   node scripts/build.mjs paymatrix  只构建指定品牌
import { readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync, statSync, copyFileSync } from "node:fs";
import { join, dirname, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(ROOT, "src");
const BRANDS_DIR = join(ROOT, "brands");
const OUT_ROOT = join(ROOT, "build");

// 需要做文本替换的文件类型；其余（图片等）原样复制。
const TEXT_EXT = new Set([".mdx", ".md", ".mdc", ".yaml", ".yml", ".json"]);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function applyTokens(text, tokens) {
  return text.replace(/\{\{(\w+)\}\}/g, (m, key) => {
    if (!(key in tokens)) return m; // 未知 token 原样保留，交给下方校验报错
    return tokens[key];
  });
}

function buildBrand(brandFile) {
  const brand = JSON.parse(readFileSync(join(BRANDS_DIR, brandFile), "utf8"));
  const { id, tokens, logoDir } = brand;
  const outDir = join(OUT_ROOT, id);
  rmSync(outDir, { recursive: true, force: true });
  mkdirSync(outDir, { recursive: true });

  let leftovers = [];
  for (const file of walk(SRC)) {
    const rel = relative(SRC, file);
    // docs.template.json 输出为 docs.json
    const outRel = rel === "docs.template.json" ? "docs.json" : rel;
    const dest = join(outDir, outRel);
    mkdirSync(dirname(dest), { recursive: true });
    if (TEXT_EXT.has(extname(file))) {
      const replaced = applyTokens(readFileSync(file, "utf8"), tokens);
      const rest = replaced.match(/\{\{\w+\}\}/g);
      if (rest) leftovers.push(`${outRel}: ${[...new Set(rest)].join(", ")}`);
      writeFileSync(dest, replaced);
    } else {
      copyFileSync(file, dest);
    }
  }

  // 复制品牌 logo -> build/<id>/logo/
  const logoOut = join(outDir, "logo");
  mkdirSync(logoOut, { recursive: true });
  for (const f of ["logo-light.png", "logo-dark.png", "icon.png"]) {
    copyFileSync(join(ROOT, logoDir, f), join(logoOut, f));
  }

  if (leftovers.length) {
    console.error(`\n✗ [${id}] 存在未定义的占位符，请在 brands/${id}.json 补充：`);
    for (const l of leftovers) console.error(`    ${l}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ [${id}] -> build/${id}`);
  }
}

const only = process.argv[2];
const brandFiles = readdirSync(BRANDS_DIR).filter((f) => f.endsWith(".json"));
const targets = only ? brandFiles.filter((f) => f === `${only}.json`) : brandFiles;
if (only && targets.length === 0) {
  console.error(`未找到品牌配置 brands/${only}.json`);
  process.exit(1);
}
for (const bf of targets) buildBrand(bf);

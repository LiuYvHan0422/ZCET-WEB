const fs = require("node:fs");
const path = require("node:path");

const target = path.join(
  __dirname,
  "..",
  "node_modules",
  "nuxt",
  "dist",
  "app",
  "composables",
  "manifest.js",
);

const fromDirect = 'manifest = import("#app-manifest");';
const fromViteIgnore = 'manifest = import(/* @vite-ignore */ "#app-manifest");';
const to = 'const manifestId = "#app-manifest";\n    manifest = import(manifestId);';

function run() {
  if (!fs.existsSync(target)) {
    console.log("[postinstall] Skip Nuxt manifest patch (file not found).");
    return;
  }

  const source = fs.readFileSync(target, "utf8");
  if (source.includes('manifest = import(manifestId);')) {
    console.log("[postinstall] Nuxt manifest patch already applied.");
    return;
  }

  let next = source;
  if (source.includes(fromDirect)) {
    next = source.replace(fromDirect, to);
  } else if (source.includes(fromViteIgnore)) {
    next = source.replace(fromViteIgnore, to);
  } else {
    console.log("[postinstall] Skip Nuxt manifest patch (pattern not found).");
    return;
  }

  fs.writeFileSync(target, next, "utf8");
  console.log("[postinstall] Patched Nuxt #app-manifest dynamic import.");
}

run();

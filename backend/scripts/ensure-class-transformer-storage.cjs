const fs = require("fs");
const path = require("path");

const packageDir = path.join(__dirname, "..", "node_modules", "class-transformer");
const shimPath = path.join(packageDir, "storage.js");
const cjsStoragePath = path.join(packageDir, "cjs", "storage.js");

function patchFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  let source = fs.readFileSync(filePath, "utf8");
  let changed = false;

  for (const [from, to] of replacements) {
    if (source.includes(from)) {
      source = source.split(from).join(to);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, source, "utf8");
    console.log(`[postinstall] Patched ${path.relative(process.cwd(), filePath)}`);
  }
}

if (fs.existsSync(packageDir) && !fs.existsSync(shimPath) && fs.existsSync(cjsStoragePath)) {
  fs.writeFileSync(shimPath, 'module.exports = require("./cjs/storage.js");\n');
  console.log("[postinstall] Created class-transformer/storage.js shim");
}

patchFile(path.join(__dirname, "..", "node_modules", "@nestjs", "core", "nest-application.js"), [
  [
    "require('@nestjs/websockets/socket-module')",
    "eval('require')('@nestjs/websockets/socket-module')",
  ],
  [
    "require('@nestjs/websockets/socket' + '-module')",
    "eval('require')('@nestjs/websockets/socket-module')",
  ],
  [
    "require('@nestjs/microservices/microservices-module')",
    "eval('require')('@nestjs/microservices/microservices-module')",
  ],
  [
    "require('@nestjs/microservices/microservices' + '-module')",
    "eval('require')('@nestjs/microservices/microservices-module')",
  ],
  ["require('@nestjs/microservices')", "eval('require')('@nestjs/microservices')"],
  ["require('@nestjs/' + 'microservices')", "eval('require')('@nestjs/microservices')"],
]);

patchFile(path.join(__dirname, "..", "node_modules", "@nestjs", "core", "nest-factory.js"), [
  ["require('@nestjs/microservices')", "eval('require')('@nestjs/microservices')"],
  ["require('@nestjs/' + 'microservices')", "eval('require')('@nestjs/microservices')"],
]);

patchFile(
  path.join(__dirname, "..", "node_modules", "@nestjs", "mapped-types", "dist", "type-helpers.utils.js"),
  [
    ["require('class-transformer/storage')", "eval('require')('class-transformer/storage')"],
    ["require('class-transformer/' + 'storage')", "eval('require')('class-transformer/storage')"],
  ],
);

patchFile(path.join(__dirname, "..", "node_modules", "app-root-path", "browser-shim.js"), [
  [
    "exports.path = require('path').dirname(require.main.filename);",
    "const __arpPath = require('path');\nconst __arpMain = (typeof require.main !== 'undefined' && require.main && require.main.filename) ? require.main.filename : (__arpPath.join(process.cwd(), 'index.js'));\nexports.path = __arpPath.dirname(__arpMain);",
  ],
]);

patchFile(path.join(__dirname, "..", "node_modules", "iconv-lite", "lib", "index.js"), [
  [
    'require("./streams")(iconv);',
    '// Disabled in Workers bundle: stream extension is optional for encode/decode APIs.',
  ],
  [
    'require("./extend-node")(iconv);',
    '// Disabled in Workers bundle: Node extension patching is optional.',
  ],
  [
    'const __iconvStreams = require("./streams");\n        (__iconvStreams && __iconvStreams.default ? __iconvStreams.default : __iconvStreams)(iconv);',
    '// Disabled in Workers bundle: stream extension is optional for encode/decode APIs.',
  ],
  [
    'const __iconvExtendNode = require("./extend-node");\n    (__iconvExtendNode && __iconvExtendNode.default ? __iconvExtendNode.default : __iconvExtendNode)(iconv);',
    '// Disabled in Workers bundle: Node extension patching is optional.',
  ],
]);

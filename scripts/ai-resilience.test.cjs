/* eslint-disable @typescript-eslint/no-require-imports -- Node regression harness. */
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function loadGeminiParser() {
  const out = {};
  const source = fs.readFileSync("src/lib/gemini.ts", "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  vm.runInNewContext(compiled, {
    exports: out,
    require: (name) => ({
      "@google/genai": { GoogleGenAI: class {} },
      "@/lib/cv-json-schema": { CV_JSON_SCHEMA: {} },
      "@/lib/normalize-cv": { normalizeCv: value => value },
      "@/lib/cv-utils": { cvHasContent: () => true },
    })[name] ?? require(name),
    process,
  });
  return out.parseGeminiJson;
}

test("Gemini JSON parser accepts plain, fenced, and narrated objects", () => {
  const parse = loadGeminiParser();
  assert.deepEqual(JSON.parse(JSON.stringify(parse('{"targetLanguage":"TR"}'))), { targetLanguage: "TR" });
  assert.deepEqual(JSON.parse(JSON.stringify(parse('```json\n{"targetLanguage":"EN"}\n```'))), { targetLanguage: "EN" });
  assert.deepEqual(JSON.parse(JSON.stringify(parse('Result:\n{"targetLanguage":"TR"}\nDone'))), { targetLanguage: "TR" });
  assert.throws(() => parse("```json\n```"), /Empty model response|Unexpected/);
});

test("AI errors preserve categories without exposing provider details", async () => {
  const out = {};
  const source = fs.readFileSync("src/lib/request-validation.ts", "utf8");
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText, { exports: out, require, Response, console: { error() {} } });
  const timeout = out.aiErrorResponse(new Error("request timed out with secret query"), "fallback", "TR");
  assert.equal(timeout.status, 504);
  assert.equal((await timeout.json()).code, "AI_TIMEOUT");
  const rate = out.aiErrorResponse(new Error("429 RESOURCE_EXHAUSTED"), "fallback", "EN");
  assert.equal(rate.status, 429);
  assert.equal((await rate.json()).code, "AI_RATE_LIMIT");
});

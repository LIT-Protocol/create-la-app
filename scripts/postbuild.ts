/**
 * Postbuild script to process the lit-action.js file
 * Purpose: Reads the compiled lit-action.js, escapes backticks, and wraps it in a module export
 * Usage: Run after build process to prepare the lit-action code for distribution
 */

import fs from "fs";

console.log("- postbuilding...");
const actionCode = fs.readFileSync("./dist/lit-action.js", "utf-8");
// Escape both backticks and template literal expressions
const escapedActionCode = actionCode
  .replace(/`/g, "\\`")
  .replace(/\${/g, "\\${");
const code = `export const litActionCodeString = \`${escapedActionCode}\`;`;
fs.writeFileSync("./dist/lit-action.js", code);

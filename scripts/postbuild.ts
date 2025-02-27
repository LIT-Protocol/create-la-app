/**
 * Postbuild script to process the lit-action.js file
 * Purpose: Reads the compiled lit-action.js, removes Ajv code, and converts it to a string export
 * Usage: Run after build process to prepare the lit-action code for distribution
 */

import fs from "fs";

console.log("- postbuilding...");
const actionCode = fs.readFileSync("./dist/lit-action.js", "utf-8");

// Create a JavaScript string literal with the code properly escaped
// using JSON.stringify to handle all escaping correctly
const codeAsString = JSON.stringify(actionCode);

// Create a regular string concatenation without template literals
const outputCode = "export const litActionCodeString = " + codeAsString + ";";

fs.writeFileSync("./dist/lit-action.js", outputCode);
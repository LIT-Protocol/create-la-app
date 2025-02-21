import degit from "degit";
import path from "path";

/**
 * Scaffolds a new LA (Lit Action) project by cloning the template
 * @param {string} projectName - The name of the project to create
 * @returns {Promise<void>}
 */
export async function scaffold(projectName = "lit-action-project") {
  const targetDir = path.join(process.cwd(), projectName);

  const emitter = degit("LIT-Protocol/create-la-app", {
    cache: false,
    force: true,
    verbose: true,
  });

  try {
    console.log(`Creating new LA project in ${targetDir}...`);
    await emitter.clone(targetDir);
    console.log(`✨ Project created successfully in ${projectName}!`);
    console.log("\nNext steps:");
    console.log(`1. cd ${projectName}`);
    console.log("2. bun install");
    console.log("3. cp .env.example .env");
    console.log("4. bun run cli");
    console.log("5. bun run watch or bun run start");
    process.exit(0);
  } catch (err) {
    console.error("Error cloning template:", err);
    process.exit(1);
  }
}

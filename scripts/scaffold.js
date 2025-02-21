import degit from "degit";

export async function scaffold() {
  const emitter = degit("your-username/your-template-repo", {
    cache: false,
    force: true,
    verbose: true,
  });

  try {
    await emitter.clone(process.cwd());
    console.log("Project created successfully!");
  } catch (err) {
    console.error("Error cloning template:", err);
  }
}

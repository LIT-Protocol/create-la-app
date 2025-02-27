import fs from 'fs';
import path from 'path';

function disableOrbisSchemaValidation() {
  const filePath = path.join(__dirname, './node_modules/@useorbis/db-sdk/dist/querybuilder/index.js');
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');

    // Find the line with ajv.compile and replace it
    const modifiedContent = fileContent.replace(
      /validate: ajv\.compile\(content\.schema\),/g,
      '// Temporarily disabled "validate: ajv.compile(content.schema)" due to schema validation issues'
    );

    // Write the modified content back to the file
    fs.writeFileSync(filePath, modifiedContent, 'utf8');

    console.log(`✅ Successfully modified file at: ${path.resolve(filePath)}`);
  } catch (error) {
    console.log(`❌ Error modifying file: ${error.message}`);
  }
}

disableOrbisSchemaValidation();

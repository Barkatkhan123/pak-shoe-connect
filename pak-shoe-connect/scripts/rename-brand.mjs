import fs from "fs";
import path from "path";

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (/\.(tsx?|jsx?|json|html|md)$/.test(file)) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const srcFiles = getAllFiles(path.resolve("src"));
let updatedCount = 0;

srcFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf-8");
  let original = content;

  // Replace SherSha -> Anamon
  content = content.replace(/SherSha/g, "Anamon");
  // Replace شیر شاہ -> اینامون
  content = content.replace(/شیر شاہ/g, "اینامون");

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf-8");
    updatedCount++;
    console.log(`Updated ${path.relative(process.cwd(), filePath)}`);
  }
});

console.log(`\n🎉 Total files updated with Anamon branding: ${updatedCount}`);

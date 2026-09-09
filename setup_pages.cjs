const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

// Get all .jsx files in src/pages (excluding directories)
const items = fs.readdirSync(pagesDir);
const files = items.filter(item => {
  return item.endsWith('.jsx') && fs.statSync(path.join(pagesDir, item)).isFile();
});

files.forEach(file => {
  const pageName = path.basename(file, '.jsx');
  const pageDir = path.join(pagesDir, pageName);
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  // Move the .jsx file into the new directory
  const oldPath = path.join(pagesDir, file);
  const newPath = path.join(pageDir, file);
  fs.renameSync(oldPath, newPath);
  
  // Create index.jsx
  const indexPath = path.join(pageDir, 'index.jsx');
  const indexContent = `export { default } from './${pageName}';\n`;
  fs.writeFileSync(indexPath, indexContent);
  
  console.log(`Migrated ${pageName} to ${pageDir}`);
});

console.log('Finished structural preparation.');

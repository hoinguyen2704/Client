const fs = require('fs');
const path = require('path');

const UI_DIR = path.join(__dirname, 'src', 'components', 'ui');
const COMPONENTS_DIR = path.join(__dirname, 'src', 'components');

const moves = {
  // Button
  'PrimaryButton.tsx': 'button',
  'BackButton.tsx': 'button',
  'TrashButton.tsx': 'button',
  'ActionButtons.tsx': 'button',
  // Input
  'FormInput.tsx': 'input',
  'CustomSelect.tsx': 'input',
  // Dialog
  'Modal.tsx': 'dialog',
  'ConfirmDialog.tsx': 'dialog',
  'ProductPickerModal.tsx': 'dialog',
  // Rating
  'StarRating.tsx': 'rating',
  // Loading
  'Skeleton.tsx': 'loading',
  // Product
  'ProductCard.tsx': 'product',
  // Chat
  'Chatbot.tsx': 'chat'
};

// 1. Create target directories
const targetDirs = [...new Set(Object.values(moves))];
for (const dir of targetDirs) {
  const fullPath = path.join(COMPONENTS_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created directory: ${fullPath}`);
  }
}

// 2 & 3. Move files and update internal imports
for (const [file, folder] of Object.entries(moves)) {
  const oldPath = path.join(UI_DIR, file);
  const newPath = path.join(COMPONENTS_DIR, folder, file);

  if (fs.existsSync(oldPath)) {
    let content = fs.readFileSync(oldPath, 'utf8');

    // Update relative imports 
    // They are moving from `src/components/ui` to `src/components/category`, which is still same depth level.
    // So `./types` -> `../ui/types`
    // `./constants` -> `../ui/constants`
    
    // A quick hack using regex to replace local imports from sibling files
    const localImportRegex = /from\s+['"]\.\/([^'"]+)['"]/g;
    content = content.replace(localImportRegex, (match, importedPath) => {
      // If it's importing something that is ALSO moving, we should technically point to the new folder.
      // E.g., `import { Modal } from '.'` inside ProductPickerModal
      if (importedPath === 'types' || importedPath === 'constants') {
         return `from '../ui/${importedPath}'`;
      }
      
      // If importedPath matches a file move
      const importedFile = `${importedPath}.tsx`;
      if (moves[importedFile]) {
         return `from '../${moves[importedFile]}/${importedPath}'`;
      }
      
      // Default: if it's a structural import like '.' or index, check manually later.
      // Usually, just point to '../ui/${importedPath}'
      if (importedPath === '') { // from '.'
         return `from '../ui'`;
      }
      
      return `from '../ui/${importedPath}'`;
    });

    // Special case for '.' imports
    content = content.replace(/from\s+['"]\.\/?['"]/g, "from '../ui'");

    fs.writeFileSync(newPath, content, 'utf8');
    fs.unlinkSync(oldPath);
    console.log(`Moved ${file} to ${folder}/`);
  }
}

// 4. Update ui/index.ts
const indexPath = path.join(UI_DIR, 'index.ts');
if (fs.existsSync(indexPath)) {
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  for (const [file, folder] of Object.entries(moves)) {
    const baseName = file.replace('.tsx', '');
    // export { default as PrimaryButton } from './PrimaryButton';
    // should become -> from '../button/PrimaryButton';
    const rx = new RegExp(`from\\s+['"]\\.\\/${baseName}['"]`, 'g');
    indexContent = indexContent.replace(rx, `from '../${folder}/${baseName}'`);
  }
  
  fs.writeFileSync(indexPath, indexContent, 'utf8');
  console.log(`Updated ui/index.ts barrel file`);
}

console.log('Refactoring script completed!');

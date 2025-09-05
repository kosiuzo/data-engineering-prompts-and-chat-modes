#!/usr/bin/env node

/**
 * Script to fix YAML formatting issues in chat mode files
 */

const fs = require('fs');
const path = require('path');

function fixChatModeFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Fix command descriptions by replacing em dashes with hyphens
    const fixedContent = content
      .replace(/– /g, '- ')
      .replace(/— /g, '- ');
    
    fs.writeFileSync(filePath, fixedContent);
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

function fixAllChatModes() {
  const chatmodesDir = 'chatmodes/de';
  
  if (fs.existsSync(chatmodesDir)) {
    const files = fs.readdirSync(chatmodesDir);
    files.forEach(file => {
      if (file.endsWith('.chatmode.md')) {
        fixChatModeFile(path.join(chatmodesDir, file));
      }
    });
  }
}

console.log('🔄 Fixing YAML formatting in chat mode files...\n');
fixAllChatModes();
console.log('\n✅ Fixing complete!');

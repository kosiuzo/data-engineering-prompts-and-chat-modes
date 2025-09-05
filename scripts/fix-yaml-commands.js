#!/usr/bin/env node

/**
 * Script to fix YAML command formatting in chat mode files
 */

const fs = require('fs');
const path = require('path');

function fixChatModeCommands(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix command descriptions by properly quoting them
    content = content.replace(
      /^(\s*-\s*"[^"]*")\s*-\s*(.+)$/gm,
      '$1 - $2'
    );
    
    // Fix unquoted commands that contain special characters
    content = content.replace(
      /^(\s*-\s*)([^"][^-\n]*<[^>]*>[^-\n]*)\s*-\s*(.+)$/gm,
      '$1"$2" - $3'
    );
    
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed commands in ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

function fixAllChatModeCommands() {
  const chatmodesDir = 'chatmodes/de';
  
  if (fs.existsSync(chatmodesDir)) {
    const files = fs.readdirSync(chatmodesDir);
    files.forEach(file => {
      if (file.endsWith('.chatmode.md')) {
        fixChatModeCommands(path.join(chatmodesDir, file));
      }
    });
  }
}

console.log('🔄 Fixing YAML command formatting in chat mode files...\n');
fixAllChatModeCommands();
console.log('\n✅ Fixing complete!');

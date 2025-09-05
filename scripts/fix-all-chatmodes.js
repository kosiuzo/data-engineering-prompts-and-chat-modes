#!/usr/bin/env node

/**
 * Script to properly fix all chat mode files with correct YAML formatting
 */

const fs = require('fs');
const path = require('path');

const chatModeFiles = [
  'chatmodes/de/analytics-architect.chatmode.md',
  'chatmodes/de/attribution-planner.chatmode.md',
  'chatmodes/de/batch-pipeline-orchestrator.chatmode.md',
  'chatmodes/de/cohort-retention-coach.chatmode.md',
  'chatmodes/de/data-quality-sentinel.chatmode.md',
  'chatmodes/de/devops-data-engineer.chatmode.md',
  'chatmodes/de/experimentation-steward.chatmode.md',
  'chatmodes/de/infrastructure-engineer.chatmode.md',
  'chatmodes/de/streaming-data-specialist.chatmode.md',
  'chatmodes/de/warehouse-optimizer.chatmode.md'
];

function fixChatModeFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Split into front-matter and body
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      console.log(`Skipping ${filePath}: No front-matter found`);
      return;
    }
    
    const frontMatter = match[1];
    const body = content.replace(frontMatterRegex, '');
    
    // Parse and fix the front-matter
    const lines = frontMatter.split('\n');
    const fixedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('commands:')) {
        fixedLines.push(line);
        // Process command lines
        i++;
        while (i < lines.length && lines[i].startsWith('  - ')) {
          const commandLine = lines[i];
          // Extract command and description
          const match = commandLine.match(/^  - "([^"]*)" - (.+)$/);
          if (match) {
            fixedLines.push(`  - "${match[1]}" - ${match[2]}`);
          } else {
            // Handle unquoted commands
            const unquotedMatch = commandLine.match(/^  - ([^-]+) - (.+)$/);
            if (unquotedMatch) {
              fixedLines.push(`  - "${unquotedMatch[1]}" - ${unquotedMatch[2]}`);
            } else {
              fixedLines.push(commandLine);
            }
          }
          i++;
        }
        i--; // Adjust for the loop increment
      } else {
        fixedLines.push(line);
      }
    }
    
    const newFrontMatter = fixedLines.join('\n');
    const newContent = `---\n${newFrontMatter}\n---\n${body}`;
    
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Fixed ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error fixing ${filePath}: ${error.message}`);
  }
}

console.log('🔄 Fixing all chat mode files with proper YAML formatting...\n');

chatModeFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    fixChatModeFile(filePath);
  } else {
    console.log(`⚠️  File not found: ${filePath}`);
  }
});

console.log('\n✅ Fixing complete!');

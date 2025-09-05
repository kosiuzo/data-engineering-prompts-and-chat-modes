#!/usr/bin/env node

/**
 * Script to update prompt files to VS Code format
 * Converts from custom format to VS Code standard format
 */

const fs = require('fs');
const path = require('path');

// VS Code prompt file format mapping
const VSCODE_FORMAT = {
  requiredFields: ['description', 'mode', 'model'],
  optionalFields: ['tools'],
  mode: 'agent', // default mode
  model: 'GPT-4o', // default model
  tools: ['codebase'] // default tools
};

// Function to convert custom format to VS Code format
function convertPromptFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Parse front-matter
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
    const match = content.match(frontMatterRegex);
    
    if (!match) {
      console.log(`Skipping ${filePath}: No front-matter found`);
      return;
    }
    
    const frontMatter = match[1];
    const body = content.replace(frontMatterRegex, '');
    
    // Extract title and intent from custom format
    const titleMatch = frontMatter.match(/title:\s*["']?([^"'\n]+)["']?/);
    const intentMatch = frontMatter.match(/intent:\s*["']?([^"'\n]+)["']?/);
    
    const title = titleMatch ? titleMatch[1] : 'Data Engineering Prompt';
    const intent = intentMatch ? intentMatch[1] : 'Generate data engineering code';
    
    // Convert template variables from {{ var }} to ${input:var}
    let convertedBody = body
      .replace(/\{\{\s*([^}]+)\s*\}\}/g, '${input:$1}')
      .replace(/\{\%\s*for\s+(\w+)\s+in\s+(\w+)\s*\%\}/g, '${input:$2}')
      .replace(/\{\%\s*endfor\s*\%\}/g, '')
      .replace(/\{\%\s*if\s+([^%]+)\s*\%\}/g, '${input:$1}')
      .replace(/\{\%\s*endif\s*\%\}/g, '');
    
    // Create VS Code format front-matter
    const newFrontMatter = `---
description: "${intent}"
mode: "agent"
model: "GPT-4o"
tools: ["codebase"]
---`;

    // Create new content
    const newContent = `${newFrontMatter}

# ${title}

${intent}

${convertedBody}

## Requirements
- Follow data engineering best practices
- Include comprehensive error handling
- Optimize for performance and scalability
- Use appropriate tools and frameworks
- Ensure code is production-ready`;

    // Write back to file
    fs.writeFileSync(filePath, newContent);
    console.log(`✅ Updated ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error updating ${filePath}: ${error.message}`);
  }
}

// Function to process all prompt files
function updateAllPrompts() {
  const promptsDir = 'prompts/de';
  const patternsDir = 'patterns';
  
  // Process prompts directory
  if (fs.existsSync(promptsDir)) {
    const files = fs.readdirSync(promptsDir);
    files.forEach(file => {
      if (file.endsWith('.prompt.md')) {
        convertPromptFile(path.join(promptsDir, file));
      }
    });
  }
  
  // Process patterns directory
  if (fs.existsSync(patternsDir)) {
    const files = fs.readdirSync(patternsDir);
    files.forEach(file => {
      if (file.endsWith('.prompt.md')) {
        convertPromptFile(path.join(patternsDir, file));
      }
    });
  }
}

// Run the conversion
console.log('🔄 Converting prompt files to VS Code format...\n');
updateAllPrompts();
console.log('\n✅ Conversion complete!');

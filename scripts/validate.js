#!/usr/bin/env node

/**
 * Validation script for Awesome Copilot: Data Engineering Edition
 * 
 * This script validates:
 * - File naming conventions
 * - Front-matter metadata consistency
 * - Required fields presence
 * - File structure compliance
 * 
 * Usage: node scripts/validate.js [--fix] [--verbose]
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

// Configuration
const CONFIG = {
  prompts: {
    dir: 'prompts/de',
    pattern: /\.prompt\.md$/,
    requiredFields: ['description', 'mode', 'model'],
    optionalFields: ['tools']
  },
  chatmodes: {
    dir: 'chatmodes/de',
    pattern: /\.chatmode\.md$/,
    requiredFields: ['name', 'description', 'capabilities', 'boundaries'],
    optionalFields: ['commands', 'activation']
  },
  instructions: {
    dir: 'instructions/de',
    pattern: /\.instructions\.md$/,
    requiredFields: ['name', 'globs', 'rules'],
    optionalFields: ['autofix_hints']
  },
  patterns: {
    dir: 'patterns',
    pattern: /^pattern-.*\.prompt\.md$/,
    requiredFields: ['description', 'mode', 'model'],
    optionalFields: ['tools']
  }
};

// Validation results
let validationResults = {
  errors: [],
  warnings: [],
  fixed: [],
  summary: {
    totalFiles: 0,
    validFiles: 0,
    errorFiles: 0,
    warningFiles: 0
  }
};

/**
 * Parse front-matter from markdown file
 */
function parseFrontMatter(content) {
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    return null;
  }
  
  try {
    return yaml.load(match[1]);
  } catch (error) {
    throw new Error(`Invalid YAML front-matter: ${error.message}`);
  }
}

/**
 * Validate file naming convention
 */
function validateFileName(filePath, config) {
  const fileName = path.basename(filePath);
  const isValid = config.pattern.test(fileName);
  
  if (!isValid) {
    validationResults.errors.push({
      file: filePath,
      type: 'naming',
      message: `File name does not match pattern: ${config.pattern}`
    });
    return false;
  }
  
  return true;
}

/**
 * Validate front-matter metadata
 */
function validateFrontMatter(filePath, content, config) {
  try {
    const frontMatter = parseFrontMatter(content);
    
    if (!frontMatter) {
      validationResults.errors.push({
        file: filePath,
        type: 'frontmatter',
        message: 'Missing or invalid front-matter'
      });
      return false;
    }
    
    let isValid = true;
    
    // Check required fields
    for (const field of config.requiredFields) {
      if (!frontMatter[field]) {
        validationResults.errors.push({
          file: filePath,
          type: 'required_field',
          message: `Missing required field: ${field}`
        });
        isValid = false;
      }
    }
    
    // Check field types
    if (frontMatter.inputs && !Array.isArray(frontMatter.inputs)) {
      validationResults.errors.push({
        file: filePath,
        type: 'field_type',
        message: 'inputs field must be an array'
      });
      isValid = false;
    }
    
    if (frontMatter.capabilities && !Array.isArray(frontMatter.capabilities)) {
      validationResults.errors.push({
        file: filePath,
        type: 'field_type',
        message: 'capabilities field must be an array'
      });
      isValid = false;
    }
    
    if (frontMatter.rules && !Array.isArray(frontMatter.rules)) {
      validationResults.errors.push({
        file: filePath,
        type: 'field_type',
        message: 'rules field must be an array'
      });
      isValid = false;
    }
    
    // Check for unknown fields
    const allFields = [...config.requiredFields, ...config.optionalFields];
    for (const field of Object.keys(frontMatter)) {
      if (!allFields.includes(field)) {
        validationResults.warnings.push({
          file: filePath,
          type: 'unknown_field',
          message: `Unknown field: ${field}`
        });
      }
    }
    
    return isValid;
    
  } catch (error) {
    validationResults.errors.push({
      file: filePath,
      type: 'frontmatter',
      message: error.message
    });
    return false;
  }
}

/**
 * Validate file content structure
 */
function validateContent(filePath, content, config) {
  let isValid = true;
  
  // Check for required sections based on file type
  if (config.pattern.test(filePath)) {
    // VS Code format doesn't require specific content sections
    // These are optional and not part of the VS Code specification
    
    if (filePath.includes('instructions.md')) {
      // Check for rules section
      if (!content.includes('rules:') && !content.includes('rules =')) {
        validationResults.warnings.push({
          file: filePath,
          type: 'content_structure',
          message: 'Missing rules section'
        });
      }
    }
  }
  
  return isValid;
}

/**
 * Process a single file
 */
function processFile(filePath, config) {
  validationResults.summary.totalFiles++;
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let isValid = true;
    
    // Validate file naming
    if (!validateFileName(filePath, config)) {
      isValid = false;
    }
    
    // Validate front-matter
    if (!validateFrontMatter(filePath, content, config)) {
      isValid = false;
    }
    
    // Validate content structure
    if (!validateContent(filePath, content, config)) {
      isValid = false;
    }
    
    if (isValid) {
      validationResults.summary.validFiles++;
    } else {
      validationResults.summary.errorFiles++;
    }
    
  } catch (error) {
    validationResults.errors.push({
      file: filePath,
      type: 'file_error',
      message: `Error reading file: ${error.message}`
    });
    validationResults.summary.errorFiles++;
  }
}

/**
 * Process directory
 */
function processDirectory(dirPath, config) {
  if (!fs.existsSync(dirPath)) {
    validationResults.warnings.push({
      file: dirPath,
      type: 'directory',
      message: `Directory does not exist: ${dirPath}`
    });
    return;
  }
  
  const files = fs.readdirSync(dirPath);
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath, config);
    } else if (config.pattern.test(file)) {
      processFile(filePath, config);
    }
  }
}

/**
 * Generate validation report
 */
function generateReport() {
  console.log('\n=== Validation Report ===\n');
  
  console.log(`Total files processed: ${validationResults.summary.totalFiles}`);
  console.log(`Valid files: ${validationResults.summary.validFiles}`);
  console.log(`Files with errors: ${validationResults.summary.errorFiles}`);
  console.log(`Files with warnings: ${validationResults.warnings.length}`);
  
  if (validationResults.errors.length > 0) {
    console.log('\n=== Errors ===');
    validationResults.errors.forEach(error => {
      console.log(`❌ ${error.file}: ${error.message}`);
    });
  }
  
  if (validationResults.warnings.length > 0) {
    console.log('\n=== Warnings ===');
    validationResults.warnings.forEach(warning => {
      console.log(`⚠️  ${warning.file}: ${warning.message}`);
    });
  }
  
  if (validationResults.fixed.length > 0) {
    console.log('\n=== Fixed ===');
    validationResults.fixed.forEach(fix => {
      console.log(`✅ ${fix.file}: ${fix.message}`);
    });
  }
  
  console.log('\n=== Summary ===');
  if (validationResults.errors.length === 0) {
    console.log('✅ All files passed validation!');
  } else {
    console.log(`❌ ${validationResults.errors.length} files have errors that need to be fixed.`);
  }
  
  if (validationResults.warnings.length > 0) {
    console.log(`⚠️  ${validationResults.warnings.length} files have warnings.`);
  }
}

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose');
  const fix = args.includes('--fix');
  
  console.log('🔍 Validating Awesome Copilot: Data Engineering Edition...\n');
  
  // Process each asset type
  for (const [assetType, config] of Object.entries(CONFIG)) {
    if (verbose) {
      console.log(`Processing ${assetType}...`);
    }
    
    processDirectory(config.dir, config);
  }
  
  // Generate report
  generateReport();
  
  // Exit with error code if there are errors
  if (validationResults.errors.length > 0) {
    process.exit(1);
  }
}

// Run validation
if (require.main === module) {
  main();
}

module.exports = {
  validateFile: processFile,
  validateDirectory: processDirectory,
  generateReport
};

#!/usr/bin/env tsx
/**
 * Code quality checker for pre-push hook
 * Checks for common issues like console.log, debugger statements, etc.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, extname, relative } from 'path';
import { execSync } from 'child_process';

const ALLOWED_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];
const IGNORE_PATTERNS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '.husky',
  'scripts/check-code-quality.ts', // Don't check this file itself
];

interface Issue {
  file: string;
  line: number;
  message: string;
}

const issues: Issue[] = [];

function shouldIgnoreFile(filePath: string): boolean {
  return IGNORE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

function hasEslintDisable(lines: string[], currentIndex: number): boolean {
  const currentLine = lines[currentIndex].trim();
  const prevLine = currentIndex > 0 ? lines[currentIndex - 1].trim() : '';
  
  // Check if current line or previous line has eslint-disable
  return (
    currentLine.includes('// eslint-disable') ||
    prevLine.includes('// eslint-disable-next-line') ||
    prevLine.includes('// eslint-disable-line')
  );
}

function checkFile(filePath: string): void {
  if (shouldIgnoreFile(filePath)) return;

  const ext = extname(filePath);
  if (!ALLOWED_EXTENSIONS.includes(ext)) return;

  try {
    const content = readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmedLine = line.trim();

      // Skip if eslint-disable is present (current line or previous line)
      if (hasEslintDisable(lines, index)) return;

      // Check for console.log (but allow console.error, console.warn for error handling)
      if (/console\.(log|debug|info)\(/.test(trimmedLine)) {
        issues.push({
          file: filePath,
          line: lineNum,
          message: `Found console.${trimmedLine.match(/console\.(\w+)/)?.[1]} - remove before pushing to production`,
        });
      }

      // Check for debugger statements
      if (/\bdebugger\b/.test(trimmedLine)) {
        issues.push({
          file: filePath,
          line: lineNum,
          message: 'Found debugger statement - remove before pushing',
        });
      }
    });
  } catch (error) {
    // Skip files that can't be read (permissions, etc.)
  }
}

function walkDirectory(dir: string): void {
  try {
    const files = readdirSync(dir);

    for (const file of files) {
      const filePath = join(dir, file);

      if (shouldIgnoreFile(filePath)) continue;

      try {
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
          walkDirectory(filePath);
        } else if (stat.isFile()) {
          checkFile(filePath);
        }
      } catch {
        // Skip files/dirs we can't access
      }
    }
  } catch {
    // Skip directories we can't read
  }
}

// Get changed files (staged + modified) or check all files
const srcDir = join(process.cwd(), 'src');
const checkOnlyChanged = process.argv.includes('--changed-only') || process.argv.includes('--staged-only');

let filesToCheck: string[] = [];

if (checkOnlyChanged) {
  try {
    // Get staged files
    const stagedFiles = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    // Get modified files (not staged)
    const modifiedFiles = execSync('git diff --name-only --diff-filter=ACM', { encoding: 'utf-8' })
      .split('\n')
      .filter(Boolean);
    
    // Combine and filter to only src files
    const allChangedFiles = [...new Set([...stagedFiles, ...modifiedFiles])];
    filesToCheck = allChangedFiles
      .filter(file => file.startsWith('src/') && ALLOWED_EXTENSIONS.includes(extname(file)))
      .map(file => join(process.cwd(), file));
    
    if (filesToCheck.length === 0) {
      console.log('✅ No changed files to check. Skipping code quality check.');
      process.exit(0);
    }
    
    console.log(`📝 Checking ${filesToCheck.length} changed file(s)...\n`);
  } catch (error) {
    // If not a git repo or git command fails, fall back to checking all files
    console.warn('⚠️  Could not get changed files, checking all files in src/...\n');
    walkDirectory(srcDir);
    filesToCheck = [];
  }
}

if (filesToCheck.length > 0) {
  // Check only changed files
  filesToCheck.forEach(file => {
    if (existsSync(file)) {
      checkFile(file);
    }
  });
} else {
  // Check all files in src directory
  walkDirectory(srcDir);
}

if (issues.length > 0) {
  // Show first 20 issues to avoid overwhelming output
  const issuesToShow = issues.slice(0, 20);
  const remaining = issues.length - issuesToShow.length;

  console.error('\n❌ Code quality issues found:\n');
  issuesToShow.forEach((issue) => {
    console.error(`  ${issue.file}:${issue.line} - ${issue.message}`);
  });
  
  if (remaining > 0) {
    console.error(`  ... and ${remaining} more issue(s)\n`);
  }
  
  console.error(`\n❌ Found ${issues.length} total issue(s). Please fix before pushing.\n`);
  console.error('💡 How to fix:');
  console.error('   1. Remove console.log/debugger statements');
  console.error('   2. Or add // eslint-disable-next-line above the line to allow it');
  console.error('   3. Or skip this check: SKIP_CODE_QUALITY=true git push\n');
  // Exit with 1 (error) to block push
  process.exit(1);
} else {
  console.log('✅ No code quality issues found!');
  process.exit(0);
}

/**
 * Parse a Slidev markdown file to extract slide boundaries and speaker notes.
 *
 * Returns an array of { index, note } where index is 0-based and note is the
 * raw markdown string of the speaker notes (empty string if none).
 */
export function parseSlides(markdown) {
  const lines = markdown.split('\n');
  const blocks = splitIntoBlocks(lines);

  // Detect and skip global YAML front matter.
  // Front matter looks like: ---\nkey: value\n---
  // After splitting by ---, this produces block 0 (empty) + block 1 (YAML).
  let startIndex = 0;
  if (
    blocks.length >= 2 &&
    isBlankBlock(blocks[0]) &&
    isYamlBlock(blocks[1])
  ) {
    startIndex = 2;
  }

  // Merge per-slide YAML config blocks with their following content blocks.
  // In Slidev, a slide can have: ---\nlayout: foo\n---\ncontent
  // This appears as a YAML-only block followed by a content block.
  const mergedBlocks = [];
  for (let i = startIndex; i < blocks.length; i++) {
    if (isYamlBlock(blocks[i]) && i + 1 < blocks.length) {
      // Per-slide YAML config — merge with the next content block
      mergedBlocks.push([...blocks[i], ...blocks[i + 1]]);
      i++; // skip next block, it's now merged
    } else {
      mergedBlocks.push(blocks[i]);
    }
  }

  const slides = [];
  for (const block of mergedBlocks) {
    const note = extractNote(block);
    slides.push({ index: slides.length, note });
  }

  return slides;
}

/**
 * Split lines into blocks separated by `---` on its own line.
 */
function splitIntoBlocks(lines) {
  const blocks = [];
  let current = [];

  for (const line of lines) {
    if (isSeparator(line)) {
      blocks.push(current);
      current = [];
    } else {
      current.push(line);
    }
  }
  // Push the last block if it has content
  if (current.length > 0) {
    blocks.push(current);
  }

  return blocks;
}

function isSeparator(line) {
  return /^---\s*$/.test(line.trimEnd());
}

function isBlankBlock(block) {
  return !block || block.length === 0 || block.every(l => l.trim() === '');
}

/**
 * Detect whether a block is purely YAML key-value pairs (and blank lines).
 */
function isYamlBlock(block) {
  if (!block || block.length === 0) return false;
  const nonEmpty = block.filter(l => l.trim() !== '');
  if (nonEmpty.length === 0) return false;
  return nonEmpty.every(line => /^[\w-]+\s*:/.test(line.trim()));
}

/**
 * Extract speaker notes from a slide block.
 * Supports both HTML comment syntax and triple-colon syntax.
 * Only returns notes from multi-line comment blocks (not single-line HTML comments
 * used as labels like <!-- Slide 1 — Title -->).
 */
function extractNote(block) {
  // Try multi-line comment syntax: <!-- ... -->
  const commentNote = extractCommentNote(block);
  if (commentNote !== null) return commentNote;

  // Try colon syntax: ::: ... :::
  const colonNote = extractColonNote(block);
  if (colonNote !== null) return colonNote;

  return '';
}

function extractCommentNote(block) {
  let inComment = false;
  const noteLines = [];

  for (const line of block) {
    const trimmed = line.trimEnd();
    if (!inComment && /^\s*<!--\s*$/.test(trimmed)) {
      inComment = true;
      continue;
    }
    if (!inComment && /^\s*<!--/.test(trimmed)) {
      // Single-line comment or comment start with content on same line
      inComment = true;
      const content = trimmed.replace(/^\s*<!--/, '').replace(/-->\s*$/, '');
      if (/-->\s*$/.test(trimmed)) {
        // Single-line comment — skip, these are slide labels not notes
        inComment = false;
        continue;
      }
      if (content.trim()) noteLines.push(content);
      continue;
    }
    if (inComment && /-->\s*$/.test(trimmed)) {
      const content = trimmed.replace(/-->\s*$/, '');
      if (content.trim()) noteLines.push(content);
      inComment = false;
      continue;
    }
    if (inComment) {
      noteLines.push(line);
    }
  }

  return noteLines.length > 0 ? noteLines.join('\n').trim() : null;
}

function extractColonNote(block) {
  let inColon = false;
  const noteLines = [];

  for (const line of block) {
    const trimmed = line.trimEnd();
    if (!inColon && /^\s*:::\s*$/.test(trimmed)) {
      inColon = true;
      continue;
    }
    if (inColon && /^\s*:::\s*$/.test(trimmed)) {
      inColon = false;
      continue;
    }
    if (inColon) {
      noteLines.push(line);
    }
  }

  return noteLines.length > 0 ? noteLines.join('\n').trim() : null;
}

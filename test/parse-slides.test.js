import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseSlides } from '../src/parse-slides.js';

const fixture = readFileSync(
  new URL('./fixtures/sample-slides.md', import.meta.url),
  'utf-8',
);

describe('parseSlides', () => {
  it('extracts the correct number of slides from the fixture', () => {
    const slides = parseSlides(fixture);
    expect(slides).toHaveLength(4);
  });

  it('skips YAML front matter', () => {
    const slides = parseSlides(fixture);
    // First slide should be "Welcome", not the front matter
    expect(slides[0].index).toBe(0);
  });

  it('extracts comment-syntax notes', () => {
    const slides = parseSlides(fixture);
    expect(slides[0].note).toContain('notes for the title slide');
    expect(slides[0].note).toContain('**bold**');
    expect(slides[0].note).toContain('*italic*');
  });

  it('extracts colon-syntax notes', () => {
    const slides = parseSlides(fixture);
    expect(slides[1].note).toContain('Notes for slide two');
    expect(slides[1].note).toContain('- A list in the notes');
  });

  it('returns empty string for slides with no notes', () => {
    const slides = parseSlides(fixture);
    expect(slides[2].note).toBe('');
  });

  it('preserves markdown formatting in notes', () => {
    const slides = parseSlides(fixture);
    expect(slides[3].note).toContain('[this link](https://example.com)');
  });

  it('assigns sequential zero-based indices', () => {
    const slides = parseSlides(fixture);
    slides.forEach((slide, i) => {
      expect(slide.index).toBe(i);
    });
  });

  it('handles a file with no front matter', () => {
    const md = `# Slide One

<!--
Note one
-->

---

# Slide Two`;
    const slides = parseSlides(md);
    expect(slides).toHaveLength(2);
    expect(slides[0].note).toBe('Note one');
    expect(slides[1].note).toBe('');
  });

  it('handles empty slides between separators', () => {
    const md = `---
theme: default
---

# First

---

---

# After empty`;
    const slides = parseSlides(md);
    // Should have 3 slides: First, empty, After empty
    expect(slides).toHaveLength(3);
    expect(slides[1].note).toBe('');
  });

  it('merges per-slide YAML config with content', () => {
    const md = `---
theme: default
---

# Slide One

---
layout: section
---

## Section Title

<!--
Notes for section slide
-->`;
    const slides = parseSlides(md);
    expect(slides).toHaveLength(2);
    expect(slides[1].note).toBe('Notes for section slide');
  });

  it('handles separators with trailing whitespace', () => {
    const md = `---
theme: default
---

# Slide One

---

# Slide Two`;
    const slides = parseSlides(md);
    expect(slides).toHaveLength(2);
  });
});

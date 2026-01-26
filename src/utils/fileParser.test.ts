/**
 * Unit Tests for File Parser V1
 * Run with: npx vitest run src/utils/fileParser.test.ts
 */

import { describe, it, expect } from 'vitest';
import { parseContent, parseWithFallback, normalizeText } from './fileParser';

describe('normalizeText', () => {
  it('should unify different newline types', () => {
    const input = 'line1\r\nline2\rline3\nline4';
    const result = normalizeText(input);
    expect(result).toBe('line1\nline2\nline3\nline4');
  });

  it('should collapse multiple blank lines', () => {
    const input = 'line1\n\n\n\nline2';
    const result = normalizeText(input);
    expect(result).toBe('line1\n\nline2');
  });

  it('should trim each line', () => {
    const input = '  line1  \n  line2  ';
    const result = normalizeText(input);
    expect(result).toBe('line1\nline2');
  });
});

describe('parseContent - CARD multiline', () => {
  it('should parse basic CARD with multiline Q and A', () => {
    const input = `
@CARD
Q: What is photosynthesis?
It is a process used by plants
A: The process by which green plants
use sunlight to synthesize nutrients
from carbon dioxide and water
    `;
    
    const result = parseContent(input);
    
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].front).toBe('What is photosynthesis?\nIt is a process used by plants');
    expect(result.cards[0].back).toContain('The process by which green plants');
    expect(result.cards[0].back).toContain('carbon dioxide and water');
    expect(result.errors).toHaveLength(0);
  });
});

describe('parseContent - MCQ with multiline explain', () => {
  it('should parse MCQ with all options and multiline explanation', () => {
    const input = `
@MCQ
Q: Which planet is known as the Red Planet?
A: Earth
B: Mars
C: Jupiter
D: Venus
ANSWER: B
EXPLAIN: Mars is called the Red Planet because
of its reddish appearance, which is caused by
iron oxide (rust) on its surface.
    `;
    
    const result = parseContent(input);
    
    expect(result.mcqs).toHaveLength(1);
    expect(result.mcqs[0].question).toBe('Which planet is known as the Red Planet?');
    expect(result.mcqs[0].options.A).toBe('Earth');
    expect(result.mcqs[0].options.B).toBe('Mars');
    expect(result.mcqs[0].options.C).toBe('Jupiter');
    expect(result.mcqs[0].options.D).toBe('Venus');
    expect(result.mcqs[0].answer).toBe('B');
    expect(result.mcqs[0].explain).toContain('Mars is called the Red Planet');
    expect(result.mcqs[0].explain).toContain('iron oxide');
    expect(result.errors).toHaveLength(0);
  });
});

describe('parseContent - missing fields', () => {
  it('should report error for CARD missing answer', () => {
    const input = `
@CARD
Q: What is the capital of France?
    `;
    
    const result = parseContent(input);
    
    expect(result.cards).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('INCOMPLETE_CARD');
    expect(result.errors[0].message).toContain('đáp án (A)');
  });

  it('should report error for MCQ missing ANSWER', () => {
    const input = `
@MCQ
Q: What is 2+2?
A: 3
B: 4
C: 5
D: 6
    `;
    
    const result = parseContent(input);
    
    expect(result.mcqs).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('MCQ_MISSING_ANSWER');
  });
});

describe('parseContent - invalid answer', () => {
  it('should report error for MCQ with invalid answer letter', () => {
    const input = `
@MCQ
Q: What is the largest ocean?
A: Atlantic
B: Pacific
C: Indian
D: Arctic
ANSWER: E
    `;
    
    const result = parseContent(input);
    
    expect(result.mcqs).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('MCQ_INVALID_ANSWER');
    expect(result.errors[0].message).toContain('E');
  });

  it('should report error when selected answer option does not exist', () => {
    const input = `
@MCQ
Q: What is 1+1?
A: 1
B: 2
ANSWER: C
    `;
    
    const result = parseContent(input);
    
    expect(result.mcqs).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('MCQ_ANSWER_NOT_FOUND');
  });
});

describe('parseContent - mixed blocks', () => {
  it('should parse mixed CARD and MCQ blocks', () => {
    const input = `
#DECK Vocabulary Set
#DESC A collection of vocabulary
and quiz questions

@CARD
Q: Hello
A: Xin chào

@MCQ
Q: What does "Bonjour" mean?
A: Hello
B: Goodbye
C: Thank you
D: Sorry
ANSWER: A

@CARD
Q: Thank you
A: Cảm ơn

@MCQ
Q: "Gracias" is Spanish for?
A: Hello
B: Please
C: Thank you
D: Goodbye
ANSWER: C
EXPLAIN: Gracias means thank you in Spanish
    `;
    
    const result = parseContent(input);
    
    expect(result.meta.deckTitle).toBe('Vocabulary Set');
    expect(result.meta.deckDesc).toContain('A collection of vocabulary');
    expect(result.cards).toHaveLength(2);
    expect(result.mcqs).toHaveLength(2);
    expect(result.errors).toHaveLength(0);
    
    expect(result.cards[0].front).toBe('Hello');
    expect(result.cards[0].back).toBe('Xin chào');
    expect(result.cards[1].front).toBe('Thank you');
    expect(result.cards[1].back).toBe('Cảm ơn');
    
    expect(result.mcqs[0].answer).toBe('A');
    expect(result.mcqs[1].answer).toBe('C');
    expect(result.mcqs[1].explain).toBe('Gracias means thank you in Spanish');
  });
});

describe('parseContent - deck meta', () => {
  it('should parse #DECK and #DESC metadata', () => {
    const input = `
#DECK My Amazing Flashcard Set
#DESC This is a description
that spans multiple lines
with detailed information

@CARD
Q: Test
A: Testing
    `;
    
    const result = parseContent(input);
    
    expect(result.meta.deckTitle).toBe('My Amazing Flashcard Set');
    expect(result.meta.deckDesc).toBe('This is a description\nthat spans multiple lines\nwith detailed information');
  });

  it('should handle #DECK without #DESC', () => {
    const input = `
#DECK Title Only

@CARD
Q: A
A: B
    `;
    
    const result = parseContent(input);
    
    expect(result.meta.deckTitle).toBe('Title Only');
    expect(result.meta.deckDesc).toBeUndefined();
  });
});

describe('parseWithFallback - legacy format', () => {
  it('should fallback to line-by-line parsing when no markers', () => {
    const input = `
Apple - Quả táo
Banana - Quả chuối
Orange: Quả cam
    `;
    
    const result = parseWithFallback(input);
    
    expect(result.cards).toHaveLength(3);
    expect(result.cards[0].front).toBe('Apple');
    expect(result.cards[0].back).toBe('Quả táo');
    expect(result.cards[2].front).toBe('Orange');
    expect(result.cards[2].back).toBe('Quả cam');
  });

  it('should report error when no content found in fallback', () => {
    const input = `
just random text
without any structure
    `;
    
    const result = parseWithFallback(input);
    
    expect(result.cards).toHaveLength(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('NO_CONTENT_FOUND');
  });
});

describe('edge cases', () => {
  it('should handle empty input', () => {
    const result = parseContent('');
    expect(result.cards).toHaveLength(0);
    expect(result.mcqs).toHaveLength(0);
  });

  it('should handle special characters in content', () => {
    const input = `
@CARD
Q: What is "氷" (こおり)?
A: Ice (冰) - frozen water
    `;
    
    const result = parseContent(input);
    
    expect(result.cards).toHaveLength(1);
    expect(result.cards[0].front).toContain('氷');
    expect(result.cards[0].back).toContain('冰');
  });

  it('should handle consecutive blocks without blank lines', () => {
    const input = `@CARD
Q: A
A: B
@CARD
Q: C
A: D`;
    
    const result = parseContent(input);
    
    expect(result.cards).toHaveLength(2);
  });
});

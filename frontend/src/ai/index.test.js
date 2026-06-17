import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { getAIMove } from './index';

function board25() {
  return Array.from({ length: 25 }, () => new Piece());
}

test('getAIMove returns a capture for the tiger on every difficulty', () => {
  for (const difficulty of ['easy', 'medium', 'hard']) {
    const b = board25();
    b[0] = new Tiger();
    b[1] = new Goat();
    const move = getAIMove(b, 'tiger', { gisnext: false, goatsOnBoard: 20, goatsTaken: 0 }, difficulty);
    expect(move.type).toBe('capture');
  }
});

test('getAIMove returns a placement during the goat placement phase', () => {
  const b = board25();
  [0, 4, 20, 24].forEach(i => { b[i] = new Tiger(); });
  const move = getAIMove(b, 'goat', { gisnext: true, goatsOnBoard: 0, goatsTaken: 0 }, 'medium');
  expect(move.type).toBe('place');
});

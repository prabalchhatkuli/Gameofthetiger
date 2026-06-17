import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { search } from './minimax';

function board25() {
  return Array.from({ length: 25 }, () => new Piece());
}

test('tiger takes an available capture', () => {
  const b = board25();
  b[0] = new Tiger();
  b[1] = new Goat();
  const { move } = search(b, { gisnext: false, goatsOnBoard: 20, goatsTaken: 0 }, 2);
  expect(move.type).toBe('capture');
  expect(move.captured).toBe(1);
});

test('search returns a legal move object for the side to move', () => {
  const b = board25();
  [0, 4, 20, 24].forEach(i => { b[i] = new Tiger(); });
  const { move } = search(b, { gisnext: true, goatsOnBoard: 0, goatsTaken: 0 }, 2);
  expect(move.type).toBe('place');
  expect(b[move.to].player).toBe(null);
});

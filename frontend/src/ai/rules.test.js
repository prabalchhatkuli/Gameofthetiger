import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { cloneBoard, getLegalMoves } from './rules';

function emptyBoard() {
  return Array.from({ length: 25 }, () => new Piece());
}
function withTigersAtCorners() {
  const b = emptyBoard();
  [0, 4, 20, 24].forEach(i => { b[i] = new Tiger(); });
  return b;
}

test('cloneBoard produces an independent board with same players', () => {
  const b = withTigersAtCorners();
  b[12] = new Goat();
  const c = cloneBoard(b);
  expect(c).not.toBe(b);
  expect(c[0].player).toBe('T');
  expect(c[12].player).toBe('G');
  c[12] = new Piece();
  expect(b[12].player).toBe('G');
});

test('goat placement phase: every empty cell is a place move', () => {
  const b = withTigersAtCorners();
  const moves = getLegalMoves(b, true, 0);
  expect(moves.length).toBe(21);
  expect(moves.every(m => m.type === 'place')).toBe(true);
  expect(moves.some(m => m.to === 12)).toBe(true);
  expect(moves.some(m => m.to === 0)).toBe(false);
});

test('goat movement phase: goats step to adjacent empties only', () => {
  const b = withTigersAtCorners();
  b[12] = new Goat();
  const moves = getLegalMoves(b, true, 20);
  expect(moves.length > 0).toBe(true);
  expect(moves.every(m => m.type === 'move' && m.from === 12)).toBe(true);
  expect(moves.map(m => m.to).sort((a, b) => a - b)).toEqual([6, 7, 8, 11, 13, 16, 17, 18]);
});

test('tiger moves include a capture when a goat is jumpable', () => {
  const b = withTigersAtCorners();
  b[1] = new Goat();
  const moves = getLegalMoves(b, false, 20);
  const capture = moves.find(m => m.type === 'capture');
  expect(capture).toBeDefined();
  expect(capture.from).toBe(0);
  expect(capture.to).toBe(2);
  expect(capture.captured).toBe(1);
});

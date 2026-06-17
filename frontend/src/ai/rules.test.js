import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { cloneBoard, getLegalMoves, applyMove, getWinner } from './rules';

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

test('applyMove place: adds a goat, increments goatsOnBoard, toggles turn', () => {
  const b = withTigersAtCorners();
  const next = applyMove(b, { type: 'place', to: 12 }, { gisnext: true, goatsOnBoard: 0, goatsTaken: 0 });
  expect(next.board[12].player).toBe('G');
  expect(next.goatsOnBoard).toBe(1);
  expect(next.goatsTaken).toBe(0);
  expect(next.gisnext).toBe(false);
  expect(b[12].player).toBe(null);
});

test('applyMove move: relocates the piece and clears the source', () => {
  const b = withTigersAtCorners();
  b[12] = new Goat();
  const next = applyMove(b, { type: 'move', from: 12, to: 13 }, { gisnext: true, goatsOnBoard: 20, goatsTaken: 0 });
  expect(next.board[12].player).toBe(null);
  expect(next.board[13].player).toBe('G');
  expect(next.gisnext).toBe(false);
});

test('applyMove capture: removes captured goat, increments goatsTaken', () => {
  const b = withTigersAtCorners();
  b[1] = new Goat();
  const next = applyMove(b, { type: 'capture', from: 0, to: 2, captured: 1 },
    { gisnext: false, goatsOnBoard: 20, goatsTaken: 0 });
  expect(next.board[0].player).toBe(null);
  expect(next.board[2].player).toBe('T');
  expect(next.board[1].player).toBe(null);
  expect(next.goatsTaken).toBe(1);
  expect(next.gisnext).toBe(true);
});

test('getWinner: tigers win at 5 captures', () => {
  const b = withTigersAtCorners();
  expect(getWinner(b, 5)).toBe('T');
  expect(getWinner(b, 4)).toBe(null);
});

test('getWinner: goats win when all tigers are blocked', () => {
  const b = withTigersAtCorners();
  [1, 5, 6, 3, 8, 9, 15, 16, 21, 18, 19, 23].forEach(i => { b[i] = new Goat(); });
  [2, 7, 10, 11, 12, 13, 14, 17, 22].forEach(i => { if (b[i].player === null) b[i] = new Goat(); });
  expect(getWinner(b, 0)).toBe('G');
});

test('getWinner: returns null when a tiger can still move', () => {
  const b = withTigersAtCorners();
  b[12] = new Goat();
  expect(getWinner(b, 0)).toBe(null);
});

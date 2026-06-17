import { test, expect } from 'vitest';
import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';
import { evaluate } from './evaluate';

function withTigersAtCorners() {
  const b = Array.from({ length: 25 }, () => new Piece());
  [0, 4, 20, 24].forEach(i => { b[i] = new Tiger(); });
  return b;
}

test('captures raise the tiger-perspective score', () => {
  const b = withTigersAtCorners();
  const noCaptures = evaluate(b, { goatsTaken: 0, goatsOnBoard: 0 });
  const someCaptures = evaluate(b, { goatsTaken: 3, goatsOnBoard: 0 });
  expect(someCaptures).toBeGreaterThan(noCaptures);
});

test('more trapped tigers lowers the tiger-perspective score', () => {
  const open = withTigersAtCorners();
  const trapped = withTigersAtCorners();
  [1, 5, 6].forEach(i => { trapped[i] = new Goat(); });
  expect(evaluate(trapped, { goatsTaken: 0, goatsOnBoard: 3 }))
    .toBeLessThan(evaluate(open, { goatsTaken: 0, goatsOnBoard: 3 }));
});

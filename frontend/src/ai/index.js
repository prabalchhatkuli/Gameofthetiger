import { search } from './minimax';
import { getLegalMoves } from './rules';

const DEPTH = { easy: 2, medium: 3, hard: 4 };
const PLACEMENT_DEPTH = { easy: 1, medium: 2, hard: 2 };

export function getAIMove(board, side, state, difficulty) {
  const legal = getLegalMoves(board, state.gisnext, state.goatsOnBoard);
  if (legal.length === 0) return null;

  const inPlacement = state.gisnext && state.goatsOnBoard < 20;
  const depth = inPlacement ? PLACEMENT_DEPTH[difficulty] : DEPTH[difficulty];
  const { move } = search(board, state, depth);
  const chosen = move || legal[0];

  // Easy: if the best move is NOT a capture, sometimes substitute a random
  // legal move so it plays loosely. Captures are always taken (keeps it from
  // being trivially bad and keeps behavior testable).
  if (difficulty === 'easy' && chosen.type !== 'capture' && Math.random() < 0.35) {
    return legal[Math.floor(Math.random() * legal.length)];
  }
  return chosen;
}

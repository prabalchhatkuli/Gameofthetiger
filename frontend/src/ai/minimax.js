import { getLegalMoves, applyMove, getWinner } from './rules';
import { evaluate } from './evaluate';

const WIN_SCORE = 1e6;

function order(moves) {
  return moves.slice().sort((a, b) => (b.type === 'capture' ? 1 : 0) - (a.type === 'capture' ? 1 : 0));
}

// Root minimax with alpha-beta. Tigers maximize the tiger-perspective
// evaluation; goats minimize. Returns { score, move } (move null at terminal).
export function search(board, state, depth) {
  const winner = getWinner(board, state.goatsTaken);
  if (winner === 'T') return { score: WIN_SCORE, move: null };
  if (winner === 'G') return { score: -WIN_SCORE, move: null };
  if (depth === 0) return { score: evaluate(board, state), move: null };

  const moves = order(getLegalMoves(board, state.gisnext, state.goatsOnBoard));
  if (moves.length === 0) return { score: evaluate(board, state), move: null };

  const maximizing = !state.gisnext;
  let best = { score: maximizing ? -Infinity : Infinity, move: moves[0] };
  let alpha = -Infinity;
  let beta = Infinity;

  for (const move of moves) {
    const after = applyMove(board, move, state);
    const childState = { gisnext: after.gisnext, goatsOnBoard: after.goatsOnBoard, goatsTaken: after.goatsTaken };
    const { score } = search(after.board, childState, depth - 1);

    if (maximizing) {
      if (score > best.score) best = { score, move };
      alpha = Math.max(alpha, score);
    } else {
      if (score < best.score) best = { score, move };
      beta = Math.min(beta, score);
    }
    if (beta <= alpha) break;
  }

  return best;
}

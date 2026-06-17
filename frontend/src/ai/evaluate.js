import { getLegalMoves } from './rules';

const W_CAPTURE = 100;
const W_TRAPPED = 60;
const W_TIGER_MOBILITY = 2;
const W_THREAT = 8;
// Penalty per goat adjacent to a tiger (encirclement pressure).
const W_ENCIRCLE = 10;

export function evaluate(board, state) {
  let score = 0;
  score += W_CAPTURE * state.goatsTaken;

  let trapped = 0;
  for (let i = 0; i < 25; i++) {
    if (board[i].player === 'T' && board[i].isTigerBlocked(i, board)) trapped += 1;
  }
  score -= W_TRAPPED * trapped;

  const tigerMoves = getLegalMoves(board, false, 20);
  score += W_TIGER_MOBILITY * tigerMoves.length;
  score += W_THREAT * tigerMoves.filter(m => m.type === 'capture').length;

  // Penalise goats that are directly adjacent to a tiger: they restrict
  // step-mobility and signal an encirclement build-up.
  const DIRS = [-6, -5, -4, -1, 1, 4, 5, 6];
  for (let i = 0; i < 25; i++) {
    if (board[i].player !== 'T') continue;
    for (const d of DIRS) {
      const j = i + d;
      if (j >= 0 && j < 25 && board[j] && board[j].player === 'G') {
        score -= W_ENCIRCLE;
      }
    }
  }

  return score;
}

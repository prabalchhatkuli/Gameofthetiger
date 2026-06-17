import Piece from '../components/piece/piece.component';
import Tiger from '../components/piece/tigerpiece.component';
import Goat from '../components/piece/goatpiece.component';

const CAPTURE_DISTANCES = new Set([2, 8, 10, 12]);

export function cloneBoard(board) {
  return board.map(cell => {
    if (cell.player === 'T') return new Tiger();
    if (cell.player === 'G') return new Goat();
    return new Piece();
  });
}

export function getLegalMoves(board, gisnext, goatsOnBoard) {
  const moves = [];

  if (gisnext && goatsOnBoard < 20) {
    for (let to = 0; to < 25; to++) {
      if (board[to].player === null) moves.push({ type: 'place', to });
    }
    return moves;
  }

  const side = gisnext ? 'G' : 'T';
  for (let from = 0; from < 25; from++) {
    if (board[from].player !== side) continue;
    for (let to = 0; to < 25; to++) {
      if (to === from) continue;
      if (!board[from].isMovePossible(from, to, board)) continue;
      if (side === 'T' && CAPTURE_DISTANCES.has(Math.abs(from - to))) {
        moves.push({ type: 'capture', from, to, captured: (from + to) / 2 });
      } else {
        moves.push({ type: 'move', from, to });
      }
    }
  }
  return moves;
}

export type Player = 'X' | 'O' | null;
export type Board = Player[];

export interface GameState {
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  winningLine: number[] | null;
  history: Board[];
  step: number;
}

export function calculateWinner(board: Board): { winner: Player, line: number[] | null } {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6]              // diagonals
  ];

  for (const [a, b, c] of lines) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return { winner: null, line: null };
}

export function makeNewGame(): GameState {
  return {
    board: Array(9).fill(null),
    currentPlayer: 'X',
    winner: null,
    winningLine: null,
    history: [Array(9).fill(null)],
    step: 0,
  };
}

export function playMove(game: GameState, square: number): GameState {
  if (game.winner || game.board[square]) return game;

  const newBoard = [...game.board];
  newBoard[square] = game.currentPlayer;

  const result = calculateWinner(newBoard);
  const nextPlayer = game.currentPlayer === 'X' ? 'O' : 'X';

  return {
    board: newBoard,
    currentPlayer: nextPlayer,
    winner: result.winner || (newBoard.every(Boolean) ? 'draw' : null),
    winningLine: result.line,
    history: [...game.history.slice(0, game.step + 1), newBoard],
    step: game.step + 1,
  };
}

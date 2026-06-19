import { useState, useCallback, type FC, type ReactNode } from 'react';
import {
  makeNewGame,
  playMove,
  type GameState,
  type Player,
  calculateWinner,
} from './game';
import './App.css';

const Square: FC<{
  value: Player;
  onClick: () => void;
  isWinning: boolean;
  disabled: boolean;
}> = ({ value, onClick, isWinning, disabled }) => (
  <button className={`square${isWinning ? ' winning' : ''}${value ? ' has-value' : ''}`}
          onClick={onClick}
          disabled={disabled}>
    {value}
  </button>
);

const Board: FC<{
  board: GameState['board'];
  winningLine: GameState['winningLine'];
  disabled: boolean;
  onClick: (square: number) => void;
}> = ({ board, winningLine, disabled, onClick }) => {
  const rows = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ];

  return (
    <div className="board">
      {rows.map((row, ri) => (
        <div key={ri} className="board-row">
          {row.map((squareIdx) => (
            <Square
              key={squareIdx}
              value={board[squareIdx]}
              onClick={() => onClick(squareIdx)}
              isWinning={winningLine?.includes(squareIdx) ?? false}
              disabled={disabled}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

type MoveStatus = 'playing' | 'won' | 'draw';

const App: FC = () => {
  const [game, setGame] = useState<GameState>(makeNewGame);
  const [undoStack, setUndoStack] = useState<Board[]>([game.board[0]!]);

  const status: MoveStatus = game.winner
    ? game.winner === 'draw'
      ? 'draw'
      : 'won'
    : 'playing';

  const handleSquareClick = useCallback((square: number) => {
    const next = playMove(game, square);
    if (next !== game) {
      setGame(next);
      setUndoStack((prev) => [...prev, next.board]);
    }
  }, [game]);

  const handleUndo = useCallback(() => {
    if (undoStack.length <= 1) return;
    const prevBoard = undoStack[undoStack.length - 2]!;
    const result = calculateWinner(prevBoard);
    const prevPlayer = game.history.length > 2
      ? (game.currentPlayer === 'X' ? 'O' : 'X')
      : 'X';
    setGame({
      board: prevBoard,
      currentPlayer: prevPlayer,
      winner: result.winner || (prevBoard.every(Boolean) ? 'draw' : null),
      winningLine: result.line,
      history: game.history,
      step: game.step - 1,
    });
    setUndoStack((prev) => prev.slice(0, -1));
  }, [game, undoStack]);

  const handleReset = useCallback(() => {
    setGame(makeNewGame());
    setUndoStack([Array(9).fill(null)]);
  }, []);

  const statusText = status === 'won'
    ? `Player ${game.winner} wins!`
    : status === 'draw'
      ? "It's a draw!"
      : `Player ${game.currentPlayer}'s turn`;

  return (
    <div className="app">
      <div className="title">Tic Tac Toe</div>
      <div className="status">{statusText}</div>
      <Board
        board={game.board}
        winningLine={game.winningLine}
        disabled={status !== 'playing'}
        onClick={handleSquareClick}
      />
      <div className="controls">
        <button className="btn btn-undo" onClick={handleUndo} disabled={undoStack.length <= 1}>
          ↩ Undo
        </button>
        <button className="btn btn-reset" onClick={handleReset}>
          ↻ New Game
        </button>
      </div>
    </div>
  );
};

export default App;

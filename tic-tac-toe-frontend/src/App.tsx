import React, { useState, useEffect } from "react";
import "./index.css";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const App: React.FC = () => {
  const [board, setBoard] = useState<string[][]>(
    Array(5).fill(null).map(() => Array(5).fill(""))
  );
  const [leaderboard, setLeaderboard] = useState<{ player: string; wins: number }[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const players = ["X", "O", "A"];

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  // Fetch leaderboard from backend
  const fetchLeaderboard = async () => {
    const res = await axios.get(`${API_URL}/leaderboard`);
    setLeaderboard(res.data);
  };

  // Handle player move
  const handleMove = async (row: number, col: number) => {
    // Check if cell is already occupied
    if (board[row][col] !== "") return alert("Cell already occupied!");

    const newBoard = [...board.map(r => [...r])]; 
    newBoard[row][col] = players[currentPlayer];
    setBoard(newBoard);

    // Check if current player has won
    const winner = checkWinner(newBoard);
    if (winner) {
      alert(`Winner: ${winner}`);

      // Send winner to backend
      try {
        await axios.post(`${API_URL}/save-winner`, { player: winner });
        fetchLeaderboard(); // Refresh leaderboard
      } catch (error) {
        console.error("Error saving winner:", error);
      }

      resetBoard();
      return;
    }

    // when there is no cell remaining game is draw
    if (newBoard.every(row => row.every(cell => cell !== ""))) {
      alert("Game is draw!");
      resetBoard();
      return;
    }

    // Switch to next player
    setCurrentPlayer((currentPlayer + 1) % 3);
  };

  // Reset the board
  const resetBoard = () => {
    setBoard(Array(5).fill(null).map(() => Array(5).fill("")));
    setCurrentPlayer(0);
  };

  // Check if there is a winner
  const checkWinner = (board: string[][]) => {
    const size = 5;

    // Check rows & columns
    for (let i = 0; i < size; i++) {
      for (let j = 0; j <= size - 5; j++) {
        if (
          board[i][j] &&
          board[i][j] === board[i][j + 1] &&
          board[i][j] === board[i][j + 2] &&
          board[i][j] === board[i][j + 3] &&
          board[i][j] === board[i][j + 4]
        ) return board[i][j];

        if (
          board[j][i] &&
          board[j][i] === board[j + 1][i] &&
          board[j][i] === board[j + 2][i] &&
          board[j][i] === board[j + 3][i] &&
          board[j][i] === board[j + 4][i]
        ) return board[j][i];
      }
    }

    // Check diagonals
    for (let i = 0; i <= size - 5; i++) {
      for (let j = 0; j <= size - 5; j++) {
        if (
          board[i][j] &&
          board[i][j] === board[i + 1][j + 1] &&
          board[i][j] === board[i + 2][j + 2] &&
          board[i][j] === board[i + 3][j + 3] &&
          board[i][j] === board[i + 4][j + 4]
        ) return board[i][j];

        if (
          board[i + 4][j] &&
          board[i + 4][j] === board[i + 3][j + 1] &&
          board[i + 4][j] === board[i + 2][j + 2] &&
          board[i + 4][j] === board[i + 1][j + 3] &&
          board[i + 4][j] === board[i][j + 4]
        ) return board[i + 4][j];
      }
    }

    return null;
  };

  return (
    <div className="main-container">
      <h1>5x5 Tic-Tac-Toe (3 Players)</h1>
      <div className="main-grid">
        {board.map((row, rIndex) =>
          row.map((cell, cIndex) => (
            <button
              key={`${rIndex}-${cIndex}`}
              onClick={() => handleMove(rIndex, cIndex)}
              className="cell">
              {cell}
            </button>
          ))
        )}
      </div>
      <h2>Leaderboard</h2>
      <ol className="m-auto leaderboard-content">
        {leaderboard.map((entry, index) => (
          <li key={index}>
            {entry.player}: {entry.wins} wins
          </li>
        ))}
      </ol>
      <button onClick={resetBoard} className="reset-button">
        Reset Game
      </button>
    </div>
  );
};

export default App;

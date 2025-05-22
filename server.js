const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = {};
let turn = null;
let board = Array(9).fill(null);

io.on('connection', socket => {
  if (Object.keys(players).length < 2) {
    const symbol = Object.keys(players).length === 0 ? 'X' : 'O';
    players[socket.id] = symbol;

    socket.emit('symbol', symbol);
    if (Object.keys(players).length === 2) {
      turn = 'X';
      io.emit('start', turn);
    }

    socket.on('makeMove', index => {
      if (players[socket.id] === turn && !board[index]) {
        board[index] = turn;
        io.emit('moveMade', { index, symbol: turn });

        if (checkWinner(turn)) {
          io.emit('gameOver', `${turn} wins!`);
          reset();
        } else if (board.every(cell => cell)) {
          io.emit('gameOver', 'Draw!');
          reset();
        } else {
          turn = turn === 'X' ? 'O' : 'X';
          io.emit('turn', turn);
        }
      }
    });

    socket.on('disconnect', () => {
      io.emit('gameOver', 'Opponent disconnected.');
      reset();
    });
  } else {
    socket.emit('full');
  }
});

function checkWinner(sym) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c]) => board[a] === sym && board[b] === sym && board[c] === sym);
}

function reset() {
  players = {};
  turn = null;
  board = Array(9).fill(null);
}

http.listen(3000, () => console.log('Listening on http://localhost:3000'));


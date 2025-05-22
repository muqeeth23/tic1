const socket = io();
let mySymbol = '';
let isMyTurn = false;

socket.on('symbol', symbol => {
  mySymbol = symbol;
  document.getElementById('status').innerText = `You are ${symbol}`;
});

socket.on('start', turn => {
  isMyTurn = (turn === mySymbol);
  updateStatus(turn);
});

socket.on('turn', turn => {
  isMyTurn = (turn === mySymbol);
  updateStatus(turn);
});

socket.on('moveMade', ({ index, symbol }) => {
  document.querySelectorAll('.cell')[index].innerText = symbol;
});

socket.on('gameOver', message => {
  alert(message);
  location.reload();
});

socket.on('full', () => {
  alert('Room is full.');
});

function updateStatus(turn) {
  document.getElementById('status').innerText = isMyTurn ? "Your turn" : "Opponent's turn";
}

function createBoard() {
  const board = document.getElementById('board');
  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.addEventListener('click', () => {
      if (isMyTurn && !cell.innerText) {
        socket.emit('makeMove', i);
      }
    });
    board.appendChild(cell);
  }
}
createBoard();


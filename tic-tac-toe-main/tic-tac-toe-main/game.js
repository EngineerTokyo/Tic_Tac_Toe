const gameCells = document.querySelectorAll('.gamecell');
const resetButton = document.querySelector('main button');

const namesDialog = document.querySelector('.names-dialog');
const namesDialogButton = namesDialog.querySelector('button');

const Player = (name, symbol) => {
    const getSymbol = () => symbol;
    const getName = () => name;
    return {getSymbol, getName};
}

// Initialization of Players
namesDialog.showModal();
namesDialogButton.addEventListener('click', (event) => {
    const form = namesDialog.querySelector('form');
    const player1Name = form.querySelector('#name1');
    const player2Name = form.querySelector('#name2');
    if (form.checkValidity()) {
        event.preventDefault(); // Prevent form submission
        const player1 = Player(player1Name.value, 'X');
        const player2 = Player(player2Name.value, 'O');
        namesDialog.close();
        gameInitialization(player1, player2);
    } 
});

// Game Initialization
function gameInitialization(player1, player2) {
    const gameBoard = (() => {
        let gameBoardArray = Array(9).fill(null);

        const addToArray = (symbol, position) => {
            gameBoardArray[position] = symbol;
        }

        const clearArray = () => {
            gameBoardArray = Array(9).fill(null);
        }

        const getWinningCombinations = () => {
            return [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
                [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
                [0, 4, 8], [2, 4, 6]            // Diagonals
            ];
        }

        const checkWinner = () => {
            const combinations = getWinningCombinations();
            for (const combination of combinations) {
                const [a, b, c] = combination;
                if (gameBoardArray[a] && 
                    gameBoardArray[a] === gameBoardArray[b] && 
                    gameBoardArray[a] === gameBoardArray[c]) {
                    return { hasWinner: true, winner: gameBoardArray[a], winningCells: combination };
                }
            }
            if (!gameBoardArray.includes(null)) {
                return { hasWinner: false, isTie: true };
            }
            return { hasWinner: false, isTie: false };
        }

        return { addToArray, clearArray, checkWinner };
    })();

    const displayController = (() => {
        const turnMessage = document.querySelector('main p');
        const winnerDialog = document.querySelector('.result-dialog');
        const winnerDialogMessage = winnerDialog.querySelector('h1');

        winnerDialog.addEventListener('click', (event) => {
            if (event.target === winnerDialog) {
                winnerDialog.close();
            }
        });

        const updateTurnMessage = (message) => {
            turnMessage.textContent = message;
        }

        const showResultDialog = (message) => {
            winnerDialogMessage.textContent = message;
            winnerDialog.showModal();
        }

        const highlightWinningCells = (winningCells) => {
            winningCells.forEach(index => {
                gameCells[index].classList.add('winning-cell');
            });
        }

        const clearGameboard = () => {
            gameCells.forEach(cell => {
                cell.textContent = '';
                cell.classList.remove('winning-cell');
            });
        }

        return { updateTurnMessage, showResultDialog, highlightWinningCells, clearGameboard };
    })();

    const game = (() => {
        let currentPlayer = player1;
        let gameOver = false;

        displayController.updateTurnMessage(`${currentPlayer.getName()}'s Turn`);

        const makeMove = (cell, player) => {
            const position = cell.dataset.position;
            if (cell.textContent || gameOver) return false;

            cell.textContent = player.getSymbol();
            gameBoard.addToArray(player.getSymbol(), position);
            return true;
        }

        const checkGameState = () => {
            const result = gameBoard.checkWinner();
            if (result.hasWinner) {
                const winner = result.winner === player1.getSymbol() ? player1 : player2;
                displayController.showResultDialog(`${winner.getName()} Wins!`);
                displayController.highlightWinningCells(result.winningCells);
                gameOver = true;
            } else if (result.isTie) {
                displayController.showResultDialog("It's a Tie!");
                gameOver = true;
            }
        }

        const switchPlayer = () => {
            currentPlayer = currentPlayer === player1 ? player2 : player1;
            if (!gameOver) {
                displayController.updateTurnMessage(`${currentPlayer.getName()}'s Turn`);
            }
        }

        const handleCellClick = (e) => {
            if (!makeMove(e.target, currentPlayer)) return;
            checkGameState();
            switchPlayer();
        }

        const resetGame = () => {
            displayController.clearGameboard();
            gameBoard.clearArray();
            gameOver = false;
            currentPlayer = player1;
            displayController.updateTurnMessage(`${currentPlayer.getName()}'s Turn`);
        }

        return { handleCellClick, resetGame };
    })();

    resetButton.addEventListener('click', game.resetGame);
    gameCells.forEach(cell => cell.addEventListener('click', game.handleCellClick));
}

﻿let polling = false;
let lastGameStateHash = '';
let pollTimeoutId = null;
let selectedTile = null;
let selectedTileInt = null;
let selectedFactory = null;

window.addEventListener('beforeunload', function () {
    localStorage.removeItem('hasRefreshed');
    clearTimeout(pollTimeoutId);
});

document.addEventListener('DOMContentLoaded', async function () {
    // — your Instructions button —
    const instructionsButton = document.getElementById('instructions-button');
    instructionsButton.addEventListener('click', () => {
        window.open('Azul Game Instructions.pdf', '_blank');
    });

    // — your Leave Table button —
    const tableId = new URLSearchParams(window.location.search).get('tableId');
    const leaveButton = document.getElementById('leave-button');
    leaveButton.addEventListener('click', () => handleLeaveTable(tableId));

    
    const token = sessionStorage.getItem('userToken');
    if (!tableId || !token) return;

    // Fetch table data
    const tableRes = await fetch(`https://azul32.onrender.com/api/Tables/${tableId}`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + sessionStorage.getItem('userToken'),
            'Content-Type': 'application/json',
            'Accept': 'text/plain'
        }
    });

    const tableData = await tableRes.json();
    sessionStorage.setItem('count', tableData.preferences.numberOfFactoryDisplays);
    sessionStorage.setItem('gameId', tableData.gameId);

    // Start polling
    pollGameState();
});

async function pollGameState() {
    if (polling) return;
    polling = true;

    try {       
        const token = sessionStorage.getItem('userToken');
        const gameId = sessionStorage.getItem('gameId');
        const gameRes = await fetch(`https://azul32.onrender.com/api/Games/${gameId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            }
        });
        if (!gameRes.ok) throw new Error('Failed to fetch game data');
        const gameData = await gameRes.json();

        // Update session storage
        const currentPlayerId = gameData.playerToPlayId;
        const currentUserId = getUserIdFromToken();
        const playerIndex = gameData.players.findIndex(p => p.id === currentPlayerId);

        sessionStorage.setItem('playerIndex', playerIndex);
        sessionStorage.setItem('playerStart', currentPlayerId);
        sessionStorage.setItem('currentPlayerId', currentPlayerId);
        sessionStorage.setItem('currentUserId', currentUserId);
        sessionStorage.setItem('gameId', gameId);
        

        // Check if game state has changed
        const newHash = hashGameState(gameData);
        if (newHash !== lastGameStateHash) {
            lastGameStateHash = newHash;

            // Render game with all your original functionality
            renderGame(gameData);

            // Determine if player has taken tiles
            const playerIndex = Number(sessionStorage.getItem('playerIndex'));
            let hadTakenTile = gameData.players[playerIndex]?.tilesToPlace.length > 0;
            window.hadTakenTile = hadTakenTile;

            // Render factory displays and table center with your original click handlers
            renderFactoryDisplays(sessionStorage.getItem('count'), gameData.tileFactory);
            renderTableCenter(gameData.tileFactory);

            // Update round information
            const round = document.getElementById('round');
            let roundNumberText = round.querySelector('.round-number');
            if (!roundNumberText) {
                roundNumberText = document.createElement('span');
                roundNumberText.className = 'round-number';
                round.appendChild(roundNumberText);
            }
            roundNumberText.textContent = `Round: ${gameData.roundNumber}`;

            // Update tiles to place
            let tilesContainer = round.querySelector('.tiles-container');
            if (!tilesContainer) {
                tilesContainer = document.createElement('div');
                tilesContainer.className = 'tiles-container';
                round.appendChild(tilesContainer);
            }
            tilesContainer.innerHTML = '';

            if (playerIndex >= 0 && gameData.players[playerIndex]) {
                for (const tile of gameData.players[playerIndex].tilesToPlace) {
                    const tileImg = document.createElement('div');
                    tileImg.className = `tile tile-${getTileColor(tile)}`;
                    tilesContainer.appendChild(tileImg);
                }
            }

            // Update current player highlight
            document.querySelectorAll('.player-board').forEach(board => {
                board.classList.remove('current-player');
                if (board.dataset.playerId === currentPlayerId) {
                    board.classList.add('current-player');
                }
            });

            // Check if game has ended
            if (gameData.hasEnded) {
                window.location.href = `game-over.html?gameId=${gameId}`;
            }
        }
    } catch (e) {
        console.error('Polling error:', e);
    } finally {
        polling = false;
        // Adjust polling frequency based on whether it's the player's turn
        const isYourTurn = sessionStorage.getItem('currentUserId') === sessionStorage.getItem('currentPlayerId');
        const delay = isYourTurn ? 2000 : 5000;
        pollTimeoutId = setTimeout(pollGameState, delay);
    }
}

function renderGame(data) {
    // Render game info (your original implementation)
    document.getElementById('game-id').textContent = `Game ID: ${data.id}`;
    document.getElementById('player-count').textContent =
        `Players: ${data.players.length})`;
    
        

    // Clear existing player boards before rendering new ones
    const playerBoardsContainer = document.getElementById('player-boards');
    playerBoardsContainer.innerHTML = '';

    // Get current player info
    const playerIndex = Number(sessionStorage.getItem('playerIndex'));
    const currentUserId = sessionStorage.getItem('currentUserId');
    let hadTakenTile = data.players[playerIndex]?.tilesToPlace.length > 0;
    window.hadTakenTile = hadTakenTile;

    // Render player boards with all your original functionality
    renderPlayerBoards(data.players, currentUserId, hadTakenTile);
}

function renderFactoryDisplays(count, tileFactory) {
    const container = document.getElementById('factory-displays');
    container.innerHTML = '';

    const tileImages = {
        11: '../Images/Tiles/plainblue.png',    // Blue
        12: '../Images/Tiles/yellowred.png',  // Yellow
        13: '../Images/Tiles/plainred.png',    // Red
        14: '../Images/Tiles/blackblue.png',    // Black
        15: '../Images/Tiles/whiteturquoise.png'     // White
    };

    for (let i = 0; i < count; i++) {
        const display = document.createElement('div');
        display.className = 'factory-display';
        display.innerHTML = '<div class="tiles"></div>';
        display.dataset.displayId = `${i}`; // Unieke ID voor elke display

        const tilesContainer = display.querySelector('.tiles');

        // Loop door de tiles van dit display
        tileFactory.displays[i].tiles.forEach(tileType => {
            const tile = document.createElement('div');
            tile.className = 'tile';
            const tileButton = document.createElement('button');
            tileButton.className = 'tile-button';
            tileButton.dataset.tileId = `${tileType}`;
            tileButton.dataset.displayId = `${i}`;

            // Geef de button een unieke ID
            if (selectedTile && selectedTile.dataset.tileId === tileButton.dataset.tileId && selectedTile.dataset.displayId === tileButton.dataset.displayId) {
                tileButton.classList.add('selected');
            }

            tileButton.addEventListener('click', function () {
                const currentUserId = sessionStorage.getItem('currentUserId');
                const currentPlayerId = sessionStorage.getItem('currentPlayerId');
                if (currentUserId !== currentPlayerId) {
                    console.log("It is not your turn to pick a tile.");
                    return;
                }

                // Verwijder selectie van vorige tegel
                if (selectedTile) {
                    selectedTile.classList.remove('selected');
                }

                if (window.hadTakenTile) {
                    alert('You still have tiles to place before you can take new ones.');
                    return;
                }

                if (selectedTile !== this) {
                    this.classList.add('selected');
                    selectedTile = this;
                    selectedTileInt = Number(selectedTile.dataset.tileId);
                } else {
                    selectedTile = null;
                }

                if (selectedFactory !== tileFactory.displays[i].id) {
                    selectedFactory = tileFactory.displays[i].id;
                } else {
                    selectedFactory = null;
                }
                takeTiles();
            });

            const tileImg = document.createElement('img');
            tileImg.src = `images/${tileImages[tileType]}`;
            tileImg.className = 'tile';
            tileImg.alt = `Tile ${tileType}`;
            tileButton.appendChild(tileImg);
            tile.appendChild(tileButton);
            tilesContainer.appendChild(tile);
        });

        container.appendChild(display);
    }
}

function renderTableCenter(tileFactory) {
    const container = document.getElementById('central-factory');
    container.innerHTML = '';
    const tileImages = {
        0: '../Images/Tiles/startingtile.png',
        11: '../Images/Tiles/plainblue.png',    // Blue
        12: '../Images/Tiles/yellowred.png',  // Yellow
        13: '../Images/Tiles/plainred.png',    // Red
        14: '../Images/Tiles/blackblue.png',    // Black
        15: '../Images/Tiles/whiteturquoise.png'     // White
    };
    const display = document.createElement('div');
    display.className = 'central-factory-display';
    display.innerHTML = '<div class="tiles"></div>';

    const tilesContainer = display.querySelector('.tiles');

    tileFactory.tableCenter.tiles.forEach(tileType => {
        const tile = document.createElement('div');
        tile.className = 'tile';
        const tileButton = document.createElement('button');
        tileButton.className = 'tile-button';
        tileButton.dataset.tileId = `${tileType}`;
        tileButton.dataset.displayId = `${tileFactory.tableCenter.id}`;

        if (selectedTile && selectedTile.dataset.tileId === tileButton.dataset.tileId && selectedTile.dataset.displayId === tileButton.dataset.displayId) {
            tileButton.classList.add('selected');
        }

        tileButton.addEventListener('click', function () {
            const currentUserId = sessionStorage.getItem('currentUserId');
            const currentPlayerId = sessionStorage.getItem('currentPlayerId');
            if (currentUserId !== currentPlayerId) {
                console.log("It is not your turn to pick a tile.");
                return;
            }

            // Verwijder selectie van vorige tegel
            if (selectedTile) {
                selectedTile.classList.remove('selected');
            }

            if (selectedTile !== this) {
                this.classList.add('selected');
                selectedTile = this;
                selectedTileInt = Number(selectedTile.dataset.tileId);
            } else {
                selectedTile = null;
            }

            if (selectedFactory !== tileFactory.tableCenter.id) {
                selectedFactory = tileFactory.tableCenter.id;
            } else {
                selectedFactory = null;
            }

            if (window.hadTakenTile) {
                alert('You still have tiles to place before you can take new ones.');
                return;
            }
            takeTiles();
        });

        const tileImg = document.createElement('img');
        tileImg.src = `images/${tileImages[tileType]}`;
        tileImg.className = 'tile';
        tileImg.alt = `Tile ${tileType}`;
        tileButton.appendChild(tileImg);
        tile.appendChild(tileButton);
        tilesContainer.appendChild(tile);
    });

    container.appendChild(display);
}

function takeTiles() {
    if (selectedTileInt !== null && selectedFactory !== null && selectedTile !== null) {
        try {
            const token = sessionStorage.getItem('userToken');
            const gameId = sessionStorage.getItem('gameId');

            fetch(`https://azul32.onrender.com/api/Games/${gameId}/take-tiles`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain'
                },
                body: JSON.stringify({
                    displayId: selectedFactory,
                    tileType: selectedTileInt,
                })
            }).then(res => {
                if (!res.ok) {
                    console.error('API request failed:', res.status);
                }
            });
        } catch (e) {
            console.error('Error:', e);
        }
    }
}

function renderPlayerBoards(players, currentUserId, hadTakenTile) {
    const container = document.getElementById('player-boards');
    container.innerHTML = '';
    const tileImages = {
        blue: '../Images/Tiles/plainblue.png',
        yellow: '../Images/Tiles/yellowred.png',
        red: '../Images/Tiles/plainred.png',
        black: '../Images/Tiles/blackblue.png',
        white: '../Images/Tiles/whiteturquoise.png'
    };

    const playerSart = sessionStorage.getItem('playerStart');

    players.forEach(player => {
        const board = document.createElement('div');
        board.className = 'player-board';
        board.dataset.playerId = player.id;

        const header = document.createElement('div');
        header.className = 'player-header';
        if (player.id === currentUserId) {
            header.innerHTML =
                `<h3>${player.name}</h3>
            <div">Your Board</div>
            <div class="score">Score: ${player.board.score}</div>
            ${player.hasStartingTile ? '<div class="starting-tile">⭐</div>' : ''}`;
        } else {
            header.innerHTML =
                `<h3>${player.name}</h3>
            <div class="score">Score: ${player.board.score}</div>
            ${player.hasStartingTile ? '<div class="starting-tile">⭐</div>' : ''}`;
        }

        board.appendChild(header);

        // Create main board content container
        const boardContent = document.createElement('div');
        boardContent.className = 'player-board-content';

        // Pattern lines
        const patternLines = document.createElement('div');
        patternLines.className = 'pattern-lines';
        player.board.patternLines.forEach(line => {
            if (line.length > 0) {
                const lineDiv = document.createElement('div');
                lineDiv.className = 'pattern-line';

                const tilesContainer = document.createElement('div');
                tilesContainer.className = 'tiles-container';

                if (player.id === currentUserId && player.id === playerSart) {
                    if (hadTakenTile) {
                        lineDiv.innerHTML = `<span class="line-label">${line.length} -->:</span>`;
                    } else {
                        lineDiv.innerHTML = `<span class="line-label">${line.length}:</span>`;
                    }
                    lineDiv.addEventListener('click', function () {
                        placeTileOnPatternline(line)
                    })
                } else {
                    lineDiv.innerHTML = `<span class="line-label">${line.length}:</span>`;
                }

                lineDiv.appendChild(tilesContainer);

                for (let i = line.length - 1; i >= 0; i--) {
                    const tile = document.createElement('div');
                    tile.className = `tile ${i < line.numberOfTiles ? `tile-${getTileColor(line.tileType)}` : 'empty'}`;
                    tilesContainer.appendChild(tile);
                }

                patternLines.appendChild(lineDiv);
            }
        });
        boardContent.appendChild(patternLines);

        // Wall with tile images
        const wall = document.createElement('div');
        wall.className = 'wall';

        // Create wall rows based on Azul's pattern
        for (let row = 0; row < 5; row++) {
            const rowDiv = document.createElement('div');
            rowDiv.className = 'wall-row';

            for (let col = 0; col < 5; col++) {
                const cell = document.createElement('div');
                cell.className = 'wall-cell';

                // Determine color based on Azul's offset pattern
                let color;
                switch (row) {
                    case 0: color = ['blue', 'yellow', 'red', 'black', 'white'][col]; break;
                    case 1: color = ['white', 'blue', 'yellow', 'red', 'black'][col]; break;
                    case 2: color = ['black', 'white', 'blue', 'yellow', 'red'][col]; break;
                    case 3: color = ['red', 'black', 'white', 'blue', 'yellow'][col]; break;
                    case 4: color = ['yellow', 'red', 'black', 'white', 'blue'][col]; break;
                }

                // Check if tile is placed (1) or not (0)
                const isOccupied = player.board.wall[row][col].hasTile === true;

                cell.style.backgroundImage = `url(${tileImages[color]})`;
                cell.style.opacity = isOccupied ? '1' : '0.4';
                cell.className += isOccupied ? ' occupied' : ' empty';

                rowDiv.appendChild(cell);
            }
            wall.appendChild(rowDiv);
        }
        boardContent.appendChild(wall);

        board.appendChild(boardContent);

        // Floor line with 7 positions
        const floorLine = document.createElement('div');
        floorLine.className = 'floor-line';
        floorLine.innerHTML = '<span class="label">Floor:</span>';

        floorLine.addEventListener('click', function () {
            if (player.id === currentUserId && player.id === playerSart) {
                if (hadTakenTile) {
                    placeTileOnFloorline();
                } else {
                    alert('You still have tiles to place before you can take new ones.');
                    return;
                }
            }
        })

        // Create all 7 floor positions with penalty indicators
        for (let i = 0; i < 7; i++) {
            const floorPos = document.createElement('div');
            floorPos.className = 'floor-position';

            const hasTile = player.board.floorLine[i] && player.board.floorLine[i].hasTile;
            const tileType = hasTile ? player.board.floorLine[i].type : null;

            if (hasTile) {
                const tile = document.createElement('div');
                tile.className = `tile tile-${getTileColor(tileType)}`;
                floorPos.appendChild(tile);
            } else {
                floorPos.classList.add('empty');
            }

            // Add penalty indicator
            const penaltyBadge = document.createElement('div');
            penaltyBadge.className = 'penalty-badge';
            penaltyBadge.textContent = getFloorPenalty(i);
            floorPos.appendChild(penaltyBadge);

            floorLine.appendChild(floorPos);
        }

        board.appendChild(floorLine);
        container.appendChild(board);
    });
}

function placeTileOnPatternline(line) {
    try {
        const token = sessionStorage.getItem('userToken');
        const gameId = sessionStorage.getItem('gameId');

        fetch(`https://azul32.onrender.com/api/Games/${gameId}/place-tiles-on-patternline`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify({
                patternLineIndex: line.length - 1,
            })
        }).then(res => {
            if (!res.ok) {
                console.error('API request failed:', res.status);
            }
        });
    } catch (e) {
        console.error('Error:', e);
    }
}

function placeTileOnFloorline() {
    try {
        const token = sessionStorage.getItem('userToken');
        const gameId = sessionStorage.getItem('gameId');

        fetch(`https://azul32.onrender.com/api/Games/${gameId}/place-tiles-on-floorline`, {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            }
        }).then(res => {
            if (!res.ok) {
                console.error('API request failed:', res.status);
            }
        });
    } catch (e) {
        console.error('Error:', e);
    }
}

function hashGameState(gameData) {
    return JSON.stringify({
        players: gameData.players.map(p => ({
            id: p.id,
            board: p.board,
            tilesToPlace: p.tilesToPlace
        })),
        tileFactory: gameData.tileFactory,
        roundNumber: gameData.roundNumber
    });
}

function getUserIdFromToken() {
    const token = sessionStorage.getItem('userToken');
    if (!token) {
        return null;
    }
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        return payload.nameid;
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return null;
    }
}

// Helper function for floor penalties
function getFloorPenalty(position) {
    const penalties = ['-1', '-1', '-2', '-2', '-2', '-3', '-3'];
    return penalties[position] || '0';
}

// Helper function to get tile color name
function getTileColor(tileType) {
    const colors = {
        0: 'startingTile',
        11: 'blue',
        12: 'yellow',
        13: 'red',
        14: 'black',
        15: 'white'
    };
    return colors[tileType] || 'unknown';
}

async function handleLeaveTable(tableId) {
    const userToken = sessionStorage.getItem('userToken');

    if (!userToken) {
        showError('User not authenticated');
        return;
    }

    try {
        // Show loading state
        const leaveButton = document.getElementById('leave-button');
        leaveButton.disabled = true;
        leaveButton.textContent = 'Leaving...';

        // Make POST request to leave table
        const response = await fetch(`https://azul32.onrender.com/api/Tables/${tableId}/leave`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${userToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to leave table: ${response.status}`);
        }

        // Clear table-related data from storage
        sessionStorage.removeItem('currentTable');

        // Redirect back to main page or wherever appropriate
        window.location.href = 'index.html';

    } catch (error) {
        console.error('Error leaving table:', error);
        showError(error.message);

        // Reset button state
        const leaveButton = document.getElementById('leave-button');
        leaveButton.disabled = false;
        leaveButton.textContent = 'Leave Table';
    }
}
function showError(message) {
    const errorContainer = document.getElementById('error-container');
    errorContainer.textContent = message;
    errorContainer.style.display = 'block';

    // Hide error after 5 seconds
    setTimeout(() => {
        errorContainer.style.display = 'none';
    }, 5000);
};

// -------- Chatbox Functionaliteit --------

// DOM Elements
const chatIcon = document.getElementById('chat-icon');
const chatContainer = document.getElementById('chat-container');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('chat-message');
const sendButton = document.getElementById('send-message');

// Add event listener for send button
sendButton.addEventListener('click', sendMessage);

// Also allow sending with Enter key
messageInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Get player name from your existing game state
function getCurrentPlayerName() {
    const token = sessionStorage.getItem('userToken');
    if (!token) return "Player";

    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const payload = JSON.parse(jsonPayload);
        console.log('JWT Payload:', payload);  // <-- Add this line

        return payload.unique_name || payload.name || payload.username || payload.sub || "Player";
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return "Player";
    }
}


// Enhanced loadMessages() with player names and timestamps
function loadMessages() {
    const messages = JSON.parse(localStorage.getItem('azul-chat') || '[]');
    chatMessages.innerHTML = messages.map(msg => `
        <div class="message">
            <span class="sender">${msg.sender}:</span>
            <span class="text">${msg.text}</span>
            <span class="time">${msg.time}</span>
        </div>
    `).join('');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Enhanced sendMessage() with real-time sync
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    const newMessage = {
        sender: getCurrentPlayerName(),
        text: text,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Save to session storage
    const messages = JSON.parse(localStorage.getItem('azul-chat') || '[]');
    messages.push(newMessage);
    localStorage.setItem('azul-chat', JSON.stringify(messages));

    // Update UI immediately
    loadMessages();

    // Clear input
    messageInput.value = '';
    messageInput.focus();
}

// Clear chat when new game starts
function checkForNewGame() {
    const currentGameId = sessionStorage.getItem('gameId');
    const lastGameId = localStorage.getItem('lastGameId');

    if (currentGameId && currentGameId !== lastGameId) {
        // New game detected, clear chat
        localStorage.removeItem('azul-chat');
        localStorage.setItem('lastGameId', currentGameId);
        loadMessages(); // Refresh chat to show it's empty
    }
}

// Enhanced storage listener for instant updates
window.addEventListener('storage', (e) => {
    if (e.key === 'azul-chat') {
        loadMessages();

        // Flash chat icon on new message (if chat is closed)
        if (chatContainer.style.display !== 'block') {
            chatIcon.classList.add('new-message');
            setTimeout(() => chatIcon.classList.remove('new-message'), 500);
        }
    }
});

// Toggle Chat
chatIcon.addEventListener('click', () => {
    const isVisible = chatContainer.style.display === 'block';
    chatContainer.style.display = isVisible ? 'none' : 'block';
    if (!isVisible) {
        messageInput.focus();
        chatIcon.classList.remove('new-message');
    }
});

// Initialize chat
function initializeChat() {
    checkForNewGame();
    loadMessages();
}

// Call initializeChat when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeChat);
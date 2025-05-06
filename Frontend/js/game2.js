document.addEventListener('DOMContentLoaded', async function () {
    setInterval(async function () {
        try {
            // Haal tableId uit de URL
            const urlParams = new URLSearchParams(window.location.search);
            const tableId = urlParams.get('tableId');

            if (!tableId) {
                console.error('Table ID not found in URL');
                return;
            }

            const token = sessionStorage.getItem('userToken');
            const res = await fetch(`https://localhost:5051/api/Tables/${tableId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain'
                }
            });

            if (!res.ok) {
                console.error('API request failed:', res.status);
                return;
            }

            const data = await res.json();
            const gameId = data.gameId;
            sessionStorage.setItem('count', data.preferences.numberOfFactoryDisplays);
            renderGame(data);
            gameInfo(gameId)// Verwerk de ontvangen data
            return gameId; // Return the gameId for further use

        } catch (e) {
            console.error('Error:', e);
        }
    }, 1000); // Poll every 3 seconds
    
});



function renderGame(data) {
    // Render game info
    document.getElementById('game-id').textContent = `Game ID: ${data.id}`;
    document.getElementById('player-count').textContent =
        `Players: ${data.seatedPlayers.length} (${data.preferences.numberOfArtificialPlayers} AI)`;
    document.getElementById('factory-count').textContent =
        `Factory Displays: ${data.preferences.numberOfFactoryDisplays}`;

    // Clear existing player boards before rendering new ones
    const playerBoardsContainer = document.getElementById('player-boards');
    playerBoardsContainer.innerHTML = '';

    // Haal de currentPlayerId op uit sessionStorage
    
    renderPlayerBoards(data.seatedPlayers);
}
function gameInfo(gameId) {
    setInterval(async function () {
        try {
            const token = sessionStorage.getItem('userToken');

            const res = await fetch(`https://localhost:5051/api/Games/${gameId}`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain'
                }
            });
            if (!res.ok) return;
            const data = await res.json();

            const tileFactory = data.tileFactory;
            const currentPlayerId = data.playerToPlayId;

            document.querySelectorAll('.player-board').forEach(board => {
                // Verwijder eerst de current-player class van alle boards
                board.classList.remove('current-player');

                // Voeg de class alleen toe aan het board van de huidige speler
                if (board.dataset.playerId === currentPlayerId) {
                    board.classList.add('current-player');
                }
            });
            renderFactoryDisplays(sessionStorage.getItem('count'), tileFactory);

            return tileFactory; // Return the tileFactory for further use


        } catch (e) {
            console.error('Poll error:', e);
        }
    }, 1000);
}

function renderFactoryDisplays(count, tileFactory) {
    const container = document.getElementById('factory-displays');
    container.innerHTML = `<h2>Factory Displays (${count})</h2>`;

    const tileImages = {
        11: '../Images/Tiles/plainblue.png',    // Blue
        12: '../Images/Tiles/yellowred.png',  // Yellow
        13: '../Images/Tiles/plainred.png',     // Red
        14: '../Images/Tiles/blackblue.png',   // Black
        15: '../Images/Tiles/whiteturquoise.png'    // White
    };

    for (let i = 0; i < count; i++) {
        const display = document.createElement('div');
        display.className = 'factory-display';
        display.innerHTML = `<h3>Display ${i + 1}</h3><div class="tiles"></div>`;

        const tilesContainer = display.querySelector('.tiles');

        // Loop door de tiles van dit display
        tileFactory.displays[i].tiles.forEach(tileType => {
            const tileImg = document.createElement('img');
            tileImg.src = `images/${tileImages[tileType]}`;
            tileImg.className = 'tile';
            tileImg.alt = `Tile ${tileType}`;
            tilesContainer.appendChild(tileImg);
        });

        container.appendChild(display);
    }
}

function renderPlayerBoards(players) {
    const container = document.getElementById('player-boards');
    container.innerHTML = '';
    const tileImages = {
        blue: '../Frontend/Images/Tiles/plainblue.png',
        yellow: '../Frontend/Images/Tiles/yellowred.png',
        red: '../Frontend/Images/Tiles/plainred.png',
        black: '../Frontend/Images/Tiles/blackblue.png',
        white: '../Frontend/Images/Tiles/whiteturquoise.png'
    };

    players.forEach(player => {
        const board = document.createElement('div');
        board.className = 'player-board';

        board.dataset.playerId = player.id;

        
        const header = document.createElement('div');
        header.className = 'player-header';
        header.innerHTML = `
            <h3>${player.name}</h3>
            <div class="score">Score: ${player.board.score}</div>
            ${player.hasStartingTile ? '<div class="starting-tile">⭐</div>' : ''}
        `;
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

                lineDiv.innerHTML = `<span class="line-label">${line.length}:</span>`;
                lineDiv.appendChild(tilesContainer);

                for (let i = 0; i < line.length; i++) {
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
                const isOccupied = player.board.wall[row][col] === '1';

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

// Helper function for floor penalties
function getFloorPenalty(position) {
    const penalties = ['-1', '-1', '-2', '-2', '-2', '-3', '-3'];
    return penalties[position] || '0';
}

// Helper function to get tile color name
function getTileColor(tileType) {
    const colors = {
        11: 'blue',
        12: 'yellow',
        13: 'red',
        14: 'black',
        15: 'white'
    };
    return colors[tileType] || 'unknown';
}

// Helper function for floor penalties
function getFloorPenalty(position) {
    const penalties = ['-1', '-1', '-2', '-2', '-2', '-3', '-3'];
    return penalties[position] || '0';
}
    function getTileColor(tileType) {
        const colors = {
            11: 'blue',
            12: 'yellow',
            13: 'red',
            14: 'black',
            15: 'white'
        };
        return colors[tileType] || 'unknown';
}

document.addEventListener('DOMContentLoaded', async function () {
    const tableId = new URLSearchParams(window.location.search).get('tableId');
    const leaveButton = document.getElementById('leave-button');
    leaveButton.addEventListener('click', () => handleLeaveTable(tableId));
});

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
        const response = await fetch(`https://localhost:5051/api/Tables/${tableId}/leave`, {
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
}

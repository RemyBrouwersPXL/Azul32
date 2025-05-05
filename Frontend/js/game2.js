document.addEventListener('DOMContentLoaded', async function () {
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
        sessionStorage.setItem('count', data.preferences.numberOfFactoryDisplays); // Sla gameId op in sessionStorage
        renderGame(data);
        gameInfo(gameId)// Verwerk de ontvangen data
        return gameId; // Return the gameId for further use

    } catch (e) {
        console.error('Error:', e);
    }
});

function renderGame(data) {
    // Render game info
    document.getElementById('game-id').textContent = `Game ID: ${data.id}`;
    document.getElementById('player-count').textContent =
        `Players: ${data.seatedPlayers.length} (${data.preferences.numberOfArtificialPlayers} AI)`;
    document.getElementById('factory-count').textContent =
        `Factory Displays: ${data.preferences.numberOfFactoryDisplays}`;

    // Render factory displays
    

    // Render player boards
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
            renderFactoryDisplays(sessionStorage.getItem('count'), tileFactory)
            return tileFactory;


        } catch (e) {
            console.error('Poll error:', e);
        }
    }, 3000);
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
       //container.innerHTML = '<h2>Player Boards</h2>';

        players.forEach(player => {
            const board = document.createElement('div');
            board.className = 'player-board';

            // Player header
            const header = document.createElement('div');
            header.className = 'player-header';
            header.innerHTML = `
                <h3>${player.name}</h3>
                <div class="score">Score: ${player.board.score}</div>
                ${player.hasStartingTile ? '<div class="starting-tile">⭐</div>' : ''}
            `;
            board.appendChild(header);

            // Pattern lines
            const patternLines = document.createElement('div');
            patternLines.className = 'pattern-lines';
            player.board.patternLines.forEach(line => {
                if (line.length > 0) { // Only show active lines
                    const lineDiv = document.createElement('div');
                    lineDiv.className = 'pattern-line';
                    lineDiv.innerHTML = `<span class="line-label">${line.length}:</span>`;

                    for (let i = 0; i < line.length; i++) {
                        const tile = document.createElement('div');
                        tile.className = `tile ${i < line.numberOfTiles ? `tile-${getTileColor(line.tileType)}` : 'empty'}`;
                        lineDiv.appendChild(tile);
                    }

                    patternLines.appendChild(lineDiv);
                }
            });
            board.appendChild(patternLines);

            // Wall
            const wall = document.createElement('div');
            wall.className = 'wall';
            player.board.wall.forEach(row => {
                const rowDiv = document.createElement('div');
                rowDiv.className = 'wall-row';

                for (let i = 0; i < row.length; i++) {
                    const cell = document.createElement('div');
                    cell.className = `wall-cell ${row[i] === '1' ? 'occupied' : 'empty'}`;
                    rowDiv.appendChild(cell);
                }

                wall.appendChild(rowDiv);
            });
            board.appendChild(wall);

            // Floor line
            const floorLine = document.createElement('div');
            floorLine.className = 'floor-line';
            floorLine.innerHTML = '<span class="label">Floor:</span>';

            player.board.floorLine.forEach(tile => {
                if (tile.hasTile) {
                    const tileDiv = document.createElement('div');
                    tileDiv.className = `tile tile-${getTileColor(tile.type)}`;
                    floorLine.appendChild(tileDiv);
                }
            });
            board.appendChild(floorLine);

            container.appendChild(board);
        });
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

  
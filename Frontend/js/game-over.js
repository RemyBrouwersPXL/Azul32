document.addEventListener("DOMContentLoaded", async function() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const gameId = urlParams.get('gameId');
        const token = sessionStorage.getItem('userToken');

        const gameRes = await fetch(`https://localhost:5051/api/Games/${gameId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            }
        });
        if (!gameRes.ok) throw new Error('Failed to fetch game data');
        const data = await gameRes.json();

        if (!data.hasEnded) return;

        const podium = document.getElementById('podium');

        const players = data.players.map(p => ({
            name: p.name,
            score: p.board.score
        }));


        players.sort((a, b) => b.score - a.score);

        players.forEach((player, index) => {
            const div = document.createElement('div');
            div.classList.add('podium-player');

            if (index === 0) div.classList.add('podium-1');
            else if (index === 1) div.classList.add('podium-2');
            else if (index === 2) div.classList.add('podium-3');
            else if (index === 3) div.classList.add('podium-4');
            else div.style.height = `${100 - index * 10}px`; // lagere spelers

            div.innerHTML = `
                <h2>${index + 1}e: ${player.name}</h2>
                <div class="score">${player.score} punten</div>
                `;
            podium.appendChild(div);
        });

        const fanfare = new Audio('music/fanfare.mp3');
        fanfare.play().catch(err => {
            console.warn("Couldn't autoplay fanfare:", err);
        });


        const firstPlaceDiv = document.querySelector('.podium-1');
        if (firstPlaceDiv) {
            firstPlaceDiv.addEventListener('click', () => {
                if (!firstPlaceDiv.querySelector('.crown')) {
                    const crown = document.createElement('div');
                    crown.className = 'crown';
                    firstPlaceDiv.appendChild(crown);
                    new Audio('music/fanfare.mp3').play().catch(() => { });
                }
            });
        }


    } catch (e) {
        console.error('Polling error:', e);
    }    
});

const leaveButton = document.getElementById('leave-button');
leaveButton.addEventListener('click', async () => {
    window.location.href = "index.html";
});

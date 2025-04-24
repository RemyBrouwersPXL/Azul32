document.addEventListener('DOMContentLoaded', function () {
    const gameButton = document.getElementById('gameMode');
    const overlay = document.getElementById('loaderOverlay');
    const loadingMsg = document.getElementById('loading_msg');

    console.log('Lobby script loaded. Elements:', { gameButton, overlay, loadingMsg });

    gameButton.addEventListener('click', async function () {
        console.log('gameMode clicked');

        overlay.style.display = 'flex';
        loadingMsg.style.display = 'block';   
        gameButton.style.display = 'none';

    // Darken the background
    document.span.style.filter = 'brightness(0.7)';

    // You can add your game loading logic here

    try {
        const response = await fetch('/api/Tables/join-or-create', { //hier heb ik een verzoek verzonden naar de backend
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ desiredPlayers: 2 }) //twee spelers nodig
        });
        console.log('Fetch completed:', response.status);


        const data = await response.json(); //leest json response
        console.log('Server data:', data);

        overlay.style.display = 'none';
        document.body.style.filter = 'none';

        let info = document.getElementById('tableInfo'); //toon tabel info
        if (!info) {
            info = document.createElement('div');
            info.id = 'tableInfo';
            info.className = 'table-info';
            document.body.appendChild(info);
        }

        const waiting = data.maxPlayers - data.currentPlayers;
     
    }
    
    // Example: After 5 seconds, hide the loader (remove this in production)
    // setTimeout(function() {
    //     document.getElementById('loaderOverlay').style.display = 'none';
    //     document.body.style.filter = 'none';
    // }, 5000); **/
    });
});
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
        const response = await fetch('/api/Tables/join-or-create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ desiredPlayers: 2 })
        });
        console.log('Fetch completed:', response.status);

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        console.log('Server data:', data);

        overlay.style.display = 'none';
        document.body.style.filter = 'none';

        let info = document.getElementById('tableInfo');
        if (!info) {
            info = document.createElement('div');
            info.id = 'tableInfo';
            info.className = 'table-info';
            document.body.appendChild(info);
        }

        const waiting = data.maxPlayers - data.currentPlayers;
        info.innerHTML = `
        <p>You're at table <strong>${data.tableId}</strong></p>
        <p>Players: ${data.currentPlayers}/${data.maxPlayers}</p>
        <p>${waiting > 0
                ? `Waiting for ${waiting} your opponent${waiting > 1 ? 's' : ''}…`
                : `<em>Congratsulations! All players joined, starting soon…</em>`
            }</p>
      `;
    }
    catch (err) {
        console.error('Error in join-or-create:', err);
        overlay.style.display = 'none';
        document.body.style.filter = 'none';
        gameButton.style.display = 'block';
        alert('Sorry! There was an error joining the table: ' + err.message);
    }
    // Example: After 5 seconds, hide the loader (remove this in production)
    // setTimeout(function() {
    //     document.getElementById('loaderOverlay').style.display = 'none';
    //     document.body.style.filter = 'none';
    // }, 5000); **/
    });
});
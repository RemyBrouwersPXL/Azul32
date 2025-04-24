document.getElementById('gameMode').addEventListener('click', function () {
    // Show loader and overlay
    document.getElementById('loaderOverlay').style.display = 'flex';
    document.getElementById('gameMode').style.display = 'none';
    document.getElementById('loading_msg').style.display = 'unset';

    // Darken the background
    document.span.style.filter = 'brightness(0.7)';

    // You can add your game loading logic here
    try {
        const response = await fetch('/api/Tables/join-or-create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
                // 'Authorization': 'Bearer ' + localStorage.getItem('token'),
            },
            body: JSON.stringify({ desiredPlayers: 2 })
        })

        if (!response.ok) {
            throw new Error(`Server returned ${response.status}`)
        }

        const data = await response.json()

        // hide loader & restore background
        overlay.style.display = 'none'
        document.body.style.filter = 'brightness(1)'

        // render or create table info
        let info = document.getElementById('tableInfo')
        if (!info) {
            info = document.createElement('div')
            info.id = 'tableInfo'
            document.body.appendChild(info)
        }

        const waiting = data.maxPlayers - data.currentPlayers
        info.innerHTML = `
        <p> You’re at table ${data.tableId}</p>
        <p>Players: ${data.currentPlayers}/${data.maxPlayers}</p>
        <p>${waiting > 0
                ? `Waiting for ${waiting} more opponent${waiting > 1 ? 's' : ''}…`
                : `<em>All players joined, game starting soon…</em>`
            }</p>
      `
    }
    catch (err) {
        // on error, reset UI
        overlay.style.display = 'none'
        document.body.style.filter = 'brightness(1)'
        gameBtn.style.display = 'flex'
        alert(`There is an error joining the table: ${err.message}`)
    }
    // Example: After 5 seconds, hide the loader (remove this in production)
    // setTimeout(function() {
    //     document.getElementById('loaderOverlay').style.display = 'none';
    //     document.body.style.filter = 'none';
    // }, 5000);
});
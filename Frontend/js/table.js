document.addEventListener('DOMContentLoaded', function () {
    // Get table ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const tableId = urlParams.get('tableId');

    if (!tableId) {
        console.error('No table ID found in URL');
        showError('Table ID missing');
        return;
    }
    
    
    function getTableRegistry() {
        return JSON.parse(localStorage.getItem('tableRegistrys')) || {};
    }

    function setTableRegistry(registrys) {
        localStorage.setItem('tableRegistrys', JSON.stringify(registrys));
    }

    function getTableCounter() {
        return parseInt(localStorage.getItem('tableCounters')) || 1;
    }

    function setTableCounter(counters) {
        localStorage.setItem('tableCounters', counters.toString());
    }

    function getTableNumberFromLocalStorage(tableId) {
        let tableRegistrys = getTableRegistry();
        let tableCounters = getTableCounter();

        if (tableRegistrys[tableId] !== undefined) {
            return tableRegistrys[tableId];
        }

        const newNumber = tableCounters;
        tableRegistrys[tableId] = newNumber;

        setTableRegistry(tableRegistrys);
        setTableCounter(tableCounters + 1);

        return newNumber;
    }

    function removeTableId(tableId) {
        let tableRegistrys = getTableRegistry();

        if (tableRegistrys[tableId] !== undefined) {
            delete tableRegistrys[tableId];
            setTableRegistry(tableRegistrys);
        }
    }

    // --- Gebruiksvoorbeeld ---
    
    const tableNumber = getTableNumberFromLocalStorage(tableId);

    document.getElementById('table-id-display').textContent = tableNumber;


    // Initialize the page with table ID
    //document.getElementById('table-id-display').textContent = tableId;

  

   /** 
    * HIER IS DIE CODE
    * 
    * fetch gaat ophalen van de huidige gegevens van de speelers via de API en token
    * 3000 gekozen omdat het moet herhalen elke 3 seconden
    * voorwaarden worden gecheckt seatedPlayers >= totalSets om te zien of tafel vol is
    * window.location.href is dan doorsturen naar game.html
    * await res.json omdat die dan een response zal halen uit json-body
    * 
    * 
    * */
    setInterval(async function () {
        try {
            const token = sessionStorage.getItem('userToken');
            const res = await fetch(
                'https://localhost:5051/api/Tables/' + tableId, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain'
                }
            }
            );
            if (!res.ok) return;
            const data = await res.json();
            const seated = data.seatedPlayers.length;
            const total = data.hasAvailableSeat;
            const aiPlayersCount = data.preferences.numberOfArtificialPlayers;

            let contentPlayers = document.getElementById('aantal')
            contentPlayers.innerText = `Players: ${seated} (of which AI: ${aiPlayersCount})`;

            if (total == false) {
                window.location.href = 'game.html?tableId=' + tableId;
            }
            if (seated === 0) {
                // Geen spelers meer -> verwijderen uit localStorage
                removeTableId(tableId);
            }

            
        } catch (e) {
            console.error('Poll error:', e);
        }
    }, 3000); 


    // Setup leave button
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


//const hasAvailableSeat = sessionStorage.getItem('hasAvailableSeat');


//if (hasAvailableSeat === 'false') {
//    window.location.href = './game.html?gameId=';
//}

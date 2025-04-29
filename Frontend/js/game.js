const urlParams = new URLSearchParams(window.location.search);
const tableId = urlParams.get('tableId');
//
// Setup leave button
const leaveButton = document.getElementById('leave-button');
leaveButton.addEventListener('click', () => handleLeaveTable(tableId));

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


//try catch if in interval 5sec fetch moet tableid te pakken staat in de url. table.js url
//variabek data met const data zijn

const params = new URLSearchParams(window.location.search);
const tableId = params.get('tableId');

setInterval(async () => {
    try {
        const token = sessionStorage.getItem('userToken');
        const res = await fetch(
            `https://localhost:5051/api/Tables/${tableId}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        if (!res.ok) throw new Error(`Status ${res.status}`);

        const data = await res.json();

    } catch (err) {
        console.error('Fout bij polling van tafel:', err);

    }
}, 5000);

document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.querySelector('.submit');
    submitButton.addEventListener("click", handleSubmitButtonClick);
})

async function handleSubmitButtonClick(event) {
    event.preventDefault();
    console.log('gameMode clicked');

    const players = document.getElementById('player').value.trim();
    const bots = document.getElementById('bots').value;
    clearErrors();
    console.log('players:', players);

    const player = parseInt(players);
    const bot = parseInt(bots);
    const people = player + bot;
    console.log('people:', people);

    let isValid = true;
    if (people > 4) {
        showError('player', 'Too many people');
        isValid = false;
    }

    const form = document.querySelectorAll('.form')[0];
    form.style.display = 'none';

    if (isValid) {
        // Show the loader before processing
        await showLoader();

        const userData = {
            numberOfPlayers: players,
            numberOfArtificialPlayers: bots,
        };

        try {
            await sendRegistration(userData);
        } catch (error) {
            showError('form', error.message);
            console.error('Registration failed:', error);
        } finally {
            // Hide the loader when done
            hideLoader();
        }
    }
}

function showError(fieldId, message) {
    if (fieldId === 'form') {
        const form = document.querySelector('.form');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.marginBottom = '15px';
        form.prepend(errorElement);
    } else {
        const field = document.getElementById(fieldId);
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.8em';
        field.parentNode.appendChild(errorElement);
    }
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

async function sendRegistration(userData) {
    const userToken = sessionStorage.getItem('userToken');
    console.log('Sending to backend:', userToken);

    // 1. First create/join the table (POST request)
    const response = await fetch('https://localhost:5051/api/Tables/join-or-create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken,
            'Accept': 'application/json' // Changed to expect JSON response
        },
        body: JSON.stringify(userData)
    });

    if (!response.ok) {
        throw new Error('Registration failed');
    }

    const result = await response.json();
    console.log('Table created/joined:', result);

    // 2. Get the table ID from the response and fetch table details
    const tableId = result.id; // Adjust this based on your API response structure
    await fetchTableDetails(tableId);
    sessionStorage.setItem('hasAvailableSeat', result.hasAvailableSeat);
    sessionStorage.setItem('aantal', result.seatedPlayers);

    // 3. Redirect to table.html with the table ID
    window.location.href = `table.html?tableId=${tableId}`;

    return result;
}

async function fetchTableDetails(tableId) {
    const userToken = sessionStorage.getItem('userToken');

    try {
        const response = await fetch(`https://localhost:5051/api/Tables/${tableId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + userToken,
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            console.warn('Failed to fetch table details, but continuing anyway');
            return;
        }

        const tableDetails = await response.json();
        console.log('Table details:', tableDetails);
        // You can store these details or use them as needed
        sessionStorage.setItem('currentTable', JSON.stringify(tableDetails));
        

    } catch (error) {
        console.error('Error fetching table details:', error);
        // Even if this fails, we'll still proceed with the redirect
    }
}

function getRandomDelay(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function showLoader() {
    const overlay = document.getElementById('loaderOverlay');
    const loadingMsg = document.getElementById('loading_msg');
    const submitButton = document.querySelector('.submit');

    // Show loader
    overlay.style.display = 'flex';
    loadingMsg.style.display = 'block';
    submitButton.style.display = 'none';

    // Apply dimming effect to the page
    document.body.style.filter = 'brightness(0.7)';

    // Wait for random time between 5-10 seconds
    const delayTime = getRandomDelay(5000, 10000);
    await delay(delayTime);
}

function hideLoader() {
    const overlay = document.getElementById('loaderOverlay');
    const loadingMsg = document.getElementById('loading_msg');
    const submitButton = document.querySelector('.submit');

    // Hide loader
    overlay.style.display = 'none';
    loadingMsg.style.display = 'none';
    submitButton.style.display = 'block';

    // Remove dimming effect
    document.body.style.filter = 'brightness(1)';
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
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

    let isValid = true;
    
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

function openModal() {
    document.getElementById('profileModal').style.display = 'block';
    try {
        const userId = getUserIdFromToken();
        
        // Fetch user profile data
        fetch(`https://azul32.onrender.com/api/Player/${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            }
        })
            .then(response => response.json())
            .then(data => {
                document.getElementById('name').value = data.name || '';
                document.querySelector(`input[name="color"][value="${data.color}"]`).checked = true;
                document.getElementById('bio').value = data.bio || '';
            })
            .catch(error => console.error('Error fetching profile:', error));
    }
    catch (error) {
        console.error('Error opening modal:', error);
        alert('Er is een fout opgetreden bij het openen van het profiel.');
    }
}

function closeModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// Formulier versturen naar backend
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        userName: document.getElementById('name').value,
        color: document.querySelector('input[name="color"]:checked')?.value,
        bio: document.getElementById('bio').value,
        avatarUrl: document.getElementById('avatarUrl').value || ""
    };

    const userId = getUserIdFromToken();

    try {
        const response = await fetch(`https://azul32.onrender.com/api/Player/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Profiel opgeslagen!');
            closeModal();
        } else {
            alert('Fout bij opslaan!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Server niet bereikbaar.');
    }
});

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
    const response = await fetch('https://azul32.onrender.com/api/Tables/join-or-create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken,
            'Accept': 'text/plain' // Changed to expect JSON response
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
        const response = await fetch(`https://azul32.onrender.com/api/Tables/${tableId}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + userToken,
                'Accept': 'text/plain'
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

    // Wait for random time between 3-5 seconds
    const delayTime = getRandomDelay(3000, 5000);
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

const playerSelect = document.getElementById('player');
const botsSelect = document.getElementById('bots');

function updateBotOptions() {
    const selectedPlayers = parseInt(playerSelect.value);
    const botOptions = botsSelect.options;

    for (let i = 0; i < botOptions.length; i++) {
        if (botOptions[i].value === "2") {
            if (selectedPlayers === 2) {
                botOptions[i].disabled = true;
                if (botsSelect.value === "2") {
                    botsSelect.value = "1";
                }
            } else {
                botOptions[i].disabled = false;
            }
        }
    }
}

updateBotOptions();
playerSelect.addEventListener('change', updateBotOptions);

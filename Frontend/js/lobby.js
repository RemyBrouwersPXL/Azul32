document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.querySelector('.submit');
    
    submitButton.addEventListener("click", handleSubmitButtonClick);

    
})

function handleSubmitButtonClick(event) {
    event.preventDefault();

    console.log('gameMode clicked');
    

    //processWithDelay();

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
        const userData = {
            numberOfPlayers: players,
            numberOfArtificialPlayers: bots,
        };
        sendRegistration(userData);
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
    
function sendRegistration(userData) {
    const userToken = sessionStorage.getItem('userToken');
    console.log('Sending to backend:', userToken);
    fetch('https://localhost:5051/api/Tables/join-or-create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + userToken,
            'Accept': 'text/plain'
        },
        body: JSON.stringify(userData)
    })
        .then(async response => {
            const text = await response.text; // Eerst als tekst lezen
        })

        .then(response => {
            const form = document.querySelector('.form');
            form.style.display = 'hidden';
        })
        
        .catch(error => {
            showError('form', error.message);
            console.error('Registration failed:', error);
        });
}

//function delay(ms) {
//    return new Promise(resolve => setTimeout(resolve, ms));
//}

//async function processWithDelay() {

//    const overlay = document.getElementById('loaderOverlay');
//    const loadingMsg = document.getElementById('loading_msg');
//    overlay.style.display = 'flex';
//    loadingMsg.style.display = 'block';
//    submitButton.style.display = 'none';

//    document.span.style.filter = 'brightness(0.7)';

//    await delay(5000);

//    overlay.style.display = 'none';
//    loadingMsg.style.display = 'none';
//    document.span.style.filter = 'brightness(1)';


//}



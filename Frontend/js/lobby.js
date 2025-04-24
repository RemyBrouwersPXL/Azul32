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
    const userToken = localStorage.getItem('userToken');
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





    // You can add your game loading logic here
/*
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
//    });
//});


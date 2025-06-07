document.addEventListener('DOMContentLoaded', function () {
    // Controleer op succesvolle registratie
    const urlParams = new URLSearchParams(window.location.search);
    const registrationSuccess = urlParams.get('registration');
    const instructionsButton = document.getElementById('leave-button');
    if (instructionsButton) {
        instructionsButton.addEventListener('click', function () {
            window.open('Azul Game Instructions.pdf', '_blank');
        });
    }

    if (registrationSuccess === 'success') {
        // Opgeslagen email ophalen
        const registeredEmail = localStorage.getItem('registeredEmail');

        if (registeredEmail) {
            // Email automatisch invulen indien het bestaat
            const emailField = document.getElementById('email'); // Verzekeren dat dit uw input ID matcht
            if (emailField) {
                emailField.value = registeredEmail;
            }

            // Opgeslagen Email verwijderen nadat dit gebruikt is
            localStorage.removeItem('registeredEmail');
        }
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.querySelector('.submit');
    submitButton.addEventListener("click", handleSubmitButtonClick);
});

(function () {
    const sequence = ['a', 'z', 'u', 'l'];
    let position = 0;
    const modal = document.getElementById('easter-egg-modal');

    document.addEventListener('keydown', e => {
        const key = e.key.toLowerCase();
        if (key === sequence[position]) {
            position++;
            if (position === sequence.length) {
                modal.style.display = 'block';
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 2000);
                position = 0;
            }
        } else {
            position = (key === sequence[0]) ? 1 : 0;
        }
    });
})();

setInterval(async function () {
    try {
        const token = sessionStorage.getItem('userToken');
        const res = await fetch(
            "https://azul32.onrender.com/api/Leaderboard"


        );
        if (!res.ok) return;
        const data = await res.json();
        data.sort((a, b) => b.highestScore - a.highestScore);
        createLeaderboard(data);


    } catch (e) {
        console.error('Poll error:', e);
    }
}, 3000);

function createLeaderboard(data) {
    const container = document.getElementById('leaderboard-container');
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    // Maak titel
    const title = document.createElement('h3');
    title.textContent = '🏆 Top Players';
    container.appendChild(title);

    // Maak genummerde lijst
    const ol = document.createElement('ol');

    // Voeg alleen de top 5 spelers toe (of aanpasbaar aantal)
    data.slice(0, 5).forEach(player => {
        const li = document.createElement('li');
        li.innerHTML = `
                    <strong>${player.userName}</strong> 
                    - High Score: ${player.highestScore} 
                    - Wins: ${player.wins}
                `;
        ol.appendChild(li);
    });

    container.appendChild(ol);

    // Optioneel: voeg een "meer zien" link toe
    const link = document.createElement('a');
    link.href = "#"; // Of link naar een volledig leaderboard
    link.textContent = "View full leaderboard →";
    link.style.display = "block";
    link.style.marginTop = "10px";
    link.style.color = "#1e3a8a";
    container.appendChild(link);
    }

    function handleSubmitButtonClick(event) {
        event.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        clearErrors();

        let isValid = true;

        if (!email) {
            showError('email', 'Email address is required!');
            isValid = false;
        }

        if (!password) {
            showError('password', 'Password is required!');
            isValid = false;
        }

        if (isValid) {
            const userData = {
                email: email,
                password: password,
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
        console.log('Sending to backend:', userData);

        fetch('https://azul32.onrender.com/api/authentication/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain'
            },
            body: JSON.stringify(userData)
        })
            .then(async response => {
                const text = await response.text(); // Eerst als tekst lezen
                try {
                    const data = text ? JSON.parse(text) : {}; // Probeer te parsen
                    if (!response.ok) {
                        throw new Error(
                            data.message ||
                            data.title ||
                            `Server error: ${response.status} ${response.statusText}`
                        );
                    }
                    return data;
                } catch (e) {
                    throw new Error(text || `Request failed with status ${response.status}`);
                }
            })
            .then(data => {
                let token = data.token
                sessionStorage.setItem('userToken', token);
                window.location.href = './lobby.html?token=' + token;

            })
            .catch(error => {
                showError('form', error.message);
                console.error('Registration failed:', error);
            });

    }



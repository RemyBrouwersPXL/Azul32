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

    fetch('https://localhost:5051/api/authentication/token', {
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



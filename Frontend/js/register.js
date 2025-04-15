document.addEventListener('DOMContentLoaded', function () {
    const submitButton = document.querySelector('.submit');
    submitButton.addEventListener("click", handleSubmitButtonClick);
});

function handleSubmitButtonClick(event) {
    event.preventDefault()

        const email = document.getElementById('email').value.trim();
        const userName = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const lastVisitToPortugal = document.getElementById('lastVisitToPortugal').value;

        clearErrors();

        let isValid = true;

        if (!email) {
            showError('email', 'Email address is required!');
            isValid = false;
        }

        if (!userName) {
            showError('username', 'Username is required!');
            isValid = false;
        }

        if (!password) {
            showError('password', 'Password is required!');
            isValid = false;
        } else if (password.length < 6) {
            showError('password', 'Password must be at least 6 characters long!');
            isValid = false;
        }

        if (!confirmPassword) {
            showError('confirmPassword', 'Confirm your password!');
            isValid = false;
        } else if (password !== confirmPassword) {
            showError('confirmPassword', 'Passwords do not match!');
            isValid = false;
        }

        if (lastVisitToPortugal && !validatePastDate(lastVisitToPortugal)) {
            showError('lastVisitToPortugal', 'Date must be in the past!');
            isValid = false;
        }

        if (isValid) {
            const userData = {
                email: email,
                userName: userName,  
                password: password,
                lastVisitToPortugal: lastVisitToPortugal || null  
            };
            sendRegistration(userData);
        }
    
}

function validatePastDate(dateString) {
    const inputDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    return inputDate < today;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    errorElement.style.color = 'red';
    errorElement.style.fontSize = '0.8em';

    field.parentNode.appendChild(errorElement);
}

function clearErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

function sendRegistration(userData) {
    console.log('Sending to backend:', userData);

    let url = 'https://localhost:5051/api/authentication/register';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Registration failed');
            return response.json();
        }
        return response.json();
    })
    .then(data => {
        window.location.href = '../index.html';
    })
        .catch(error => {
            showError('form', error.message || 'An error occurred during registration!')
        })

}

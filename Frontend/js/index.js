document.addEventListener('DOMContentLoaded', function () {
    // Check if registration was successful
    const urlParams = new URLSearchParams(window.location.search);
    const registrationSuccess = urlParams.get('registration');

    if (registrationSuccess === 'success') {
        // Retrieve the stored email
        const registeredEmail = localStorage.getItem('registeredEmail');

        if (registeredEmail) {
            // Auto-fill the email field if it exists
            const emailField = document.getElementById('email'); // Ensure this matches your input ID
            if (emailField) {
                emailField.value = registeredEmail;
            }

            // Optional: Clear the stored email after use
            localStorage.removeItem('registeredEmail');
        }
    }
});
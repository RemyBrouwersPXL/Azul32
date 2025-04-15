function registerForm() {
    const registerForm = document.getElementsByClassName('form');

    if (registerForm) {
        registerForm.addEventListener('submit')
    }
}





document.addEventListener('Load', registerForm)
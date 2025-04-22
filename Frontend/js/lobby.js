document.getElementById('gameMode').addEventListener('click', function () {
    // Show loader and overlay
    document.getElementById('loaderOverlay').style.display = 'flex';
    document.getElementById('gameMode').style.display = 'none';
    document.getElementById('loading_msg').style.display = 'unset';

    // Darken the background
    document.body.style.filter = 'brightness(0.7)';

    // You can add your game loading logic here

    // Example: After 5 seconds, hide the loader (remove this in production)
    // setTimeout(function() {
    //     document.getElementById('loaderOverlay').style.display = 'none';
    //     document.body.style.filter = 'none';
    // }, 5000);
});
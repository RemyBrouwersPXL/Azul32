document.getElementById('gameMode').addEventListener('click', function () {
    // Show loader and overlay
    document.getElementById('loaderOverlay').style.display = 'flex';

    // Darken the background (optional - if you want to darken the body content too)
    document.body.style.filter = 'brightness(0.7)';

    // You can add your game loading logic here

    // Example: After 5 seconds, hide the loader (remove this in production)
    // setTimeout(function() {
    //     document.getElementById('loaderOverlay').style.display = 'none';
    //     document.body.style.filter = 'none';
    // }, 5000);
});
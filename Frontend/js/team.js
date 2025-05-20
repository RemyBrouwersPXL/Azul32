
document.addEventListener('DOMContentLoaded', function () {
    const title = document.querySelector('header .title h1');
    let clickCount = 0;
    let resetTimer;

    title.addEventListener('click', function (e) {
        const rect = title.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const tileW = 32;
        const leftStart = 4;
        const leftEnd = leftStart + tileW;
        const rightEnd = rect.width - 4;
        const rightStart = rightEnd - tileW;

        if ((x >= leftStart && x <= leftEnd) || (x >= rightStart && x <= rightEnd)) {
            clickCount++;
            clearTimeout(resetTimer);
            resetTimer = setTimeout(() => { clickCount = 0; }, 1000);

            if (clickCount === 5) {
                launchConfetti();
                clickCount = 0;
            }
        }
    });
    function launchConfetti() {
        const overlay = document.createElement('div');
        overlay.className = 'confetti-overlay';
        document.body.appendChild(overlay);
        setTimeout(() => overlay.remove(), 4000);
    }
    const themeToggle = document.getElementById('theme-toggle');
    const bodyEl = document.body;
    const saved = localStorage.getItem('theme') || 'light';
    if (saved === 'dark') bodyEl.classList.add('dark-mode');
    themeToggle.textContent = bodyEl.classList.contains('dark-mode') ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        const isDark = bodyEl.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.textContent = isDark ? '☀️' : '🌙';
    });
});


/* js/theme.js */

document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('sidebar-theme-toggle');
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;

    // --- 1. Initialize Theme (System Default Support) ---
    function initTheme() {
        const savedTheme = localStorage.getItem('theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (savedTheme === 'light') {
            setLightMode();
        } else if (savedTheme === 'dark') {
            setDarkMode();
        } else {
            // No preference saved? Follow System
            if (systemPrefersDark) {
                setDarkMode();
            } else {
                setLightMode();
            }
        }
    }

    // --- 2. Helper: Turn ON Light Mode ---
    function setLightMode() {
        document.body.classList.add('light-mode');
        if (themeIcon) {
            themeIcon.className = 'fas fa-sun'; // Show Sun
        }
    }

    // --- 3. Helper: Turn ON Dark Mode ---
    function setDarkMode() {
        document.body.classList.remove('light-mode');
        if (themeIcon) {
            themeIcon.className = 'fas fa-moon'; // Show Moon
        }
    }

    // --- 4. Animation Helper ---
    function playAnimation() {
        if (!themeIcon) return;
        themeIcon.classList.remove('icon-rotate');
        void themeIcon.offsetWidth; // Trigger reflow to restart animation
        themeIcon.classList.add('icon-rotate');
    }

    // --- 5. Run Initialization ---
    initTheme();

    // --- 6. Click Event Listener ---
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            playAnimation();

            // Toggle Logic
            if (document.body.classList.contains('light-mode')) {
                // Switch to Dark
                setDarkMode();
                localStorage.setItem('theme', 'dark');
            } else {
                // Switch to Light
                setLightMode();
                localStorage.setItem('theme', 'light');
            }
        });
    }
});

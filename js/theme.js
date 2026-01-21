/* js/theme.js */

// 1. Run immediately (Before page loads) to prevent Flash
// We apply to HTML tag first because BODY doesn't exist yet
(function() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // If Light is saved, OR no preference but System is Light
    if (savedTheme === 'light' || (!savedTheme && !systemPrefersDark)) {
        document.documentElement.classList.add('light-mode');
    }
})();

// 2. Wait for page to finish loading to setup the Button and sync Body
document.addEventListener('DOMContentLoaded', () => {
    // SYNC: Make sure Body has the class if HTML has it
    if (document.documentElement.classList.contains('light-mode')) {
        document.body.classList.add('light-mode');
    }

    const themeBtn = document.getElementById('sidebar-theme-toggle');
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;

    // Helper: Update Icon based on current mode
    function updateIcon() {
        if (!themeIcon) return;
        // Check if light mode is active (we check HTML tag to be safe)
        const isLight = document.documentElement.classList.contains('light-mode');
        
        if (isLight) {
            themeIcon.className = 'fas fa-sun';
            themeBtn.style.color = '#f59e0b';
            themeBtn.style.borderColor = '#fcd34d';
            themeBtn.style.background = '#fff7ed';
        } else {
            themeIcon.className = 'fas fa-moon';
            themeBtn.style.color = ''; 
            themeBtn.style.borderColor = '';
            themeBtn.style.background = '';
        }
    }

    // Set initial icon state
    updateIcon();

    // Click Handler
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            // Toggle BOTH tags to ensure CSS works no matter what
            document.documentElement.classList.toggle('light-mode');
            document.body.classList.toggle('light-mode');
            
            // Animation effect
            themeIcon.classList.remove('icon-rotate');
            void themeIcon.offsetWidth; // Trigger reflow
            themeIcon.classList.add('icon-rotate');

            // Save Preference
            if (document.documentElement.classList.contains('light-mode')) {
                localStorage.setItem('theme', 'light');
            } else {
                localStorage.setItem('theme', 'dark');
            }
            
            updateIcon();
        });
    }
});

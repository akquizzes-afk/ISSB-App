// BULLETPROOF back button handler
document.addEventListener('DOMContentLoaded', function() {
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        const { App } = window.Capacitor.Plugins;
        
        App.addListener('backButton', function() {
            // Use explicitly set page name
            const currentPage = window.currentPage || 'index.html';
            
            if (currentPage !== 'index.html') {
                // Go back to home
                window.location.href = 'index.html';
            } else {
                // Exit app
                App.exitApp();
            }
        });
    }
});
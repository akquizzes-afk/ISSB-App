// APK-optimized back button handler
function initializeBackButton() {
    // Check if Capacitor is available
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.App) {
        console.log('Capacitor not available (running in browser) - back button disabled');
        return;
    }

    const { App } = window.Capacitor.Plugins;
    
    console.log('Capacitor App plugin found, initializing back button...');
    
    App.addListener('backButton', () => {
        console.log('Back button pressed!');
        
        // Method 1: Check current file name directly
        const currentPath = window.location.pathname;
        const currentHref = window.location.href;
        let currentFile = '';
        
        // Extract filename from path
        if (currentPath) {
            currentFile = currentPath.split('/').pop() || '';
        }
        
        console.log('Current file:', currentFile);
        console.log('Full href:', currentHref);
        
        // Check if we're on index.html (main page)
        const isIndexPage = 
            currentFile === 'index.html' ||
            currentFile === '' ||
            currentPath.endsWith('/') ||
            currentHref.endsWith('/') ||
            currentHref.includes('/index.html') ||
            !currentFile;
        
        console.log('Is index page:', isIndexPage);
        
        if (!isIndexPage) {
            console.log('Not on index - navigating back to index.html');
            // Use multiple navigation methods to ensure it works
            try {
                window.location.href = 'index.html';
            } catch (e) {
                window.location.replace('index.html');
            }
        } else {
            console.log('On index page - exiting app');
            App.exitApp();
        }
    });
}

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBackButton);
} else {
    initializeBackButton();
}
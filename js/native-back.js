// Robust back button handler with Capacitor readiness check
function initializeBackButton() {
    // Check if Capacitor is available
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.App) {
        console.warn('Capacitor App plugin not available yet, retrying...');
        setTimeout(initializeBackButton, 100);
        return;
    }

    const { App } = window.Capacitor.Plugins;
    
    console.log('Capacitor App plugin found, initializing back button...');
    
    App.addListener('backButton', () => {
        console.log('Back button pressed - Current URL:', window.location.href);
        
        // Simple and reliable page detection
        const currentUrl = window.location.href.toLowerCase();
        
        // Check if we're on any test page (not index.html)
        const isTestPage = currentUrl.includes('wat-test') || 
                          currentUrl.includes('picture-story') ||
                          currentUrl.includes('pointer-story') || 
                          currentUrl.includes('srt-test');
        
        if (isTestPage) {
            console.log('On test page - navigating to index.html');
            window.location.href = 'index.html';
        } else {
            console.log('On main page - exiting app');
            App.exitApp();
        }
    });
    
    console.log('Back button handler registered successfully');
}

// Wait for DOM and Capacitor to be ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing back button...');
    initializeBackButton();
});

// Also try initializing after a delay in case DOMContentLoaded already fired
setTimeout(initializeBackButton, 500);
// Function to write a log message to the <div> on the page
function debugLog(message) {
    const logBox = document.getElementById('debug-log');
    if (logBox) {
        logBox.innerHTML += message + '<br>';
    }
}

function attachBackButtonHandler() {
    debugLog('Attempting to attach listener...');
    
    // --- NEW, MORE DETAILED CHECK ---
    if (!window.Capacitor) {
        debugLog('Capacitor: [NOT FOUND]. Retrying...');
        setTimeout(attachBackButtonHandler, 500);
        return;
    }
    
    if (!window.Capacitor.Plugins) {
        debugLog('Capacitor.Plugins: [NOT FOUND]. Retrying...');
        setTimeout(attachBackButtonHandler, 500);
        return;
    }

    if (!window.Capacitor.Plugins.App) {
        debugLog('Capacitor.Plugins.App: [NOT FOUND].');
        
        // Log all available plugins so we can see what IS loading
        const availablePlugins = Object.keys(window.Capacitor.Plugins);
        debugLog('Available plugins: [' + availablePlugins.join(', ') + ']');
        debugLog('Retrying...');
        setTimeout(attachBackButtonHandler, 500);
        return;
    }
    
    // --- END NEW CHECK ---

    debugLog('Capacitor App plugin FOUND');
    const { App } = window.Capacitor.Plugins;
    
    App.removeAllListeners('backButton');
    App.addListener('backButton', function() {
        const currentPage = window.currentPage || 'index.html';
        debugLog('BACK BUTTON: Pressed. Page: ' + currentPage);

        if (currentPage !== 'index.html') {
            debugLog('Navigating to index.html');
            window.location.href = 'index.html';
        } else {
            debugLog('Exiting app');
            App.exitApp();
        }
    });

    debugLog('Back button listener ATTACHED');
}

// Wait for the 'load' event
window.addEventListener('load', () => {
    debugLog('Window "load" event fired. Starting attach...');
    attachBackButtonHandler();
});

debugLog('native-back.js: Script file parsed');

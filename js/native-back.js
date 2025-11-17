// Function to write a log message to the <div> on the page
function debugLog(message) {
    const logBox = document.getElementById('debug-log');
    if (logBox) {
        logBox.innerHTML += message + '<br>';
    }
}

function attachBackButtonHandler() {
    debugLog('Attempting to attach listener...');
    
    // Check if the Capacitor App plugin is available
    if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.App) {
        
        debugLog('Capacitor App plugin FOUND');
        const { App } = window.Capacitor.Plugins;
        
        // Remove any old listeners to prevent duplicates
        App.removeAllListeners('backButton');

        // Add the new listener
        App.addListener('backButton', function() {
            // Read the variable AT THE MOMENT of the click
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

    } else {
        debugLog('App plugin NOT found. Retrying in 250ms...');
        // If the plugin isn't ready, wait 250ms and try again
        setTimeout(attachBackButtonHandler, 250); 
    }
}

// --- THIS IS THE KEY ---
// Don't run immediately. Wait for the 'load' event.
// This waits for all scripts, images, etc., to finish loading.
window.addEventListener('load', () => {
    debugLog('Window "load" event fired. Starting attach...');
    attachBackButtonHandler();
});

// Initial log to show the script file itself was loaded
debugLog('native-back.js: Script file parsed');

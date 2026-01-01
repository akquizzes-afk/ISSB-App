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

        // Define COMPLETE navigation hierarchy
        const navigationMap = {
            // Home page
            'index.html': 'exit',
            
            // Root test pages (direct from home)
            'wat-test.html': 'index.html',
            'picture-story.html': 'index.html',
            'pointer-story.html': 'index.html',
            'srt-test.html': 'index.html',
            'opi.html': 'index.html',
            'mat.html': 'index.html',
            
            // Initial tests hub
            'initials/initial-tests.html': 'index.html',
            
            // Academic tests section
            'initials/academic-tests.html': 'initials/initial-tests.html',
            'initials/academic-tests/test1/test1.html': 'initials/academic-tests.html',
            'initials/academic-tests/test2/test2.html': 'initials/academic-tests.html',
            'initials/academic-tests/test3/test3.html': 'initials/academic-tests.html',
            'initials/academic-tests/test4/test4.html': 'initials/academic-tests.html',
            'initials/academic-tests/test5/test5.html': 'initials/academic-tests.html',
            'initials/academic-tests/test6/test6.html': 'initials/academic-tests.html',
            'initials/academic-tests/test7/test7.html': 'initials/academic-tests.html',
            'initials/academic-tests/test8/test8.html': 'initials/academic-tests.html',
            'initials/academic-tests/test9/test9.html': 'initials/academic-tests.html',
            'initials/academic-tests/test10/test10.html': 'initials/academic-tests.html',
            'initials/academic-tests/test11/test11.html': 'initials/academic-tests.html',
            'initials/academic-tests/test12/test12.html': 'initials/academic-tests.html',
            'initials/academic-tests/test13/test13.html': 'initials/academic-tests.html',
            
            // Verbal tests section
            'initials/verbal-tests.html': 'initials/initial-tests.html',
            'initials/verbal-tests/test1/test1.html': 'initials/verbal-tests.html',
            'initials/verbal-tests/test2/test2.html': 'initials/verbal-tests.html',
            'initials/verbal-tests/test3/test3.html': 'initials/verbal-tests.html',
            'initials/verbal-tests/test4/test4.html': 'initials/verbal-tests.html',
            'initials/verbal-tests/test5/test5.html': 'initials/verbal-tests.html',
            'initials/verbal-tests/test6/test6.html': 'initials/verbal-tests.html',
            
            // Coming Soon pages
            'coming-soon.html': 'initials/initial-tests.html'
        };

        // Check for exact match first
        if (navigationMap[currentPage] === 'exit') {
            debugLog('Exiting app');
            App.exitApp();
        } else if (navigationMap[currentPage]) {
            debugLog('Navigating to: ' + navigationMap[currentPage]);
            window.location.href = navigationMap[currentPage];
        } else {
            // Check for partial matches (for any other test pages you might add)
            const pagePath = currentPage;
            
            // Check if it's an academic test
            if (pagePath.includes('/academic-tests/test') && pagePath.includes('.html')) {
                debugLog('Generic academic test detected, navigating to academic-tests.html');
                window.location.href = 'initials/academic-tests.html';
            }
            // Check if it's a verbal test
            else if (pagePath.includes('/verbal-tests/test') && pagePath.includes('.html')) {
                debugLog('Generic verbal test detected, navigating to verbal-tests.html');
                window.location.href = 'initials/verbal-tests.html';
            }
            // Check if it's in initials folder
            else if (pagePath.includes('initials/')) {
                debugLog('Initial test detected, navigating to initial-tests.html');
                window.location.href = 'initials/initial-tests.html';
            }
            // Default fallback
            else if (currentPage !== 'index.html') {
                debugLog('Navigating to index.html');
                window.location.href = 'index.html';
            } else {
                debugLog('Exiting app');
                App.exitApp();
            }
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
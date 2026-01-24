// Function to write a log message to the <div> on the page
function debugLog(message) {
    const logBox = document.getElementById('debug-log');
    if (logBox) {
        logBox.innerHTML += message + '<br>';
    }
}

function attachBackButtonHandler() {
    debugLog('Checking for Capacitor...');
    
    // Check if Capacitor App plugin exists
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.App) {
        setTimeout(attachBackButtonHandler, 500);
        return;
    }

    // Destructure App and Toast. 
    // Note: Ensure @capacitor/toast is installed for the Toast feature.
    const { App, Toast } = window.Capacitor.Plugins;
    
    App.removeAllListeners('backButton');

    // Variable to track the last time the back button was pressed
    let lastBackPressTime = 0;
    const exitTimeWindow = 2000; // 2 seconds window

    // Helper function to handle the double-tap logic
    const handleExitConfirmation = async () => {
        const currentTime = new Date().getTime();
        
        // Check if the last press was within the time window
        if (currentTime - lastBackPressTime < exitTimeWindow) {
            debugLog('Double tap detected. Exiting app.');
            App.exitApp();
        } else {
            // Update the last press time
            lastBackPressTime = currentTime;
            debugLog('First tap. Showing toast.');
            
            if (Toast) {
                await Toast.show({
                    text: "Please click again if you want to close!",
                    duration: 'short',
                    position: 'bottom'
                });
            } else {
                debugLog('Toast plugin not found. Install @capacitor/toast');
            }
        }
    };
    
    App.addListener('backButton', function() {
        // Get the full path including any query parameters
        const fullPath = window.location.pathname;
        debugLog('Back Button Pressed. Current Path: ' + fullPath);
        
        // Add query string and hash for complete debugging
        debugLog('Full URL: ' + window.location.href);
        
        // Define navigation hierarchy
        const navigationMap = {
            // Home page
            '/': 'exit',
            '/index.html': 'exit',
            
            // Root test pages (direct from home)
            '/wat-test.html': '/index.html',
            '/picture-story.html': '/index.html',
            '/pointer-story.html': '/index.html',
            '/srt-test.html': '/index.html',
            '/opi.html': '/index.html',
            '/mat.html': '/index.html',
            
            // Initial tests hub
            '/initials/initial-tests.html': '/index.html',

            // Academic tests hub
            '/initials/academic-tests/academic-tests.html': '/initials/initial-tests.html',
            // Verbal tests hub
            '/initials/verbal-tests/verbal-tests.html': '/initials/initial-tests.html',
            // English tests hub
            '/initials/english-tests/english-tests.html': '/initials/initial-tests.html',
            // Physics tests hub
            '/initials/physics-tests/physics-tests.html': '/initials/initial-tests.html',
            
            // Individual tests (Must go back to the hub inside the folder)
            '/initials/academic-tests/test-engine.html': '/initials/academic-tests/academic-tests.html',
            '/initials/verbal-tests/test-engine.html': '/initials/verbal-tests/verbal-tests.html',
            '/initials/english-tests/test-engine.html': '/initials/english-tests/english-tests.html',
            '/initials/physics-tests/test-engine.html': '/initials/physics-tests/physics-tests.html',

            // Coming Soon page
            '/coming-soon.html': '/initials/initial-tests.html'
        };

        // Check for exact match first
        if (navigationMap[fullPath]) {
            const target = navigationMap[fullPath];
            debugLog('Exact match found. Target: ' + target);
            
            if (target === 'exit') {
                // USE THE NEW HELPER FUNCTION HERE
                handleExitConfirmation();
            } else {
                debugLog('Navigating to: ' + target);
                window.location.href = target;
            }
            return;
        }
        
        // If no exact match, try pattern matching
        debugLog('No exact match. Trying pattern matching...');
        
        // Check for academic test pattern
        if (fullPath.includes('/academic-tests/test') && fullPath.endsWith('.html')) {
            debugLog('Pattern: Academic test detected');
            window.location.href = '/initials/academic-tests/academic-tests.html';
            return;
        }
        
        // Check for verbal test pattern
        if (fullPath.includes('/verbal-tests/test') && fullPath.endsWith('.html')) {
            debugLog('Pattern: Verbal test detected');
            window.location.href = '/initials/verbal-tests/verbal-tests.html';
            return;
        }
        
        // Check if in initials folder
        if (fullPath.includes('/initials/')) {
            debugLog('Pattern: Inside initials folder');
            window.location.href = '/initials/initial-tests.html';
            return;
        }
        
        // Default fallback
        debugLog('Pattern: Default fallback to home');
        if (fullPath === '/' || fullPath === '/index.html') {
            // USE THE NEW HELPER FUNCTION HERE AS WELL
            handleExitConfirmation();
        } else {
            window.location.href = '/index.html';
        }
    });
    
    debugLog('Back button listener attached successfully');
}

// Try attaching immediately and also on load
attachBackButtonHandler();
window.addEventListener('load', attachBackButtonHandler);
debugLog('native-back.js loaded and initialized');

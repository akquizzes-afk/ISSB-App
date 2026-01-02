// Function to write a log message to the <div> on the page
function debugLog(message) {
    const logBox = document.getElementById('debug-log');
    if (logBox) {
        logBox.innerHTML += message + '<br>';
    }
}

function attachBackButtonHandler() {
    debugLog('Checking for Capacitor...');
    
    if (!window.Capacitor || !window.Capacitor.Plugins || !window.Capacitor.Plugins.App) {
        setTimeout(attachBackButtonHandler, 500);
        return;
    }

    const { App } = window.Capacitor.Plugins;
    App.removeAllListeners('backButton');
    
    App.addListener('backButton', function() {
        // Detect current path (e.g., /initials/academic-tests/test1/test1.html)
        const path = window.location.pathname;
        debugLog('Back Event: ' + path);

        // --- 1. DIRECT HUB MAPPING ---
        const directMap = {
            '/': 'exit',
            '/index.html': 'exit',
            '/initials/initial-tests.html': '/index.html',
            '/initials/academic-tests/academic-tests.html': '/initials/initial-tests.html',
            '/initials/verbal-tests/verbal-tests.html': '/initials/initial-tests.html',
            // Root pages
            '/wat-test.html': '/index.html',
            '/picture-story.html': '/index.html',
            '/pointer-story.html': '/index.html',
            '/srt-test.html': '/index.html',
            '/opi.html': '/index.html',
            '/mat.html': '/index.html'
        };

        // If current page is a Hub or Root page
        if (directMap[path]) {
            const target = directMap[path];
            if (target === 'exit') {
                App.exitApp();
            } else {
                window.location.href = target;
            }
            return;
        }

        // --- 2. SMART FOLDER MATCHING (For the 19+ individual tests) ---
        
        // If in an Academic Sub-test (e.g., /initials/academic-tests/test1/test1.html)
        if (path.includes('/academic-tests/test')) {
            debugLog('Academic test detected. Going to Academic Hub.');
            window.location.href = '/initials/academic-tests/academic-tests.html';
        }
        // If in a Verbal Sub-test (e.g., /initials/verbal-tests/test1/test1.html)
        else if (path.includes('/verbal-tests/test')) {
            debugLog('Verbal test detected. Going to Verbal Hub.');
            window.location.href = '/initials/verbal-tests/verbal-tests.html';
        }
        // General Academic folder fallback
        else if (path.includes('/academic-tests/')) {
            window.location.href = '/initials/academic-tests/academic-tests.html';
        }
        // General Verbal folder fallback
        else if (path.includes('/verbal-tests/')) {
            window.location.href = '/initials/verbal-tests/verbal-tests.html';
        }
        // General Initials folder fallback
        else if (path.includes('/initials/')) {
            window.location.href = '/initials/initial-tests.html';
        }
        // Default to Home
        else {
            debugLog('Path unknown. Going home.');
            window.location.href = '/index.html';
        }
    });

    debugLog('Listener active for all directories.');
}

window.addEventListener('load', attachBackButtonHandler);


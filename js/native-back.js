// This script runs *after* capacitor.js has been loaded in the HTML.
// We do not need to wait for any event.

// Get the App plugin from the Capacitor global object.
const { App } = window.Capacitor.Plugins;

// Add a listener for the native 'backButton' event
App.addListener('backButton', () => {
    
    // Check if the browser history has any pages to go back to.
    // 'window.history.length > 1' means we are not on the first page (index.html).
    if (window.history.length > 1) {
        
        // If we are on 'wat-test.html', this will go back to 'index.html'.
        window.history.back();
        
    } else {
        
        // If we are on 'index.html' (history length is 1), exit the app.
        App.exitApp();
    }
});

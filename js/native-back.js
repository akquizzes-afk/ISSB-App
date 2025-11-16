// This script runs *after* capacitor.js has been loaded in the HTML.
// We do not need to wait for any event.

// Get the App plugin from the Capacitor global object.
const { App } = window.Capacitor.Plugins;

// Add a listener for the native 'backButton' event
App.addListener('backButton', () => {
    
    // Get the current file name from the URL
    const currentPage = window.location.pathname.split("/").pop();

    // If we're *not* on index.html, always navigate back to it
    if (currentPage !== "index.html") {
        window.location.href = "index.html";
    } else {
        // Otherwise, exit the app
        App.exitApp();
    }
});
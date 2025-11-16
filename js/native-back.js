// This code waits for the Capacitor API to be ready
document.addEventListener('deviceready', () => {
    // Get the Capacitor 'App' plugin
    const { App } = window.Capacitor.Plugins;

    // Add a listener for the native 'backButton' event
    App.addListener('backButton', () => {
        // Check if there is any history to go back to
        if (window.history.length > 1) {
            // If yes, just go back one page
            window.history.back();
        } else {
            // If no history (we are on index.html), then exit the app
            App.exitApp();
        }
    });
});

// app.js - Main entry point

document.addEventListener('DOMContentLoaded', () => {
    console.log('SafeSpace App Initialized');
    
    const sosBtn = document.getElementById('sos-btn');
    if (sosBtn) {
        sosBtn.addEventListener('click', handleSOS);
    }
});

function handleSOS() {
    console.log('SOS Button Clicked!');
    document.body.classList.toggle('alert-active');
    
    // Example: Fetch location
    SafeSpaceGeo.getCurrentLocation()
        .then(loc => console.log('Location:', loc))
        .catch(err => console.error('Location Error:', err));
}

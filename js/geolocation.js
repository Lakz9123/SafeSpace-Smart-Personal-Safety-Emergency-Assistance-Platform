// geolocation.js - Browser Geolocation Wrapper

const SafeSpaceGeo = {
    getCurrentLocation: () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.warn("Geolocation not supported. Using mock location.");
                resolve({ lat: 37.7749, lng: -122.4194, accuracy: 100 }); // San Francisco
                return;
            }
            
            navigator.geolocation.getCurrentPosition(
                position => resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    accuracy: position.coords.accuracy
                }),
                error => {
                    console.warn("Geolocation failed or timed out. Using mock location.", error);
                    resolve({ lat: 37.7749, lng: -122.4194, accuracy: 100 });
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        });
    }
};

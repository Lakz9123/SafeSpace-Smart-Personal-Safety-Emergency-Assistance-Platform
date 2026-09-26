// api.js - AJAX calls and external API integrations

const SafeSpaceAPI = {
    triggerSOSEndpoint: async (data) => {
        console.log("Simulating AJAX POST to SOS endpoint with data:", data);
        return new Promise((resolve) => {
            setTimeout(() => resolve({ 
                success: true, 
                message: 'SOS sent successfully', 
                id: 'evt_' + Date.now() 
            }), 1000);
        });
    },
    
    getNearbyPlaces: async (lat, lng) => {
        try {
            // Using Overpass API (OpenStreetMap) to find hospitals and police stations within 5km
            const radius = 5000;
            const query = `
                [out:json][timeout:15];
                (
                  node["amenity"~"hospital|police"](around:${radius},${lat},${lng});
                  way["amenity"~"hospital|police"](around:${radius},${lat},${lng});
                );
                out center 5;
            `;
            const url = `https://overpass-api.de/api/interpreter`;
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                body: `data=${encodeURIComponent(query)}`
            });
            
            if (!response.ok) {
                throw new Error(`Overpass API returned ${response.status}`);
            }
            const data = await response.json();
            
            return data.elements.map(el => {
                const elLat = el.lat || (el.center ? el.center.lat : 0);
                const elLon = el.lon || (el.center ? el.center.lon : 0);
                const amenity = el.tags && el.tags.amenity ? el.tags.amenity : 'unknown';
                const name = el.tags && el.tags.name ? el.tags.name : (amenity === 'hospital' ? 'Local Hospital' : 'Police Station');
                return {
                    name: name,
                    type: amenity,
                    lat: elLat,
                    lng: elLon,
                    distance: SafeSpaceUtils.calculateDistance(lat, lng, elLat, elLon)
                };
            }).sort((a, b) => a.distance - b.distance);
        } catch (error) {
            console.error("Error fetching places (Overpass might be down). Using mock data:", error);
            // Return mock data if Overpass is down (504, 429, CORS, etc)
            return [
                { name: "Central General Hospital", type: "hospital", lat: lat + 0.01, lng: lng + 0.01, distance: 1.2 },
                { name: "Precinct 42 Police Station", type: "police", lat: lat - 0.01, lng: lng - 0.01, distance: 1.5 },
                { name: "Westside Urgent Care", type: "hospital", lat: lat + 0.02, lng: lng - 0.01, distance: 2.1 }
            ].sort((a, b) => a.distance - b.distance);
        }
    }
};

// map.js - Leaflet Map Integration

const SafeSpaceMap = {
    dashboardMap: null,
    historyMap: null,
    userMarker: null,
    placesLayer: null,
    routeLine: null,
    routePoints: [],
    
    initDashboardMap: () => {
        if (!document.getElementById('dashboard-map')) return;
        
        // Initialize dashboard map
        SafeSpaceMap.dashboardMap = L.map('dashboard-map').setView([0, 0], 2);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(SafeSpaceMap.dashboardMap);
        
        // Group for safe places
        SafeSpaceMap.placesLayer = L.layerGroup().addTo(SafeSpaceMap.dashboardMap);
        
        // Polyline for "Follow Me" routing
        SafeSpaceMap.routeLine = L.polyline([], {color: 'red', weight: 4, opacity: 0.7}).addTo(SafeSpaceMap.dashboardMap);
        
        // Invalidate size on tab switch if needed (since it might be hidden initially)
        document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
            tab.addEventListener('shown.bs.tab', (e) => {
                if(e.target.id === 'nav-dashboard-tab') {
                    setTimeout(() => SafeSpaceMap.dashboardMap.invalidateSize(), 100);
                }
            });
        });
    },
    
    updateCurrentPosition: (lat, lng, accuracy) => {
        const fallbackText = document.getElementById('fallback-location-text');
        if (fallbackText) fallbackText.innerText = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
        
        if (!SafeSpaceMap.dashboardMap) return;
        
        const pos = [lat, lng];
        
        // Update or create user marker
        if (!SafeSpaceMap.userMarker) {
            SafeSpaceMap.userMarker = L.circleMarker(pos, {
                color: '#fff',
                fillColor: '#4776E6',
                fillOpacity: 1,
                radius: 8,
                weight: 2
            }).bindPopup('<b>You are here</b>').addTo(SafeSpaceMap.dashboardMap);
            SafeSpaceMap.dashboardMap.setView(pos, 15);
            
            const statusEl = document.getElementById('map-status');
            if(statusEl) {
                statusEl.className = 'badge bg-success';
                statusEl.innerText = 'Live';
            }
        } else {
            SafeSpaceMap.userMarker.setLatLng(pos);
            // Optional: only pan if following or off-screen, but let's pan for now
            SafeSpaceMap.dashboardMap.panTo(pos);
        }
    },
    
    addSafePlaces: (places) => {
        if (!SafeSpaceMap.placesLayer) return;
        SafeSpaceMap.placesLayer.clearLayers();
        
        places.forEach(p => {
            const marker = L.marker([p.lat, p.lon]).bindPopup(`<b>${p.tags.name || 'Safe Place'}</b><br>${p.tags.amenity || ''}`);
            SafeSpaceMap.placesLayer.addLayer(marker);
        });
    },
    
    addRouteBreadcrumb: (lat, lng) => {
        if (!SafeSpaceMap.routeLine) return;
        SafeSpaceMap.routePoints.push([lat, lng]);
        SafeSpaceMap.routeLine.setLatLngs(SafeSpaceMap.routePoints);
    },
    
    clearRoute: () => {
        SafeSpaceMap.routePoints = [];
        if (SafeSpaceMap.routeLine) SafeSpaceMap.routeLine.setLatLngs([]);
    },
    
    showHistoryLocation: (lat, lng, details) => {
        const modalEl = document.getElementById('mapModal');
        const mapModal = new bootstrap.Modal(modalEl);
        
        mapModal.show();
        
        // Wait for modal to be fully visible before initializing/invalidating map size
        modalEl.addEventListener('shown.bs.modal', function onModalShown() {
            modalEl.removeEventListener('shown.bs.modal', onModalShown);
            
            if (!SafeSpaceMap.historyMap) {
                SafeSpaceMap.historyMap = L.map('history-map').setView([lat, lng], 15);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    maxZoom: 19,
                    attribution: '© OpenStreetMap'
                }).addTo(SafeSpaceMap.historyMap);
            } else {
                SafeSpaceMap.historyMap.setView([lat, lng], 15);
                SafeSpaceMap.historyMap.invalidateSize();
                // clear old markers
                SafeSpaceMap.historyMap.eachLayer((layer) => {
                    if (layer instanceof L.Marker) {
                        SafeSpaceMap.historyMap.removeLayer(layer);
                    }
                });
            }
            
            L.marker([lat, lng]).bindPopup(`<b>Alert Location</b><br>${details}`).addTo(SafeSpaceMap.historyMap).openPopup();
        });
    }
};

// followMe.js - Live Route Tracking and Auto-SOS

const SafeSpaceFollowMe = {
    watchId: null,
    sessionTimer: null,
    stagnationTimer: null,
    alertCountdownTimer: null,

    sessionActive: false,
    startTime: null,
    expectedDurationMs: null, // nullable
    breadcrumbs: [], // {lat, lng, timestamp}

    init: () => {
        const startBtn = document.getElementById('fm-start-btn');
        const endBtn = document.getElementById('fm-end-btn');
        const imSafeBtn = document.getElementById('fm-im-safe-btn');

        if (startBtn) startBtn.addEventListener('click', SafeSpaceFollowMe.startSession);
        if (endBtn) endBtn.addEventListener('click', () => SafeSpaceFollowMe.endSession(true));
        if (imSafeBtn) imSafeBtn.addEventListener('click', SafeSpaceFollowMe.cancelAlertPrompt);
    },

    startSession: () => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser.');
            return;
        }

        const durationInput = document.getElementById('fm-duration').value;
        SafeSpaceFollowMe.expectedDurationMs = durationInput ? parseFloat(durationInput) * 60000 : null;
        
        SafeSpaceFollowMe.breadcrumbs = [];
        SafeSpaceFollowMe.startTime = Date.now();
        SafeSpaceFollowMe.sessionActive = true;
        
        if (typeof SafeSpaceMap !== 'undefined') {
            SafeSpaceMap.clearRoute();
        }

        // UI Updates
        document.getElementById('fm-start-container').classList.add('d-none');
        document.getElementById('fm-active-container').classList.remove('d-none');
        document.getElementById('fm-elapsed').innerText = 'Elapsed: 00:00';
        document.getElementById('fm-breadcrumbs').innerText = 'Points: 0';
        document.getElementById('fm-last-loc').innerText = 'Locating...';
        
        if (SafeSpaceFollowMe.expectedDurationMs) {
            document.getElementById('fm-remaining-time').innerText = `Expected: ${durationInput} min`;
        } else {
            document.getElementById('fm-remaining-time').innerText = '';
        }

        // Start tracking
        SafeSpaceFollowMe.watchId = navigator.geolocation.watchPosition(
            SafeSpaceFollowMe.onPositionUpdate,
            (err) => console.warn('Follow Me watchPosition error:', err),
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 5000 }
        );

        // Start UI timer and logic check
        SafeSpaceFollowMe.sessionTimer = setInterval(SafeSpaceFollowMe.tick, 1000);
    },

    onPositionUpdate: (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        SafeSpaceFollowMe.breadcrumbs.push({
            lat,
            lng,
            timestamp: Date.now()
        });
        
        if (typeof SafeSpaceMap !== 'undefined') {
            SafeSpaceMap.addRouteBreadcrumb(lat, lng);
            SafeSpaceMap.updateCurrentPosition(lat, lng, position.coords.accuracy);
        }

        document.getElementById('fm-breadcrumbs').innerText = `Points: ${SafeSpaceFollowMe.breadcrumbs.length}`;
        document.getElementById('fm-last-loc').innerText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    },

    tick: () => {
        if (!SafeSpaceFollowMe.sessionActive) return;

        const now = Date.now();
        const elapsedSecs = Math.floor((now - SafeSpaceFollowMe.startTime) / 1000);
        
        const m = Math.floor(elapsedSecs / 60).toString().padStart(2, '0');
        const s = (elapsedSecs % 60).toString().padStart(2, '0');
        document.getElementById('fm-elapsed').innerText = `Elapsed: ${m}:${s}`;

        // Check duration expiry
        if (SafeSpaceFollowMe.expectedDurationMs && (now - SafeSpaceFollowMe.startTime >= SafeSpaceFollowMe.expectedDurationMs)) {
            SafeSpaceFollowMe.triggerAlertPrompt('Your expected arrival time has expired.');
            return;
        }

        // Check stagnation: If no movement > 20 meters in the last 5 minutes (300 secs)
        // Only run check if we have enough elapsed time (e.g., at least 5 mins)
        if (elapsedSecs > 300 && elapsedSecs % 30 === 0) { // Check every 30 seconds after 5 mins
            SafeSpaceFollowMe.checkStagnation(now);
        }

        // Refresh Nearby Places (and recalculate Safety Score) every 60 seconds
        if (elapsedSecs > 0 && elapsedSecs % 60 === 0) {
            if (typeof initPlacesFeature === 'function') {
                initPlacesFeature(true);
            }
        }
    },

    checkStagnation: (now) => {
        if (SafeSpaceFollowMe.breadcrumbs.length < 2) return;
        
        // Find the breadcrumb closest to 5 minutes ago
        const fiveMinsAgo = now - 300000;
        let pastPoint = null;
        for (let i = SafeSpaceFollowMe.breadcrumbs.length - 1; i >= 0; i--) {
            if (SafeSpaceFollowMe.breadcrumbs[i].timestamp <= fiveMinsAgo) {
                pastPoint = SafeSpaceFollowMe.breadcrumbs[i];
                break;
            }
        }

        if (!pastPoint) return; // Not enough history yet

        const currentPoint = SafeSpaceFollowMe.breadcrumbs[SafeSpaceFollowMe.breadcrumbs.length - 1];
        
        // Use our distance util
        if (SafeSpaceUtils && SafeSpaceUtils.calculateDistance) {
            // Returns miles. 20 meters = 0.0124 miles
            const distMiles = SafeSpaceUtils.calculateDistance(pastPoint.lat, pastPoint.lng, currentPoint.lat, currentPoint.lng);
            if (distMiles < 0.0124) {
                SafeSpaceFollowMe.triggerAlertPrompt("You haven't moved recently.");
            }
        }
    },

    triggerAlertPrompt: (reasonDesc) => {
        if (!SafeSpaceFollowMe.sessionActive) return;
        
        // Pause tick checks
        clearInterval(SafeSpaceFollowMe.sessionTimer);
        
        const modalEl = document.getElementById('followMeAlertModal');
        if (!modalEl) return;
        
        document.getElementById('fm-alert-desc').innerText = reasonDesc;
        
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();
        
        let timeLeft = 60;
        const display = document.getElementById('fm-countdown-display');
        display.innerText = timeLeft;
        
        SafeSpaceFollowMe.alertCountdownTimer = setInterval(() => {
            timeLeft--;
            display.innerText = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(SafeSpaceFollowMe.alertCountdownTimer);
                bsModal.hide();
                // Auto trigger SOS
                if (window.SafeSpaceCore) {
                    window.SafeSpaceCore.triggerSOS('followme-auto');
                }
                SafeSpaceFollowMe.endSession(false);
            }
        }, 1000);
    },

    cancelAlertPrompt: () => {
        clearInterval(SafeSpaceFollowMe.alertCountdownTimer);
        const modalEl = document.getElementById('followMeAlertModal');
        const bsModal = bootstrap.Modal.getInstance(modalEl);
        if (bsModal) bsModal.hide();
        
        // Resume session tick
        if (SafeSpaceFollowMe.sessionActive) {
            SafeSpaceFollowMe.sessionTimer = setInterval(SafeSpaceFollowMe.tick, 1000);
            
            // If it was expired time, we should bump expectedDurationMs to avoid infinite loop
            if (SafeSpaceFollowMe.expectedDurationMs && (Date.now() - SafeSpaceFollowMe.startTime >= SafeSpaceFollowMe.expectedDurationMs)) {
                // Add 10 more minutes gracefully
                SafeSpaceFollowMe.expectedDurationMs += 600000;
                document.getElementById('fm-remaining-time').innerText = `Extended 10m`;
            }
        }
    },

    endSession: (isSafe) => {
        SafeSpaceFollowMe.sessionActive = false;
        if (SafeSpaceFollowMe.watchId) navigator.geolocation.clearWatch(SafeSpaceFollowMe.watchId);
        clearInterval(SafeSpaceFollowMe.sessionTimer);
        clearInterval(SafeSpaceFollowMe.alertCountdownTimer);
        
        if (typeof SafeSpaceMap !== 'undefined') {
            SafeSpaceMap.clearRoute();
        }

        if (isSafe && SafeSpaceFollowMe.breadcrumbs.length > 0) {
            // Log history
            const sessionData = {
                id: 'fm_' + Date.now(),
                startTime: SafeSpaceFollowMe.startTime,
                endTime: Date.now(),
                points: SafeSpaceFollowMe.breadcrumbs.length,
                distanceStr: 'Unknown'
            };

            // Calculate rough distance (start to end straight line for demo)
            if (SafeSpaceFollowMe.breadcrumbs.length > 1 && SafeSpaceUtils) {
                const startP = SafeSpaceFollowMe.breadcrumbs[0];
                const endP = SafeSpaceFollowMe.breadcrumbs[SafeSpaceFollowMe.breadcrumbs.length - 1];
                const d = SafeSpaceUtils.calculateDistance(startP.lat, startP.lng, endP.lat, endP.lng);
                sessionData.distanceStr = `${d.toFixed(2)} mi`;
            }

            if (window.SafeSpaceStorage && SafeSpaceStorage.addFollowMeSession) {
                SafeSpaceStorage.addFollowMeSession(sessionData);
                if (window.renderFollowMeHistory) window.renderFollowMeHistory();
            }
        }

        // Reset UI
        document.getElementById('fm-start-container').classList.remove('d-none');
        document.getElementById('fm-active-container').classList.add('d-none');
        document.getElementById('fm-duration').value = '';
    }
};

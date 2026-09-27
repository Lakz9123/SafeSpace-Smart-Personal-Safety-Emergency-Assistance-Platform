// shakeDetect.js - Device Motion Shake Detection

const SafeSpaceShake = {
    isListening: false,
    shouldListen: false,
    threshold: 15,
    lastUpdate: 0,
    lastX: null,
    lastY: null,
    lastZ: null,
    cooldownUntil: 0,
    COOLDOWN_MS: 10000, // 10 seconds

    init: () => {
        // Check initial support
        if (typeof window.DeviceMotionEvent === 'undefined') {
            const msgEl = document.getElementById('shake-unsupported-msg');
            const toggleEl = document.getElementById('shakeEnableToggle');
            if (msgEl) msgEl.classList.remove('d-none');
            if (toggleEl) toggleEl.disabled = true;
            return;
        }
        
        SafeSpaceShake.reloadSettings();
    },

    requestPermissionAndToggle: async (toggleEl) => {
        // iOS 13+ requires explicit permission via user gesture
        if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
            try {
                const permissionState = await DeviceMotionEvent.requestPermission();
                if (permissionState === 'granted') {
                    SafeSpaceShake.handleToggleChange(toggleEl);
                } else {
                    alert("Motion permission denied. Shake SOS cannot be enabled.");
                    toggleEl.checked = false;
                }
            } catch (error) {
                console.error("Error requesting motion permission:", error);
                SafeSpaceShake.handleToggleChange(toggleEl); // fallback
            }
        } else {
            // Non-iOS or older iOS
            SafeSpaceShake.handleToggleChange(toggleEl);
        }
    },

    handleToggleChange: (toggleEl) => {
        const settings = SafeSpaceStorage.getShakeSettings();
        settings.enabled = toggleEl.checked;
        SafeSpaceStorage.saveShakeSettings(settings);
        SafeSpaceShake.reloadSettings();
    },

    reloadSettings: () => {
        const settings = SafeSpaceStorage.getShakeSettings();
        SafeSpaceShake.shouldListen = settings.enabled;

        if (SafeSpaceShake.shouldListen && !SafeSpaceShake.isListening) {
            SafeSpaceShake.startListening();
        } else if (!SafeSpaceShake.shouldListen && SafeSpaceShake.isListening) {
            SafeSpaceShake.stopListening();
        }
    },

    startListening: () => {
        if (!SafeSpaceShake.isListening) {
            window.addEventListener('devicemotion', SafeSpaceShake.onMotion, false);
            SafeSpaceShake.isListening = true;
            SafeSpaceShake.updateIndicator(true);
        }
    },

    stopListening: () => {
        if (SafeSpaceShake.isListening) {
            window.removeEventListener('devicemotion', SafeSpaceShake.onMotion, false);
            SafeSpaceShake.isListening = false;
            SafeSpaceShake.updateIndicator(false);
            
            // Reset coordinates
            SafeSpaceShake.lastX = null;
            SafeSpaceShake.lastY = null;
            SafeSpaceShake.lastZ = null;
        }
    },

    onMotion: (event) => {
        if (!event.accelerationIncludingGravity) return;
        
        const now = Date.now();
        
        // Respect cooldown
        if (now < SafeSpaceShake.cooldownUntil) return;

        const diffTime = now - SafeSpaceShake.lastUpdate;
        
        if (diffTime > 100) {
            const accel = event.accelerationIncludingGravity;
            
            if (SafeSpaceShake.lastX !== null) {
                const deltaX = Math.abs(accel.x - SafeSpaceShake.lastX);
                const deltaY = Math.abs(accel.y - SafeSpaceShake.lastY);
                const deltaZ = Math.abs(accel.z - SafeSpaceShake.lastZ);

                // Speed calculation based on delta sum relative to time interval
                const speed = (deltaX + deltaY + deltaZ) / diffTime * 10000;

                if (speed > SafeSpaceShake.threshold) {
                    SafeSpaceShake.trigger();
                }
            }

            SafeSpaceShake.lastX = accel.x;
            SafeSpaceShake.lastY = accel.y;
            SafeSpaceShake.lastZ = accel.z;
            SafeSpaceShake.lastUpdate = now;
        }
    },

    trigger: () => {
        SafeSpaceShake.cooldownUntil = Date.now() + SafeSpaceShake.COOLDOWN_MS;
        
        if (window.SafeSpaceCore) {
            SafeSpaceCore.triggerSOS('shake');
        }
    },

    updateIndicator: (active) => {
        const indicator = document.getElementById('shake-indicator');
        if (!indicator) return;
        if (active) {
            indicator.classList.remove('d-none');
        } else {
            indicator.classList.add('d-none');
        }
    }
};

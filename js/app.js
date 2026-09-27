// app.js - Main entry point

document.addEventListener('DOMContentLoaded', () => {
    console.log('SafeSpace App Initialized');
    
    // Register Service Worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.warn('SW error:', err));
    }
    
    initOfflineSupport();
    if (typeof SafeSpaceI18n !== 'undefined') SafeSpaceI18n.init();
    if (typeof SafeSpacePhrases !== 'undefined') SafeSpacePhrases.init();
    if (typeof SafeSpaceMap !== 'undefined') SafeSpaceMap.initDashboardMap();

    // Initialize Features
    initThemeFeature();
    initContactsFeature();
    initSOSFeature();
    refreshHistoryList();
    initPlacesFeature();
    initProfileFeature();
    initCheckinFeature();
    SafeSpaceFakeCall.init();
    SafeSpaceVoice.init();
    SafeSpaceFollowMe.init();
    SafeSpaceShake.init();
});

let contactModalInstance = null;

function initThemeFeature() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');
    
    const savedTheme = SafeSpaceStorage.getData('theme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', savedTheme);
    if(themeIcon) themeIcon.innerText = savedTheme === 'dark' ? '☀️' : '🌙';

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-bs-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-bs-theme', newTheme);
            themeIcon.innerText = newTheme === 'dark' ? '☀️' : '🌙';
            SafeSpaceStorage.saveData('theme', newTheme);
        });
    }
}

function initContactsFeature() {
    refreshContactsList();

    const modalElement = document.getElementById('contactModal');
    if (modalElement) {
        contactModalInstance = new bootstrap.Modal(modalElement);
        
        modalElement.addEventListener('hidden.bs.modal', () => {
            document.getElementById('contactForm').reset();
            document.getElementById('contactId').value = '';
            document.getElementById('contactModalLabel').innerText = 'Add Emergency Contact';
        });
    }

    const form = document.getElementById('contactForm');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('contactId').value;
            const name = document.getElementById('contactName').value;
            const relation = document.getElementById('contactRelation').value;
            const phone = document.getElementById('contactPhone').value;
            
            SafeSpaceStorage.saveContact({ id, name, relation, phone });
            
            if (contactModalInstance) contactModalInstance.hide();
            refreshContactsList();
        });
    }

    const contactsList = document.getElementById('contacts-list');
    if (contactsList) {
        contactsList.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-contact-btn')) {
                e.preventDefault();
                const id = e.target.getAttribute('data-id');
                openEditModal(id);
            } else if (e.target.classList.contains('delete-contact-btn')) {
                e.preventDefault();
                const id = e.target.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this emergency contact?')) {
                    SafeSpaceStorage.deleteContact(id);
                    refreshContactsList();
                }
            }
        });
    }
}

function refreshContactsList() {
    const contacts = SafeSpaceStorage.getContacts();
    SafeSpaceDOM.renderContacts(contacts);
}

function openEditModal(id) {
    const contact = SafeSpaceStorage.getContactById(id);
    if (!contact) return;

    document.getElementById('contactId').value = contact.id;
    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactRelation').value = contact.relation;
    document.getElementById('contactPhone').value = contact.phone;
    
    document.getElementById('contactModalLabel').innerText = 'Edit Emergency Contact';
    
    if (contactModalInstance) {
        contactModalInstance.show();
    }
}

// SOS Feature
let sosTimeout;
let sosInterval;
let holdTime = 0;
const REQUIRED_HOLD_TIME = 3000;

function initSOSFeature() {
    const mainBtn = document.getElementById('sos-btn');
    const floatBtn = document.getElementById('floating-sos-btn');
    const floatWidget = document.getElementById('floating-sos-widget');
    const floatClose = document.getElementById('floating-sos-close');

    // Handle floating widget close
    if (floatClose && floatWidget) {
        floatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            floatWidget.classList.add('hidden');
        });
    }

    const sosButtons = [
        { btn: mainBtn, source: 'manual', textId: '#sos-text', progressClass: '.sos-progress' },
        { btn: floatBtn, source: 'panic-widget', textId: '#floating-sos-text', progressClass: '.floating-sos-progress' }
    ].filter(b => b.btn !== null);

    sosButtons.forEach(({btn, source, textId, progressClass}) => {
        let btnTimeout, btnInterval;

        const startCountdown = (e) => {
            if (e.cancelable) e.preventDefault();
            holdTime = 0;
            btn.classList.add('counting');
            
            const progressEl = btn.querySelector(progressClass);
            const textEl = btn.querySelector(textId);
            
            btnInterval = setInterval(() => {
                holdTime += 100;
                const percentage = (holdTime / REQUIRED_HOLD_TIME) * 100;
                if (progressEl) progressEl.style.height = `${percentage}%`;
                
                const remaining = Math.ceil((REQUIRED_HOLD_TIME - holdTime) / 1000);
                if (textEl) textEl.innerText = remaining + 's';
            }, 100);

            btnTimeout = setTimeout(() => {
                cancelCountdown();
                SafeSpaceCore.triggerSOS(source);
            }, REQUIRED_HOLD_TIME);
        };

        const cancelCountdown = () => {
            clearTimeout(btnTimeout);
            clearInterval(btnInterval);
            resetSOSButton();
        };

        const resetSOSButton = () => {
            btn.classList.remove('counting');
            const progressEl = btn.querySelector(progressClass);
            const textEl = btn.querySelector(textId);
            if (progressEl) progressEl.style.height = '0%';
            if (textEl) textEl.innerText = 'SOS';
        };

        btn.addEventListener('mousedown', startCountdown);
        btn.addEventListener('mouseup', cancelCountdown);
        btn.addEventListener('mouseleave', cancelCountdown);
        
        btn.addEventListener('touchstart', startCountdown, {passive: false});
        btn.addEventListener('touchend', cancelCountdown);
    });
}

window.SafeSpaceCore = {
    triggerSOS: async (source = 'manual') => {
        document.body.classList.add('alert-active');
        
        let locationStr = "Location unavailable";
        let locationData = null;
        
        try {
            const loc = await SafeSpaceGeo.getCurrentLocation();
            locationData = loc;
            locationStr = `Lat: ${loc.lat.toFixed(4)}, Lng: ${loc.lng.toFixed(4)}`;
        } catch (err) {
            console.warn("Failed to get location:", err);
        }
        
        const alertData = {
            id: 'evt_' + Date.now(),
            timestamp: Date.now(),
            location: locationData,
            locationStr: locationStr,
            contactsCount: SafeSpaceStorage.getContacts().length,
            source: source
        };
        
        let typeString = 'SOS Triggered';
        if (source === 'auto' || source === 'followme-auto') typeString = 'Auto-Triggered SOS';
        else if (source === 'voice') typeString = 'Voice-Triggered SOS';
        else if (source === 'shake') typeString = 'Shake-Triggered SOS';
        else if (source === 'panic-widget') typeString = 'Widget-Triggered SOS';
        else if (source !== 'manual') typeString = `SOS Triggered (${source})`;

        if (!navigator.onLine) {
            // Queue offline
            console.log("Offline. Queueing alert...");
            let queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
            queue.push(alertData);
            localStorage.setItem('offlineQueue', JSON.stringify(queue));
            
            SafeSpaceStorage.addHistoryEvent({
                id: alertData.id,
                timestamp: alertData.timestamp,
                type: typeString,
                details: `Location shared: ${locationStr}. Contacts notified: ${alertData.contactsCount}.`,
                status: 'Queued (Offline)',
                location: locationData
            });
            if (window.refreshHistoryList) refreshHistoryList();
        } else {
            try {
                const response = await SafeSpaceAPI.triggerSOSEndpoint(alertData);
                
                SafeSpaceStorage.addHistoryEvent({
                    id: alertData.id, // using our generated ID to keep it consistent
                    timestamp: alertData.timestamp,
                    type: typeString,
                    details: `Location shared: ${locationStr}. Contacts notified: ${alertData.contactsCount}.`,
                    status: 'Active',
                    location: locationData
                });
                
                if (window.refreshHistoryList) refreshHistoryList();
            } catch (e) {
                console.error("SOS failed", e);
            }
        }
        
        setTimeout(() => {
            document.body.classList.remove('alert-active');
        }, 5000);
    }
};

function refreshHistoryList() {
    const history = SafeSpaceStorage.getHistory();
    SafeSpaceDOM.renderHistory(history);
}

async function initPlacesFeature(silent = false) {
    const container = document.getElementById('places-list');
    if (!container) return;
    
    if (!silent) container.innerHTML = `<p class="text-muted text-center my-4 fs-sm">Fetching location...</p>`;
    
    try {
        const loc = await SafeSpaceGeo.getCurrentLocation();
        
        if (typeof SafeSpaceMap !== 'undefined') {
            SafeSpaceMap.updateCurrentPosition(loc.lat, loc.lng, loc.accuracy);
        }
        
        if (!silent) container.innerHTML = `<p class="text-muted text-center my-4 fs-sm">Finding safe places...</p>`;
        const places = await SafeSpaceAPI.getNearbyPlaces(loc.lat, loc.lng);
        SafeSpaceDOM.renderPlaces(places);
        
        if (typeof SafeSpaceMap !== 'undefined') {
            SafeSpaceMap.addSafePlaces(places);
        }
    } catch (err) {
        console.warn("Could not load location for places", err);
        container.innerHTML = `<p class="text-warning text-center my-4 fs-sm">Location required to find nearby places.</p>`;
    }
}

function initProfileFeature() {
    loadProfileInfo();

    const medicalForm = document.getElementById('medicalForm');
    if (medicalForm) {
        medicalForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const info = {
                name: document.getElementById('profileName').value,
                bloodType: document.getElementById('profileBlood').value,
                conditions: document.getElementById('profileConditions').value
            };
            SafeSpaceStorage.saveMedicalInfo(info);
            alert('Medical info saved successfully!');
        });
    }

    const fakeCallForm = document.getElementById('fakeCallForm');
    if (fakeCallForm) {
        fakeCallForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const info = {
                callerName: document.getElementById('fakeCallerName').value,
                delay: parseFloat(document.getElementById('fakeCallDelay').value)
            };
            SafeSpaceStorage.saveFakeCallInfo(info);
            alert('Fake Call settings saved successfully!');
        });
    }

    const voiceForm = document.getElementById('voiceForm');
    if (voiceForm) {
        voiceForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const settings = {
                enabled: document.getElementById('voiceEnableToggle').checked,
                phrase: document.getElementById('voiceTriggerPhrase').value
            };
            SafeSpaceStorage.saveVoiceSettings(settings);
            SafeSpaceVoice.reloadSettings();
            alert('Voice settings saved successfully!');
        });
        
        // Also reload instantly on toggle
        const toggleEl = document.getElementById('voiceEnableToggle');
        if (toggleEl) {
            toggleEl.addEventListener('change', () => {
                const settings = SafeSpaceStorage.getVoiceSettings();
                settings.enabled = toggleEl.checked;
                SafeSpaceStorage.saveVoiceSettings(settings);
                SafeSpaceVoice.reloadSettings();
            });
        }
    }

    const shakeToggleEl = document.getElementById('shakeEnableToggle');
    if (shakeToggleEl) {
        shakeToggleEl.addEventListener('change', (e) => {
            e.preventDefault();
            // We use requestPermissionAndToggle to handle iOS 13+ permission prompts
            SafeSpaceShake.requestPermissionAndToggle(shakeToggleEl);
        });
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            SafeSpaceXML.exportProfile();
        });
    }

    const encryptToggle = document.getElementById('encryptExportToggle');
    if (encryptToggle) {
        encryptToggle.addEventListener('change', (e) => {
            const pwdContainer = document.getElementById('export-password-container');
            if (e.target.checked) {
                pwdContainer.classList.remove('d-none');
            } else {
                pwdContainer.classList.add('d-none');
            }
        });
    }

    const importFile = document.getElementById('import-file');
    if (importFile) {
        importFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                SafeSpaceXML.importProfile(e.target.files[0]);
                e.target.value = ''; // Reset input
            }
        });
    }

    const decryptBtn = document.getElementById('decrypt-import-btn');
    if (decryptBtn) {
        decryptBtn.addEventListener('click', () => {
            SafeSpaceXML.attemptDecryption();
        });
    }
}

function loadProfileInfo() {
    const medInfo = SafeSpaceStorage.getMedicalInfo();
    const nameEl = document.getElementById('profileName');
    const bloodEl = document.getElementById('profileBlood');
    const condEl = document.getElementById('profileConditions');
    
    if (nameEl) nameEl.value = medInfo.name || '';
    if (bloodEl) bloodEl.value = medInfo.bloodType || '';
    if (condEl) condEl.value = medInfo.conditions || '';

    const fcInfo = SafeSpaceStorage.getFakeCallInfo();
    const fcNameEl = document.getElementById('fakeCallerName');
    const fcDelayEl = document.getElementById('fakeCallDelay');
    
    if (fcNameEl) fcNameEl.value = fcInfo.callerName || 'Mom';
    if (fcDelayEl) fcDelayEl.value = fcInfo.delay || 3;

    const vInfo = SafeSpaceStorage.getVoiceSettings();
    const vToggle = document.getElementById('voiceEnableToggle');
    const vPhrase = document.getElementById('voiceTriggerPhrase');
    
    if (vToggle) vToggle.checked = vInfo.enabled;
    if (vPhrase) vPhrase.value = vInfo.phrase || 'help me now';

    const sInfo = SafeSpaceStorage.getShakeSettings();
    const sToggle = document.getElementById('shakeEnableToggle');
    if (sToggle) sToggle.checked = sInfo.enabled;

    window.renderFollowMeHistory();
}

window.renderFollowMeHistory = () => {
    const listEl = document.getElementById('fm-history-list');
    if (!listEl) return;
    
    const sessions = SafeSpaceStorage.getFollowMeSessions();
    if (sessions.length === 0) {
        listEl.innerHTML = '<p class="text-muted text-center fs-sm">No past sessions found.</p>';
        return;
    }

    let html = '';
    sessions.forEach(s => {
        const dateStr = new Date(s.startTime).toLocaleDateString();
        const durationSecs = Math.floor((s.endTime - s.startTime) / 1000);
        const m = Math.floor(durationSecs / 60);
        
        html += `
            <div class="alert alert-secondary border-0 shadow-sm d-flex justify-content-between align-items-center p-3 mb-2 bg-transparent" style="border-left: 4px solid #11998e !important;">
                <div>
                    <h6 class="mb-1 fw-bold">${dateStr}</h6>
                    <small class="text-muted">${s.points} points logged</small>
                </div>
                <div class="text-end">
                    <span class="fw-bold text-primary">${m} min</span><br>
                    <small class="text-muted">${s.distanceStr}</small>
                </div>
            </div>
        `;
    });
    listEl.innerHTML = html;
};

// Auto Check-in Feature
let checkinInterval;
let checkinTimeout;
let promptInterval;

function initCheckinFeature() {
    const startBtn = document.getElementById('start-checkin-btn');
    const minutesInput = document.getElementById('checkin-minutes');
    const statusDiv = document.getElementById('checkin-status');
    const countdownSpan = document.getElementById('checkin-countdown');
    
    const promptModalEl = document.getElementById('checkinPromptModal');
    let promptModal;
    if (promptModalEl) {
        promptModal = new bootstrap.Modal(promptModalEl);
    }
    
    const imSafeBtn = document.getElementById('im-safe-btn');

    let isActive = false;
    let endTime = 0;

    const updateDisplay = () => {
        const now = Date.now();
        const diff = endTime - now;
        if (diff <= 0) {
            countdownSpan.innerText = "00:00";
            return;
        }
        const m = Math.floor(diff / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        countdownSpan.innerText = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const triggerPrompt = () => {
        isActive = false;
        clearInterval(checkinInterval);
        startBtn.innerText = "Start Timer";
        startBtn.classList.replace('btn-danger', 'btn-primary');
        statusDiv.classList.add('d-none');
        minutesInput.disabled = false;
        
        if (promptModal) promptModal.show();
        
        // Start 60s prompt countdown
        let promptLeft = 60;
        const promptCountEl = document.getElementById('prompt-countdown');
        if(promptCountEl) promptCountEl.innerText = promptLeft;
        
        promptInterval = setInterval(() => {
            promptLeft--;
            if(promptCountEl) promptCountEl.innerText = promptLeft;
            if (promptLeft <= 0) {
                clearInterval(promptInterval);
                if (promptModal) promptModal.hide();
                SafeSpaceCore.triggerSOS('auto');
            }
        }, 1000);
    };

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (isActive) {
                // Stop timer
                isActive = false;
                clearInterval(checkinInterval);
                clearTimeout(checkinTimeout);
                startBtn.innerText = "Start Timer";
                startBtn.classList.replace('btn-danger', 'btn-primary');
                statusDiv.classList.add('d-none');
                minutesInput.disabled = false;
            } else {
                // Start timer
                const mins = parseInt(minutesInput.value, 10);
                if (isNaN(mins) || mins < 1) return;
                
                isActive = true;
                endTime = Date.now() + mins * 60000;
                
                minutesInput.disabled = true;
                startBtn.innerText = "Stop Timer";
                startBtn.classList.replace('btn-primary', 'btn-danger');
                statusDiv.classList.remove('d-none');
                
                updateDisplay();
                checkinInterval = setInterval(updateDisplay, 1000);
                checkinTimeout = setTimeout(triggerPrompt, mins * 60000);
            }
        });
    }
    
    if (imSafeBtn) {
        imSafeBtn.addEventListener('click', () => {
            clearInterval(promptInterval);
            if (promptModal) promptModal.hide();
        });
    }
}

function initOfflineSupport() {
    const indicator = document.getElementById('offline-indicator');
    
    const updateOnlineStatus = () => {
        if (navigator.onLine) {
            if (indicator) indicator.classList.add('d-none');
            syncQueuedAlerts();
        } else {
            if (indicator) indicator.classList.remove('d-none');
        }
    };
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Check initial state
    updateOnlineStatus();
}

async function syncQueuedAlerts() {
    let queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
    if (queue.length === 0) return;
    
    console.log(`Syncing ${queue.length} offline alerts...`);
    let history = SafeSpaceStorage.getHistory();
    let updatedHistory = false;
    
    for (let i = 0; i < queue.length; i++) {
        const alertData = queue[i];
        try {
            await SafeSpaceAPI.triggerSOSEndpoint(alertData);
            
            // Update the history event status to Sent (Synced)
            const eventIndex = history.findIndex(h => h.id === alertData.id);
            if (eventIndex !== -1) {
                history[eventIndex].status = 'Sent (Synced)';
                updatedHistory = true;
            }
        } catch (e) {
            console.error("Failed to sync queued alert", e);
        }
    }
    
    // Clear the queue since they have been processed
    localStorage.removeItem('offlineQueue');
    
    if (updatedHistory) {
        SafeSpaceStorage.saveData('history', history);
        if (window.refreshHistoryList) refreshHistoryList();
    }
}

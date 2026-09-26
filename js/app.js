// app.js - Main entry point

document.addEventListener('DOMContentLoaded', () => {
    console.log('SafeSpace App Initialized');
    
    // Initialize Features
    initThemeFeature();
    initContactsFeature();
    initSOSFeature();
    refreshHistoryList();
    initPlacesFeature();
    initProfileFeature();
    initCheckinFeature();
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
    const sosBtn = document.getElementById('sos-btn');
    if (!sosBtn) return;

    const startCountdown = (e) => {
        if (e.cancelable) e.preventDefault();
        holdTime = 0;
        sosBtn.classList.add('counting');
        
        const progressEl = sosBtn.querySelector('.sos-progress');
        const textEl = sosBtn.querySelector('#sos-text');
        
        sosInterval = setInterval(() => {
            holdTime += 100;
            const percentage = (holdTime / REQUIRED_HOLD_TIME) * 100;
            if (progressEl) progressEl.style.height = `${percentage}%`;
            
            const remaining = Math.ceil((REQUIRED_HOLD_TIME - holdTime) / 1000);
            if (textEl) textEl.innerText = remaining + 's';
        }, 100);

        sosTimeout = setTimeout(() => {
            cancelCountdown();
            triggerSOS('manual');
        }, REQUIRED_HOLD_TIME);
    };

    const cancelCountdown = () => {
        clearTimeout(sosTimeout);
        clearInterval(sosInterval);
        resetSOSButton();
    };

    const resetSOSButton = () => {
        sosBtn.classList.remove('counting');
        const progressEl = sosBtn.querySelector('.sos-progress');
        const textEl = sosBtn.querySelector('#sos-text');
        if (progressEl) progressEl.style.height = '0%';
        if (textEl) textEl.innerText = 'SOS';
    };

    sosBtn.addEventListener('mousedown', startCountdown);
    sosBtn.addEventListener('mouseup', cancelCountdown);
    sosBtn.addEventListener('mouseleave', cancelCountdown);
    
    sosBtn.addEventListener('touchstart', startCountdown, {passive: false});
    sosBtn.addEventListener('touchend', cancelCountdown);
}

async function triggerSOS(mode = 'manual') {
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
        timestamp: Date.now(),
        location: locationData,
        contactsCount: SafeSpaceStorage.getContacts().length
    };
    
    try {
        const response = await SafeSpaceAPI.triggerSOSEndpoint(alertData);
        
        SafeSpaceStorage.addHistoryEvent({
            id: response.id,
            timestamp: alertData.timestamp,
            type: mode === 'auto' ? 'Auto-Triggered SOS' : 'SOS Triggered',
            details: `Location shared: ${locationStr}. Contacts notified: ${alertData.contactsCount}.`,
            status: 'Active'
        });
        
        refreshHistoryList();
    } catch (e) {
        console.error("SOS failed", e);
    }
    
    setTimeout(() => {
        document.body.classList.remove('alert-active');
    }, 5000);
}

function refreshHistoryList() {
    const history = SafeSpaceStorage.getHistory();
    SafeSpaceDOM.renderHistory(history);
}

async function initPlacesFeature() {
    const container = document.getElementById('places-list');
    if (!container) return;
    
    container.innerHTML = `<p class="text-muted text-center my-4 fs-sm">Fetching location...</p>`;
    
    try {
        const loc = await SafeSpaceGeo.getCurrentLocation();
        container.innerHTML = `<p class="text-muted text-center my-4 fs-sm">Finding safe places...</p>`;
        const places = await SafeSpaceAPI.getNearbyPlaces(loc.lat, loc.lng);
        SafeSpaceDOM.renderPlaces(places);
    } catch (err) {
        console.warn("Could not load location for places", err);
        container.innerHTML = `<p class="text-warning text-center my-4 fs-sm">Location required to find nearby places.</p>`;
    }
}

function initProfileFeature() {
    loadMedicalInfo();

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

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            SafeSpaceXML.exportProfile();
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
}

function loadMedicalInfo() {
    const info = SafeSpaceStorage.getMedicalInfo();
    const nameEl = document.getElementById('profileName');
    const bloodEl = document.getElementById('profileBlood');
    const condEl = document.getElementById('profileConditions');
    
    if (nameEl) nameEl.value = info.name || '';
    if (bloodEl) bloodEl.value = info.bloodType || '';
    if (condEl) condEl.value = info.conditions || '';
}

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
                triggerSOS('auto');
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

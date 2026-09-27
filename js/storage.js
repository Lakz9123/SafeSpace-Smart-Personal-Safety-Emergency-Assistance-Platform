// storage.js - LocalStorage management

const SafeSpaceStorage = {
    // Core data access
    saveData: (key, value) => {
        try {
            localStorage.setItem(`safespace_${key}`, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Storage save error', e);
            return false;
        }
    },
    
    getData: (key) => {
        try {
            const data = localStorage.getItem(`safespace_${key}`);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Storage read error', e);
            return null;
        }
    },

    // Contacts specific helpers
    getContacts: () => {
        return SafeSpaceStorage.getData('contacts') || [];
    },

    saveContact: (contact) => {
        const contacts = SafeSpaceStorage.getContacts();
        if (!contact.id) {
            contact.id = 'contact_' + Date.now();
        }
        
        const existingIndex = contacts.findIndex(c => c.id === contact.id);
        if (existingIndex >= 0) {
            contacts[existingIndex] = contact;
        } else {
            contacts.push(contact);
        }
        
        SafeSpaceStorage.saveData('contacts', contacts);
        return contact.id;
    },

    deleteContact: (id) => {
        let contacts = SafeSpaceStorage.getContacts();
        contacts = contacts.filter(c => c.id !== id);
        SafeSpaceStorage.saveData('contacts', contacts);
    },

    getContactById: (id) => {
        const contacts = SafeSpaceStorage.getContacts();
        return contacts.find(c => c.id === id);
    },

    // History specific helpers
    getHistory: () => {
        return SafeSpaceStorage.getData('history') || [];
    },

    addHistoryEvent: (event) => {
        const history = SafeSpaceStorage.getHistory();
        history.unshift(event);
        SafeSpaceStorage.saveData('history', history);
    },

    // Medical Info helpers
    getMedicalInfo: () => {
        return SafeSpaceStorage.getData('medical') || { name: '', bloodType: '', conditions: '' };
    },

    saveMedicalInfo: (info) => {
        return SafeSpaceStorage.saveData('medical', info);
    },

    // Fake Call helpers
    getFakeCallInfo: () => {
        return SafeSpaceStorage.getData('fakeCall') || { callerName: 'Mom', delay: 3 };
    },

    saveFakeCallInfo: (info) => {
        return SafeSpaceStorage.saveData('fakeCall', info);
    },

    // Voice Settings
    getVoiceSettings: () => {
        return SafeSpaceStorage.getData('voiceSettings') || { enabled: false, phrase: 'help me now' };
    },

    saveVoiceSettings: (settings) => {
        return SafeSpaceStorage.saveData('voiceSettings', settings);
    },

    // Follow Me Settings
    getFollowMeSessions: () => {
        return SafeSpaceStorage.getData('followMeSessions') || [];
    },

    addFollowMeSession: (session) => {
        const sessions = SafeSpaceStorage.getFollowMeSessions();
        sessions.unshift(session);
        return SafeSpaceStorage.saveData('followMeSessions', sessions);
    },

    // Shake Settings
    getShakeSettings: () => {
        return SafeSpaceStorage.getData('shakeSettings') || { enabled: false };
    },

    saveShakeSettings: (settings) => {
        return SafeSpaceStorage.saveData('shakeSettings', settings);
    }
};

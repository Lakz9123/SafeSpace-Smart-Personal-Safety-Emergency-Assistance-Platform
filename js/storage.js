// storage.js - LocalStorage management

const SafeSpaceStorage = {
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
    }
};

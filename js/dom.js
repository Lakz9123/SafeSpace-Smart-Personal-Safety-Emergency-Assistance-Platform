// dom.js - DOM rendering and UI updates

const SafeSpaceDOM = {
    updateStatus: (message, type = 'info') => {
        const statusArea = document.getElementById('status-area');
        if (!statusArea) return;
        
        statusArea.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    },
    
    renderContacts: (contacts) => {
        // Render emergency contacts list
    }
};

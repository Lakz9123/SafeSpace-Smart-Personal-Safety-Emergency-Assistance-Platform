// utils.js - Helpers, formatters, etc.

const SafeSpaceUtils = {
    formatDate: (date) => {
        return new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(date);
    },
    
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    calculateDistance: (lat1, lon1, lat2, lon2) => {
        const R = 3958.8; // Radius of the earth in miles
        const dLat = SafeSpaceUtils.deg2rad(lat2 - lat1);
        const dLon = SafeSpaceUtils.deg2rad(lon2 - lon1); 
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(SafeSpaceUtils.deg2rad(lat1)) * Math.cos(SafeSpaceUtils.deg2rad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2); 
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
        const d = R * c; 
        return d;
    },

    deg2rad: (deg) => {
        return deg * (Math.PI/180);
    }
};

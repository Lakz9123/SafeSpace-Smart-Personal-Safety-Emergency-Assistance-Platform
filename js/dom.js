// dom.js - DOM rendering and UI updates

const SafeSpaceDOM = {
    renderContacts: (contacts) => {
        const container = document.getElementById('contacts-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (contacts.length === 0) {
            container.innerHTML = `<p class="text-muted text-center my-4 fs-sm">No contacts added yet. Add one to get started.</p>`;
            return;
        }

        contacts.forEach((contact, index) => {
            const gradientClass = `gradient-${(index % 2) + 1}`;
            // Extract up to 2 initials from the name
            const initials = contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            
            const html = `
                <div class="contact-item d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center">
                        <div class="contact-avatar ${gradientClass}">${initials}</div>
                        <div class="contact-info">
                            <h6 class="mb-0 fw-semibold">${contact.name}</h6>
                            <small class="text-muted">${contact.relation} • ${contact.phone}</small>
                        </div>
                    </div>
                    <div class="contact-actions dropdown">
                        <button class="btn btn-sm btn-link text-muted p-0 text-decoration-none fs-5" data-bs-toggle="dropdown" aria-expanded="false">
                            ⋮
                        </button>
                        <ul class="dropdown-menu shadow-sm">
                            <li><a class="dropdown-item edit-contact-btn" href="#" data-id="${contact.id}">Edit</a></li>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item text-danger delete-contact-btn" href="#" data-id="${contact.id}">Delete</a></li>
                        </ul>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    },

    renderHistory: (history) => {
        const container = document.getElementById('history-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (history.length === 0) {
            container.innerHTML = `<p class="text-muted text-center my-4 fs-sm">No alerts triggered yet.</p>`;
            return;
        }

        history.forEach((event, index) => {
            const date = new Date(event.timestamp);
            const formattedDate = date.toLocaleDateString() + ', ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            const html = `
                <div class="history-item ${index !== 0 ? 'mt-3 pt-3 border-top-subtle' : ''}">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1 text-danger fw-bold">${event.type}</h6>
                        <small class="text-muted fw-medium">${formattedDate}</small>
                    </div>
                    <p class="mb-1 fs-sm">${event.details}</p>
                    <small class="badge bg-danger-subtle text-danger">${event.status}</small>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    },

    renderPlaces: (places) => {
        const container = document.getElementById('places-list');
        if (!container) return;
        
        container.innerHTML = '';
        
        if (places.length === 0) {
            container.innerHTML = `<p class="text-muted text-center my-4 fs-sm">No nearby places found.</p>`;
            return;
        }

        places.forEach(place => {
            let iconClass = 'hospital-icon';
            let iconLetter = 'H';
            if (place.type === 'police') {
                iconClass = 'police-icon';
                iconLetter = 'P';
            }

            const distanceStr = place.distance < 0.1 ? '< 0.1' : place.distance.toFixed(1);

            const html = `
                <div class="place-item">
                    <div class="place-icon ${iconClass}">${iconLetter}</div>
                    <div class="place-info">
                        <h6 class="mb-0 fw-semibold">${place.name}</h6>
                        <small class="text-success fw-medium">${distanceStr} miles away</small>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    }
};

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
            
            let mapBtnHtml = '';
            if (event.location && event.location.lat) {
                mapBtnHtml = `<button class="btn btn-sm btn-outline-primary mt-2" onclick="SafeSpaceMap.showHistoryLocation(${event.location.lat}, ${event.location.lng}, '${formattedDate.replace(/'/g, "\\'")}')">🗺️ View on Map</button>`;
            }

            const html = `
                <div class="history-item ${index !== 0 ? 'mt-3 pt-3 border-top-subtle' : ''}">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1 text-danger fw-bold">${event.type}</h6>
                        <small class="text-muted fw-medium">${formattedDate}</small>
                    </div>
                    <p class="mb-1 fs-sm">${event.details}</p>
                    <div>
                        <small class="badge bg-danger-subtle text-danger">${event.status}</small>
                        ${mapBtnHtml}
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    },

    renderPlaces: (places) => {
        const container = document.getElementById('places-list');
        const scoreContainer = document.getElementById('safety-score-container');
        const scoreBadge = document.getElementById('safety-score-badge');
        const scoreDesc = document.getElementById('safety-score-desc');
        
        if (!container) return;
        
        container.innerHTML = '';
        
        if (places.length === 0) {
            container.innerHTML = `<p class="text-muted text-center my-4 fs-sm">No nearby places found.</p>`;
            // Do not return here, we still want to render the safety score (which will be 0 or low)
        }

        // --- Calculate Safety Score ---
        // 1. Number of places within 1.24 miles (approx 2km)
        const nearbyPlaces = places.filter(p => p.distance <= 1.24);
        const count = nearbyPlaces.length;
        
        // 2. Average distance to nearest (up to 3)
        const nearest = places.slice(0, 3);
        const avgDistance = nearest.reduce((sum, p) => sum + p.distance, 0) / nearest.length;
        
        // 3. Diversity
        const types = new Set(nearbyPlaces.map(p => p.type));
        const diversityBonus = types.size * 10; 
        
        // Base score
        let score = 50; 
        
        // Add for quantity (up to +30)
        score += Math.min(count * 5, 30);
        
        // Adjust for proximity (closer is better, max +20 for avg < 0.5 miles)
        if (avgDistance < 2.0) {
            score += Math.max(0, (2.0 - avgDistance) * 10);
        } else {
            score -= Math.min(20, (avgDistance - 2.0) * 5);
        }
        
        // Add diversity
        score += diversityBonus;
        
        // Bound 0-100
        score = Math.max(0, Math.min(100, Math.round(score)));
        
        if (scoreContainer && scoreBadge && scoreDesc) {
            scoreContainer.classList.remove('d-none');
            
            let colorClass = 'bg-danger';
            let label = 'Low Safety';
            if (score >= 70) {
                colorClass = 'bg-success';
                label = 'Highly Safe';
            } else if (score >= 40) {
                colorClass = 'bg-warning text-dark';
                label = 'Moderately Safe';
            }
            
            scoreBadge.className = `badge rounded-pill fs-6 ${colorClass}`;
            scoreBadge.innerText = `${score} — ${label}`;
            
            const nearestStr = nearest[0] ? (nearest[0].distance < 0.1 ? '< 0.1' : nearest[0].distance.toFixed(1)) : '--';
            scoreDesc.innerText = `${count} safe location(s) within 2km, nearest is ${nearestStr} miles away.`;
        }
        // ------------------------------

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

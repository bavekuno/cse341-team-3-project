const hookRegionSorter = () => {
    const regionSelect = document.getElementById('region-filter');
    if (regionSelect) {
        regionSelect.addEventListener('change', () => {
            const selectedRegion = regionSelect.value;
            const url = new URL(window.location.href);

            if (selectedRegion && selectedRegion !== 'all') {
                url.searchParams.set('region', selectedRegion);
            } else {
                url.searchParams.delete('region');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookSeasonSorter = () => {
    const seasonSelect = document.getElementById('season-filter');
    if (seasonSelect) {
        seasonSelect.addEventListener('change', () => {
            const selectedSeason = seasonSelect.value;
            const url = new URL(window.location.href);

            if (selectedSeason && selectedSeason !== 'all') {
                url.searchParams.set('season', selectedSeason);
            } else {
                url.searchParams.delete('season');
            }
            
            window.location.href = url.toString();
        });
    }
};

const hookTrainsCatalog = async () => {
    const listEl = document.getElementById('trains-list');
    const templateEl = document.getElementById('train-card-template');
    const loadingEl = document.getElementById('trains-loading');
    const errorEl = document.getElementById('trains-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trains');
        if (!response.ok) {
            throw new Error(`Failed to load trains (${response.status})`);
        }

        const payload = await response.json();
        const trains = payload.trains || [];
        const fragment = document.createDocumentFragment();

        trains.forEach((train) => {
            const card = templateEl.content.cloneNode(true);
            const imageEl = card.querySelector('[data-field="image"]');

            imageEl.src = train.imageUrl;
            imageEl.alt = train.imageAlt || `${train.name} train`;

            card.querySelector('[data-field="name"]').textContent = train.name;
            card.querySelector('[data-field="operator"]').textContent = train.operator;
            card.querySelector('[data-field="type"]').textContent = train.type;
            card.querySelector('[data-field="speed"]').textContent = `${train.maxSpeedKmh} km/h`;
            card.querySelector('[data-field="seats"]').textContent = `${train.capacity} seats`;
            card.querySelector('[data-field="power"]').textContent = train.powerSource;
            card.querySelector('[data-field="description"]').textContent = train.description;
            card.querySelector('[data-field="best-for"]').textContent = train.bestFor;

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trains right now. Please try again in a moment.';
        }
    }
};

const hookTripsCatalog = async () => {
    const listEl = document.getElementById('trips-list');
    const templateEl = document.getElementById('trip-card-template');
    const loadingEl = document.getElementById('trips-loading');
    const errorEl = document.getElementById('trips-error');

    if (!listEl || !templateEl) {
        return;
    }

    try {
        const response = await fetch('/api/trips');
        if (!response.ok) {
            throw new Error(`Failed to load trips (${response.status})`);
        }

        const trips = await response.json();
        const fragment = document.createDocumentFragment();

        trips.forEach((trip) => {
            const card = templateEl.content.cloneNode(true);

            const regionClass = trip.region ? `route-card ${trip.region}` : 'route-card';
            const cardRoot = card.querySelector('.route-card');
            if (cardRoot) {
                cardRoot.className = regionClass;
            }

            card.querySelector('[data-field="name"]').textContent = trip.name ?? '';
            card.querySelector('[data-field="region"]').textContent = trip.region ?? '';
            card.querySelector('[data-field="start-station"]').textContent = trip.startStation ?? '';
            card.querySelector('[data-field="end-station"]').textContent = trip.endStation ?? '';
            card.querySelector('[data-field="duration"]').textContent = trip.duration ?? '';
            card.querySelector('[data-field="distance"]').textContent = trip.distance ?? '';
            card.querySelector('[data-field="description"]').textContent = trip.description ?? '';

            const bestSeasonEl = card.querySelector('[data-field="best-season"]');
            if (bestSeasonEl) {
                bestSeasonEl.textContent = trip.bestSeason ?? '';
            }
            const seasonBadgeEl = card.querySelector('[data-field="season-badge"]');
            if (seasonBadgeEl && trip.bestSeason) {
                seasonBadgeEl.className = `season-badge season-${trip.bestSeason}`;
            }

            const highlightsEl = card.querySelector('[data-field="highlights"]');
            if (highlightsEl) {
                highlightsEl.replaceChildren();
                if (Array.isArray(trip.highlights)) {
                    trip.highlights.forEach((highlight) => {
                        const span = document.createElement('span');
                        span.className = 'highlight-tag';
                        span.textContent = highlight;
                        highlightsEl.appendChild(span);
                    });
                }
            }

            const detailsLinkEl = card.querySelector('[data-field="details-link"]');
            if (detailsLinkEl && trip.id) {
                detailsLinkEl.href = `/trips/${trip.id}`;
            }

            fragment.appendChild(card);
        });

        listEl.replaceChildren(fragment);
        if (loadingEl) {
            loadingEl.hidden = true;
        }
    } catch (error) {
        if (loadingEl) {
            loadingEl.hidden = true;
        }
        if (errorEl) {
            errorEl.hidden = false;
            errorEl.textContent = 'Unable to load trips right now. Please try again in a moment.';
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    hookRegionSorter();
    hookSeasonSorter();
    hookTrainsCatalog();
    hookTripsCatalog();
});

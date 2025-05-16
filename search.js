// Vybe API credentials (reuse from other scripts)
const CLIENT_ID = '8dd545fb3d3f4a2a9cc2b5be29185cb6';
const CLIENT_SECRET = '6fa150638ba24eee8b3aa30906180628';

// DOM Elements
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const searchResultsContainer = document.getElementById('search-results');
const loadingElement = document.getElementById('loading');
const messageArea = document.getElementById('message-area');

// Function to get Spotify Access Token (copied/adapted from other scripts)
async function getAccessToken() {
    try {
        const cachedToken = sessionStorage.getItem('vybe_token');
        const tokenExpiry = sessionStorage.getItem('vybe_token_expiry');

        if (cachedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
            return cachedToken;
        }

        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
            },
            body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
            throw new Error(`Failed to get access token: ${response.status}`);
        }

        const data = await response.json();
        sessionStorage.setItem('vybe_token', data.access_token);
        sessionStorage.setItem('vybe_token_expiry', (Date.now() + (data.expires_in * 1000)).toString());
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        showMessage('error', 'Could not authenticate with Spotify. Please try again later.');
        return null;
    }
}

// Function to perform Spotify search
async function searchSpotifyTracks(token, query) {
    if (!query) return null; // Don't search if query is empty

    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=track&limit=50`; // Search for tracks, limit 50

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            // Handle specific errors like rate limiting (429)
            if (response.status === 429) {
                 throw new Error('Rate limit exceeded. Please wait a moment and try again.');
            }
            throw new Error(`Search failed: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        return data.tracks.items; // Return array of track objects
    } catch (error) {
        console.error('Error searching Spotify:', error);
        showMessage('error', `Search failed. ${error.message}`);
        return null;
    }
}

// Function to display search results
function displaySearchResults(tracks) {
    searchResultsContainer.innerHTML = ''; // Clear previous results

    if (!tracks) {
        // Error message already shown by searchSpotifyTracks or getAccessToken
        return;
    }

    if (tracks.length === 0) {
        showMessage('info', 'No tracks found matching your search.');
        return;
    }

    tracks.forEach(track => {
        if (!track) return; // Skip if track data is somehow null

        const trackElement = document.createElement('li');
        trackElement.className = 'track-item'; // Reuse styles

        const albumArtUrl = track.album.images && track.album.images.length > 0
            ? track.album.images[track.album.images.length - 1].url // Smallest image
            : 'https://via.placeholder.com/50?text=V'; // Fallback

        const durationMs = track.duration_ms;
        const durationMin = Math.floor(durationMs / 60000);
        const durationSec = ((durationMs % 60000) / 1000).toFixed(0);
        const formattedDuration = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;

        trackElement.innerHTML = `
            <img src="${albumArtUrl}" alt="${track.album.name}" class="track-album-art">
            <div class="track-details">
                <div class="track-title">${track.name}</div>
                <div class="track-artist">${track.artists.map(artist => artist.name).join(', ')}</div>
            </div>
            <span class="track-duration">${formattedDuration}</span>
        `;

        // Add click listener to navigate to track detail page
        trackElement.addEventListener('click', () => {
            window.location.href = `track-details.html?id=${track.id}`;
        });

        searchResultsContainer.appendChild(trackElement);
    });
}

// Function to show loading indicator
function showLoading(isLoading) {
    loadingElement.style.display = isLoading ? 'block' : 'none';
}

// Function to display messages (info, error)
function showMessage(type, text) {
    messageArea.textContent = text;
    messageArea.className = `${type}-message`; // Use CSS classes for styling (e.g., .error-message, .info-message)
    messageArea.style.display = 'block';
}

// Function to hide messages
function hideMessage() {
    messageArea.style.display = 'none';
    messageArea.textContent = '';
}

// Event Listener for search form submission
searchForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload
    const query = searchInput.value.trim();

    if (!query) {
        showMessage('info', 'Please enter something to search for.');
        return;
    }

    hideMessage();
    showLoading(true);
    searchResultsContainer.innerHTML = ''; // Clear previous results immediately
    searchButton.disabled = true; // Disable button during search

    const token = await getAccessToken();
    let tracks = null;
    if (token) {
        tracks = await searchSpotifyTracks(token, query);
    }

    showLoading(false);
    displaySearchResults(tracks); // Display results or handle errors shown by previous functions
    searchButton.disabled = false; // Re-enable button
});

// Optional: Clear message when user starts typing again
searchInput.addEventListener('input', () => {
    if (messageArea.style.display !== 'none') {
        hideMessage();
    }
});

// Initial message (optional)
// showMessage('info', 'Enter a song title, artist, or album to begin.');

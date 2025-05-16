// Vybe API credentials (replace with your actual credentials)
const CLIENT_ID = '8dd545fb3d3f4a2a9cc2b5be29185cb6';
const CLIENT_SECRET = '6fa150638ba24eee8b3aa30906180628'; // Keep secret secure in a real app

// DOM Elements
const playlistNameElement = document.getElementById('playlist-name');
const playlistDescriptionElement = document.getElementById('playlist-description');
const playlistCoverElement = document.getElementById('playlist-cover');
const playlistBackgroundElement = document.getElementById('playlist-background');
const playlistOwnerElement = document.getElementById('playlist-owner');
const playlistTrackCountElement = document.getElementById('playlist-track-count');
const tracksListElement = document.getElementById('tracks-list');
const loadingElement = document.getElementById('loading');

// Get playlist ID and name from URL
const urlParams = new URLSearchParams(window.location.search);
const playlistId = urlParams.get('id');
const playlistName = urlParams.get('name'); // Use this for fallback title if needed

// Function to get Spotify Access Token (reuse from category-details or implement here)
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
        showError('Could not authenticate with Spotify.');
        return null;
    }
}

// Function to fetch playlist details
async function fetchPlaylistDetails(token, id) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/playlists/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch playlist details: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching playlist details:', error);
        showError(`Could not load playlist details. ${error.message}`);
        return null;
    }
}

// Function to fetch playlist tracks
async function fetchPlaylistTracks(token, id) {
    try {
        // Fetch all tracks, handling pagination if necessary (Spotify API defaults to 100 limit)
        let allTracks = [];
        let url = `https://api.spotify.com/v1/playlists/${id}/tracks?limit=100`; // Max limit per request

        while (url) {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                throw new Error(`Failed to fetch playlist tracks: ${response.status}`);
            }
            const data = await response.json();
            allTracks = allTracks.concat(data.items.filter(item => item.track)); // Filter out null tracks
            url = data.next; // Get URL for the next page of results
        }
        return allTracks;

    } catch (error) {
        console.error('Error fetching playlist tracks:', error);
        showError(`Could not load tracks. ${error.message}`);
        return []; // Return empty array on error
    }
}

// Function to display playlist details
function displayPlaylistDetails(details) {
    if (!details) return;

    document.title = `${details.name} - Vybe`; // Update page title
    playlistNameElement.textContent = details.name;
    playlistDescriptionElement.textContent = details.description || 'No description available.'; // Handle empty descriptions
    playlistOwnerElement.textContent = `By ${details.owner.display_name}`;
    playlistTrackCountElement.textContent = details.tracks.total;

    if (details.images && details.images.length > 0) {
        playlistCoverElement.src = details.images[0].url;
        playlistBackgroundElement.src = details.images[0].url; // Use cover image for background blur
    } else {
        // Use a default image if no cover art
        playlistCoverElement.src = 'https://via.placeholder.com/150?text=Vybe';
        playlistBackgroundElement.src = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    }
}

// Function to display tracks
function displayTracks(tracks) {
    loadingElement.style.display = 'none'; // Hide loading indicator
    tracksListElement.innerHTML = ''; // Clear previous tracks

    if (!tracks || tracks.length === 0) {
        tracksListElement.innerHTML = '<li class="error-message">No tracks found in this playlist.</li>';
        return;
    }

    tracks.forEach((item, index) => {
        const track = item.track;
        if (!track) return; // Skip if track data is missing

        const trackElement = document.createElement('li');
        trackElement.className = 'track-item';

        const albumArtUrl = track.album.images && track.album.images.length > 0
            ? track.album.images[track.album.images.length - 1].url // Use smallest image
            : 'https://via.placeholder.com/50?text=V'; // Fallback image

        const durationMs = track.duration_ms;
        const durationMin = Math.floor(durationMs / 60000);
        const durationSec = ((durationMs % 60000) / 1000).toFixed(0);
        const formattedDuration = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;

        trackElement.innerHTML = `
            <span class="track-number">${index + 1}</span>
            <img src="${albumArtUrl}" alt="${track.album.name}" class="track-album-art">
            <div class="track-details">
                <div class="track-title">${track.name}</div>
                <div class="track-artist">${track.artists.map(artist => artist.name).join(', ')}</div>
            </div>
            <span class="track-duration">${formattedDuration}</span>
        `;

        // Optional: Add click listener to navigate to track detail page
        trackElement.addEventListener('click', () => {
            window.location.href = `track-details.html?id=${track.id}`;
        });


        tracksListElement.appendChild(trackElement);
    });
}

// Function to show error messages
function showError(message) {
    loadingElement.style.display = 'none'; // Hide loading indicator
    // Display error in the tracks list area or create a dedicated error div
    tracksListElement.innerHTML = `<li class="error-message"><i class="fas fa-exclamation-circle"></i> ${message}</li>`;
    // Optionally update banner text
    if (playlistNameElement.textContent === 'Loading Playlist...') {
        playlistNameElement.textContent = 'Error';
        playlistDescriptionElement.textContent = 'Could not load playlist.';
    }
}

// Initialize the page
async function init() {
    if (!playlistId) {
        showError('No Playlist ID provided. Please go back and select a playlist.');
        playlistNameElement.textContent = 'Invalid Playlist';
        return;
    }

    // Set initial title while loading
    if (playlistName) {
         document.title = `${decodeURIComponent(playlistName)} - Vybe`;
         playlistNameElement.textContent = decodeURIComponent(playlistName);
    }


    const token = await getAccessToken();
    if (!token) {
        // Error already shown by getAccessToken
        return;
    }

    // Fetch details and tracks in parallel
    try {
        const [details, tracks] = await Promise.all([
            fetchPlaylistDetails(token, playlistId),
            fetchPlaylistTracks(token, playlistId)
        ]);

        displayPlaylistDetails(details);
        displayTracks(tracks);

    } catch (error) {
        // Errors are handled within the fetch functions, but catch any unexpected ones
        console.error("Initialization error:", error);
        showError('An unexpected error occurred during initialization.');
    }
}

// Run initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', init);


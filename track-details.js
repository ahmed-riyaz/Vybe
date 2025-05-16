// Vybe API credentials (using CLIENT_ID from auth.js)
// Note: CLIENT_ID is already defined in auth.js
const CLIENT_SECRET = '6fa150638ba24eee8b3aa30906180628';

// DOM Elements
const loadingElement = document.getElementById('loading');
const errorMessageElement = document.getElementById('error-message');
const trackContentElement = document.getElementById('track-content');
const trackBannerElement = document.getElementById('track-banner');
const trackCoverElement = document.getElementById('track-cover');
const trackTitleElement = document.getElementById('track-title');
const artistInfoElement = document.getElementById('artist-info');
const albumLinkElement = document.getElementById('album-link');
const trackYearElement = document.getElementById('track-year');
const trackDurationElement = document.getElementById('track-duration');
const artistCardsContainer = document.getElementById('artist-cards-container');
const recommendationAlbumTitleElement = document.getElementById('recommendation-album-title');
const recommendationsListElement = document.getElementById('recommendations-list');

// Add to Playlist functionality elements
const addToPlaylistBtn = document.getElementById('add-to-playlist-btn');
const playlistModal = document.getElementById('playlist-modal');
const closePlaylistModalBtn = document.getElementById('close-playlist-modal');
const playlistList = document.getElementById('playlist-list');
const playlistModalLoading = document.getElementById('playlist-modal-loading');
const playlistModalMessage = document.getElementById('playlist-modal-message');
const addToSelectedPlaylistBtn = document.getElementById('add-to-selected-playlist');

// Get track ID from URL
const urlParams = new URLSearchParams(window.location.search);
const trackId = urlParams.get('id');

// Function to get Spotify Access Token (reused)
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

// Function to fetch track details
async function fetchTrackDetails(token, id) {
    try {
        const response = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 404) throw new Error('Track not found.');
            throw new Error(`Failed to fetch track details: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching track details:', error);
        showError(`Could not load track details. ${error.message}`);
        return null;
    }
}

// Function to fetch artist details (can fetch multiple artists)
async function fetchArtistDetails(token, artistIds) {
    if (!artistIds || artistIds.length === 0) return [];
    try {
        const ids = artistIds.join(',');
        const response = await fetch(`https://api.spotify.com/v1/artists?ids=${ids}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch artist details: ${response.status}`);
        }
        const data = await response.json();
        return data.artists;
    } catch (error) {
        console.error('Error fetching artist details:', error);
        // Don't necessarily show a page-level error, maybe just log it
        return []; // Return empty array on error
    }
}

// Function to fetch album tracks
async function fetchAlbumTracks(token, albumId) {
    if (!albumId) return [];
    try {
        let allTracks = [];
        let url = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`;

        while (url) {
             const response = await fetch(url, {
                 headers: { 'Authorization': `Bearer ${token}` }
             });
             if (!response.ok) {
                 throw new Error(`Failed to fetch album tracks: ${response.status}`);
             }
             const data = await response.json();
             allTracks = allTracks.concat(data.items);
             url = data.next; // Handle pagination
        }
        return allTracks;
    } catch (error) {
        console.error('Error fetching album tracks:', error);
        // Don't show page error, recommendations are secondary
        return [];
    }
}

// Function to format duration
function formatDuration(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}

// Function to display track details
function displayTrackDetails(track, artistsDetails) {
    if (!track) return;

    document.title = `${track.name} by ${track.artists.map(a => a.name).join(', ')} - Vybe`;

    // Banner Background (use album art)
    if (track.album.images && track.album.images.length > 0) {
        trackBannerElement.style.backgroundImage = `linear-gradient(to bottom, rgba(30, 30, 35, 0.7), rgba(23, 23, 25, 1) 80%), url('${track.album.images[0].url}')`;
        trackCoverElement.src = track.album.images[0].url;
        trackCoverElement.alt = track.name;
    }

    trackTitleElement.textContent = track.name;

    // Artist Info in Banner
    artistInfoElement.innerHTML = ''; // Clear loading state
    if (artistsDetails && artistsDetails.length > 0) {
        artistsDetails.forEach((artist, index) => {
            if (!artist) return; // Skip if artist data is missing (shouldn't happen)
            // Add avatar
            const avatar = document.createElement('img');
            avatar.src = artist.images && artist.images.length > 0 ? artist.images[artist.images.length - 1].url : 'https://via.placeholder.com/25?text=A';
            avatar.alt = artist.name;
            avatar.className = 'artist-avatar';
            artistInfoElement.appendChild(avatar);

            // Add artist name (link if URL available)
            const artistLink = document.createElement(artist.external_urls.spotify ? 'a' : 'span');
            artistLink.textContent = artist.name;
            if (artist.external_urls.spotify) {
                artistLink.href = artist.external_urls.spotify;
                artistLink.target = '_blank'; // Open in new tab
            }
            artistInfoElement.appendChild(artistLink);

            // Add comma if not the last artist
            if (index < artistsDetails.length - 1) {
                const comma = document.createTextNode(', ');
                artistInfoElement.appendChild(comma);
            }
        });
    } else {
        // Fallback if artist details fetch failed
        artistInfoElement.textContent = track.artists.map(a => a.name).join(', ');
    }

    // Album Info
    albumLinkElement.innerHTML = '';
    const albumLink = document.createElement(track.album.external_urls.spotify ? 'a' : 'span');
    albumLink.textContent = track.album.name;
    if (track.album.external_urls.spotify) {
        albumLink.href = track.album.external_urls.spotify;
        albumLink.target = '_blank';
    }
    albumLinkElement.appendChild(albumLink);

    // Year and Duration
    trackYearElement.textContent = track.album.release_date ? track.album.release_date.substring(0, 4) : 'N/A';
    trackDurationElement.textContent = formatDuration(track.duration_ms);

    // Display Artist Cards
    artistCardsContainer.innerHTML = '';
    if (artistsDetails && artistsDetails.length > 0) {
        artistsDetails.forEach(artist => {
            if (!artist) return;
            const card = document.createElement('div');
            card.className = 'artist-card';
            const imgUrl = artist.images && artist.images.length > 0 ? artist.images[1]?.url || artist.images[0].url : 'https://via.placeholder.com/60?text=A'; // Prefer medium image
            card.innerHTML = `
                <img src="${imgUrl}" alt="${artist.name}">
                <div class="artist-details">
                    <h4>${artist.name}</h4>
                    <p>${artist.genres ? artist.genres.slice(0, 3).join(', ') : 'Artist'}</p> <!-- Show top genres -->
                </div>
            `;
            // Optional: Make card clickable to Spotify artist page
            if (artist.external_urls.spotify) {
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => window.open(artist.external_urls.spotify, '_blank'));
            }
            artistCardsContainer.appendChild(card);
        });
    } else {
        artistCardsContainer.innerHTML = '<p class="info-message">Artist details could not be loaded.</p>';
    }
}

// Function to display recommendations (album tracks)
function displayRecommendations(albumTracks, currentTrackId) {
    recommendationsListElement.innerHTML = ''; // Clear

    if (!albumTracks || albumTracks.length <= 1) { // Only show if more than 1 track
        recommendationsListElement.innerHTML = '<li class="info-message">No other tracks found on this album.</li>';
        return;
    }

    albumTracks.forEach((track, index) => {
        // Skip the currently viewed track
        if (track.id === currentTrackId) return;

        const trackElement = document.createElement('li');
        trackElement.className = 'track-item';

        // Note: Album tracks endpoint doesn't include album art per track, use placeholder or fetch separately if needed
        const albumArtUrl = 'https://via.placeholder.com/40?text=V'; // Placeholder

        trackElement.innerHTML = `
            <span class="track-number">${track.track_number || index + 1}</span>
            <img src="${albumArtUrl}" alt="Album Track" class="track-album-art">
            <div class="track-details">
                <div class="track-title">${track.name}</div>
                <div class="track-artist">${track.artists.map(artist => artist.name).join(', ')}</div>
            </div>
            <span class="track-duration">${formatDuration(track.duration_ms)}</span>
        `;

        // Add click listener to navigate to this track's detail page
        trackElement.addEventListener('click', () => {
            window.location.href = `track-details.html?id=${track.id}`;
        });

        recommendationsListElement.appendChild(trackElement);
    });
}

// Function to show error messages
function showError(message) {
    loadingElement.style.display = 'none';
    trackContentElement.style.display = 'none';
    errorMessageElement.textContent = message;
    errorMessageElement.style.display = 'block';
}

// --- Add to Playlist Functionality ---

// Check if user is logged in (for Add to Playlist feature)
async function checkUserLoginStatus() {
    try {
        // Check if auth.js is loaded and functions exist
        if (typeof getAccessToken === 'function') {
            const token = getAccessToken();
            if (token) {
                // User is logged in, show the button
                addToPlaylistBtn.classList.remove('hidden');
                return true;
            }
        }
        return false;
    } catch (error) {
        console.error('Error checking login status:', error);
        return false;
    }
}

// Open the playlist selection modal - only add listener if button exists
if (addToPlaylistBtn) {
    addToPlaylistBtn.addEventListener('click', () => {
        openPlaylistModal();
    });
}

// Close the modal - only add listener if button exists
if (closePlaylistModalBtn) {
    closePlaylistModalBtn.addEventListener('click', () => {
        playlistModal.style.display = 'none';
    });
}

// Close modal if clicking outside content
window.addEventListener('click', (event) => {
    if (event.target === playlistModal) {
        playlistModal.style.display = 'none';
    }
});

// Function to open modal and load user playlists
async function openPlaylistModal() {    
    // Check if we're on a page with the playlist modal
    // Re-query these elements to ensure they're available
    const playlistModal = document.getElementById('playlist-modal');
    const playlistList = document.getElementById('playlist-list');
    const playlistModalMessage = document.getElementById('playlist-modal-message');
    const playlistModalLoading = document.getElementById('playlist-modal-loading');
    const addToSelectedPlaylistBtn = document.getElementById('add-to-selected-playlist');
    
    // If modal elements don't exist, log a warning and exit
    if (!playlistModal) {
        console.warn('Playlist modal not found in the DOM. This feature is only available on track detail pages.');
        return;
    }
    
    // Reset modal state (safely, checking elements exist)
    if (playlistList) playlistList.innerHTML = '';
    if (playlistModalMessage) playlistModalMessage.classList.add('hidden');
    if (addToSelectedPlaylistBtn) addToSelectedPlaylistBtn.disabled = true;
    
    // Show modal
    playlistModal.style.display = 'flex';
    
    // Check for auth.js user token (directly from localStorage)
    // This is the correct token for accessing user playlists
    const userToken = localStorage.getItem('vybe_user_access_token');
    
    if (!userToken) {
        // User is not logged in with Spotify OAuth
        if (playlistModalMessage) {
            playlistModalMessage.textContent = 'Please log in with your Spotify account to add tracks to playlists.';
            playlistModalMessage.className = 'info-message';
            playlistModalMessage.classList.remove('hidden');
            
            // Add a login button to the message
            const loginBtn = document.createElement('button');
            loginBtn.className = 'action-button';
            loginBtn.innerHTML = '<i class="fab fa-spotify"></i> Log in with Spotify';
            loginBtn.style.marginTop = '1rem';
            loginBtn.onclick = () => {
                // Redirect to the My Playlists page which handles Spotify login
                window.location.href = 'my-playlists.html';
            };
            
            playlistModalMessage.appendChild(loginBtn);
        }
        return;
    }
    
    await loadUserPlaylists(userToken, playlistList, playlistModalMessage, playlistModalLoading);
}

// Function to load user playlists in the modal - fixed to use the proper user token
async function loadUserPlaylists(token, playlistList, playlistModalMessage, playlistModalLoading) {
    // Safety check for DOM elements
    if (!playlistList || !playlistModalMessage || !playlistModalLoading) {
        console.warn('Required DOM elements for playlist modal not found');
        return;
    }
    
    playlistModalLoading.classList.remove('hidden');
    playlistList.innerHTML = '';
    
    try {
        let allPlaylists = [];
        let url = 'https://api.spotify.com/v1/me/playlists?limit=50';
        
        while (url) {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    // Token might be invalid/expired
                    localStorage.removeItem('vybe_user_access_token');
                    localStorage.removeItem('vybe_user_token_expiry');
                    throw new Error('Authentication error. Please log in again.');
                }
                throw new Error(`Failed to fetch playlists: ${response.status}`);
            }
            
            const data = await response.json();
            allPlaylists = allPlaylists.concat(data.items);
            url = data.next; // Get URL for next page if any
        }
        
        if (allPlaylists.length === 0) {
            showPlaylistModalMessage('info', 'You don\'t have any playlists yet. Create one in the My Playlists page first!');
        } else {
            displayPlaylistsInModal(allPlaylists);
        }
    } catch (error) {
        console.error('Error loading playlists:', error);
        showPlaylistModalMessage('error', `Could not load playlists: ${error.message}`);
    } finally {
        if (playlistModalLoading) {
            playlistModalLoading.classList.add('hidden');
        }
    }
}

// Function to display playlists in the modal
function displayPlaylistsInModal(playlists) {
    // Re-fetch the DOM element in case it wasn't available when the script loaded
    const playlistList = document.getElementById('playlist-list');
    const addToSelectedPlaylistBtn = document.getElementById('add-to-selected-playlist');
    
    // Safety check to make sure playlistList exists
    if (!playlistList) {
        console.error('playlistList element not found in the DOM');
        showPlaylistModalMessage('error', 'Something went wrong while loading playlists.');
        return;
    }
    
    if (!addToSelectedPlaylistBtn) {
        console.error('addToSelectedPlaylistBtn element not found in the DOM');
        return;
    }
    
    playlistList.innerHTML = '';
    let selectedPlaylistItem = null;
    
    playlists.forEach(playlist => {
        const item = document.createElement('li');
        item.className = 'playlist-item';
        item.dataset.playlistId = playlist.id;
        
        const imageUrl = playlist.images && playlist.images.length > 0 
            ? playlist.images[0].url 
            : 'https://via.placeholder.com/40?text=V';
            
        item.innerHTML = `
            <img src="${imageUrl}" alt="${playlist.name}" class="playlist-thumbnail">
            <span class="playlist-name">${playlist.name}</span>
        `;
        
        // Add click handler to select this playlist
        item.addEventListener('click', () => {
            // Deselect previous selection
            if (selectedPlaylistItem) {
                selectedPlaylistItem.classList.remove('selected');
            }
            
            // Select this playlist
            item.classList.add('selected');
            selectedPlaylistItem = item;
            
            // Enable the Add button
            addToSelectedPlaylistBtn.disabled = false;
            // Store the playlist ID on the button for easy access
            addToSelectedPlaylistBtn.dataset.playlistId = playlist.id;
        });
        
        playlistList.appendChild(item);
    });
    
    // Add event listener for the Add button
    addToSelectedPlaylistBtn.onclick = async () => {
        const selectedItem = document.querySelector('.playlist-item.selected');
        if (!selectedItem) return;
        
        const playlistId = selectedItem.dataset.playlistId;
        await addTrackToPlaylist(playlistId);
    };
}

// Function to add current track to selected playlist
async function addTrackToPlaylist(playlistId) {
    if (!trackId || !playlistId) return;
    
    // Get user token directly from localStorage
    const token = localStorage.getItem('vybe_user_access_token');
    if (!token) {
        showPlaylistModalMessage('error', 'Authentication error. Please log in again.');
        return;
    }

    // Disable Add button while processing
    const addToSelectedPlaylistBtn = document.getElementById('add-to-selected-playlist');
    if (addToSelectedPlaylistBtn) {
        addToSelectedPlaylistBtn.disabled = true;
        addToSelectedPlaylistBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';
    }
    
    try {
        // Add track to playlist - using Spotify API
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                uris: [`spotify:track:${trackId}`]
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            
            // Check if it's a scope issue (missing write permissions)
            if (response.status === 403) {
                console.error('Permission error:', errorData);
                // Clear the token to force re-login with proper scopes
                localStorage.removeItem('vybe_user_access_token');
                localStorage.removeItem('vybe_user_token_expiry');
                throw new Error('You need additional permissions to add tracks to playlists. Please log in again.');
            }
            
            throw new Error(`Failed to add track: ${response.status} ${errorData.error?.message || ''}`);
        }
        
        // Show success message
        showPlaylistModalMessage('success', 'Track added to playlist successfully!');
        
        // Close modal after a brief delay to show the success message
        setTimeout(() => {
            const playlistModal = document.getElementById('playlist-modal');
            if (playlistModal) playlistModal.style.display = 'none';
        }, 1500);
        
    } catch (error) {
        console.error('Error adding track to playlist:', error);
        showPlaylistModalMessage('error', `Could not add track to playlist: ${error.message}`);
        
        // Re-enable the Add button
        if (addToSelectedPlaylistBtn) {
            addToSelectedPlaylistBtn.disabled = false;
            addToSelectedPlaylistBtn.innerHTML = 'Add Track';
        }
    }
}

// Function to show messages in the playlist modal
function showPlaylistModalMessage(type, text) {
    const messageElement = document.getElementById('playlist-modal-message');
    if (!messageElement) return;
    
    messageElement.textContent = text;
    messageElement.className = `${type}-message`; // Assumes CSS classes like .error-message, .info-message, .success-message
    messageElement.classList.remove('hidden');
    
    // Auto-hide success/info messages after a delay
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            messageElement.classList.add('hidden');
        }, 3000);
    }
}

// Check if we should show the Add to Playlist button during init
async function initPlaylistFeature() {
    try {
        // Check if auth.js is loaded and required functions exist
        if (typeof window.getAccessToken === 'function') {
            const token = window.getAccessToken();
            if (token) {
                // User is logged in, show the button
                if (addToPlaylistBtn) {
                    addToPlaylistBtn.classList.remove('hidden');
                }
                return true;
            }
        } else {
            // Auth.js not loaded yet, try to load it
            await loadAuthScript();
            // Check again after loading
            if (typeof window.getAccessToken === 'function') {
                const token = window.getAccessToken();
                if (token) {
                    if (addToPlaylistBtn) {
                        addToPlaylistBtn.classList.remove('hidden');
                    }
                    return true;
                }
            }
        }
        return false;
    } catch (error) {
        console.error('Error initializing playlist feature:', error);
        return false;
    }
}

// Helper function to load auth.js dynamically
function loadAuthScript() {
    return new Promise((resolve, reject) => {
        if (document.querySelector('script[src="auth.js"]')) {
            resolve(); // Script already loaded
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'auth.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
    });
}

// Initialize the page
async function init() {
    if (!trackId) {
        showError('No Track ID provided. Please go back and select a track.');
        return;
    }

    loadingElement.style.display = 'block';
    errorMessageElement.classList.add('hidden');
    trackContentElement.classList.add('hidden');

    // Initialize the Add to Playlist feature in parallel
    initPlaylistFeature();

    const token = await getAccessToken();
    if (!token) {
        // Error already shown by getAccessToken
        return;
    }

    const trackDetails = await fetchTrackDetails(token, trackId);

    if (!trackDetails) {
        // Error already shown by fetchTrackDetails
        return;
    }

    // Fetch artist details and album tracks in parallel
    const artistIds = trackDetails.artists.map(artist => artist.id);
    const albumId = trackDetails.album.id;

    try {
        const [artistsDetails, albumTracks] = await Promise.all([
            fetchArtistDetails(token, artistIds),
            fetchAlbumTracks(token, albumId)
        ]);

        // Display everything
        loadingElement.style.display = 'none';
        displayTrackDetails(trackDetails, artistsDetails);
        recommendationAlbumTitleElement.textContent = trackDetails.album.name;
        displayRecommendations(albumTracks, trackId);
        trackContentElement.classList.remove('hidden'); // Show content now

    } catch (error) {
        // Catch potential errors from Promise.all although individual fetches handle errors
        console.error("Initialization error:", error);
        showError('An unexpected error occurred while loading additional details.');
    }
}

// Run initialization when the DOM is ready
document.addEventListener('DOMContentLoaded', init);

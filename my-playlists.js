// my-playlists.js - Logic for the My Playlists page

// Immediately attempt to handle auth callback when the script loads
// This will capture the token from the URL hash if present
handleAuthCallback(); // Add this line

// DOM Elements
const loginPromptElement = document.getElementById('login-prompt');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const loadingElement = document.getElementById('loading');
const messageArea = document.getElementById('message-area');
const playlistsGridElement = document.getElementById('playlists-grid');
const createPlaylistBtn = document.getElementById('create-playlist-btn');
const createPlaylistModal = document.getElementById('create-playlist-modal');
const closeModalBtn = document.getElementById('close-modal-btn');
const createPlaylistForm = document.getElementById('create-playlist-form');
const playlistNameInput = document.getElementById('playlist-name-input');
const playlistDescriptionInput = document.getElementById('playlist-description-input');
const submitCreatePlaylistBtn = document.getElementById('submit-create-playlist');

// --- Authentication Handling ---

function checkLoginStatus() {
    const token = getAccessToken(); // From auth.js
    if (token) {
        // Logged in
        loginPromptElement.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
        createPlaylistBtn.disabled = false;
        loadUserPlaylists(token);
    } else {
        // Not logged in
        loginPromptElement.style.display = 'block';
        logoutBtn.style.display = 'none';
        createPlaylistBtn.disabled = true;
        playlistsGridElement.innerHTML = ''; // Clear any old playlists
        hideLoading();
    }
}

loginBtn.addEventListener('click', () => {
    redirectToSpotifyLogin(); // From auth.js
});

logoutBtn.addEventListener('click', () => {
    logout(); // From auth.js
    checkLoginStatus(); // Update UI to show login prompt
    showMessage('info', 'You have been logged out.');
});

// --- Playlist Loading ---

async function loadUserPlaylists(token) {
    showLoading('Loading your playlists...');
    hideMessage();
    playlistsGridElement.innerHTML = ''; // Clear previous

    try {
        let allPlaylists = [];
        let url = 'https://api.spotify.com/v1/me/playlists?limit=50';

        while (url) {
            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    logout(); // Token likely expired/invalid
                    checkLoginStatus();
                    throw new Error('Authentication error. Please log in again.');
                }
                throw new Error(`Failed to fetch playlists: ${response.status}`);
            }

            const data = await response.json();
            allPlaylists = allPlaylists.concat(data.items);
            url = data.next; // Get URL for next page
        }

        hideLoading();
        displayPlaylists(allPlaylists);

    } catch (error) {
        console.error('Error loading playlists:', error);
        hideLoading();
        showMessage('error', `Could not load playlists. ${error.message}`);
    }
}

function displayPlaylists(playlists) {
    playlistsGridElement.innerHTML = ''; // Clear just in case

    if (!playlists || playlists.length === 0) {
        showMessage('info', 'You don\'t have any playlists yet. Create one!');
        return;
    }

    playlists.forEach(playlist => {
        const card = document.createElement('div');
        card.className = 'playlist-card';

        const imageUrl = playlist.images && playlist.images.length > 0 ? playlist.images[0].url : null;
        const imageElement = imageUrl
            ? `<img src="${imageUrl}" alt="${playlist.name}" class="playlist-card-image">`
            : `<div class="playlist-card-placeholder"><i class="fas fa-music"></i></div>`;

        card.innerHTML = `
            ${imageElement}
            <div class="playlist-card-content">
                <h3 class="playlist-card-title">${playlist.name}</h3>
                <p class="playlist-card-owner">By ${playlist.owner.display_name}</p>
            </div>
        `;

        // Add click listener to navigate to the playlist detail page (reuse existing one)
        card.addEventListener('click', () => {
            window.location.href = `playlist-details.html?id=${playlist.id}&name=${encodeURIComponent(playlist.name)}`;
        });

        playlistsGridElement.appendChild(card);
    });
}

// --- Create Playlist Modal --- //

createPlaylistBtn.addEventListener('click', () => {
    playlistNameInput.value = ''; // Clear form
    playlistDescriptionInput.value = '';
    createPlaylistModal.style.display = 'flex'; // Show modal
});

closeModalBtn.addEventListener('click', () => {
    createPlaylistModal.style.display = 'none'; // Hide modal
});

// Close modal if clicking outside the content
window.addEventListener('click', (event) => {
    if (event.target === createPlaylistModal) {
        createPlaylistModal.style.display = 'none';
    }
});

createPlaylistForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const token = getAccessToken();
    const userId = getUserId(); // Fetch user ID (should be stored after login)

    if (!token || !userId) {
        showMessage('error', 'Authentication error. Please log in again.');
        createPlaylistModal.style.display = 'none';
        checkLoginStatus();
        return;
    }

    const playlistName = playlistNameInput.value.trim();
    const playlistDescription = playlistDescriptionInput.value.trim();

    if (!playlistName) {
        // Basic validation, should be handled by 'required' but good practice
        alert('Playlist name cannot be empty.');
        return;
    }

    submitCreatePlaylistBtn.disabled = true;
    submitCreatePlaylistBtn.textContent = 'Creating...';

    try {
        const response = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: playlistName,
                description: playlistDescription,
                public: false // Default to private, could add an option
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({})); // Try to get error details
            throw new Error(`Failed to create playlist: ${response.status} ${errorData.error?.message || ''}`);
        }

        const newPlaylist = await response.json();
        createPlaylistModal.style.display = 'none';
        showMessage('success', `Playlist '${newPlaylist.name}' created successfully!`);
        // Refresh the playlist list to include the new one
        loadUserPlaylists(token);

    } catch (error) {
        console.error('Error creating playlist:', error);
        showMessage('error', `Could not create playlist. ${error.message}`);
    } finally {
        submitCreatePlaylistBtn.disabled = false;
        submitCreatePlaylistBtn.textContent = 'Create Playlist';
    }
});

// --- Utility Functions ---

function showLoading(message = 'Loading...') {
    loadingElement.querySelector('p').textContent = message;
    loadingElement.style.display = 'block';
}

function hideLoading() {
    loadingElement.style.display = 'none';
}

function showMessage(type, text) {
    messageArea.textContent = text;
    messageArea.className = `${type}-message`; // Assumes CSS classes like .error-message, .info-message, .success-message
    messageArea.style.display = 'block';
    // Auto-hide info/success messages after a delay
    if (type === 'info' || type === 'success') {
        setTimeout(hideMessage, 4000);
    }
}

function hideMessage() {
    messageArea.style.display = 'none';
    messageArea.textContent = '';
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus(); // This will now use the token if handleAuthCallback found one
});

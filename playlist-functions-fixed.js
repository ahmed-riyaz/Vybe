// Fixed version of the playlist functionality for track-details.js

// Function to open modal and load user playlists
async function openPlaylistModal() {
    // Check if we're on a page that should have this functionality
    // This prevents errors on pages that don't have the playlist modal
    if (!document.querySelector('.track-details-page')) {
        console.log('Playlist functionality is only available on track detail pages');
        return;
    }
    
    // Ensure the DOM is ready
    if (document.readyState !== 'complete') {
        console.warn('DOM not ready yet, waiting...');
        await new Promise(resolve => {
            window.addEventListener('DOMContentLoaded', resolve);
        });
    }

    // Get DOM elements first with safety checks
    let playlistModal = document.getElementById('playlist-modal');
    let playlistList = document.getElementById('playlist-list');
    let playlistModalMessage = document.getElementById('playlist-modal-message');
    let playlistModalLoading = document.getElementById('playlist-modal-loading');
    let addToSelectedPlaylistBtn = document.getElementById('add-to-selected-playlist');
    
    // Create modal elements if they don't exist
    if (!playlistModal) {
        console.warn('Creating missing playlist modal elements');
        
        // Create the modal container
        playlistModal = document.createElement('div');
        playlistModal.id = 'playlist-modal';
        playlistModal.className = 'modal';
        
        // Create modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        
        // Create modal header
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.innerHTML = '<h2>Add to Playlist</h2><span class="close">&times;</span>';
        
        // Create modal body
        const modalBody = document.createElement('div');
        modalBody.className = 'modal-body';
        
        // Create message element
        playlistModalMessage = document.createElement('div');
        playlistModalMessage.id = 'playlist-modal-message';
        playlistModalMessage.className = 'info-message hidden';
        
        // Create loading indicator
        playlistModalLoading = document.createElement('div');
        playlistModalLoading.id = 'playlist-modal-loading';
        playlistModalLoading.className = 'loading-indicator hidden';
        playlistModalLoading.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading your playlists...';
        
        // Create playlist list container
        playlistList = document.createElement('div');
        playlistList.id = 'playlist-list';
        playlistList.className = 'playlist-container';
        
        // Create action button
        addToSelectedPlaylistBtn = document.createElement('button');
        addToSelectedPlaylistBtn.id = 'add-to-selected-playlist';
        addToSelectedPlaylistBtn.className = 'action-button';
        addToSelectedPlaylistBtn.textContent = 'Add Track';
        addToSelectedPlaylistBtn.disabled = true;
        addToSelectedPlaylistBtn.onclick = function() {
            const playlistId = this.dataset.playlistId;
            if (playlistId) {
                addTrackToPlaylist(playlistId);
            }
        };
        
        // Assemble the modal
        modalBody.appendChild(playlistModalMessage);
        modalBody.appendChild(playlistModalLoading);
        modalBody.appendChild(playlistList);
        modalBody.appendChild(addToSelectedPlaylistBtn);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(modalBody);
        
        playlistModal.appendChild(modalContent);
        
        // Add modal to body
        document.body.appendChild(playlistModal);
        
        // Add close functionality
        const closeBtn = modalHeader.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = function() {
                playlistModal.style.display = 'none';
            };
        }
        
        // Close when clicking outside the modal
        window.onclick = function(event) {
            if (event.target === playlistModal) {
                playlistModal.style.display = 'none';
            }
        };
        
        console.log('Playlist modal elements created successfully');
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

// Function to add current track to selected playlist - fixed to use proper user token
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

// Added helper function to show playlist modal messages
function showPlaylistModalMessage(type, message) {
    const messageElement = document.getElementById('playlist-modal-message');
    if (!messageElement) return;
    
    messageElement.textContent = message;
    messageElement.className = '';
    messageElement.classList.add(`${type}-message`);
    messageElement.classList.remove('hidden');
}

// Helper function to display playlists in the modal
function displayPlaylistsInModal(playlists) {
    // Try to find playlist list element again - it might be a ul or div depending on which page we're on
    const playlistList = document.getElementById('playlist-list');
    const addToSelectedPlaylistBtn = document.getElementById('add-to-selected-playlist');
    
    if (!playlistList) {
        console.error('playlistList element not found in the DOM');
        return;
    }
    
    if (!addToSelectedPlaylistBtn) {
        console.error('addToSelectedPlaylistBtn element not found in the DOM');
        return;
    }
    
    // Clear playlist list regardless of what element type it is
    playlistList.innerHTML = '';
    
    playlists.forEach(playlist => {
        // Create item based on parent element type (ul → li, div → div)
        const isListElement = playlistList.tagName.toLowerCase() === 'ul';
        const item = document.createElement(isListElement ? 'li' : 'div');
        item.className = 'playlist-item';
        item.dataset.id = playlist.id;
        item.dataset.playlistId = playlist.id; // Add both formats for compatibility
        
        // Create image
        const imageUrl = playlist.images && playlist.images.length > 0 
            ? playlist.images[0].url 
            : 'https://via.placeholder.com/40?text=V'; // Use placeholder instead of fixed path
            
        // Either use innerHTML for simple structure or create elements
        item.innerHTML = `
            <img src="${imageUrl}" alt="${playlist.name}" class="playlist-thumbnail">
            <span class="playlist-name">${playlist.name}</span>
        `;
        
        // Add click handler to select playlist
        item.addEventListener('click', () => {
            // Remove selection from all items
            document.querySelectorAll('.playlist-item').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selection to clicked item
            item.classList.add('selected');
            
            // Enable Add button
            addToSelectedPlaylistBtn.disabled = false;
            
            // Store selected playlist ID
            addToSelectedPlaylistBtn.dataset.playlistId = playlist.id;
        });
        
        playlistList.appendChild(item);
    });
}

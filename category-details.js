// Vybe API credentials
const CLIENT_ID = '8dd545fb3d3f4a2a9cc2b5be29185cb6';
const CLIENT_SECRET = '6fa150638ba24eee8b3aa30906180628';

// Function to get an access token
async function getAccessToken() {
    try {
        // Check if we have a cached token that's still valid
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
            throw new Error('Failed to get access token');
        }

        const data = await response.json();
        
        // Cache the token (expires in 1 hour = 3600 seconds)
        sessionStorage.setItem('vybe_token', data.access_token);
        sessionStorage.setItem('vybe_token_expiry', (Date.now() + (data.expires_in * 1000)).toString());
        
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        return null; // Return null instead of showing error directly
    }
}

// Function to fetch playlists for a category
async function fetchPlaylists() {
    try {
        // Check cache first
        const cacheKey = `vybe_playlists_${categoryId}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        const cacheTimestamp = sessionStorage.getItem(`${cacheKey}_timestamp`);
        
        // Cache is valid for 1 hour
        if (cachedData && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 3600000) {
            return JSON.parse(cachedData);
        }
        
        const token = await getAccessToken();
        
        if (!token) {
            console.warn('Authentication failed, using fallback playlists');
            return FALLBACK_PLAYLISTS;
        }
        
        const response = await fetch(`https://api.spotify.com/v1/browse/categories/${categoryId}/playlists?limit=30`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            // If the category doesn't exist, try searching by name instead
            if (response.status === 404 && categoryName) {
                console.log(`Category ${categoryId} not found, trying search by name: ${categoryName}`);
                const searchResults = await searchPlaylistsByCategory(token, categoryName);
                
                if (searchResults && searchResults.length > 0) {
                    console.log(`Found ${searchResults.length} playlists by searching for "${categoryName}"`);
                    return searchResults;
                }
            }
            
            console.warn('Failed to fetch playlists, using fallback data');
            return FALLBACK_PLAYLISTS;
        }
        
        const data = await response.json();
        
        if (!data.playlists || !data.playlists.items || data.playlists.items.length === 0) {
            console.warn('No playlists found, using fallback data');
            const searchResults = await searchPlaylistsByCategory(token, categoryName);
            if (searchResults && searchResults.length > 0) {
                return searchResults;
            }
            return FALLBACK_PLAYLISTS;
        }
        
        // Cache the results
        sessionStorage.setItem(cacheKey, JSON.stringify(data.playlists.items));
        sessionStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
        
        return data.playlists.items;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        return FALLBACK_PLAYLISTS; // Return fallback data instead of showing error
    }
}

// Function to fetch artists for a category
async function fetchArtists() {
    try {
        // Since Spotify API doesn't have a direct endpoint for category artists,
        // we'll get artists from the playlists in the category
        const playlists = await fetchPlaylists();
        if (!playlists || playlists.length === 0) return [];
        
        // Get a sample playlist to extract artists
        const token = await getAccessToken();
        if (!token) return [];
        
        // Get tracks from the first playlist
        const playlistId = playlists[0].id;
        const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        // Extract unique artists
        const artistsMap = new Map();
        data.items.forEach(item => {
            if (item.track && item.track.artists) {
                item.track.artists.forEach(artist => {
                    if (!artistsMap.has(artist.id)) {
                        artistsMap.set(artist.id, artist);
                    }
                });
            }
        });
        
        return Array.from(artistsMap.values());
    } catch (error) {
        console.error('Error fetching artists:', error);
        return [];
    }
}

// Set the appropriate background image based on category
function setBackgroundImage(categoryName) {
    const backgroundElement = document.getElementById('category-background');
    if (!backgroundElement) return;
    
    const lowerName = categoryName.toLowerCase();
    
    // Map of category names to background images (expanded)
    const backgroundMap = {
        'pop': 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'hip hop': 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'rap': 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'rock': 'https://images.unsplash.com/photo-1603363615752-693b4e0a4ce8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'electronic': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'jazz': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'r&b': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'indie': 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'chill': 'https://images.unsplash.com/photo-1520262454473-a1a82276a574?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'mood': 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'workout': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'focus': 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'party': 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'sleep': 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'classical': 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'latin': 'https://images.unsplash.com/photo-1551641506-ee5bf4cb45f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'metal': 'https://images.unsplash.com/photo-1508252592163-5d3c3c559f36?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'blues': 'https://images.unsplash.com/photo-1485579149621-3123dd979885?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'punk': 'https://images.unsplash.com/photo-1518972559570-7cc05ee638dc?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'soul': 'https://images.unsplash.com/photo-1605722243979-fe0be8158232?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'reggae': 'https://images.unsplash.com/photo-1533038590840-1f130a868a7e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'folk': 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80',
        'country': 'https://images.unsplash.com/photo-1605275239299-88cbe54ae0af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80'
    };
    
    // Default background
    let bgImage = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    
    // Check for any matching category
    for (const [key, url] of Object.entries(backgroundMap)) {
        if (lowerName.includes(key)) {
            bgImage = url;
            break;
        }
    }
    
    // Set a temporary background while loading
    backgroundElement.style.opacity = '0.2';
    
    // Preload image
    const img = new Image();
    img.onload = function() {
        backgroundElement.src = bgImage;
        backgroundElement.style.opacity = '1';
        backgroundElement.classList.add('loaded');
    };
    img.onerror = function() {
        // Fallback to default image if loading fails
        backgroundElement.src = 'https://images.unsplash.com/photo-1571330735066-03aaa9429d89?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
        backgroundElement.style.opacity = '1';
        backgroundElement.classList.add('loaded');
    };
    img.src = bgImage;
}

// Display playlists with smooth loading
function displayPlaylists(playlists) {
    loadingElement.style.display = 'none';
    
    if (!playlists || playlists.length === 0) {
        showError('No playlists available for this category');
        return;
    }
    
    // Update playlist count
    playlistCountElement.textContent = playlists.length;
    
    // Clear container first
    playlistsContainer.innerHTML = '';
    
    // Display each playlist with staggered animations
    playlists.forEach((playlist, index) => {
        const playlistCard = document.createElement('div');
        playlistCard.className = 'playlist-card';
        
        let imageUrl = 'https://via.placeholder.com/150';
        
        if (playlist.images && playlist.images.length > 0) {
            imageUrl = playlist.images[0].url;
        }
        
        playlistCard.innerHTML = `
            <img class="playlist-image" src="${imageUrl}" alt="${playlist.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/150?text=${encodeURIComponent(playlist.name.charAt(0))}'; this.classList.add('fallback-image');">
            <div class="playlist-content">
                <h3 class="playlist-title">${playlist.name}</h3>
                <p class="playlist-info">
                    <i class="fas fa-music"></i>
                    <span>${playlist.tracks.total} tracks</span>
                </p>
            </div>
        `;
        
        // Add click event to open playlist
        playlistCard.addEventListener('click', () => {
            window.open(playlist.external_urls.spotify, '_blank');
        });
        
        // Add staggered animation
        setTimeout(() => {
            playlistCard.classList.add('visible');
        }, index * 50);
        
        playlistsContainer.appendChild(playlistCard);
    });
}

// Display artists
function displayArtists(artists) {
    if (!artists || artists.length === 0) return;
    
    const artistsContainer = document.getElementById('artists-container');
    if (!artistsContainer) return;
    
    // Clear previous artists
    artistsContainer.innerHTML = '';
    
    // Display up to 10 artists
    const displayedArtists = artists.slice(0, 10);
    
    displayedArtists.forEach((artist, index) => {
        const artistItem = document.createElement('div');
        artistItem.className = 'artist-item';
        
        let imageUrl = 'https://via.placeholder.com/120?text=' + artist.name.charAt(0);
        
        if (artist.images && artist.images.length > 0) {
            imageUrl = artist.images[0].url;
        }
        
        artistItem.innerHTML = `
            <div class="artist-image-container">
                <img class="artist-image" src="${imageUrl}" alt="${artist.name}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/120?text=${encodeURIComponent(artist.name.charAt(0))}'; this.classList.add('fallback-image');">
            </div>
            <h3 class="artist-name">${artist.name}</h3>
        `;
        
        // Add click event to open artist
        artistItem.addEventListener('click', () => {
            if (artist.external_urls && artist.external_urls.spotify) {
                window.open(artist.external_urls.spotify, '_blank');
            }
        });
        
        artistsContainer.appendChild(artistItem);
    });
}

// Show error message
function showError(message) {
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    const errorElement = document.createElement('div');
    errorElement.className = 'loading';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle" style="font-size: 2rem; color: var(--neon-pink);"></i>
        <p class="loading-text">${message}</p>
        <button class="btn btn-outline" onclick="init()">Try Again</button>
    `;
    
    if (playlistsContainer) {
        playlistsContainer.parentNode.insertBefore(errorElement, playlistsContainer);
    }
}

// Initialize the page
async function init() {
    // Initialize DOM elements
    categoryTitleElement = document.getElementById('category-title');
    loadingElement = document.getElementById('loading');
    playlistsContainer = document.getElementById('playlists-container');
    playlistCountElement = document.getElementById('playlist-count');
    artistsContainer = document.getElementById('artists-container');
    
    // Set page title and category name
    if (categoryName) {
        document.title = `${categoryName} - Vybe`;
        if (categoryTitleElement) {
            categoryTitleElement.textContent = categoryName;
        }
        setBackgroundImage(categoryName);
    }
    
    try {
        // Clear previous error messages
        const previousErrors = document.querySelectorAll('.loading');
        previousErrors.forEach(error => {
            if (error !== loadingElement) {
                error.remove();
            }
        });
        
        // Show loading spinner
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
        if (playlistsContainer) {
            playlistsContainer.innerHTML = '';
        }
        
        // Fetch and display playlists
        const playlists = await fetchPlaylists();
        displayPlaylists(playlists);
        
        // Fetch and display artists
        const artists = await fetchArtists();
        displayArtists(artists);
    } catch (error) {
        console.error('Error initializing page:', error);
        showError('Something went wrong. Please try again later.');
    }
}

// Add event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    
    // Add view options functionality
    const viewOptions = document.querySelectorAll('.view-option');
    viewOptions.forEach(option => {
        option.addEventListener('click', () => {
            viewOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            
            // Toggle grid/list view
            if (option.querySelector('.fa-list')) {
                playlistsContainer.classList.add('list-view');
                playlistsContainer.classList.remove('grid-view');
            } else {
                playlistsContainer.classList.add('grid-view');
                playlistsContainer.classList.remove('list-view');
            }
        });
    });
});

// Handle back/forward navigation
window.addEventListener('pageshow', event => {
    if (event.persisted) {
        init();
    }
});

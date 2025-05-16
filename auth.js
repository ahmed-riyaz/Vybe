// auth.js - Simplified Spotify Authentication Helper

const CLIENT_ID = '8dd545fb3d3f4a2a9cc2b5be29185cb6'; // Your Spotify Client ID
// IMPORTANT: In a real app, use Authorization Code Flow with PKCE and a backend proxy.
// This Implicit Grant Flow example exposes the token in the URL fragment.

// Use the exact redirect URI that you've registered in your Spotify Developer Dashboard
const REDIRECT_URI = 'http://127.0.0.1:3000/Vybe/callback.html';

const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SCOPES = [
    'playlist-read-private',    // Read user's private playlists
    'playlist-modify-public',   // Create/modify user's public playlists
    'playlist-modify-private',  // Create/modify user's private playlists
    'user-read-private'         // Read user profile info (needed for user ID)
];

const TOKEN_KEY = 'vybe_user_access_token';
const TOKEN_EXPIRY_KEY = 'vybe_user_token_expiry';
const USER_ID_KEY = 'vybe_user_id';

/**
 * Redirects the user to Spotify's login page.
 */
function redirectToSpotifyLogin() {
    // Update scopes to include playlist-modify-private and playlist-modify-public
    const scopes = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public';
    
    // Ensure this exactly matches a registered Redirect URI in Spotify Developer Dashboard
    const redirectUri = encodeURIComponent(window.location.origin + '/Vybe/my-playlists.html'); 
    
    const clientId = CLIENT_ID;
    
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scopes)}&show_dialog=true`;
    
    window.location.href = spotifyAuthUrl;
}

/**
 * Checks if there's a valid access token stored.
 * @returns {string|null} The access token or null if expired/not found.
 */
function getAccessToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    if (token && expiry && Date.now() < parseInt(expiry)) {
        return token;
    }
    // Token expired or not found, clear potentially stale data
    logout();
    return null;
}

/**
 * Parses the access token from the URL fragment (used in callback).
 * @returns {boolean} True if a token was successfully parsed and stored, false otherwise.
 */
function handleAuthCallback() {
    const hashParams = {};
    let e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while ( e = r.exec(q)) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
    }

    // Optional: Verify state parameter here if you used one
    // const storedState = localStorage.getItem('spotify_auth_state');
    // if (!hashParams.state || hashParams.state !== storedState) {
    //     console.error('State mismatch during auth callback.');
    //     localStorage.removeItem('spotify_auth_state');
    //     return false;
    // }
    // localStorage.removeItem('spotify_auth_state');

    if (hashParams.access_token && hashParams.expires_in) {
        const accessToken = hashParams.access_token;
        const expiresIn = parseInt(hashParams.expires_in);
        const expiryTime = Date.now() + expiresIn * 1000;

        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

        // Clear the hash from the URL
        window.location.hash = '';
        return true;
    } else if (hashParams.error) {
        console.error('Spotify Auth Error:', hashParams.error);
    }
    return false;
}

/**
 * Fetches the current user's Spotify ID.
 * Stores it in localStorage if successful.
 * @returns {Promise<string|null>} User ID or null on failure.
 */
async function fetchAndStoreUserId() {
    const token = getAccessToken();
    if (!token) return null;

    // Check if already stored
    const storedUserId = localStorage.getItem(USER_ID_KEY);
    if (storedUserId) return storedUserId;

    try {
        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                // Token might be invalid/expired
                logout();
            }
            throw new Error(`Failed to fetch user profile: ${response.status}`);
        }
        const data = await response.json();
        localStorage.setItem(USER_ID_KEY, data.id);
        return data.id;
    } catch (error) {
        console.error('Error fetching user ID:', error);
        return null;
    }
}

/**
 * Gets the stored User ID.
 * @returns {string|null} User ID or null if not found.
 */
function getUserId() {
    return localStorage.getItem(USER_ID_KEY);
}

/**
 * Clears authentication data.
 */
function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY_KEY);
    localStorage.removeItem(USER_ID_KEY);
    localStorage.removeItem('spotify_auth_state'); // Clear state if used
    // Optionally redirect to a logged-out page or home
    // window.location.href = 'index.html';
}

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
function generateRandomString(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

// Export functions needed by other modules (if using modules, otherwise they are global)
// export { redirectToSpotifyLogin, getAccessToken, handleAuthCallback, fetchAndStoreUserId, getUserId, logout };

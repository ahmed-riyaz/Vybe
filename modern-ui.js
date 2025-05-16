// modern-ui.js - New modern interface functionality for Vybe

document.addEventListener('DOMContentLoaded', () => {
  // Initialize the modern UI components
  initHeader();
  initMobileMenu();
  initAnimations();
});

// Handle header scroll effect
function initHeader() {
  const header = document.querySelector('.vybe-header');
  
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    });
  }
}

// Handle mobile menu toggle
function initMobileMenu() {
  const mobileToggle = document.querySelector('.vybe-mobile-toggle');
  const nav = document.querySelector('.vybe-nav');
  
  if (mobileToggle && nav) {
    mobileToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
      
      // Toggle between menu and close icons
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        if (icon.classList.contains('fa-bars')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-times');
        } else {
          icon.classList.remove('fa-times');
          icon.classList.add('fa-bars');
        }
      }
    });
  }
}

// Initialize animations for modern UI elements
function initAnimations() {
  // Reveal animations on scroll
  const revealElements = document.querySelectorAll('.vybe-reveal');
  
  if (revealElements.length > 0) {
    const revealOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, revealOptions);
    
    revealElements.forEach(el => {
      revealObserver.observe(el);
      // Add initial state class
      el.classList.add('vybe-reveal-initial');
    });
  }
  
  // Hover effects for cards
  const cards = document.querySelectorAll('.vybe-card');
  if (cards.length > 0) {
    cards.forEach(card => {
      card.addEventListener('mouseenter', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        card.style.setProperty('--x-pos', `${x}px`);
        card.style.setProperty('--y-pos', `${y}px`);
        card.classList.add('hovered');
      });
      
      card.addEventListener('mouseleave', () => {
        card.classList.remove('hovered');
      });
    });
  }
}

// Handle user authentication UI updates
function updateUserUI(user) {
  const userButtons = document.querySelectorAll('.vybe-user-button');
  
  userButtons.forEach(button => {
    if (user) {
      // User is logged in
      const userImg = button.querySelector('img') || document.createElement('img');
      const userNameElement = button.querySelector('.user-name') || document.createElement('span');
      
      // Set user profile image if available, otherwise use default
      userImg.src = user.images && user.images.length > 0 ? 
        user.images[0].url : 
        'https://i.pravatar.cc/100?img=32'; // Fallback avatar
      
      userImg.alt = user.display_name || 'User profile';
      userNameElement.textContent = user.display_name || 'My Account';
      userNameElement.classList.add('user-name');
      
      // Make sure elements are in button
      if (!button.contains(userImg)) button.prepend(userImg);
      if (!button.contains(userNameElement)) button.appendChild(userNameElement);
      
      // Update button action to go to account page
      button.onclick = () => {
        window.location.href = 'my-playlists.html';
      };
    } else {
      // User is not logged in
      button.innerHTML = '<i class="fas fa-user"></i> Login';
      
      // Update button action to trigger login
      button.onclick = () => {
        // Call your login function
        if (typeof redirectToSpotifyLogin === 'function') {
          redirectToSpotifyLogin();
        }
      };
    }
  });
}

// Function to create common layout elements for all pages
function createPageLayout() {
  // Create header
  const header = document.createElement('header');
  header.className = 'vybe-header';
  header.innerHTML = `
    <div class="vybe-container">
      <div class="vybe-header-inner">
        <a href="index.html" class="vybe-logo">vybe</a>
        <nav class="vybe-nav">
          <a href="index.html" class="vybe-nav-link">Home</a>
          <a href="search.html" class="vybe-nav-link">Search</a>
          <a href="playlist-details.html?id=37i9dQZF1DXcBWIGoYBM5M&name=Today's%20Top%20Hits" class="vybe-nav-link">Trending</a>
          <a href="my-playlists.html" class="vybe-nav-link">My Playlists</a>
        </nav>
        <div class="vybe-user-menu">
          <button class="vybe-user-button">
            <i class="fas fa-user"></i> Login
          </button>
        </div>
        <button class="vybe-mobile-toggle">
          <i class="fas fa-bars"></i>
        </button>
      </div>
    </div>
  `;
  
  // Create footer
  const footer = document.createElement('footer');
  footer.className = 'vybe-footer';
  footer.innerHTML = `
    <div class="vybe-container">
      <div class="vybe-footer-content">
        <div class="vybe-footer-column">
          <h3>vybe</h3>
          <p>Your ultimate music experience. Discover curated playlists that match your energy, aesthetic, and mood.</p>
        </div>
        <div class="vybe-footer-column">
          <h3>Explore</h3>
          <ul class="vybe-footer-links">
            <li class="vybe-footer-link"><a href="index.html">Home</a></li>
            <li class="vybe-footer-link"><a href="search.html">Search</a></li>
            <li class="vybe-footer-link"><a href="my-playlists.html">My Playlists</a></li>
          </ul>
        </div>
        <div class="vybe-footer-column">
          <h3>Legal</h3>
          <ul class="vybe-footer-links">
            <li class="vybe-footer-link"><a href="#">Terms of Service</a></li>
            <li class="vybe-footer-link"><a href="#">Privacy Policy</a></li>
            <li class="vybe-footer-link"><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </div>
      <div class="vybe-footer-bottom">
        <div class="vybe-footer-copyright">
          © ${new Date().getFullYear()} vybe. All rights reserved.
        </div>
        <div class="vybe-footer-social">
          <a href="#" class="vybe-social-link"><i class="fab fa-instagram"></i></a>
          <a href="#" class="vybe-social-link"><i class="fab fa-twitter"></i></a>
          <a href="#" class="vybe-social-link"><i class="fab fa-github"></i></a>
        </div>
      </div>
    </div>
  `;
  
  // Add to document
  document.body.prepend(header);
  document.body.appendChild(footer);
  
  // Mark current page in navigation
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.vybe-nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href').split('?')[0]; // Remove query params
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
  
  // Check if user is logged in and update UI
  if (typeof getAccessToken === 'function' && typeof fetchCurrentUser === 'function') {
    const token = getAccessToken();
    if (token) {
      fetchCurrentUser(token).then(user => {
        if (user) {
          updateUserUI(user);
        }
      }).catch(err => {
        console.error('Error fetching user data:', err);
      });
    }
  }
}

// Create a helper function to fetch user data
async function fetchCurrentUser(token) {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Vybe API credentials - updated April 2025
const CLIENT_ID = '8dd545fb3d3f4a2a9cc2b5be29185cb6';
const CLIENT_SECRET = '6fa150638ba24eee8b3aa30906180628';

// Fallback data in case API fails
const FALLBACK_CATEGORIES = [
  { id: 'pop', name: 'Pop', icons: [{ url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }] },
  { id: 'hiphop', name: 'Hip Hop', icons: [{ url: 'https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }] },
  { id: 'rock', name: 'Rock', icons: [{ url: 'https://images.unsplash.com/photo-1603363615752-693b4e0a4ce8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }] },
  { id: 'electronic', name: 'Electronic', icons: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }] },
  { id: 'chill', name: 'Chill Vibes', icons: [{ url: 'https://images.unsplash.com/photo-1520262454473-a1a82276a574?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }] },
  { id: 'workout', name: 'Workout Energy', icons: [{ url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80' }] }
];

// DOM elements
const loadingElement = document.getElementById('loading');
const categoriesContainer = document.getElementById('categories-container');

// Function to get an access token
async function getAccessToken() {
    try {
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
        return data.access_token;
    } catch (error) {
        console.error('Error getting access token:', error);
        showError('Failed to authenticate with the music API');
    }
}

// Function to fetch categories
async function fetchCategories() {
    try {
        // Get access token first
        const token = await getAccessToken();
        
        if (!token) {
            console.warn("No access token available, using fallback data");
            return FALLBACK_CATEGORIES;
        }
        
        // Fetch more categories (increased limit to 50 for more variety)
        const response = await fetch('https://api.spotify.com/v1/browse/categories?country=US&limit=50', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.warn(`API returned ${response.status}, using fallback data`);
            return FALLBACK_CATEGORIES;
        }

        const data = await response.json();
        return data.categories.items;
    } catch (error) {
        console.error('Error fetching categories:', error);
        showError('Failed to load categories. Please try again later.');
    }
}

// Helper function to get Gen Z relatable image for the category
function getGenZImageForCategory(name) {
    const lowerName = name.toLowerCase();
    // Using more abstract/stylized images for a different aesthetic
    const imageMap = {
        'pop': 'https://images.unsplash.com/photo-1576761418469-8a76a1b0d768?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Abstract color burst
        'hip hop': 'https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Neon light trails
        'rap': 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Fluid gradient shapes
        'rock': 'https://images.unsplash.com/photo-1557989069-8d4eaa6db8a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Textured dark background
        'electronic': 'https://images.unsplash.com/photo-1506157786151-b8491531f063?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Soundwave visualization
        'jazz': 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Moody saxophone silhouette
        'r&b': 'https://images.unsplash.com/photo-1587183100709-3e1a03e1f7a9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Soft focus lights
        'indie': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Dreamy beach landscape
        'mood': 'https://images.unsplash.com/photo-1534790566855-4cb788d389ec?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Abstract water ripples
        'chill': 'https://images.unsplash.com/photo-1497250681960-ef046c08a56e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Minimalist plant aesthetic
        'workout': 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Energetic motion blur
        'focus': 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Clean desk setup, top view
        'party': 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Confetti/lights bokeh
        'sleep': 'https://images.unsplash.com/photo-1472552944129-b035e9ea3744?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Starry night sky
        'classical': 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Piano or orchestra
        'metal': 'https://images.unsplash.com/photo-1508252592163-5d3c3c559f36?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Dark moody stage
        'punk': 'https://images.unsplash.com/photo-1508252592163-5d3c3c559f36?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Grungy aesthetic
        'soul': 'https://images.unsplash.com/photo-1605722243979-fe0be8158232?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Warm tones
        'blues': 'https://images.unsplash.com/photo-1485579149621-3123dd979885?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Blue tones
        'country': 'https://images.unsplash.com/photo-1533776992670-a72f3d52f1e9?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Scenic landscape
        'latin': 'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Vibrant colors
        'folk': 'https://images.unsplash.com/photo-1534692499281-57d0f102fd03?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Rustic aesthetic
        'alternative': 'https://images.unsplash.com/photo-1504704911898-68304a7d2807?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Abstract art
        'edm': 'https://images.unsplash.com/photo-1578736641330-3155e606cd40?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Neon lights
        'gaming': 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Gaming setup
        'romance': 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80', // Soft romantic scene
    };

    // Find a matching key
    for (const key in imageMap) {
        if (lowerName.includes(key)) {
            return imageMap[key];
        }
    }

    // Default abstract image
    return 'https://images.unsplash.com/photo-1536904171932-9eacb8454753?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';
}

// Helper function to get emoji for category
function getEmojiForCategory(name) {
    const lowerName = name.toLowerCase();
    
    if (lowerName.includes('pop')) return '🎵';
    if (lowerName.includes('hip hop') || lowerName.includes('rap')) return '🎤';
    if (lowerName.includes('rock')) return '🤘';
    if (lowerName.includes('electronic')) return '💿';
    if (lowerName.includes('jazz')) return '🎷';
    if (lowerName.includes('r&b')) return '🎹';
    if (lowerName.includes('indie')) return '🎸';
    if (lowerName.includes('chill')) return '🌊';
    if (lowerName.includes('mood')) return '✨';
    if (lowerName.includes('workout')) return '💪';
    if (lowerName.includes('focus')) return '🧠';
    if (lowerName.includes('party')) return '🎉';
    if (lowerName.includes('sleep')) return '💤';
    
    // Default emoji
    return '🎧';
}

// Helper function to get random animation
function getRandomAnimation() {
    const animations = ['fade-up', 'fade-down', 'fade-left', 'fade-right', 'zoom-in'];
    return animations[Math.floor(Math.random() * animations.length)];
}

// Helper function to get Gen Z content for each category
function getGenZContentForCategory(name) {
    const lowerName = name.toLowerCase();
    
    // Default content
    let content = {
        tag: 'trending now',
        description: 'Discover curated playlists that match your vibe',
        vibe: 'main character energy'
    };
    
    if (lowerName.includes('pop')) {
        content = {
            tag: 'the moment',
            description: 'bops that live in your head rent-free',
            vibe: 'main character energy'
        };
    } else if (lowerName.includes('rock')) {
        content = {
            tag: 'core memory',
            description: 'iconic tracks for when you need to feel something',
            vibe: 'nostalgic feels'
        };
    } else if (lowerName.includes('hip hop') || lowerName.includes('rap')) {
        content = {
            tag: 'straight fire',
            description: 'tracks that hit different when you\'re in your feels',
            vibe: 'certified banger'
        };
    } else if (lowerName.includes('electronic')) {
        content = {
            tag: 'immaculate vibes',
            description: 'sounds that make the serotonin go brrr',
            vibe: 'absolute bops'
        };
    } else if (lowerName.includes('jazz')) {
        content = {
            tag: 'elite taste',
            description: 'for your sophisticated era',
            vibe: 'old money aesthetic'
        };
    } else if (lowerName.includes('r&b')) {
        content = {
            tag: 'unmatched feels',
            description: 'when you\'re in your feelings at 2am',
            vibe: 'emotional damage'
        };
    } else if (lowerName.includes('chill')) {
        content = {
            tag: 'chef\'s kiss',
            description: 'the perfect soundtrack for your soft era',
            vibe: 'immaculate vibes'
        };
    } else if (lowerName.includes('indie')) {
        content = {
            tag: 'underground vibe',
            description: 'hidden gems for your playlist',
            vibe: 'aesthetic life'
        };
    } else if (lowerName.includes('mood')) {
        content = {
            tag: 'big mood',
            description: 'tracks that match your energy',
            vibe: 'all the feels'
        };
    } else if (lowerName.includes('workout')) {
        content = {
            tag: 'gains season',
            description: 'glow up anthems for your gym era',
            vibe: 'go beast mode'
        };
    } else if (lowerName.includes('sleep')) {
        content = {
            tag: 'sleep era',
            description: 'dreamscape sounds for the perfect slumber',
            vibe: 'cozy vibes only'
        };
    }
    
    return content;
}

// Function to display categories with improved error handling
function displayCategories(categories) {
    // Hide loading message
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // Check if we have categories to display
    if (!categories || categories.length === 0) {
        showError('No categories available');
        return;
    }
    
    // Clear container first
    categoriesContainer.innerHTML = '';
    
    // Create HTML for each category with modern Gen Z content
    categories.forEach((category, index) => {
        const categoryCard = document.createElement('div');
        categoryCard.className = 'category-card';
        categoryCard.setAttribute('data-index', index);
        categoryCard.setAttribute('data-animation', getRandomAnimation());
        
        // Generate category tag based on name
        let emoji = getEmojiForCategory(category.name);
        
        // Get Gen Z relatable image for the category
        const imageUrl = category.icons && category.icons.length > 0 
            ? category.icons[0].url 
            : getGenZImageForCategory(category.name);
        
        // If preloader is available, queue this image
        if (window.imagePreloader) {
            window.imagePreloader.queueImage(imageUrl);
        }
        
        // Get Gen Z relatable content for each category
        const genZContent = getGenZContentForCategory(category.name);
        
        // Create the card with error handling for images
        categoryCard.innerHTML = `
            <div class="category-image-container">
                <img class="category-image" src="${imageUrl}" alt="${category.name}" 
                     onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1536904171932-9eacb8454753?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80';">
                <div class="category-overlay"></div>
            </div>
            <div class="category-content">
                <div class="category-emoji">${emoji}</div>
                <div class="category-tag">${genZContent.tag}</div>
                <h3 class="category-title">${category.name}</h3>
                <p class="category-text">${genZContent.description}</p>
                <div class="category-aesthetic">
                    <span>${genZContent.vibe}</span>
                </div>
            </div>
        `;

        // Add click event to navigate to category
        categoryCard.addEventListener('click', () => {
            navigateToCategory(category.id, category.name);
        });
        
        // Add to container
        categoriesContainer.appendChild(categoryCard);
        
        // Add class with delay for animation
        setTimeout(() => {
            categoryCard.classList.add('revealed');
        }, index * 50);
    });
}

// Helper function to navigate to category with error handling
function navigateToCategory(categoryId, categoryName) {
    if (!categoryId || !categoryName) {
        console.error('Missing category ID or name');
        return;
    }
    
    try {
        window.location.href = `category-details.html?id=${encodeURIComponent(categoryId)}&name=${encodeURIComponent(categoryName)}`;
    } catch (error) {
        console.error('Error navigating to category:', error);
        alert('Unable to navigate to this category. Please try again.');
    }
}

// Function to show error message
function showError(message) {
    loadingElement.style.display = 'none';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.innerHTML = `
        <i class="fas fa-exclamation-circle" style="margin-right: 10px;"></i>
        <span>${message}</span>
        <button class="btn" style="margin-left: 15px; padding: 5px 10px;" onclick="init()">Try Again</button>
    `;
    
    if (categoriesContainer) {
        categoriesContainer.innerHTML = '';
        categoriesContainer.appendChild(errorElement);
    }
}

// Initialize the page with better caching and error handling
async function init() {
    try {
        // Clear previous error messages if any
        const previousErrors = document.querySelectorAll('.error-message');
        previousErrors.forEach(error => error.remove());
        
        // Show loading element
        if (loadingElement) {
            loadingElement.style.display = 'flex';
        }
        
        // Check if categories container exists
        if (!categoriesContainer) {
            console.error('Categories container not found');
            document.body.innerHTML += '<div class="container" style="padding: 2rem; text-align: center;"><h2>Error: Could not find categories container</h2><p>Please refresh the page or contact support.</p></div>';
            return;
        }
        
        // Check if we have cached categories
        const cachedCategories = sessionStorage.getItem('vybe_categories');
        const cacheTimestamp = sessionStorage.getItem('vybe_categories_timestamp');
        
        // Cache is valid for 30 minutes (1800000 ms)
        if (cachedCategories && cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) < 1800000) {
            displayCategories(JSON.parse(cachedCategories));
        } else {
            // Fetch and display categories
            const categories = await fetchCategories();
            if (categories && categories.length > 0) {
                // Cache the results
                sessionStorage.setItem('vybe_categories', JSON.stringify(categories));
                sessionStorage.setItem('vybe_categories_timestamp', Date.now().toString());
                displayCategories(categories);
            } else {
                // Use fallback data if no categories are returned
                displayCategories(FALLBACK_CATEGORIES);
            }
        }    } catch (error) {
        console.error('Initialization error:', error);
        // Ensure we still show something even if everything fails
        if (categoriesContainer) {
            showError('Something went wrong. Displaying fallback categories.');
            displayCategories(FALLBACK_CATEGORIES);
        }
    }
}

// Function to initialize 3D tilt effect on cards
function init3DCardEffects() {
  const cards = document.querySelectorAll('.card-3d');
  
  cards.forEach(card => {
    // Variables for the effect
    const cardContent = card.querySelector('.card-3d-content');
    const strength = card.getAttribute('data-tilt-strength') || 20;
    const glareStrength = card.getAttribute('data-glare-strength') || 0.5;
    
    // Add event listeners for mouse movement
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    card.addEventListener('mouseenter', handleMouseEnter);
    
    function handleMouseMove(e) {
      const rect = card.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate mouse position relative to card center (-1 to 1)
      const relativeX = (e.clientX - centerX) / (rect.width / 2);
      const relativeY = (e.clientY - centerY) / (rect.height / 2);
      
      // Apply rotation based on mouse position
      card.style.transform = `perspective(1000px) rotateY(${relativeX * strength}deg) rotateX(${-relativeY * strength}deg)`;
      
      // Move content slightly for parallax effect
      if (cardContent) {
        cardContent.style.transform = `translateZ(30px) translateX(${relativeX * 10}px) translateY(${relativeY * 10}px)`;
      }
      
      // Apply dynamic glare effect
      const glare = card.querySelector('.card-glare');
      if (glare) {
        const glareX = (relativeX + 1) / 2 * 100; // Convert -1...1 to 0...100
        const glareY = (relativeY + 1) / 2 * 100;
        
        glare.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, ${glareStrength}), transparent 50%)`;
      }
    }
    
    function handleMouseLeave() {
      // Reset card position with transition
      card.style.transition = 'transform 0.5s var(--ease-out-cubic)';
      card.style.transform = 'perspective(1000px) rotateY(0) rotateX(0)';
      
      if (cardContent) {
        cardContent.style.transition = 'transform 0.5s var(--ease-out-cubic)';
        cardContent.style.transform = 'translateZ(0)';
      }
      
      // Reset glare
      const glare = card.querySelector('.card-glare');
      if (glare) {
        glare.style.opacity = '0';
      }
      
      // Remove transition after animation completes
      setTimeout(() => {
        card.style.transition = '';
        if (cardContent) cardContent.style.transition = '';
      }, 500);
    }
    
    function handleMouseEnter() {
      // Add glare element if it doesn't exist
      if (!card.querySelector('.card-glare') && card.getAttribute('data-glare') !== 'false') {
        const glare = document.createElement('div');
        glare.className = 'card-glare';
        glare.style.position = 'absolute';
        glare.style.top = '0';
        glare.style.left = '0';
        glare.style.width = '100%';
        glare.style.height = '100%';
        glare.style.pointerEvents = 'none';
        glare.style.zIndex = '1';
        glare.style.opacity = '0';
        glare.style.transition = 'opacity 0.3s ease';
        card.appendChild(glare);
        
        // Fade in glare
        setTimeout(() => {
          glare.style.opacity = '1';
        }, 50);
      }
    }
  });
}

// Function to apply magnetic effect to links
function initMagneticLinks() {
  const links = document.querySelectorAll('.magnetic-link');
  
  links.forEach(link => {
    const strength = link.getAttribute('data-magnetic-strength') || 0.3;
    
    link.addEventListener('mousemove', e => {
      const rect = link.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Calculate distance from mouse to center
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      
      // Apply magnetic effect
      link.style.transform = `translate(${distanceX * strength}px, ${distanceY * strength}px)`;
    });
    
    link.addEventListener('mouseleave', () => {
      // Reset position with animation
      link.style.transition = 'transform 0.5s var(--ease-out-cubic)';
      link.style.transform = '';
      
      // Remove transition after animation completes
      setTimeout(() => {
        link.style.transition = '';
      }, 500);
    });
  });
}

// Initialize all interactive elements
document.addEventListener('DOMContentLoaded', () => {
  // Initialize core functionality
  init(); // This directly calls our initialization function
  
  // Simple navigation scroll effect
  window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
      if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }
  }, { passive: true });
  
  console.log('Vybe initialized: Loading categories...');
});

// Enhanced scroll animations
function setupScrollAnimations() {
  // Parallax scrolling for background elements
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    
    // Animate section backgrounds with different speeds
    document.querySelectorAll('.parallax-bg').forEach(bg => {
      const speed = bg.getAttribute('data-speed') || 0.3;
      bg.style.transform = `translateY(${scrollY * speed}px)`;
    });
  });
  
  // Initialize section transitions with Intersection Observer
  const sections = document.querySelectorAll('section');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        
        // Apply staggered animation to children if needed
        const staggerItems = entry.target.querySelectorAll('[data-stagger]');
        staggerItems.forEach((item, index) => {
          item.style.transitionDelay = `${index * 0.1}s`;
          item.classList.add('stagger-visible');
        });
      }
    });
  }, { threshold: 0.15 });
  
  sections.forEach(section => {
    sectionObserver.observe(section);
  });
}

// Create music visualizer elements
function createMusicVisualizer(container) {
  const visualizer = document.createElement('div');
  visualizer.className = 'music-visualizer';
  
  // Create visualizer bars
  for (let i = 0; i < 8; i++) {
    const bar = document.createElement('div');
    bar.className = 'visualizer-bar';
    visualizer.appendChild(bar);
  }
  
  container.appendChild(visualizer);
}

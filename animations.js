/**
 * Vybe Animations - Enhanced with Advanced Parallax Effects
 * Optimized for Gen Z aesthetics and interactions
 */

// Initialize viewport dimensions for parallax effects
let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let mouseX = 0;
let mouseY = 0;

document.addEventListener('DOMContentLoaded', () => {
  // Update viewport dimensions on load
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
  
  initScrollTriggeredElements();
  initScrollAnimations();
  initHeaderAnimations();
  initParallaxEffects();
  initParallaxScenes();
  initFloatingElements();
  initParallaxQuotes();
  initCategoryRevealAnimations();
  initCursorTrailEffects();
  document.body.classList.add('page-loaded');
});

// Update viewport dimensions when window is resized
window.addEventListener('resize', () => {
  viewportWidth = window.innerWidth;
  viewportHeight = window.innerHeight;
});

// Optimized scroll-triggered elements with improved animations
function initScrollTriggeredElements() {
  // Use Intersection Observer for better performance
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add randomized animation delay for more organic feel
        const delay = Math.random() * 0.3;
        entry.target.style.animationDelay = `${delay}s`;
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target); // Stop observing once it's in view
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -8% 0px'
  });
  
  // Observe all elements with animation attributes
  document.querySelectorAll('[data-animation]').forEach(el => {
    observer.observe(el);
  });
}

// Enhanced parallax scrolling with 3D perspective and multi-axis movement
function initParallaxEffects() {
  const parallaxElements = document.querySelectorAll('.parallax');
  const parallaxImages = document.querySelectorAll('.parallax-image');
  const parallaxText = document.querySelectorAll('.parallax-text');
  const parallaxScenes = document.querySelectorAll('.parallax-scene');
  const parallaxQuotes = document.querySelectorAll('.parallax-quote');
  let ticking = false;
  
  if (!parallaxElements.length && !parallaxImages.length && !parallaxText.length && !parallaxScenes.length) return;
  
  function updateParallax() {
    const scrollY = window.scrollY;
    const viewportHeight = window.innerHeight;    // Mouse position for additional parallax effect
    let mouseX = 0;
    let mouseY = 0;
    
    // Apply mouse-based parallax when mouse moves
    function handleMouseMove(e) {
      mouseX = e.clientX / viewportWidth - 0.5;
      mouseY = e.clientY / viewportHeight - 0.5;
      
      // Apply mouse-based parallax to elements with data-mouse-parallax
      document.querySelectorAll('[data-mouse-parallax]').forEach(el => {
        const speed = el.getAttribute('data-mouse-parallax') || 20;
        const x = mouseX * speed;
        const y = mouseY * speed;
        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      });
    }
    
    // Only add the event listener once
    if (!window.mouseParallaxInitialized) {
      document.addEventListener('mousemove', handleMouseMove);
      window.mouseParallaxInitialized = true;
    }
    
    // Enhanced parallax effect with optimized transforms
    parallaxElements.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed') || 0.2);
      const rotation = el.getAttribute('data-rotate') === 'true';
      const scale = el.getAttribute('data-scale') === 'true';
      
      let transform = `translateY(${scrollY * speed}px)`;
      
      if (rotation) {
        // Add slight rotation for more dynamic effect
        const rotateAmount = (scrollY * speed * 0.05) % 360;
        transform += ` rotate(${rotateAmount}deg)`;
      }
      
      if (scale) {
        // Add subtle scaling for depth effect
        const scaleBase = 1.0;
        const scaleAmount = 1.0 + Math.sin(scrollY * 0.002) * 0.05;
        transform += ` scale(${scaleBase + (scaleAmount * Math.abs(speed))})`;
      }
      
      el.style.transform = transform;
    });
    
    // Advanced image parallax with 3D effects
    parallaxImages.forEach(el => {
      const rect = el.getBoundingClientRect();
      const elementCenterY = rect.top + rect.height / 2;
      const fromViewportCenter = (elementCenterY - viewportHeight / 2) / (viewportHeight / 2);
      
      const speed = parseFloat(el.getAttribute('data-speed') || 0.1);
      const depth = parseFloat(el.getAttribute('data-depth') || 1);
      const direction = el.getAttribute('data-direction') || 'vertical';
      
      // Calculate transform based on element position in viewport
      let transform = '';
      
      if (direction === 'horizontal' || direction === 'both') {
        transform += `translateX(${scrollY * speed * 0.5}px) `;
      }
      
      if (direction === 'vertical' || direction === 'both') {
        transform += `translateY(${scrollY * speed}px) `;
      }
      
      // Add subtle 3D rotation based on position
      transform += `rotateX(${fromViewportCenter * -5 * depth}deg) rotateY(${fromViewportCenter * 5 * depth}deg)`;
      
      el.style.transform = transform;
    });
    
    // Dynamic text parallax with color shifts
    parallaxText.forEach(el => {
      const speed = parseFloat(el.getAttribute('data-speed') || 0.2);
      const colorShift = el.getAttribute('data-color-shift') === 'true';
      
      el.style.transform = `translateY(${scrollY * speed}px)`;
      
      if (colorShift) {
        // Create dynamic color shifts based on scroll position
        const hue = (scrollY * 0.1) % 360;
        el.style.background = `linear-gradient(90deg, var(--purple-main), hsl(${hue}, 100%, 65%), var(--pink-hot))`;
        el.style.backgroundClip = 'text';
        el.style.webkitBackgroundClip = 'text';
      }
    });
    
    ticking = false;
  }
  
  // Optimize scroll events with requestAnimationFrame
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateParallax();
      ticking = false;
    });
  });
}

// New function to create parallax scenes with depth layers
function initParallaxScenes() {
  const scenes = document.querySelectorAll('.parallax-scene');
  
  scenes.forEach(scene => {
    // Create layers with different depths
    const layerCount = 5;
    for (let i = 0; i < layerCount; i++) {
      const depth = (i + 1) / layerCount;
      const layer = document.createElement('div');
      layer.className = 'parallax-layer';
      layer.style.setProperty('--depth', depth);
      
      // Add different elements based on layer depth
      if (i === 0) {
        // Background layer
        layer.classList.add('layer-bg');
        const gradientEl = document.createElement('div');
        gradientEl.className = 'layer-gradient';
        layer.appendChild(gradientEl);
      } else if (i === layerCount - 1) {
        // Foreground layer
        layer.classList.add('layer-fg');
        for (let j = 0; j < 3; j++) {
          const particle = document.createElement('div');
          particle.className = 'floating-particle';
          particle.style.left = `${Math.random() * 100}%`;
          particle.style.top = `${Math.random() * 100}%`;
          particle.style.animationDelay = `${Math.random() * 5}s`;
          layer.appendChild(particle);
        }
      } else {
        // Middle layers with different content
        layer.classList.add(`layer-${i}`);
        
        // Add different elements based on layer number
        if (i === 1) {
          const shapeCount = 3;
          for (let j = 0; j < shapeCount; j++) {
            const shape = document.createElement('div');
            shape.className = 'parallax-shape';
            shape.style.left = `${Math.random() * 100}%`;
            shape.style.top = `${Math.random() * 100}%`;
            shape.style.transform = `rotate(${Math.random() * 360}deg)`;
            layer.appendChild(shape);
          }
        } else if (i === 2) {
          const lineCount = 5;
          for (let j = 0; j < lineCount; j++) {
            const line = document.createElement('div');
            line.className = 'parallax-line';
            line.style.left = `${Math.random() * 100}%`;
            line.style.top = `${Math.random() * 100}%`;
            line.style.width = `${50 + Math.random() * 100}px`;
            line.style.transform = `rotate(${Math.random() * 360}deg)`;
            layer.appendChild(line);
          }
        } else {
          const dotCount = 8;
          for (let j = 0; j < dotCount; j++) {
            const dot = document.createElement('div');
            dot.className = 'parallax-dot';
            dot.style.left = `${Math.random() * 100}%`;
            dot.style.top = `${Math.random() * 100}%`;
            dot.style.opacity = 0.1 + Math.random() * 0.5;
            layer.appendChild(dot);
          }
        }
      }
      
      scene.appendChild(layer);
    }
  });
  
  // Add mouse movement handler for scenes
  document.addEventListener('mousemove', handleParallaxSceneMouseMove);
}

// Handle mouse movement for parallax scenes
function handleParallaxSceneMouseMove(e) {
  const scenes = document.querySelectorAll('.parallax-scene');
  
  scenes.forEach(scene => {
    const rect = scene.getBoundingClientRect();
    
    // Only apply effect if mouse is near the scene
    if (
      e.clientX >= rect.left - window.innerWidth / 2 &&
      e.clientX <= rect.right + window.innerWidth / 2 &&
      e.clientY >= rect.top - window.innerHeight / 2 &&
      e.clientY <= rect.bottom + window.innerHeight / 2
    ) {
      // Calculate mouse position relative to scene center
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const moveX = (e.clientX - centerX) / 20;
      const moveY = (e.clientY - centerY) / 20;
      
      // Apply transform to each layer based on depth
      const layers = scene.querySelectorAll('.parallax-layer');
      layers.forEach(layer => {
        const depth = parseFloat(layer.style.getPropertyValue('--depth')) || 0.5;
        const moveMultiplier = 1 - depth; // Invert so deeper layers move less
        layer.style.transform = `translate3d(${moveX * moveMultiplier}px, ${moveY * moveMultiplier}px, 0)`;
      });
    }
  });
}

// Initialize floating elements with randomized animations
function initFloatingElements() {
  const floatingElements = document.querySelectorAll('.floating-element');
  
  floatingElements.forEach(el => {
    // Apply random animation properties
    const animDuration = 15 + Math.random() * 20;
    const animDelay = Math.random() * 5;
    const moveX = 10 + Math.random() * 30;
    const moveY = 10 + Math.random() * 30;
    const rotation = Math.random() > 0.5 ? 15 : -15;
    
    el.style.setProperty('--float-duration', `${animDuration}s`);
    el.style.setProperty('--float-delay', `${animDelay}s`);
    el.style.setProperty('--float-x', `${moveX}px`);
    el.style.setProperty('--float-y', `${moveY}px`);
    el.style.setProperty('--float-rotation', `${rotation}deg`);
  });
}

// Initialize parallax quotes that reveal on scroll
function initParallaxQuotes() {
  const quotes = document.querySelectorAll('.parallax-quote');
  
  quotes.forEach((quote, index) => {
    // Set different starting positions
    quote.style.setProperty('--quote-index', index);
    
    // Create observer for quote
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            quote.classList.add('reveal');
            // Unobserve after revealing
            observer.unobserve(quote);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -10% 0px'
      }
    );
    
    observer.observe(quote);
  });
}

// Initialize cursor trail effects
function initCursorTrailEffects() {
  const body = document.body;
  let trailElements = [];
  const maxTrails = 10;
  const colors = [
    '#8E2DE2', '#FF3CAC', '#21D4FD', '#FFD166', '#39FF14'
  ];
  
  // Create initial trail elements
  for (let i = 0; i < maxTrails; i++) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.opacity = 0;
    body.appendChild(trail);
    trailElements.push(trail);
  }
  
  // Track last mouse position
  let lastX = 0;
  let lastY = 0;
  let currentTrailIndex = 0;
  
  // Handle mouse movement
  document.addEventListener('mousemove', (e) => {
    const mouseX = e.clientX;
    const mouseY = e.clientY;
    
    // Only create trails if mouse has moved significantly
    const distance = Math.hypot(mouseX - lastX, mouseY - lastY);
    if (distance > 20) {
      // Get next trail element
      const trail = trailElements[currentTrailIndex];
      
      // Reset animation
      trail.style.animation = 'none';
      trail.offsetHeight; // Trigger reflow
      
      // Set position and style
      trail.style.left = `${mouseX}px`;
      trail.style.top = `${mouseY}px`;
      trail.style.opacity = '0.8';
      trail.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      trail.style.animation = 'trailFadeOut 0.5s forwards';
      
      // Update index and position
      currentTrailIndex = (currentTrailIndex + 1) % maxTrails;
      lastX = mouseX;
      lastY = mouseY;
    }
  });
}

// Header animations
function initHeaderAnimations() {
  const header = document.querySelector('.navbar');
  if (!header) return;
  
  let lastScrollY = window.scrollY;
  let ticking = false;
  
  function updateHeaderClass() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    
    // Hide header on scroll down, show on scroll up
    if (window.scrollY > lastScrollY && window.scrollY > 300) {
      header.classList.add('navbar-hidden');
    } else {
      header.classList.remove('navbar-hidden');
    }
    
    lastScrollY = window.scrollY;
    ticking = false;
  }
  
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeaderClass);
      ticking = true;
    }
  });
}

// Category reveal animations
function initCategoryRevealAnimations() {
  const categories = document.querySelectorAll('.category-card');
  if (!categories.length) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        // Staggered reveal
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, index * 100);
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
  });
  
  categories.forEach(category => {
    observer.observe(category);
  });
}

// Hover effects (simplified)
function initHoverEffects() {
  const hoverElements = document.querySelectorAll('.hover-effect');
  
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      el.classList.add('hovered');
    });
    
    el.addEventListener('mouseleave', () => {
      el.classList.remove('hovered');
    });
  });
}

// Scroll animations with debounce
function initScrollAnimations() {
  let scrollTimeout;
  
  function onScroll() {
    document.body.classList.add('is-scrolling');
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 100);
  }
  
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Page transitions
document.addEventListener('click', e => {
  const link = e.target.closest('a[href]:not([target="_blank"])');
  if (!link || link.href === window.location.href) return;
  
  // Only intercept same-domain links
  if (new URL(link.href).origin !== window.location.origin) return;
  
  e.preventDefault();
  document.body.classList.add('page-transition-out');
  
  setTimeout(() => {
    window.location.href = link.href;
  }, 400);
});

// Handle back/forward navigation
window.addEventListener('pageshow', event => {
  if (event.persisted) {
    document.body.classList.remove('page-transition-out');
    document.body.classList.add('page-loaded');
  }
});

// Music visualizer animation for a more interactive audio experience
function initMusicVisualizer() {
  const visualizer = document.querySelector('.music-visualizer');
  if (!visualizer) return;
  
  const bars = visualizer.querySelectorAll('.visualizer-bar');
  if (!bars.length) return;
  
  // Simulate audio reactivity without actual audio analysis
  function animateBars() {
    bars.forEach(bar => {
      // Generate random height between 20% and 100%
      const height = 20 + (Math.random() * 80);
      bar.style.height = `${height}%`;
      
      // Add subtle color variation
      const hue = Math.floor(Math.random() * 30) + 280; // Purple range
      bar.style.background = `linear-gradient(to top, var(--purple-main), hsl(${hue}, 100%, 65%))`;
    });
    
    requestAnimationFrame(() => {
      setTimeout(animateBars, 100 + (Math.random() * 200)); // Random timing for organic feel
    });
  }
  
  animateBars();
}

// Add floating musical notes for visual interest
function initFloatingNotes() {
  const container = document.querySelector('.floating-notes');
  if (!container) return;
  
  const noteSymbols = ['♪', '♫', '♬', '♩', '♭', '♮', '♯'];
  const notesCount = 15;
  
  for (let i = 0; i < notesCount; i++) {
    const note = document.createElement('div');
    note.className = 'note';
    note.textContent = noteSymbols[Math.floor(Math.random() * noteSymbols.length)];
    
    // Random positioning
    note.style.left = `${Math.random() * 100}%`;
    
    // Random animation duration between 10-20s
    const duration = 10 + (Math.random() * 10);
    note.style.animation = `floatingNote ${duration}s linear infinite`;
    
    // Random start time
    note.style.animationDelay = `${Math.random() * 20}s`;
    
    // Random size
    note.style.fontSize = `${1 + Math.random() * 1.5}rem`;
    
    // Random color
    const colors = ['var(--pink-hot)', 'var(--purple-light)', 'var(--blue-electric)', 'var(--green-neon)'];
    note.style.color = colors[Math.floor(Math.random() * colors.length)];
    
    container.appendChild(note);
  }
}

// Text reveal animation with clip path for section headings
function initTextReveal() {
  const titles = document.querySelectorAll('.section-title, .hero-title');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.clipPath = 'polygon(0 0, 100% 0, 100% 100%, 0 100%)';
        entry.target.style.transform = 'translateY(0)';
        entry.target.style.opacity = '1';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  
  titles.forEach(title => {
    // Set initial state
    title.style.clipPath = 'polygon(0 0, 0 0, 0 100%, 0 100%)';
    title.style.transform = 'translateY(20px)';
    title.style.opacity = '0';
    title.style.transition = 'clip-path 0.8s var(--ease-out-expo), transform 0.8s var(--ease-out-expo), opacity 0.8s ease';
    
    observer.observe(title);
  });
}

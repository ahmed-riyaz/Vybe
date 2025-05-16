/**
 * Vybe Custom Cursor - Optimized
 * Lightweight cursor effects with performance in mind
 */

class VybeCursor {
  constructor() {
    this.cursorDot = document.querySelector('.cursor-dot');
    this.cursorOutline = document.querySelector('.cursor-outline');
    
    if (!this.cursorDot || !this.cursorOutline) return;
    
    this.mouseX = 0;
    this.mouseY = 0;
    this.outlineX = 0;
    this.outlineY = 0;
    
    this.isActive = false;
    this.isHovering = false;
    this.isMobile = window.innerWidth < 768;
    this.rafId = null;
    
    this.init();
  }
  
  init() {
    // Disable cursor effects on mobile for better performance
    if (this.isMobile) {
      this.cursorDot.style.display = 'none';
      this.cursorOutline.style.display = 'none';
      return;
    }
    
    this.setupEventListeners();
  }
    
  setupEventListeners() {
    // Optimize mousemove event with throttling
    let lastMoveTime = 0;
    const throttleAmount = 10; // ms between updates
    
    document.addEventListener('mousemove', (e) => {
      const now = performance.now();
      if (now - lastMoveTime < throttleAmount) return;
      lastMoveTime = now;
      
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    }, { passive: true });
    
    // Simple hover effects for interactive elements
    document.querySelectorAll('a, button, .btn, input, select, textarea').forEach(el => {
      el.addEventListener('mouseenter', () => this.setHoverState(true));
      el.addEventListener('mouseleave', () => this.setHoverState(false));
    });
    
    // Mouse down/up states
    document.addEventListener('mousedown', () => this.setCursorActive(true));
    document.addEventListener('mouseup', () => this.setCursorActive(false));
    
    // Start animation loop
    this.update();
  }
  
  setHoverState(isHovering) {
    this.isHovering = isHovering;
    
    if (isHovering) {
      this.cursorOutline.classList.add('hover');
    } else {
      this.cursorOutline.classList.remove('hover');
    }
  }
  
  setCursorActive(isActive) {
    this.isActive = isActive;
    
    if (isActive) {
      this.cursorOutline.classList.add('active');
    } else {
      this.cursorOutline.classList.remove('active');
    }
  }
    update() {
    // Apply simplified transform to dot cursor with Y2K effect
    this.cursorDot.style.transform = `translate(${this.mouseX}px, ${this.mouseY}px)`;
    this.cursorDot.style.boxShadow = `0 0 ${Math.abs(Math.sin(Date.now() * 0.003) * 10)}px 2px var(--pink-hot)`;
    
    // Smooth follow effect for outline with simplified math
    this.outlineX += (this.mouseX - this.outlineX) * 0.15;
    this.outlineY += (this.mouseY - this.outlineY) * 0.15;
    
    // Use standard transform with rotation for Y2K/nostalgic effect
    const rotationAngle = Math.sin(Date.now() * 0.001) * 5;
    this.cursorOutline.style.transform = `translate(${this.outlineX}px, ${this.outlineY}px) translate(-50%, -50%) rotate(${rotationAngle}deg)`;
    
    // Create trail effect by randomly changing border colors
    if (Math.random() > 0.96) {
      const hue = Math.floor(Math.random() * 60) + 280; // Purple to pink range
      this.cursorOutline.style.borderColor = `hsl(${hue}, 100%, 75%)`;
      setTimeout(() => {
        this.cursorOutline.style.borderColor = ''; // Reset to default
      }, 150);
    }
    
    // Continue animation loop with requestAnimationFrame
    this.rafId = requestAnimationFrame(this.update.bind(this));
  }
}

// Initialize the custom cursor when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  new VybeCursor();
});

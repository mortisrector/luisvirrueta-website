/* ========================================
   LAZY LOADING MODULE
   ======================================== */

export class LazyLoading {
    constructor(options = {}) {
        this.options = {
            imageSelector: 'img[data-src]',
            rootMargin: '50px 0px',
            threshold: 0.01,
            placeholderClass: 'lazy-loading',
            loadedClass: 'lazy-loaded',
            errorClass: 'lazy-error',
            ...options
        };
        
        this.observer = null;
        this.images = [];
        
        this.init();
    }
    
    init() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            console.warn('Intersection Observer not supported, loading all images immediately');
            this.loadAllImages();
            return;
        }
        
        this.setupObserver();
        this.findImages();
        this.observeImages();
    }
    
    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: this.options.rootMargin,
            threshold: this.options.threshold
        });
    }
    
    findImages() {
        this.images = document.querySelectorAll(this.options.imageSelector);
        console.log(`Found ${this.images.length} images for lazy loading`);
    }
    
    observeImages() {
        this.images.forEach(img => {
            // Add loading class
            img.classList.add(this.options.placeholderClass);
            
            // Create placeholder if needed
            this.createPlaceholder(img);
            
            // Observe image
            this.observer.observe(img);
        });
    }
    
    createPlaceholder(img) {
        if (!img.src) {
            // Create a simple placeholder
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = img.getAttribute('width') || 300;
            canvas.height = img.getAttribute('height') || 200;
            
            // Draw placeholder
            ctx.fillStyle = '#f0f0f0';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ccc';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Cargando...', canvas.width / 2, canvas.height / 2);
            
            img.src = canvas.toDataURL();
        }
    }
    
    async loadImage(img) {
        const src = img.getAttribute('data-src');
        const srcset = img.getAttribute('data-srcset');
        
        if (!src) {
            console.warn('No data-src found for image:', img);
            return;
        }
        
        try {
            // Create new image to test loading
            const imageLoader = new Image();
            
            // Set up promise for loading
            const loadPromise = new Promise((resolve, reject) => {
                imageLoader.onload = resolve;
                imageLoader.onerror = reject;
            });
            
            // Start loading
            if (srcset) {
                imageLoader.srcset = srcset;
            }
            imageLoader.src = src;
            
            // Wait for load
            await loadPromise;
            
            // Apply to actual image
            if (srcset) {
                img.srcset = srcset;
            }
            img.src = src;
            
            // Remove data attributes
            img.removeAttribute('data-src');
            if (srcset) {
                img.removeAttribute('data-srcset');
            }
            
            // Update classes
            img.classList.remove(this.options.placeholderClass);
            img.classList.add(this.options.loadedClass);
            
            // Dispatch event
            img.dispatchEvent(new CustomEvent('image:loaded', {
                detail: { image: img, src }
            }));
            
        } catch (error) {
            console.error('Failed to load image:', src, error);
            
            // Handle error
            img.classList.remove(this.options.placeholderClass);
            img.classList.add(this.options.errorClass);
            
            // Set fallback image if provided
            const fallback = img.getAttribute('data-fallback');
            if (fallback) {
                img.src = fallback;
            }
            
            // Dispatch error event
            img.dispatchEvent(new CustomEvent('image:error', {
                detail: { image: img, src, error }
            }));
        }
    }
    
    loadAllImages() {
        // Fallback for browsers without Intersection Observer
        this.findImages();
        this.images.forEach(img => {
            this.loadImage(img);
        });
    }
    
    // Public methods
    refresh() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.findImages();
        this.observeImages();
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.images = [];
    }
    
    handleResize() {
        // Handle responsive images on resize if needed
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            // Check if any images need different sources
            this.images.forEach(img => {
                if (img.hasAttribute('data-srcset')) {
                    // Re-evaluate srcset
                    this.loadImage(img);
                }
            });
        }, 250);
    }
}
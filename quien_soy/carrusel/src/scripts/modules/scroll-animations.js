/* ========================================
   SCROLL ANIMATIONS MODULE
   ======================================== */

export class ScrollAnimations {
    constructor(options = {}) {
        this.options = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px',
            animationClass: 'scroll-reveal',
            activeClass: 'revealed',
            ...options
        };
        
        this.observer = null;
        this.elements = [];
        
        this.init();
    }
    
    init() {
        // Check for Intersection Observer support
        if (!('IntersectionObserver' in window)) {
            console.warn('Intersection Observer not supported, scroll animations disabled');
            return;
        }
        
        this.setupObserver();
        this.findElements();
        this.observeElements();
    }
    
    setupObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateElement(entry.target);
                    this.observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: this.options.threshold,
            rootMargin: this.options.rootMargin
        });
    }
    
    findElements() {
        this.elements = document.querySelectorAll(`.${this.options.animationClass}`);
        console.log(`Found ${this.elements.length} elements for scroll animation`);
    }
    
    observeElements() {
        this.elements.forEach(element => {
            // Add initial state
            element.style.opacity = '0';
            element.style.transform = this.getInitialTransform(element);
            
            // Observe element
            this.observer.observe(element);
        });
    }
    
    getInitialTransform(element) {
        if (element.classList.contains('scroll-reveal--left')) {
            return 'translateX(-50px)';
        }
        if (element.classList.contains('scroll-reveal--right')) {
            return 'translateX(50px)';
        }
        if (element.classList.contains('scroll-reveal--scale')) {
            return 'scale(0.8)';
        }
        return 'translateY(50px)'; // default
    }
    
    animateElement(element) {
        // Add active class
        element.classList.add(this.options.activeClass);
        
        // Reset styles to let CSS handle animation
        element.style.opacity = '';
        element.style.transform = '';
        
        // Dispatch custom event
        element.dispatchEvent(new CustomEvent('scroll:revealed', {
            detail: { element }
        }));
    }
    
    // Public methods
    refresh() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.findElements();
        this.observeElements();
    }
    
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        this.elements = [];
    }
    
    handleResize() {
        // Refresh on resize if needed
        clearTimeout(this.resizeTimeout);
        this.resizeTimeout = setTimeout(() => {
            this.refresh();
        }, 250);
    }
}
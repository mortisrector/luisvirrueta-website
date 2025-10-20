/* ========================================
   HEADER NAVIGATION - MODULE
   ======================================== */

class HeaderNavigation {
    constructor() {
        this.navToggle = null;
        this.navMenu = null;
        this.navOverlay = null;
        this.toolsDropdown = null;
        this.isMenuOpen = false;
        
        this.init();
    }
    
    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupElements());
        } else {
            this.setupElements();
        }
    }
    
    setupElements() {
        // Get DOM elements
        this.navToggle = document.querySelector('.nav-toggle');
        this.navMenu = document.querySelector('.nav-menu');
        this.navOverlay = document.querySelector('.nav-overlay');
        this.toolsDropdown = document.querySelector('.nav-tools-dropdown');
        
        if (!this.navToggle || !this.navMenu) {
            console.warn('Header navigation elements not found');
            return;
        }
        
        this.bindEvents();
        this.setupAccessibility();
    }
    
    bindEvents() {
        // Mobile menu toggle
        this.navToggle.addEventListener('click', () => this.toggleMobileMenu());
        
        // Overlay click to close
        if (this.navOverlay) {
            this.navOverlay.addEventListener('click', () => this.closeMobileMenu());
        }
        
        // Regular navigation links
        const regularNavLinks = this.navMenu.querySelectorAll('.nav-link:not(.tools-main-link)');
        regularNavLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavLinkClick(e, link));
        });
        
        // Tools dropdown handling
        this.setupToolsDropdown();
        
        // Keyboard navigation
        this.setupKeyboardNavigation();
        
        // Window resize handler
        window.addEventListener('resize', () => this.handleResize());
    }
    
    setupToolsDropdown() {
        if (!this.toolsDropdown) return;
        
        const toolsMainLink = this.toolsDropdown.querySelector('.tools-main-link');
        const dropdownItems = this.toolsDropdown.querySelectorAll('.dropdown-item');
        
        if (toolsMainLink) {
            toolsMainLink.addEventListener('click', (e) => this.handleToolsClick(e));
        }
        
        // Handle dropdown item clicks
        dropdownItems.forEach(item => {
            item.addEventListener('click', (e) => this.handleDropdownItemClick(e, item));
        });
    }
    
    setupKeyboardNavigation() {
        // Escape key to close menu
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isMenuOpen) {
                this.closeMobileMenu();
                this.navToggle.focus();
            }
        });
        
        // Enter/Space for toggle button
        this.navToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleMobileMenu();
            }
        });
    }
    
    setupAccessibility() {
        // Set initial ARIA attributes
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navMenu.setAttribute('aria-hidden', 'true');
        
        if (this.navOverlay) {
            this.navOverlay.setAttribute('aria-hidden', 'true');
        }
    }
    
    toggleMobileMenu() {
        if (this.isMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }
    
    openMobileMenu() {
        this.isMenuOpen = true;
        
        // Update classes
        this.navMenu.classList.add('active');
        this.navToggle.classList.add('active');
        
        if (this.navOverlay) {
            this.navOverlay.classList.add('active');
        }
        
        // Update ARIA attributes
        this.navToggle.setAttribute('aria-expanded', 'true');
        this.navMenu.setAttribute('aria-hidden', 'false');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        
        // Focus first menu item
        const firstNavLink = this.navMenu.querySelector('.nav-link');
        if (firstNavLink) {
            setTimeout(() => firstNavLink.focus(), 100);
        }
        
        console.log('Mobile menu opened');
    }
    
    closeMobileMenu() {
        this.isMenuOpen = false;
        
        // Update classes
        this.navMenu.classList.remove('active');
        this.navToggle.classList.remove('active');
        
        if (this.navOverlay) {
            this.navOverlay.classList.remove('active');
        }
        
        // Close tools dropdown if open
        if (this.toolsDropdown) {
            this.toolsDropdown.classList.remove('expanded');
        }
        
        // Update ARIA attributes
        this.navToggle.setAttribute('aria-expanded', 'false');
        this.navMenu.setAttribute('aria-hidden', 'true');
        
        // Restore body scroll
        document.body.style.overflow = '';
        
        console.log('Mobile menu closed');
    }
    
    handleNavLinkClick(e, link) {
        const href = link.getAttribute('href');
        
        console.log('Navigation link clicked:', link.textContent.trim());
        
        // Always close mobile menu for regular navigation
        this.closeMobileMenu();
        
        // Handle different link types
        if (href && href.startsWith('#')) {
            // Anchor link - let default behavior handle it
            this.smoothScrollToSection(href);
        } else if (href && href !== '#') {
            // External link - navigate after menu closes
            setTimeout(() => {
                window.location.href = href;
            }, 100);
        }
    }
    
    handleToolsClick(e) {
        e.preventDefault();
        
        if (window.innerWidth <= 768) {
            // Mobile: Toggle dropdown, keep menu open
            this.toolsDropdown.classList.toggle('expanded');
            console.log('Tools dropdown toggled on mobile');
        } else {
            // Desktop: Prevent navigation (hover handles dropdown)
            console.log('Tools link clicked on desktop - prevented navigation');
        }
    }
    
    handleDropdownItemClick(e, item) {
        const href = item.getAttribute('href');
        
        console.log('Dropdown item clicked:', item.textContent.trim());
        
        // Always close mobile menu when selecting dropdown item
        this.closeMobileMenu();
        
        // Navigate after menu closes
        if (href && href !== '#') {
            setTimeout(() => {
                window.location.href = href;
            }, 100);
        }
    }
    
    handleResize() {
        // Close mobile menu if window is resized to desktop
        if (window.innerWidth > 768 && this.isMenuOpen) {
            this.closeMobileMenu();
        }
    }
    
    smoothScrollToSection(target) {
        const targetElement = document.querySelector(target);
        if (targetElement) {
            const headerHeight = this.navMenu.closest('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
    
    // Public methods for external use
    isOpen() {
        return this.isMenuOpen;
    }
    
    close() {
        this.closeMobileMenu();
    }
    
    destroy() {
        // Clean up event listeners if needed
        window.removeEventListener('resize', this.handleResize);
        document.removeEventListener('keydown', this.setupKeyboardNavigation);
    }
}

// Auto-initialize when script loads
let headerNavInstance = null;

// Initialize header navigation
function initHeaderNavigation() {
    if (!headerNavInstance) {
        headerNavInstance = new HeaderNavigation();
    }
    return headerNavInstance;
}

// Export for module use or global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { HeaderNavigation, initHeaderNavigation };
} else {
    window.HeaderNavigation = HeaderNavigation;
    window.initHeaderNavigation = initHeaderNavigation;
    
    // Auto-initialize
    initHeaderNavigation();
}
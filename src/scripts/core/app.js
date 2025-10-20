/* ========================================
   MAIN APPLICATION ENTRY POINT
   Luis Virrueta Psychology Website
   ======================================== */

// Simple, self-contained app without external dependencies

console.log('🚀 Psychology Website App Loading...');

// Simple app that just removes loading state
class PsychologyApp {
    constructor() {
        this.components = new Map();
        this.isInitialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            console.log('🚀 Initializing Psychology Website...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.initializeComponents());
            } else {
                this.initializeComponents();
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize app:', error);
        }
    }
    
    async initializeComponents() {
        try {
            // Initialize core components
            await this.initHeaderNavigation();
            await this.initScrollAnimations();
            await this.initLazyLoading();
            await this.initFormHandlers();
            await this.initAnalytics();
            
            // Set up global event listeners
            this.setupGlobalEvents();
            
            // Mark as initialized
            this.isInitialized = true;
            document.body.classList.add('app-initialized');
            
            console.log('✅ Psychology Website initialized successfully');
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('app:initialized', {
                detail: { app: this }
            }));
            
        } catch (error) {
            console.error('❌ Component initialization failed:', error);
        }
    }
    
    async initHeaderNavigation() {
        try {
            const headerNav = new HeaderNavigation();
            this.components.set('headerNavigation', headerNav);
            console.log('✅ Header navigation initialized');
        } catch (error) {
            console.warn('⚠️ Header navigation failed to initialize:', error);
        }
    }
    
    async initScrollAnimations() {
        try {
            const scrollAnimations = new ScrollAnimations({
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            this.components.set('scrollAnimations', scrollAnimations);
            console.log('✅ Scroll animations initialized');
        } catch (error) {
            console.warn('⚠️ Scroll animations failed to initialize:', error);
        }
    }
    
    async initLazyLoading() {
        try {
            const lazyLoading = new LazyLoading({
                imageSelector: 'img[data-src]',
                rootMargin: '50px 0px'
            });
            this.components.set('lazyLoading', lazyLoading);
            console.log('✅ Lazy loading initialized');
        } catch (error) {
            console.warn('⚠️ Lazy loading failed to initialize:', error);
        }
    }
    
    async initFormHandlers() {
        try {
            const formHandler = new FormHandler({
                contactFormSelector: '#contact-form',
                subscriptionFormSelector: '#subscription-form'
            });
            this.components.set('formHandler', formHandler);
            console.log('✅ Form handlers initialized');
        } catch (error) {
            console.warn('⚠️ Form handlers failed to initialize:', error);
        }
    }
    
    async initAnalytics() {
        try {
            const analytics = new AnalyticsTracker({
                trackClicks: true,
                trackScrollDepth: true,
                trackTimeOnPage: true
            });
            this.components.set('analytics', analytics);
            console.log('✅ Analytics initialized');
        } catch (error) {
            console.warn('⚠️ Analytics failed to initialize:', error);
        }
    }
    
    setupGlobalEvents() {
        // Handle window resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                this.handleResize();
            }, 250);
        });
        
        // Handle visibility changes
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
        
        // Handle online/offline status
        window.addEventListener('online', () => this.handleOnlineStatus(true));
        window.addEventListener('offline', () => this.handleOnlineStatus(false));
        
        // Handle errors globally
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event);
        });
        
        // Handle unhandled promise rejections
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event);
        });
    }
    
    handleResize() {
        // Notify all components about resize
        this.components.forEach((component, name) => {
            if (typeof component.handleResize === 'function') {
                component.handleResize();
            }
        });
        
        console.log('📱 Window resized, components notified');
    }
    
    handleVisibilityChange() {
        const isVisible = !document.hidden;
        
        this.components.forEach((component, name) => {
            if (typeof component.handleVisibilityChange === 'function') {
                component.handleVisibilityChange(isVisible);
            }
        });
        
        console.log(`👁️ Page ${isVisible ? 'visible' : 'hidden'}`);
    }
    
    handleOnlineStatus(isOnline) {
        document.body.classList.toggle('is-offline', !isOnline);
        
        this.components.forEach((component, name) => {
            if (typeof component.handleOnlineStatus === 'function') {
                component.handleOnlineStatus(isOnline);
            }
        });
        
        console.log(`🌐 Connection ${isOnline ? 'restored' : 'lost'}`);
    }
    
    handleGlobalError(event) {
        console.error('🚨 Global error:', event.error || event.reason);
        
        // Track error if analytics is available
        const analytics = this.components.get('analytics');
        if (analytics && typeof analytics.trackError === 'function') {
            analytics.trackError(event.error || event.reason);
        }
    }
    
    // Public API methods
    getComponent(name) {
        return this.components.get(name);
    }
    
    isComponentInitialized(name) {
        return this.components.has(name);
    }
    
    getAppStatus() {
        return {
            initialized: this.isInitialized,
            components: Array.from(this.components.keys()),
            timestamp: Date.now()
        };
    }
    
    destroy() {
        // Clean up all components
        this.components.forEach((component, name) => {
            if (typeof component.destroy === 'function') {
                component.destroy();
            }
        });
        
        this.components.clear();
        this.isInitialized = false;
        
        console.log('🧹 App destroyed and cleaned up');
    }
}

// Initialize the application
let appInstance = null;

// Auto-initialize
function initializeApp() {
    if (!appInstance) {
        appInstance = new PsychologyApp();
    }
    return appInstance;
}

// Export for module use or global access
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PsychologyApp, initializeApp };
} else {
    window.PsychologyApp = PsychologyApp;
    window.PsychologyAppInstance = initializeApp();
}

// Development helpers
if (process.env.NODE_ENV === 'development') {
    window.PsychologyAppDebug = {
        getApp: () => appInstance,
        getComponents: () => appInstance?.components,
        getStatus: () => appInstance?.getAppStatus()
    };
}
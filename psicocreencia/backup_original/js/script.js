// ===============================
// NAVIGATION SYSTEM - COMPLETE VERSION
// ===============================

document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navOverlay = document.querySelector('.nav-overlay');
    
    if (!navToggle || !navMenu) {
        console.log('Navigation elements not found');
        return;
    }

    // Toggle menu function
    function toggleMenu() {
        const isActive = navMenu.classList.contains('active');
        
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
        
        if (navOverlay) {
            navOverlay.classList.toggle('active');
        }
        
        // Prevent scroll when menu is open
        document.body.style.overflow = isActive ? '' : 'hidden';
    }

    // Close menu function
    function closeMenu() {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
        if (navOverlay) {
            navOverlay.classList.remove('active');
        }
        document.body.style.overflow = '';
        console.log('Menu closed');
    }

    // Click on hamburger
    navToggle.addEventListener('click', toggleMenu);

    // Click on overlay to close
    if (navOverlay) {
        navOverlay.addEventListener('click', toggleMenu);
    }

    // ===============================
    // TOOLS DROPDOWN FUNCTIONALITY
    // ===============================
    
    const toolsMainLink = document.querySelector('.tools-main-link');
    const toolsDropdown = document.querySelector('.nav-tools-dropdown');
    
    if (toolsMainLink && toolsDropdown) {
        // Handle Herramientas click - different behavior for desktop vs mobile
        toolsMainLink.addEventListener('click', function(e) {
            e.preventDefault(); // Always prevent navigation
            
            if (window.innerWidth <= 768) {
                // Mobile: Toggle dropdown but DON'T close main menu
                toolsDropdown.classList.toggle('expanded');
                console.log('Tools dropdown toggled on mobile - main menu stays open');
            } else {
                // Desktop: Hover behavior handled by CSS
                console.log('Tools link clicked on desktop - prevented default navigation');
            }
        });
        
        // Handle clicks on dropdown items - these SHOULD close the menu
        const toolsDropdownItems = document.querySelectorAll('.premium-item a');
        toolsDropdownItems.forEach(item => {
            item.addEventListener('click', function(e) {
                console.log('Tools dropdown item clicked:', this.textContent.trim());
                closeMenu(); // Close the mobile menu when selecting a dropdown item
                
                // Small delay for navigation
                setTimeout(() => {
                    if (this.getAttribute('href') && !this.getAttribute('href').startsWith('#')) {
                        window.location.href = this.getAttribute('href');
                    }
                }, 100);
            });
        });
    }

    // Close menu when clicking on regular nav links (EXCLUDING Herramientas)
    const regularNavLinks = navMenu.querySelectorAll('.nav-link:not(.tools-main-link)');
    regularNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            console.log('Regular nav link clicked:', this.textContent.trim());
            closeMenu();
            
            // Small delay to ensure menu closes before navigation
            setTimeout(() => {
                if (link.getAttribute('href') && link.getAttribute('href').startsWith('#')) {
                    // For anchor links, let default behavior happen
                    return;
                } else if (link.getAttribute('href')) {
                    // For external links, navigate after menu closes
                    window.location.href = link.getAttribute('href');
                }
            }, 100);
        });
    });

    // Close with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (navMenu.classList.contains('active')) {
                closeMenu();
                navToggle.focus();
            }
            
            // Also close tools dropdown
            if (toolsDropdown) {
                toolsDropdown.classList.remove('expanded');
            }
        }
    });

    // Keyboard navigation for toggle button
    navToggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleMenu();
        }
    });
});

// Debug functions for development
function debugResetCache() {
    console.log('Debug: Reset cache requested');
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    // Force reload without cache
    if (confirm('¿Resetear cache y recargar la página?')) {
        window.location.reload(true);
    }
}

// Global functions for agenda system
function abrirAgendaSimple() {
    console.log('Abriendo sistema de agenda...');
    if (window.agendaSystem) {
        window.agendaSystem.openModal();
    } else {
        console.error('Sistema de agenda no disponible');
        alert('Sistema de agenda no disponible. Recargar página.');
    }
}

function cerrarAgendaSimple() {
    console.log('Cerrando agenda...');
    if (window.agendaSystem) {
        window.agendaSystem.closeModal();
    }
}

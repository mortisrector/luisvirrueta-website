/* ===========================================
   BLOG JAVASCRIPT - COMPLETE FUNCTIONALITY
   Modern vanilla JS with ES6+ features
   =========================================== */

/* ===============================
   CORE UTILITIES & HELPERS
   =============================== */

class BlogApp {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.searchIndex = [];
        this.articles = [];
        this.initializeApp();
    }

    detectCurrentPage() {
        if (window.location.pathname.includes('/articulos/')) return 'article';
        if (window.location.pathname.includes('/blog')) return 'blog';
        return 'main';
    }

    async initializeApp() {
        console.log('🔄 Starting Blog App initialization...');
        console.log('📍 Current page detected:', this.currentPage);
        console.log('🔗 Current pathname:', window.location.pathname);
        
        await this.loadInitialData();
        this.initializeGlobalFeatures();
        this.initializePageSpecificFeatures();
        console.log('🚀 Blog App initialized successfully');
    }

    async loadInitialData() {
        try {
            // Simulated data - in production this would come from an API
            this.articles = [
                {
                    id: 1,
                    title: "Del perro que me ama al vacío que me habita",
                    slug: "del-perro-que-me-ama-al-vacio-que-me-habita",
                    excerpt: "Un viaje profundo desde la búsqueda del amor hacia la habitación del vacío como gracia. Una reflexión sobre cómo transitamos del amor como necesidad al vacío como libertad.",
                    category: "Filosofía",
                    author: "Luis Virrueta",
                    date: "2025-09-29",
                    readTime: "15 min",
                    tags: ["amor", "existencial", "filosofía", "vacío", "gracia"],
                    rating: 4.9,
                    comments: 47,
                    views: 1250,
                    featured: true,
                    image: "del-perro-featured.jpg",
                    url: "articulos/2025-09-29-del-perro-que-me-ama-al-vacio-que-me-habita/"
                },
                {
                    id: 2,
                    title: "La Creencia Raíz: El Origen de Todos los Patrones",
                    slug: "la-creencia-raiz-origen-patrones",
                    excerpt: "Descubre cómo una sola creencia formada en la infancia puede gobernar toda tu vida adulta y la metodología exacta para identificarla y transformarla.",
                    category: "Transformación",
                    author: "Luis Virrueta",
                    date: "2025-09-25",
                    readTime: "12 min",
                    tags: ["creencias", "patrones", "infancia", "transformación"],
                    rating: 4.8,
                    comments: 31,
                    views: 890,
                    featured: true,
                    image: "creencia-raiz.jpg",
                    url: "articulos/la-creencia-raiz-origen-patrones/"
                },
                {
                    id: 3,
                    title: "Casos de Éxito: De la Ansiedad Crónica a la Paz Interior",
                    slug: "casos-exito-ansiedad-paz",
                    excerpt: "La historia de María, quien después de 15 años de ansiedad, encontró la paz en 3 sesiones al descubrir la creencia que la mantenía prisionera.",
                    category: "Casos",
                    author: "Luis Virrueta",
                    date: "2025-09-20",
                    readTime: "10 min",
                    tags: ["casos", "ansiedad", "paz", "sanación"],
                    rating: 4.7,
                    comments: 28,
                    views: 675,
                    featured: false,
                    image: "caso-ansiedad.jpg",
                    url: "articulos/casos-exito-ansiedad-paz/"
                },
                {
                    id: 4,
                    title: "La Técnica del Espejo Invertido: Revolucionando la Terapia",
                    slug: "tecnica-espejo-invertido",
                    excerpt: "Una técnica innovadora que permite acceder directamente al inconsciente y reprogramar creencias limitantes en tiempo real.",
                    category: "Técnicas",
                    author: "Luis Virrueta",
                    date: "2025-09-15",
                    readTime: "18 min",
                    tags: ["técnicas", "inconsciente", "reprogramación", "innovación"],
                    rating: 4.9,
                    comments: 52,
                    views: 1180,
                    featured: true,
                    image: "espejo-invertido.jpg",
                    url: "articulos/tecnica-espejo-invertido/"
                },
                {
                    id: 5,
                    title: "Investigación: El Impacto Neurológico de las Creencias",
                    slug: "investigacion-impacto-neurologico-creencias",
                    excerpt: "Nuevos hallazgos científicos demuestran cómo las creencias modifican físicamente la estructura cerebral y cómo podemos usar esto para la sanación.",
                    category: "Investigación",
                    author: "Luis Virrueta",
                    date: "2025-09-10",
                    readTime: "22 min",
                    tags: ["neurociencia", "investigación", "cerebro", "ciencia"],
                    rating: 4.8,
                    comments: 19,
                    views: 542,
                    featured: false,
                    image: "neurociencia-creencias.jpg",
                    url: "articulos/investigacion-impacto-neurologico-creencias/"
                },
                {
                    id: 6,
                    title: "El Mito del Amor Propio: Por Qué No Funciona",
                    slug: "mito-amor-propio-no-funciona",
                    excerpt: "Análisis profundo de por qué el concepto moderno de 'amor propio' mantiene a las personas atrapadas en ciclos de autojuicio y la alternativa liberadora.",
                    category: "Filosofía",
                    author: "Luis Virrueta", 
                    date: "2025-09-05",
                    readTime: "14 min",
                    tags: ["amor propio", "autoestima", "liberación", "mitos"],
                    rating: 4.6,
                    comments: 34,
                    views: 720,
                    featured: false,
                    image: "mito-amor-propio.jpg",
                    url: "articulos/mito-amor-propio-no-funciona/"
                },
                {
                    id: 7,
                    title: "Transformación Cuántica: Más Allá del Pensamiento Positivo",
                    slug: "transformacion-cuantica-pensamiento-positivo",
                    excerpt: "Cómo la física cuántica revela por qué el pensamiento positivo falla y cuál es el verdadero mecanismo de transformación de la realidad.",
                    category: "Transformación",
                    author: "Luis Virrueta",
                    date: "2025-08-30",
                    readTime: "16 min",
                    tags: ["cuántica", "realidad", "transformación", "ciencia"],
                    rating: 4.7,
                    comments: 29,
                    views: 634,
                    featured: false,
                    image: "cuantica-transformacion.jpg",
                    url: "articulos/transformacion-cuantica-pensamiento-positivo/"
                },
                {
                    id: 8,
                    title: "Caso de Estudio: Liberación de Trauma Generacional",
                    slug: "caso-trauma-generacional",
                    excerpt: "La historia de Carlos, quien sanó patrones familiares de 4 generaciones al descubrir la creencia ancestral que gobernaba su linaje.",
                    category: "Casos",
                    author: "Luis Virrueta",
                    date: "2025-08-25",
                    readTime: "13 min",
                    tags: ["trauma", "generacional", "sanación", "familia"],
                    rating: 4.9,
                    comments: 41,
                    views: 892,
                    featured: true,
                    image: "trauma-generacional.jpg",
                    url: "articulos/caso-trauma-generacional/"
                },
                {
                    id: 9,
                    title: "La Técnica de Disolución Consciente",
                    slug: "tecnica-disolucion-consciente",
                    excerpt: "Una metodología revolucionaria para disolver creencias sin resistencia, basada en los principios de la conciencia no-dual.",
                    category: "Técnicas",
                    author: "Luis Virrueta",
                    date: "2025-08-20",
                    readTime: "20 min",
                    tags: ["técnicas", "conciencia", "disolución", "no-dual"],
                    rating: 4.8,
                    comments: 36,
                    views: 756,
                    featured: false,
                    image: "disolucion-consciente.jpg",
                    url: "articulos/tecnica-disolucion-consciente/"
                },
                {
                    id: 10,
                    title: "Neuroplasticidad y Creencias: Lo Que la Ciencia Revela",
                    slug: "neuroplasticidad-creencias-ciencia",
                    excerpt: "Investigación de vanguardia sobre cómo las creencias literalmente reconfiguran el cerebro y las implicaciones para la terapia.",
                    category: "Investigación",
                    author: "Luis Virrueta",
                    date: "2025-08-15",
                    readTime: "25 min",
                    tags: ["neuroplasticidad", "investigación", "terapia", "cerebro"],
                    rating: 4.9,
                    comments: 23,
                    views: 478,
                    featured: false,
                    image: "neuroplasticidad-estudio.jpg",
                    url: "articulos/neuroplasticidad-creencias-ciencia/"
                },
                {
                    id: 11,
                    title: "El Vacío Creativo: Cuando la Nada se Vuelve Todo",
                    slug: "vacio-creativo-nada-todo",
                    excerpt: "Exploración filosófica del vacío no como ausencia sino como potencial infinito, y su papel en la transformación humana.",
                    category: "Filosofía",
                    author: "Luis Virrueta",
                    date: "2025-08-10",
                    readTime: "17 min",
                    tags: ["vacío", "creatividad", "potencial", "filosofía"],
                    rating: 4.7,
                    comments: 38,
                    views: 612,
                    featured: false,
                    image: "vacio-creativo.jpg",
                    url: "articulos/vacio-creativo-nada-todo/"
                },
                {
                    id: 12,
                    title: "Masterclass: Arquitectura de una Sesión de Transformación",
                    slug: "masterclass-arquitectura-sesion",
                    excerpt: "Detrás de escena: cómo estructurar una sesión de transformación para maximum impacto, paso a paso con ejemplos reales.",
                    category: "Técnicas",
                    author: "Luis Virrueta",
                    date: "2025-08-05",
                    readTime: "28 min",
                    tags: ["masterclass", "sesión", "estructura", "método"],
                    rating: 4.9,
                    comments: 67,
                    views: 1340,
                    featured: true,
                    image: "masterclass-sesion.jpg",
                    url: "articulos/masterclass-arquitectura-sesion/"
                }
            ];
            this.buildSearchIndex();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    buildSearchIndex() {
        this.searchIndex = this.articles.map(article => ({
            ...article,
            searchText: `${article.title} ${article.excerpt} ${article.category} ${article.tags.join(' ')}`.toLowerCase()
        }));
    }

    initializeGlobalFeatures() {
        this.initializeThemeToggle();
        this.initializeScrollEffects();
        this.initializeToastSystem();
        this.initializeShareSystem();
        this.initializeLazyLoading();
        this.initializeKeyboardNavigation();
    }

    initializePageSpecificFeatures() {
        switch (this.currentPage) {
            case 'blog':
                this.initializeBlogPage();
                break;
            case 'article':
                this.initializeArticlePage();
                break;
            default:
                this.initializeMainPage();
        }
    }
}

/* ===============================
   THEME MANAGEMENT SYSTEM
   =============================== */

class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('blog-theme') || 'light';
        this.applyTheme();
        this.setupThemeToggle();
    }

    setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
            this.updateThemeIcon();
        }
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        this.updateThemeIcon();
        localStorage.setItem('blog-theme', this.currentTheme);
        
        // Smooth transition effect
        document.documentElement.style.transition = 'all 0.3s ease';
        setTimeout(() => {
            document.documentElement.style.transition = '';
        }, 300);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        document.body.classList.toggle('dark-theme', this.currentTheme === 'dark');
    }

    updateThemeIcon() {
        const icon = document.querySelector('.theme-toggle i');
        if (icon) {
            icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    }
}

/* ===============================
   SEARCH & FILTER SYSTEM
   =============================== */

class SearchSystem {
    constructor(articles, searchIndex) {
        this.articles = articles;
        this.searchIndex = searchIndex;
        this.currentFilters = {
            search: '',
            category: 'all',
            sort: 'newest'
        };
        this.setupSearchInterface();
    }

    setupSearchInterface() {
        this.setupSearchInput();
        this.setupCategoryFilter();
        this.setupSortFilter();
        this.setupAdvancedSearch();
    }

    setupSearchInput() {
        const searchInput = document.querySelector('.search-input');
        if (!searchInput) return;

        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.currentFilters.search = e.target.value.toLowerCase();
                this.performSearch();
            }, 300);
        });

        // Search suggestions
        this.setupSearchSuggestions(searchInput);
    }

    setupSearchSuggestions(input) {
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        input.parentNode.appendChild(suggestionsContainer);

        input.addEventListener('focus', () => {
            if (input.value.length > 0) {
                this.showSuggestions(input.value, suggestionsContainer);
            }
        });

        input.addEventListener('blur', () => {
            setTimeout(() => suggestionsContainer.innerHTML = '', 150);
        });
    }

    showSuggestions(query, container) {
        const suggestions = this.generateSuggestions(query);
        container.innerHTML = suggestions.map(suggestion => 
            `<div class="suggestion-item" onclick="blogApp.searchSystem.selectSuggestion('${suggestion}')">${suggestion}</div>`
        ).join('');
    }

    generateSuggestions(query) {
        const allTags = [...new Set(this.articles.flatMap(article => article.tags))];
        const categories = [...new Set(this.articles.map(article => article.category))];
        const titles = this.articles.map(article => article.title);
        
        const searchPool = [...allTags, ...categories, ...titles];
        return searchPool.filter(item => 
            item.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);
    }

    selectSuggestion(suggestion) {
        const searchInput = document.querySelector('.search-input');
        searchInput.value = suggestion;
        this.currentFilters.search = suggestion.toLowerCase();
        this.performSearch();
    }

    setupCategoryFilter() {
        const categorySelect = document.querySelector('.category-filter');
        if (categorySelect) {
            categorySelect.addEventListener('change', (e) => {
                this.currentFilters.category = e.target.value;
                this.performSearch();
            });
        }
    }

    setupSortFilter() {
        const sortSelect = document.querySelector('.sort-filter');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.currentFilters.sort = e.target.value;
                this.performSearch();
            });
        }
    }

    setupAdvancedSearch() {
        const advancedToggle = document.querySelector('.advanced-search-toggle');
        const advancedPanel = document.querySelector('.advanced-search');
        
        if (advancedToggle && advancedPanel) {
            advancedToggle.addEventListener('click', () => {
                advancedPanel.classList.toggle('show');
                const icon = advancedToggle.querySelector('i');
                icon.className = advancedPanel.classList.contains('show') ? 
                    'fas fa-chevron-up' : 'fas fa-chevron-down';
            });
        }
    }

    performSearch() {
        let results = [...this.searchIndex];

        // Apply search filter
        if (this.currentFilters.search) {
            results = results.filter(article => 
                article.searchText.includes(this.currentFilters.search)
            );
        }

        // Apply category filter
        if (this.currentFilters.category !== 'all') {
            results = results.filter(article => 
                article.category.toLowerCase() === this.currentFilters.category
            );
        }

        // Apply sorting
        results = this.sortResults(results);

        this.displayResults(results);
        this.updateResultsCount(results.length);
    }

    sortResults(results) {
        switch (this.currentFilters.sort) {
            case 'newest':
                return results.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'oldest':
                return results.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'popular':
                return results.sort((a, b) => b.rating - a.rating);
            case 'comments':
                return results.sort((a, b) => b.comments - a.comments);
            default:
                return results;
        }
    }

    displayResults(results) {
        const blogGrid = document.querySelector('.blog-grid');
        if (!blogGrid) return;

        if (results.length === 0) {
            blogGrid.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>No se encontraron artículos</h3>
                    <p>Intenta con otros términos de búsqueda</p>
                </div>
            `;
            return;
        }

        blogGrid.innerHTML = results.map(article => this.createArticleCard(article)).join('');
        
        // Reinitialize animations and interactions
        this.initializeCardAnimations();
    }

    createArticleCard(article) {
        const featuredClass = article.featured ? 'featured-article' : '';
        const placeholderGradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        ];
        const gradient = placeholderGradients[article.id % placeholderGradients.length];
        
        return `
            <article class="blog-card ${featuredClass}" data-aos="fade-up" data-category="${article.category.toLowerCase()}">
                <div class="card-image-container">
                    <img src="../images/blog/${article.image}" 
                         alt="${article.title}"
                         class="card-image"
                         onerror="this.outerHTML='<div class=\\"card-placeholder\\" style=\\"background: ${gradient}\\"><div class=\\"placeholder-content\\"><i class=\\"fas fa-brain\\"></i><span>${article.category}</span></div></div>'">
                    
                    <div class="card-overlay">
                        <div class="card-badges">
                            ${article.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Destacado</span>' : ''}
                            <span class="category-badge ${article.category.toLowerCase()}">${article.category}</span>
                        </div>
                        
                        <div class="card-quick-actions">
                            <button class="quick-action-btn bookmark-btn" title="Guardar para después">
                                <i class="far fa-bookmark"></i>
                            </button>
                            <button class="quick-action-btn share-btn" onclick="blogApp.shareSystem.shareArticle(${article.id})" title="Compartir">
                                <i class="fas fa-share-alt"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="card-stats-overlay">
                        <div class="stat-item">
                            <i class="fas fa-eye"></i>
                            <span>${this.formatNumber(article.views)}</span>
                        </div>
                        <div class="stat-item rating-stat">
                            <i class="fas fa-star"></i>
                            <span>${article.rating}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="card-meta-header">
                        <div class="author-info">
                            <div class="author-avatar">
                                <img src="../images/luis-avatar.jpg" alt="Luis Virrueta" 
                                     onerror="this.outerHTML='<div class=\\"avatar-placeholder\\">LV</div>'">
                            </div>
                            <div class="author-details">
                                <span class="author-name">Luis Virrueta</span>
                                <time class="publish-date">${this.formatDate(article.date)}</time>
                            </div>
                        </div>
                        <div class="read-time">
                            <i class="fas fa-clock"></i>
                            <span>${article.readTime}</span>
                        </div>
                    </div>
                    
                    <h3 class="card-title">
                        <a href="${article.url}" class="card-link">${article.title}</a>
                    </h3>
                    
                    <p class="card-excerpt">${article.excerpt}</p>
                    
                    <div class="card-tags">
                        ${article.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        ${article.tags.length > 3 ? `<span class="tag-more">+${article.tags.length - 3}</span>` : ''}
                    </div>
                    
                    <div class="card-footer">
                        <div class="card-engagement">
                            <div class="engagement-item">
                                <i class="fas fa-comment"></i>
                                <span>${article.comments}</span>
                            </div>
                            <div class="engagement-item">
                                <i class="fas fa-heart"></i>
                                <span>${Math.floor(article.views * 0.05)}</span>
                            </div>
                        </div>
                        
                        <a href="${article.url}" class="read-more-btn">
                            <span>Leer completo</span>
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    formatNumber(num) {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('es-ES', options);
    }

    updateResultsCount(count) {
        const counter = document.querySelector('.results-count');
        if (counter) {
            counter.textContent = count === 1 ? 
                `1 artículo encontrado` : 
                `${count} artículos encontrados`;
        }
    }

    initializeCardAnimations() {
        // Reinitialize any card-specific animations or interactions
        const cards = document.querySelectorAll('.blog-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
    }
}

/* ===============================
   SOCIAL SHARING SYSTEM
   =============================== */

class ShareSystem {
    constructor() {
        this.setupShareButtons();
        this.setupShareModal();
    }

    setupShareButtons() {
        // Global share button handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.share-btn, .share-btn *')) {
                e.preventDefault();
                this.openShareModal();
            }
        });
    }

    setupShareModal() {
        // Create share modal if it doesn't exist
        if (!document.querySelector('.share-modal')) {
            this.createShareModal();
        }
    }

    createShareModal() {
        const modalHTML = `
            <div class="share-modal" id="shareModal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-share-alt"></i> Compartir Artículo</h3>
                        <button class="close-btn">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="share-options">
                            <button class="share-option twitter" data-platform="twitter">
                                <i class="fab fa-twitter"></i>
                                <span>Twitter</span>
                            </button>
                            <button class="share-option facebook" data-platform="facebook">
                                <i class="fab fa-facebook-f"></i>
                                <span>Facebook</span>
                            </button>
                            <button class="share-option linkedin" data-platform="linkedin">
                                <i class="fab fa-linkedin-in"></i>
                                <span>LinkedIn</span>
                            </button>
                            <button class="share-option whatsapp" data-platform="whatsapp">
                                <i class="fab fa-whatsapp"></i>
                                <span>WhatsApp</span>
                            </button>
                            <button class="share-option email" data-platform="email">
                                <i class="fas fa-envelope"></i>
                                <span>Email</span>
                            </button>
                            <button class="share-option copy" data-platform="copy">
                                <i class="fas fa-copy"></i>
                                <span>Copiar Link</span>
                            </button>
                        </div>
                        <div class="share-url">
                            <input type="text" readonly id="shareUrl" />
                            <button class="copy-url-btn">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.bindShareModalEvents();
    }

    bindShareModalEvents() {
        const modal = document.querySelector('#shareModal');
        const closeBtn = modal.querySelector('.close-btn');
        const shareOptions = modal.querySelectorAll('.share-option');
        const copyUrlBtn = modal.querySelector('.copy-url-btn');

        // Close modal events
        closeBtn.addEventListener('click', () => this.closeShareModal());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeShareModal();
        });

        // Share platform events
        shareOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const platform = e.currentTarget.dataset.platform;
                this.shareToplatform(platform);
            });
        });

        // Copy URL event
        copyUrlBtn.addEventListener('click', () => this.copyUrl());
    }

    openShareModal() {
        const modal = document.querySelector('#shareModal');
        const urlInput = modal.querySelector('#shareUrl');
        
        urlInput.value = window.location.href;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    closeShareModal() {
        const modal = document.querySelector('#shareModal');
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    shareToplatform(platform) {
        const url = encodeURIComponent(window.location.href);
        const title = encodeURIComponent(document.title);
        const description = encodeURIComponent(
            document.querySelector('meta[name="description"]')?.content || ''
        );

        const shareUrls = {
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
            whatsapp: `https://wa.me/?text=${title}%20${url}`,
            email: `mailto:?subject=${title}&body=${description}%0A%0A${url}`,
            copy: url
        };

        if (platform === 'copy') {
            this.copyUrl();
        } else {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }

        this.closeShareModal();
        blogApp.toastSystem.show(`Compartido en ${platform}`, 'success');
    }

    async copyUrl() {
        const urlInput = document.querySelector('#shareUrl');
        try {
            await navigator.clipboard.writeText(urlInput.value);
            blogApp.toastSystem.show('Link copiado al portapapeles', 'success');
        } catch (err) {
            urlInput.select();
            document.execCommand('copy');
            blogApp.toastSystem.show('Link copiado', 'success');
        }
    }

    shareArticle(articleId) {
        // For specific article sharing
        const article = blogApp.articles.find(a => a.id === articleId);
        if (article) {
            // Could customize sharing based on specific article
            this.openShareModal();
        }
    }
}

/* ===============================
   TOAST NOTIFICATION SYSTEM
   =============================== */

class ToastSystem {
    constructor() {
        this.createToastContainer();
        this.toastQueue = [];
        this.activeToasts = [];
    }

    createToastContainer() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    show(message, type = 'info', duration = 3000) {
        const toast = this.createToast(message, type, duration);
        this.displayToast(toast);
        
        setTimeout(() => this.hideToast(toast), duration);
        
        return toast;
    }

    createToast(message, type, duration) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icons[type]}"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-progress">
                <div class="toast-progress-bar" style="animation-duration: ${duration}ms"></div>
            </div>
        `;

        return toast;
    }

    displayToast(toast) {
        const container = document.querySelector('.toast-container');
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);
        
        this.activeToasts.push(toast);
    }

    hideToast(toast) {
        toast.classList.add('hide');
        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            this.activeToasts = this.activeToasts.filter(t => t !== toast);
        }, 300);
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

/* ===============================
   ARTICLE PAGE FUNCTIONALITY
   =============================== */

class ArticleManager {
    constructor() {
        this.initializeArticleFeatures();
    }

    initializeArticleFeatures() {
        this.setupTableOfContents();
        this.setupReadingProgress();
        this.setupRatingSystem();
        this.setupCommentSystem();
        this.setupTextToSpeech();
        this.setupReadingTime();
        this.setupFloatingActions();
    }

    setupTableOfContents() {
        const tocNav = document.querySelector('.toc-nav');
        const headings = document.querySelectorAll('.article-text h2');
        
        if (!tocNav || !headings.length) return;

        // Generate TOC links
        headings.forEach((heading, index) => {
            const id = `section-${index + 1}`;
            heading.id = id;
            
            const link = document.createElement('a');
            link.href = `#${id}`;
            link.className = 'toc-link';
            link.textContent = heading.textContent;
            
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.smoothScrollToSection(id);
            });
            
            tocNav.appendChild(link);
        });

        // Highlight current section on scroll
        this.setupScrollSpy(headings);
    }

    setupScrollSpy(headings) {
        const tocLinks = document.querySelectorAll('.toc-link');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const id = entry.target.id;
                const tocLink = document.querySelector(`a[href="#${id}"]`);
                
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    tocLink?.classList.add('active');
                }
            });
        }, {
            rootMargin: '-20% 0px -80% 0px'
        });

        headings.forEach(heading => observer.observe(heading));
    }

    smoothScrollToSection(id) {
        const element = document.getElementById(id);
        if (element) {
            const headerOffset = 100;
            const elementPosition = element.offsetTop - headerOffset;
            
            window.scrollTo({
                top: elementPosition,
                behavior: 'smooth'
            });
        }
    }

    setupReadingProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'reading-progress';
        progressBar.innerHTML = '<div class="progress-bar"></div>';
        document.body.appendChild(progressBar);

        const progressFill = progressBar.querySelector('.progress-bar');
        
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            const maxHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = (scrolled / maxHeight) * 100;
            
            progressFill.style.width = `${Math.min(progress, 100)}%`;
        });
    }

    setupRatingSystem() {
        const ratingStars = document.querySelectorAll('.rating-star-large');
        const ratingFeedback = document.querySelector('.rating-feedback');
        
        let currentRating = 0;
        
        ratingStars.forEach((star, index) => {
            star.addEventListener('mouseenter', () => {
                this.highlightStars(ratingStars, index + 1);
                this.updateRatingFeedback(ratingFeedback, index + 1);
            });
            
            star.addEventListener('mouseleave', () => {
                this.highlightStars(ratingStars, currentRating);
                this.updateRatingFeedback(ratingFeedback, currentRating);
            });
            
            star.addEventListener('click', () => {
                currentRating = index + 1;
                this.submitRating(currentRating);
            });
        });
    }

    highlightStars(stars, rating) {
        stars.forEach((star, index) => {
            star.classList.toggle('active', index < rating);
        });
    }

    updateRatingFeedback(feedback, rating) {
        const messages = {
            0: 'Califica este artículo',
            1: 'No me gustó',
            2: 'Regular',
            3: 'Bueno',
            4: 'Muy bueno',
            5: 'Excelente'
        };
        
        if (feedback) {
            feedback.textContent = messages[rating] || messages[0];
        }
    }

    async submitRating(rating) {
        try {
            // In production, this would be an API call
            console.log('Rating submitted:', rating);
            
            blogApp.toastSystem.success(`¡Gracias por tu calificación de ${rating} ${rating === 1 ? 'estrella' : 'estrellas'}!`);
            
            // Update UI to show rating was submitted
            const ratingContainer = document.querySelector('.rating-interactive');
            if (ratingContainer) {
                ratingContainer.innerHTML = `
                    <div class="rating-submitted">
                        <i class="fas fa-check-circle"></i>
                        <p>¡Gracias por tu calificación!</p>
                    </div>
                `;
            }
        } catch (error) {
            blogApp.toastSystem.error('Error al enviar la calificación');
        }
    }

    setupCommentSystem() {
        const commentForm = document.querySelector('.comment-form');
        if (!commentForm) return;

        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.submitComment(new FormData(commentForm));
        });

        // Auto-save draft
        this.setupCommentDraftSaving();
    }

    async submitComment(formData) {
        const submitBtn = document.querySelector('.submit-btn');
        const originalContent = submitBtn.innerHTML;
        
        // Show loading state
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            blogApp.toastSystem.success('¡Comentario enviado exitosamente!');
            
            // Reset form
            document.querySelector('.comment-form').reset();
            this.clearCommentDraft();
            
        } catch (error) {
            blogApp.toastSystem.error('Error al enviar el comentario');
        } finally {
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        }
    }

    setupCommentDraftSaving() {
        const commentTextarea = document.querySelector('textarea[name="comment"]');
        if (!commentTextarea) return;

        // Load saved draft
        const savedDraft = localStorage.getItem('comment-draft');
        if (savedDraft) {
            commentTextarea.value = savedDraft;
        }

        // Auto-save every 2 seconds
        let saveTimeout;
        commentTextarea.addEventListener('input', () => {
            clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
                localStorage.setItem('comment-draft', commentTextarea.value);
            }, 2000);
        });
    }

    clearCommentDraft() {
        localStorage.removeItem('comment-draft');
    }

    setupTextToSpeech() {
        const speakBtn = document.querySelector('.speak-btn');
        if (!speakBtn || !('speechSynthesis' in window)) return;

        let isReading = false;
        let currentUtterance = null;

        speakBtn.addEventListener('click', () => {
            if (isReading) {
                speechSynthesis.cancel();
                this.updateSpeakButton(speakBtn, false);
                isReading = false;
            } else {
                this.startReading(speakBtn);
            }
        });
    }

    startReading(button) {
        const articleText = document.querySelector('.article-text');
        if (!articleText) return;

        const text = articleText.textContent;
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            this.updateSpeakButton(button, true);
            isReading = true;
        };
        
        utterance.onend = () => {
            this.updateSpeakButton(button, false);
            isReading = false;
        };

        speechSynthesis.speak(utterance);
        currentUtterance = utterance;
    }

    updateSpeakButton(button, isReading) {
        const icon = button.querySelector('i');
        if (isReading) {
            icon.className = 'fas fa-stop';
            button.title = 'Detener lectura';
        } else {
            icon.className = 'fas fa-volume-up';
            button.title = 'Escuchar artículo';
        }
    }

    setupReadingTime() {
        const articleText = document.querySelector('.article-text');
        const readingTimeEl = document.querySelector('.reading-time');
        
        if (articleText && readingTimeEl) {
            const wordCount = articleText.textContent.trim().split(/\s+/).length;
            const readingTime = Math.ceil(wordCount / 200); // Average reading speed
            readingTimeEl.textContent = `${readingTime} min de lectura`;
        }
    }

    setupFloatingActions() {
        const floatingActions = document.createElement('div');
        floatingActions.className = 'floating-actions';
        floatingActions.innerHTML = `
            <button class="floating-btn scroll-top" title="Volver arriba">
                <i class="fas fa-arrow-up"></i>
            </button>
            <button class="floating-btn toggle-toc" title="Tabla de contenidos">
                <i class="fas fa-list"></i>
            </button>
        `;
        
        document.body.appendChild(floatingActions);
        
        // Scroll to top functionality
        const scrollTopBtn = floatingActions.querySelector('.scroll-top');
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        // Show/hide based on scroll position
        window.addEventListener('scroll', () => {
            const show = window.scrollY > 500;
            floatingActions.classList.toggle('show', show);
        });
        
        // TOC toggle for mobile
        const tocToggle = floatingActions.querySelector('.toggle-toc');
        tocToggle.addEventListener('click', () => {
            const toc = document.querySelector('.table-contents');
            if (toc) {
                toc.classList.toggle('mobile-show');
            }
        });
    }
}

/* ===============================
   NEWSLETTER SYSTEM
   =============================== */

class NewsletterSystem {
    constructor() {
        this.setupNewsletterForms();
    }

    setupNewsletterForms() {
        const forms = document.querySelectorAll('.newsletter-form, .newsletter-form-simple');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitNewsletter(form);
            });
        });
    }

    async submitNewsletter(form) {
        const email = form.querySelector('input[type="email"]').value;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        // Validate email
        if (!this.isValidEmail(email)) {
            blogApp.toastSystem.error('Por favor ingresa un email válido');
            return;
        }

        // Show loading state
        submitBtn.textContent = 'Suscribiendo...';
        submitBtn.disabled = true;

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            blogApp.toastSystem.success('¡Suscripción exitosa! Revisa tu email para confirmar.');
            form.reset();
            
        } catch (error) {
            blogApp.toastSystem.error('Error en la suscripción. Intenta nuevamente.');
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

/* ===============================
   PERFORMANCE & OPTIMIZATION
   =============================== */

class PerformanceOptimizer {
    constructor() {
        this.initializeLazyLoading();
        this.initializeImageOptimization();
        this.initializeScrollOptimization();
    }

    initializeLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    initializeImageOptimization() {
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            img.addEventListener('error', (e) => {
                // Fallback for broken images
                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
            });
        });
    }

    initializeScrollOptimization() {
        // Throttle scroll events
        let scrollTimeout;
        let isScrolling = false;

        const handleScroll = () => {
            if (!isScrolling) {
                window.requestAnimationFrame(() => {
                    // Scroll-based animations and updates go here
                    isScrolling = false;
                });
            }
            isScrolling = true;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
    }
}

/* ===============================
   ACCESSIBILITY ENHANCEMENTS
   =============================== */

class AccessibilityManager {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFocusManagement();
        this.setupScreenReaderSupport();
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // ESC key closes modals
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    blogApp.shareSystem.closeShareModal();
                }
            }

            // Navigate between articles with arrow keys
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                // Implementation for previous/next article navigation
            }
        });
    }

    setupAriaLabels() {
        // Add ARIA labels to interactive elements that don't have them
        const buttons = document.querySelectorAll('button:not([aria-label])');
        buttons.forEach(button => {
            const text = button.textContent.trim() || button.title || 'Button';
            button.setAttribute('aria-label', text);
        });
    }

    setupFocusManagement() {
        // Trap focus in modals
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            this.trapFocus(modal);
        });
    }

    trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        });
    }

    setupScreenReaderSupport() {
        // Announce dynamic content changes
        const announcer = document.createElement('div');
        announcer.className = 'sr-only';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        document.body.appendChild(announcer);

        this.announcer = announcer;
    }

    announce(message) {
        this.announcer.textContent = message;
        setTimeout(() => {
            this.announcer.textContent = '';
        }, 1000);
    }
}

/* ===============================
   MAIN APPLICATION INITIALIZATION
   =============================== */

// Initialize blog application when DOM is loaded
let blogApp;

document.addEventListener('DOMContentLoaded', () => {
    blogApp = new BlogApp();
    
    // Initialize subsystems
    blogApp.themeManager = new ThemeManager();
    blogApp.shareSystem = new ShareSystem();
    blogApp.toastSystem = new ToastSystem();
    blogApp.newsletterSystem = new NewsletterSystem();
    blogApp.performanceOptimizer = new PerformanceOptimizer();
    blogApp.accessibilityManager = new AccessibilityManager();
    
    // Page-specific initialization
    if (blogApp.currentPage === 'article') {
        blogApp.articleManager = new ArticleManager();
    }
    
    if (blogApp.currentPage === 'blog') {
        blogApp.searchSystem = new SearchSystem(blogApp.articles, blogApp.searchIndex);
    }
});

// Extension methods for BlogApp
BlogApp.prototype.initializeThemeToggle = function() {
    // Handled by ThemeManager
};

BlogApp.prototype.initializeScrollEffects = function() {
    // Add scroll-based animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    document.querySelectorAll('[data-aos]').forEach(el => {
        observer.observe(el);
    });
};

BlogApp.prototype.initializeToastSystem = function() {
    // Handled by ToastSystem
};

BlogApp.prototype.initializeShareSystem = function() {
    // Handled by ShareSystem
};

BlogApp.prototype.initializeLazyLoading = function() {
    // Handled by PerformanceOptimizer
};

BlogApp.prototype.initializeKeyboardNavigation = function() {
    // Handled by AccessibilityManager
};

BlogApp.prototype.initializeBlogPage = function() {
    // Blog-specific initialization
    console.log('Blog page initialized');
    
    // Load and render articles
    this.loadAndRenderArticles();
    
    // Initialize blog-specific features
    this.initializeBlogFilters();
    this.initializeBlogSearch();
    this.initializeLoadMore();
};

BlogApp.prototype.loadAndRenderArticles = function() {
    console.log('🔍 Attempting to load articles...');
    console.log('📊 Articles available:', this.articles ? this.articles.length : 'undefined');
    
    // Wait a bit to ensure DOM is fully loaded
    setTimeout(() => {
        const blogGrid = document.getElementById('blogGrid');
        console.log('🎯 BlogGrid element found:', !!blogGrid);
        
        if (!blogGrid) {
            console.error('❌ Blog grid element not found! Looking for element with ID: blogGrid');
            console.log('🔍 Available elements with "blog" in ID:', 
                Array.from(document.querySelectorAll('[id*="blog"]')).map(el => el.id));
            return;
        }

        console.log('📝 Loading articles...', this.articles.length);
        
        if (this.articles && this.articles.length > 0) {
            try {
                const cardsHtml = this.articles.map(article => this.createArticleCard(article)).join('');
                console.log('🎨 Generated HTML length:', cardsHtml.length);
                
                blogGrid.innerHTML = cardsHtml;
                
                // Update article count
                const totalArticlesElement = document.getElementById('totalArticles');
                if (totalArticlesElement) {
                    totalArticlesElement.textContent = this.articles.length;
                }
                
                // Initialize card animations
                this.initializeCardAnimations();
                
                console.log('✅ Articles loaded successfully:', this.articles.length);
            } catch (error) {
                console.error('❌ Error rendering articles:', error);
            }
        } else {
            console.warn('⚠️ No articles found');
            blogGrid.innerHTML = '<div class="no-results">No hay artículos disponibles</div>';
        }
    }, 100);
};

BlogApp.prototype.initializeBlogFilters = function() {
    const filterButtons = document.querySelectorAll('.blog-category-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            e.target.classList.add('active');
            
            const category = e.target.dataset.category;
            this.filterArticlesByCategory(category);
        });
    });
};

BlogApp.prototype.filterArticlesByCategory = function(category) {
    let filteredArticles;
    
    if (category === 'all') {
        filteredArticles = this.articles;
    } else {
        filteredArticles = this.articles.filter(article => 
            article.category.toLowerCase().includes(category.toLowerCase()) ||
            article.tags.some(tag => tag.toLowerCase().includes(category.toLowerCase()))
        );
    }
    
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid) {
        blogGrid.innerHTML = filteredArticles.map(article => this.createArticleCard(article)).join('');
        this.initializeCardAnimations();
    }
};

BlogApp.prototype.initializeBlogSearch = function() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            this.searchArticles(e.target.value);
        });
    }
};

BlogApp.prototype.initializeLoadMore = function() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        // For now, hide it since we're showing all articles
        loadMoreBtn.style.display = 'none';
    }
};

BlogApp.prototype.initializeCardAnimations = function() {
    // Add loading animation to cards
    const cards = document.querySelectorAll('.blog-card');
    cards.forEach((card, index) => {
        card.classList.add('loading');
        setTimeout(() => {
            card.classList.remove('loading');
        }, index * 100 + 200);
    });
};

BlogApp.prototype.initializeArticlePage = function() {
    // Article-specific initialization
    console.log('Article page initialized');
};

BlogApp.prototype.initializeMainPage = function() {
    // Main site initialization
    console.log('Main page initialized');
};

// Emergency fallback function to load articles
function forceLoadArticles() {
    console.log('🚨 Emergency fallback: Force loading articles...');
    
    const articlesData = [
        {
            id: 1,
            title: "Del perro que me ama al vacío que me habita",
            slug: "del-perro-que-me-ama-al-vacio-que-me-habita",
            excerpt: "Un viaje profundo desde la búsqueda del amor hacia la habitación del vacío como gracia. Una reflexión sobre cómo transitamos del amor como necesidad al vacío como libertad.",
            category: "Filosofía",
            author: "Luis Virrueta",
            date: "2025-09-29",
            readTime: "15 min",
            tags: ["amor", "existencial", "filosofía", "vacío", "gracia"],
            rating: 4.9,
            comments: 47,
            views: 1250,
            featured: true,
            image: "del-perro-featured.jpg",
            url: "articulos/2025-09-29-del-perro-que-me-ama-al-vacio-que-me-habita/"
        },
        {
            id: 2,
            title: "La Creencia Raíz: El Origen de Todos los Patrones",
            slug: "la-creencia-raiz-origen-patrones",
            excerpt: "Descubre cómo una sola creencia formada en la infancia puede gobernar toda tu vida adulta y la metodología exacta para identificarla y transformarla.",
            category: "Transformación",
            author: "Luis Virrueta",
            date: "2025-09-25",
            readTime: "12 min",
            tags: ["creencias", "patrones", "infancia", "transformación"],
            rating: 4.8,
            comments: 31,
            views: 890,
            featured: true,
            image: "creencia-raiz.jpg",
            url: "articulos/la-creencia-raiz-origen-patrones/"
        },
        {
            id: 3,
            title: "Casos de Éxito: De la Ansiedad Crónica a la Paz Interior",
            slug: "casos-exito-ansiedad-paz",
            excerpt: "La historia de María, quien después de 15 años de ansiedad, encontró la paz en 3 sesiones al descubrir la creencia que la mantenía prisionera.",
            category: "Casos",
            author: "Luis Virrueta",
            date: "2025-09-20",
            readTime: "10 min",
            tags: ["casos", "ansiedad", "paz", "sanación"],
            rating: 4.7,
            comments: 28,
            views: 675,
            featured: false,
            image: "caso-ansiedad.jpg",
            url: "articulos/casos-exito-ansiedad-paz/"
        },
        {
            id: 4,
            title: "La Técnica del Espejo Invertido: Revolucionando la Terapia",
            slug: "tecnica-espejo-invertido",
            excerpt: "Una técnica innovadora que permite acceder directamente al inconsciente y reprogramar creencias limitantes en tiempo real.",
            category: "Técnicas",
            author: "Luis Virrueta",
            date: "2025-09-15",
            readTime: "18 min",
            tags: ["técnicas", "inconsciente", "reprogramación", "innovación"],
            rating: 4.9,
            comments: 52,
            views: 1180,
            featured: true,
            image: "espejo-invertido.jpg",
            url: "articulos/tecnica-espejo-invertido/"
        },
        {
            id: 5,
            title: "Investigación: El Impacto Neurológico de las Creencias",
            slug: "investigacion-impacto-neurologico-creencias",
            excerpt: "Nuevos hallazgos científicos demuestran cómo las creencias modifican físicamente la estructura cerebral y cómo podemos usar esto para la sanación.",
            category: "Investigación",
            author: "Luis Virrueta",
            date: "2025-09-10",
            readTime: "22 min",
            tags: ["neurociencia", "investigación", "cerebro", "ciencia"],
            rating: 4.8,
            comments: 19,
            views: 542,
            featured: false,
            image: "neurociencia-creencias.jpg",
            url: "articulos/investigacion-impacto-neurologico-creencias/"
        },
        {
            id: 6,
            title: "El Mito del Amor Propio: Por Qué No Funciona",
            slug: "mito-amor-propio-no-funciona",
            excerpt: "Análisis profundo de por qué el concepto moderno de 'amor propio' mantiene a las personas atrapadas en ciclos de autojuicio y la alternativa liberadora.",
            category: "Filosofía",
            author: "Luis Virrueta", 
            date: "2025-09-05",
            readTime: "14 min",
            tags: ["amor propio", "autoestima", "liberación", "mitos"],
            rating: 4.6,
            comments: 34,
            views: 720,
            featured: false,
            image: "mito-amor-propio.jpg",
            url: "articulos/mito-amor-propio-no-funciona/"
        }
    ];

    const blogGrid = document.getElementById('blogGrid');
    if (!blogGrid) {
        console.error('❌ Blog grid not found even in fallback!');
        return;
    }

    function createSimpleCard(article) {
        const featuredClass = article.featured ? 'featured-article' : '';
        const placeholderGradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
        ];
        const gradient = placeholderGradients[article.id % placeholderGradients.length];
        
        return `
            <article class="blog-card ${featuredClass}">
                <div class="card-image-container">
                    <div class="card-placeholder" style="background: ${gradient}">
                        <div class="placeholder-content">
                            <i class="fas fa-brain"></i>
                            <span>${article.category}</span>
                        </div>
                    </div>
                    
                    <div class="card-overlay">
                        <div class="card-badges">
                            ${article.featured ? '<span class="featured-badge"><i class="fas fa-star"></i> Destacado</span>' : ''}
                            <span class="category-badge ${article.category.toLowerCase()}">${article.category}</span>
                        </div>
                    </div>
                </div>
                
                <div class="card-content">
                    <div class="card-meta-header">
                        <div class="author-info">
                            <div class="avatar-placeholder">LV</div>
                            <div class="author-details">
                                <div class="author-name">${article.author}</div>
                                <div class="publish-date">${article.date}</div>
                            </div>
                        </div>
                        <div class="read-time">
                            <i class="fas fa-clock"></i>
                            ${article.readTime}
                        </div>
                    </div>
                    
                    <h2 class="card-title">
                        <a href="${article.url}" class="card-link">${article.title}</a>
                    </h2>
                    
                    <p class="card-excerpt">${article.excerpt}</p>
                    
                    <div class="card-footer">
                        <div class="card-engagement">
                            <span class="engagement-item">
                                <i class="fas fa-eye"></i>
                                ${article.views}
                            </span>
                            <span class="engagement-item">
                                <i class="fas fa-comments"></i>
                                ${article.comments}
                            </span>
                            <span class="engagement-item">
                                <i class="fas fa-star"></i>
                                ${article.rating}
                            </span>
                        </div>
                        
                        <a href="${article.url}" class="read-more-btn">
                            Leer más
                            <i class="fas fa-arrow-right"></i>
                        </a>
                    </div>
                </div>
            </article>
        `;
    }

    try {
        const html = articlesData.map(article => createSimpleCard(article)).join('');
        blogGrid.innerHTML = html;
        
        // Update counter
        const counter = document.getElementById('totalArticles');
        if (counter) counter.textContent = articlesData.length;
        
        console.log('✅ Fallback articles loaded successfully!');
    } catch (error) {
        console.error('❌ Fallback failed:', error);
        blogGrid.innerHTML = '<p style="text-align: center; padding: 2rem;">Error cargando artículos</p>';
    }
}

// Auto-trigger fallback after a delay
setTimeout(() => {
    const blogGrid = document.getElementById('blogGrid');
    if (blogGrid && (!blogGrid.innerHTML || blogGrid.innerHTML.trim() === '')) {
        console.log('🔄 No articles detected, triggering fallback...');
        forceLoadArticles();
    }
}, 2000);

// Immediate check for blog page
if (window.location.pathname.includes('blog')) {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const blogGrid = document.getElementById('blogGrid');
            if (blogGrid && (!blogGrid.innerHTML || blogGrid.innerHTML.trim() === '')) {
                console.log('🚨 Immediate fallback triggered');
                forceLoadArticles();
            }
        }, 500);
    });
}
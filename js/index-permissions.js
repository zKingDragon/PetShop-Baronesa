/**
 * Index Permission System for Pet Shop Baronesa
 * Manages homepage content visibility based on user authentication and roles
 * This includes promotional sections, special offers, and user-specific content
 */

class IndexPermissionManager {
    constructor() {
        this.currentUser = null;
        this.userRole = 'guest'; // guest, user, admin
        this.isInitialized = false;
        
        // Elements that require permission checks
        this.permissionElements = {
            // Add promotional sections that may require user login
            promotionalBanners: '.promotional-banner',
            userOnlyContent: '.user-only-content',
            adminOnlyContent: '.admin-only-content',
            guestOnlyContent: '.guest-only-content'
        };
        
        this.init();
    }

    /**
     * Initialize the index permission manager
     */
    async init() {
        try {
            this.setupEventListeners();
            await this.checkAuthenticationState();
            this.updatePageContent();
            this.isInitialized = true;
            console.log('Index permission manager initialized');
        } catch (error) {
            console.error('Error initializing index permission manager:', error);
        }
    }

    /**
     * Setup event listeners for auth state changes
     */
    setupEventListeners() {
        // Listen for authentication state changes
        if (window.firebase && window.firebase.auth) {
            window.firebase.auth().onAuthStateChanged(async (user) => {
                await this.handleAuthStateChange(user);
            });
        }

        // Listen for custom auth events
        document.addEventListener('authStateChanged', async (event) => {
            await this.handleAuthStateChange(event.detail.user);
        });

        // Listen for permission changes
        document.addEventListener('userRoleChanged', async (event) => {
            this.userRole = event.detail.role;
            this.updatePageContent();
        });
    }

    /**
     * Check current authentication state
     */
    async checkAuthenticationState() {
        try {
            // Wait for auth system to be available
            if (typeof window.auth === 'undefined') {
                setTimeout(() => this.checkAuthenticationState(), 100);
                return;
            }

            // Check using global auth system
            const currentUser = window.auth?.getCurrentUser();
            if (currentUser) {
                await this.handleAuthStateChange(currentUser);
                return;
            }

            // No authenticated user
            await this.handleAuthStateChange(null);
        } catch (error) {
            console.error('Error checking authentication state:', error);
            await this.handleAuthStateChange(null);
        }
    }

    /**
     * Handle authentication state changes
     * @param {Object|null} user - User object or null
     */
    async handleAuthStateChange(user) {
        this.currentUser = user;
        
        if (user) {
            // User is logged in - get role from database
            this.userRole = await this.determineUserRole(user);
            console.log('User role determined:', this.userRole);
        } else {
            // User is not logged in
            this.userRole = 'guest';
        }

        this.updatePageContent();
    }

    /**
     * Determine user role based on user data (using database)
     * @param {Object} user - User object
     * @returns {Promise<string>} - User role (guest, user, admin)
     */
    async determineUserRole(user) {
        if (!user) return 'guest';
        
        try {
            // Use the global auth system to check user type
            if (typeof window.auth !== 'undefined' && window.auth.checkUserType) {
                const userType = await window.auth.checkUserType(user.uid);
                return userType === 'admin' ? 'admin' : 'user';
            }

            // Fallback to getCurrentUserType if available
            if (typeof window.auth !== 'undefined' && window.auth.getCurrentUserType) {
                const userType = await window.auth.getCurrentUserType();
                return userType === 'admin' ? 'admin' : 'user';
            }

            console.warn('Auth system not available, defaulting to user role');
            return 'user';
        } catch (error) {
            console.error('Error determining user role:', error);
            return 'user';
        }
    }

    /**
     * Update page content based on user role
     */
    updatePageContent() {
        // Hide all permission-based elements first
        this.hideAllPermissionElements();

        // Show elements based on current role
        switch (this.userRole) {
            case 'guest':
                this.showElements('.guest-only');
                this.showGuestContent();
                break;
            case 'user':
                this.showElements('.user-only');
                this.showUserContent();
                break;
            case 'admin':
                this.showElements('.user-only');
                this.showElements('.admin-only');
                this.showAdminContent();
                break;
        }

        // Update promotional sections
        this.updatePromotionalSections();
    }

    /**
     * Hide all permission-based elements
     */
    hideAllPermissionElements() {
        const elements = document.querySelectorAll('.guest-only, .user-only, .admin-only');
        elements.forEach(element => {
            element.style.display = 'none';
        });
    }

    /**
     * Show elements with specific class
     * @param {string} selector - CSS selector for elements to show
     */
    showElements(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            element.style.display = '';
        });
    }

    /**
     * Show guest-specific content
     */
    showGuestContent() {
        // Add guest-specific promotional content
        this.addGuestPromotions();
    }

    /**
     * Show user-specific content
     */
    showUserContent() {
        // Add user-specific promotional content
        this.addUserPromotions();
        
        // Show personalized greetings
        this.showPersonalizedGreeting();
    }

    /**
     * Show admin-specific content
     */
    showAdminContent() {
        // Add admin-specific content
        this.addAdminIndicators();
        
        // Show admin quick actions
        this.showAdminQuickActions();
    }

    /**
     * Add guest-specific promotions
     */
    addGuestPromotions() {
        // Add call-to-action for registration
        const ctaElement = document.getElementById('guest-cta');
        if (ctaElement) {
            ctaElement.innerHTML = `
                <div class="guest-promotion">
                    <h3>🎉 Cadastre-se e ganhe 10% de desconto!</h3>
                    <p>Crie sua conta e aproveite ofertas exclusivas para membros</p>
                    <a href="html/cadastro.html" class="btn btn-primary">Cadastrar-se</a>
                </div>
            `;
            ctaElement.style.display = 'block';
        }
    }

    /**
     * Add user-specific promotions
     */
    addUserPromotions() {
        // Add personalized promotions for logged-in users
        const userPromotions = document.getElementById('user-promotions');
        if (userPromotions) {
            userPromotions.innerHTML = `
                <div class="user-promotion">
                    <h3>🌟 Oferta Especial para Você!</h3>
                    <p>Aproveite descontos exclusivos em produtos selecionados</p>
                    <a href="html/promocoes.html" class="btn btn-secondary">Ver Promoções</a>
                </div>
            `;
            userPromotions.style.display = 'block';
        }
    }

    /**
     * Show personalized greeting
     */
    showPersonalizedGreeting() {
        if (!this.currentUser) return;
        
        const greetingElement = document.getElementById('personalized-greeting');
        if (greetingElement) {
            const displayName = this.currentUser.displayName || 
                             this.currentUser.email?.split('@')[0] || 
                             'Usuário';
            
            greetingElement.innerHTML = `
                <div class="personalized-greeting">
                    <h3>Olá, ${displayName}! 👋</h3>
                    <p>Bem-vindo(a) de volta ao Pet Shop Baronesa</p>
                </div>
            `;
            greetingElement.style.display = 'block';
        }
    }

    /**
     * Add admin indicators
     */
    addAdminIndicators() {
        // Add admin badge to navigation or header
        const adminBadge = document.getElementById('admin-badge');
        if (adminBadge) {
            adminBadge.innerHTML = `
                <div class="admin-badge">
                    <i class="fas fa-crown"></i>
                    <span>Administrador</span>
                </div>
            `;
            adminBadge.style.display = 'block';
        }
    }

    /**
     * Show admin quick actions
     */
    showAdminQuickActions() {
        const adminActions = document.getElementById('admin-quick-actions');
        if (adminActions) {
            adminActions.innerHTML = `
                <div class="admin-quick-actions">
                    <h3>Ações Rápidas</h3>
                    <div class="admin-action-buttons">
                        <a href="html/admin.html" class="btn btn-admin">
                            <i class="fas fa-cog"></i> Painel Admin
                        </a>
                        <a href="html/admin.html#produtos" class="btn btn-admin">
                            <i class="fas fa-plus"></i> Adicionar Produto
                        </a>
                        <a href="html/admin.html#usuarios" class="btn btn-admin">
                            <i class="fas fa-users"></i> Gerenciar Usuários
                        </a>
                    </div>
                </div>
            `;
            adminActions.style.display = 'block';
        }
    }

    /**
     * Update promotional sections based on user role
     */
    updatePromotionalSections() {
        // Update carousel slides based on user role
        const carousel = document.getElementById('mainCarousel');
        if (carousel) {
            const slides = carousel.querySelectorAll('.carousel-slide');
            slides.forEach(slide => {
                const caption = slide.querySelector('.carousel-caption .caption-box h2');
                if (caption && this.userRole === 'user') {
                    // Add personalized call-to-action for logged-in users
                    caption.innerHTML += ' <small style="display: block; font-size: 0.8em; margin-top: 5px;">Especial para você!</small>';
                }
            });
        }

        // Update category cards for different user roles
        this.updateCategoryCards();
    }

    /**
     * Update category cards based on user role
     */
    updateCategoryCards() {
        const categoryCards = document.querySelectorAll('.category-card');
        categoryCards.forEach(card => {
            if (this.userRole === 'admin') {
                // Add admin edit buttons to category cards
                const editBtn = document.createElement('button');
                editBtn.className = 'admin-edit-btn';
                editBtn.innerHTML = '<i class="fas fa-edit"></i>';
                editBtn.onclick = () => this.editCategory(card);
                card.appendChild(editBtn);
            } else {
                // Remove admin edit buttons if not admin
                const editBtn = card.querySelector('.admin-edit-btn');
                if (editBtn) {
                    editBtn.remove();
                }
            }
        });
    }

    /**
     * Edit category (admin only)
     * @param {Element} categoryCard - Category card element
     */
    editCategory(categoryCard) {
        if (this.userRole !== 'admin') return;
        
        // Navigate to admin panel for category editing
        window.location.href = 'html/admin.html#categorias';
    }

    /**
     * Check if user has specific permission
     * @param {string} permission - Permission to check (guest, user, admin)
     * @returns {Promise<boolean>} - Whether user has permission
     */
    async hasPermission(permission) {
        // Ensure we have the latest user role
        if (this.currentUser) {
            this.userRole = await this.determineUserRole(this.currentUser);
        }
        
        switch (permission) {
            case 'guest':
                return this.userRole === 'guest';
            case 'user':
                return this.userRole === 'user' || this.userRole === 'admin';
            case 'admin':
                return this.userRole === 'admin';
            default:
                return false;
        }
    }

    /**
     * Get current user role
     * @returns {string} - Current user role
     */
    getCurrentUserRole() {
        return this.userRole;
    }

    /**
     * Check if current user is admin
     * @returns {Promise<boolean>} - True if admin
     */
    async isAdmin() {
        return await this.hasPermission('admin');
    }

    /**
     * Check if current user is logged in
     * @returns {boolean} - True if logged in
     */
    isLoggedIn() {
        return this.userRole !== 'guest';
    }

    /**
     * Get user type from database
     * @returns {Promise<string>} - User type
     */
    async getUserType() {
        if (!this.currentUser) return 'guest';
        
        try {
            if (typeof window.auth !== 'undefined' && window.auth.checkUserType) {
                return await window.auth.checkUserType(this.currentUser.uid);
            }
            return 'user';
        } catch (error) {
            console.error('Error getting user type:', error);
            return 'user';
        }
    }

    /**
     * Force refresh of user permissions
     */
    async refreshPermissions() {
        await this.checkAuthenticationState();
    }
}

// Initialize index permission manager when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize on homepage
    if (window.location.pathname === '/' || 
        window.location.pathname.endsWith('/index.html') ||
        window.location.pathname.endsWith('/')) {
        
        window.indexPermissionManager = new IndexPermissionManager();
        
        // Wait for auth system to be available
        let retryCount = 0;
        const maxRetries = 50; // 5 seconds max wait
        
        const waitForAuth = async () => {
            if (typeof window.auth !== 'undefined' || retryCount >= maxRetries) {
                if (window.indexPermissionManager) {
                    await window.indexPermissionManager.init();
                }
                return;
            }
            
            retryCount++;
            setTimeout(waitForAuth, 100);
        };
        
        await waitForAuth();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IndexPermissionManager;
}

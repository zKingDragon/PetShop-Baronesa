// Admin Filter Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    initFilterToggle();
    initMobileFilterToggle();
    initAdminFilters();
});

function initAdminFilters() {
    // Inicializar filtros de produtos
    initProductFilters();
    

    
    // Inicializar botões de limpar filtros
    initClearFiltersButtons();
}

function initProductFilters() {
    const searchInput = document.getElementById('adminSearchInput');
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const promocionalFilters = document.querySelectorAll('input[name="promocional"]');
    const priceFilters = document.querySelectorAll('input[name="priceRanges"]');
    const typeFilters = document.querySelectorAll('input[name="type"]');
    
    // Previne submissão de qualquer formulário que contenha os filtros
    const filterContainer = document.querySelector('.admin-sidebar');
    if (filterContainer) {
        filterContainer.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('⚠️ Submissão de formulário bloqueada nos filtros');
            return false;
        });
        
        // Adiciona listener de keydown no container para capturar qualquer Enter
        filterContainer.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
                e.preventDefault();
                console.log('⚠️ Enter bloqueado no campo:', e.target.id || e.target.name);
                return false;
            }
        });
    }
    
    // Event listeners para busca
    if (searchInput) {
        // Previne submissão do formulário ao pressionar Enter
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                console.log('⚠️ Enter bloqueado no campo de busca');
                return false;
            }
        });
        
        // Filtro em tempo real enquanto digita
        searchInput.addEventListener('input', debounce(filterProducts, 300));
    }
    
    // Event listeners para checkboxes
    [...categoryFilters, ...promocionalFilters, ...priceFilters, ...typeFilters].forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });
}


function initClearFiltersButtons() {
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearProductFilters);
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('adminSearchInput')?.value.toLowerCase() || '';
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map(cb => cb.value);
    const showPromocional = document.querySelector('input[name="promocional"]:checked');
    const selectedPrices = Array.from(document.querySelectorAll('input[name="priceRanges"]:checked')).map(cb => cb.value);
    const selectedTypes = Array.from(document.querySelectorAll('input[name="type"]:checked')).map(cb => cb.value);
    
    // Aqui você pode chamar a função de filtro dos produtos
    // Esta função deve estar definida no admin.js
    if (window.applyProductFilters) {
        window.applyProductFilters({
            search: searchTerm,
            categories: selectedCategories,
            promocional: showPromocional ? true : false,
            priceRanges: selectedPrices,
            types: selectedTypes
        });
    }
}


function clearProductFilters() {
    // Limpar campo de busca
    const searchInput = document.getElementById('adminSearchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Desmarcar todos os checkboxes
    const allFilters = document.querySelectorAll('input[name="category"], input[name="promocional"], input[name="priceRanges"], input[name="type"]');
    allFilters.forEach(filter => {
        filter.checked = false;
    });
    
    // Aplicar filtros (que agora estarão vazios)
    filterProducts();
}


// Função utilitária para debounce
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function initFilterToggle() {
    // Desktop filter collapse buttons
    const filterCollapseBtn = document.getElementById('filterCollapseBtn');
    const filterContent = document.getElementById('filterContent');
    
    // Desktop collapse functionality for products
    if (filterCollapseBtn && filterContent) {
        filterCollapseBtn.addEventListener('click', function() {
            toggleFilterContent(filterContent, filterCollapseBtn, 'productsFiltersExpanded');
        });
    }
    
    // Initialize filter states
    initFilterStates();
}

function toggleFilterContent(filterContent, button, storageKey) {
    const isCollapsed = filterContent.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Show filters
        filterContent.classList.remove('collapsed');
        button.classList.remove('collapsed');
        button.setAttribute('aria-expanded', 'true');
        
        // Save state
        localStorage.setItem(storageKey, 'true');
    } else {
        // Hide filters
        filterContent.classList.add('collapsed');
        button.classList.add('collapsed');
        button.setAttribute('aria-expanded', 'false');
        
        // Save state
        localStorage.setItem(storageKey, 'false');
    }
}

function initFilterStates() {
    const productsFiltersExpanded = localStorage.getItem('productsFiltersExpanded');
    
    const filterContent = document.getElementById('filterContent');
    const filterCollapseBtn = document.getElementById('filterCollapseBtn');
    
    // Set initial state for products filters
    const shouldExpandProducts = productsFiltersExpanded !== 'false';
    if (filterContent && filterCollapseBtn) {
        if (!shouldExpandProducts) {
            filterContent.classList.add('collapsed');
            filterCollapseBtn.classList.add('collapsed');
            filterCollapseBtn.setAttribute('aria-expanded', 'false');
        } else {
            filterCollapseBtn.setAttribute('aria-expanded', 'true');
        }
    }
}

// Utility function to handle responsive behavior
function handleResponsiveFilters() {
    const isMobile = window.innerWidth <= 1023;
    const adminSidebars = document.querySelectorAll('.admin-sidebar');
    const filterToggleContainer = document.querySelector('.admin-filter-mobile-toggle');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    
    console.log(`📱 Ajustando responsividade ADMIN - Mobile: ${isMobile}, Sidebars: ${adminSidebars.length}`);
    
    adminSidebars.forEach((sidebar, index) => {
        if (isMobile) {
            // Mobile: ocultar por padrão, menos se estiver ativo
            if (!sidebar.classList.contains('active')) {
                sidebar.style.display = 'none';
            } else {
                sidebar.style.display = 'block';
            }
            sidebar.style.position = 'static';
            sidebar.style.maxHeight = 'none';
        } else {
            // Desktop: sempre visível
            sidebar.style.display = 'block';
            sidebar.classList.remove('active');
            sidebar.style.position = 'sticky';
            sidebar.style.maxHeight = 'calc(100vh - 4rem)';
        }
    });
    
    // Mostrar/ocultar botão de toggle baseado no tamanho da tela
    if (filterToggleContainer) {
        filterToggleContainer.style.display = isMobile ? 'block' : 'none';
    }
    
    // Resetar estado do botão se necessário
    if (filterToggleBtn && !isMobile) {
        filterToggleBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros';
        filterToggleBtn.setAttribute('aria-expanded', 'false');
    }
}

// Handle window resize for responsive behavior

// Initialize responsive behavior
document.addEventListener('DOMContentLoaded', handleResponsiveFilters);
    

// Handle window resize to manage mobile/desktop states
window.addEventListener('resize', debounce(function() {
    console.log('📱 Redimensionamento detectado - Nova largura:', window.innerWidth);
    
    const isMobile = window.innerWidth <= 1023;
    const adminSidebars = document.querySelectorAll('.admin-sidebar');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    
    if (!isMobile) {
        // Reset mobile states when switching to desktop
        adminSidebars.forEach(sidebar => {
            sidebar.classList.remove('active');
            sidebar.style.display = 'block';
        });
        
        if (filterToggleBtn) {
            filterToggleBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros';
            filterToggleBtn.setAttribute('aria-expanded', 'false');
        }
    } else {
        // Mobile mode - ocultar sidebars não ativas
        adminSidebars.forEach(sidebar => {
            if (!sidebar.classList.contains('active')) {
                sidebar.style.display = 'none';
            }
        });
    }
    
    // Aplicar comportamento responsivo
    handleResponsiveFilters();
}, 250));

function initMobileFilterToggle() {
    console.log('📱 Configurando toggle de filtros ADMIN mobile...');
    
    // Mobile filter toggle for products
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const adminSidebar = document.querySelector('.admin-layout .admin-sidebar') || 
                        document.querySelector('.admin-sidebar') ||
                        document.querySelector('[class*="sidebar"]');
    
    console.log('🔍 Elementos ADMIN encontrados:', {
        filterToggleBtn: !!filterToggleBtn,
        adminSidebar: !!adminSidebar,
        sidebarClass: adminSidebar?.className || 'não encontrado'
    });
    
    if (filterToggleBtn && adminSidebar) {
        setupFilterToggle(filterToggleBtn, adminSidebar, 'produtos');
    } else {
        console.warn('⚠️ Elementos para toggle filtros ADMIN (produtos) não encontrados');
        if (!filterToggleBtn) {
            createAdminFilterButton();
        }
    }
    
    // Mobile filter toggle for tips (dicas)
    const tipsFilterToggleBtn = document.getElementById('tipsFilterToggleBtn');
    const tipsAdminSidebar = document.querySelectorAll('.admin-sidebar')[1];
    
    console.log('🔍 Elementos DICAS encontrados:', {
        tipsFilterToggleBtn: !!tipsFilterToggleBtn,
        tipsAdminSidebar: !!tipsAdminSidebar
    });
    
    if (tipsFilterToggleBtn && tipsAdminSidebar) {
        setupFilterToggle(tipsFilterToggleBtn, tipsAdminSidebar, 'dicas');
    }
}

/**
 * Configura um botão de toggle para uma sidebar específica
 */
function setupFilterToggle(toggleBtn, sidebar, type) {
    // Remover listener existente para evitar duplicatas
    const newBtn = toggleBtn.cloneNode(true);
    toggleBtn.parentNode.replaceChild(newBtn, toggleBtn);
    
    // Configurar estado inicial
    const isMobile = window.innerWidth <= 1023;
    if (isMobile) {
        sidebar.style.display = 'none';
        sidebar.classList.remove('active');
    }
    
    newBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        console.log(`📱 Toggle filtros ${type.toUpperCase()} clicado`);
        
        const isActive = sidebar.classList.contains('active');
        console.log(`Estado atual ${type} (ativo):`, isActive);
        
        if (isActive) {
            // Ocultar filtros
            sidebar.classList.remove('active');
            sidebar.style.display = 'none';
            newBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros';
            newBtn.setAttribute('aria-expanded', 'false');
            console.log(`📱 Filtros ${type.toUpperCase()} ocultados`);
        } else {
            // Mostrar filtros
            sidebar.classList.add('active');
            sidebar.style.display = 'block';
            newBtn.innerHTML = '<i class="fas fa-times"></i> Fechar Filtros';
            newBtn.setAttribute('aria-expanded', 'true');
            console.log(`📱 Filtros ${type.toUpperCase()} exibidos`);
            
            // Scroll suave para os filtros
            setTimeout(() => {
                sidebar.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }, 100);
        }
    });
    
    console.log(`✅ Toggle filtros ${type.toUpperCase()} configurado com sucesso`);
}

/**
 * Cria o botão de filtro admin se não existir
 */
function createAdminFilterButton() {
    console.log('🔧 Criando botão de filtro ADMIN...');
    
    const adminLayout = document.querySelector('.admin-layout') || 
                       document.querySelector('.admin-content') ||
                       document.querySelector('main .container');
    
    if (!adminLayout) {
        console.error('❌ Layout admin não encontrado para criar botão');
        return;
    }
    
    // Verificar se já existe um container de toggle
    let filterToggleContainer = document.querySelector('.admin-filter-mobile-toggle');
    
    if (!filterToggleContainer) {
        // Criar container do botão
        filterToggleContainer = document.createElement('div');
        filterToggleContainer.className = 'admin-filter-mobile-toggle';
        filterToggleContainer.style.cssText = `
            display: none;
            margin-bottom: 1rem;
            width: 100%;
        `;
        
        // Criar botão
        const filterBtn = document.createElement('button');
        filterBtn.id = 'filterToggleBtn';
        filterBtn.className = 'btn-secondary';
        filterBtn.style.cssText = `
            width: 100%;
            padding: 0.75rem 1rem;
            background-color: var(--emerald-green);
            color: white;
            border: none;
            border-radius: var(--border-radius);
            font-size: 1rem;
            cursor: pointer;
            transition: background-color 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
        `;
        filterBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros';
        filterBtn.setAttribute('aria-expanded', 'false');
        
        filterToggleContainer.appendChild(filterBtn);
        
        // Inserir no início do container
        adminLayout.insertBefore(filterToggleContainer, adminLayout.firstChild);
        
        console.log('✅ Botão de filtro ADMIN criado');
        
        // Reconfigurar após criação
        setTimeout(() => {
            initMobileFilterToggle();
        }, 100);
    }
}

/**
 * Função de debug para diagnosticar problemas com filtros admin
 */
const adminFiltersDebug = {
    checkElements() {
        console.log('🔧 === DEBUG FILTROS ADMIN ===');
        
        const filterToggleBtn = document.getElementById('filterToggleBtn');
        const adminSidebars = document.querySelectorAll('.admin-sidebar');
        const adminLayout = document.querySelector('.admin-layout');
        const filterToggleContainer = document.querySelector('.admin-filter-mobile-toggle');
        
        console.log('📋 Elementos encontrados:', {
            filterToggleBtn: !!filterToggleBtn,
            adminSidebars: adminSidebars.length,
            adminLayout: !!adminLayout,
            filterToggleContainer: !!filterToggleContainer,
            screenWidth: window.innerWidth,
            isMobile: window.innerWidth <= 1023
        });
        
        if (filterToggleBtn) {
console.log('🔘 Botão de filtro:', {
    display: window.getComputedStyle(filterToggleBtn).display,
    visibility: window.getComputedStyle(filterToggleBtn).visibility,
    innerHTML: filterToggleBtn.innerHTML,
    ariaExpanded: filterToggleBtn.getAttribute('aria-expanded')
});
        }
        
        adminSidebars.forEach((sidebar, index) => {
            console.log(`📋 Sidebar ${index}:`, {
                display: window.getComputedStyle(sidebar).display,
                visibility: window.getComputedStyle(sidebar).visibility,
                hasActiveClass: sidebar.classList.contains('active'),
                classes: sidebar.className
            });
        });
        
        return {
            filterToggleBtn,
            adminSidebars,
            adminLayout,
            filterToggleContainer
        };
    },
    
    forceShow() {
        console.log('🔧 Forçando exibição dos filtros...');
        const sidebar = document.querySelector('.admin-sidebar');
        if (sidebar) {
            sidebar.style.display = 'block';
            sidebar.classList.add('active');
            console.log('✅ Sidebar forçada a aparecer');
        }
    },
    
    testToggle() {
        console.log('🔧 Testando toggle...');
        const btn = document.getElementById('filterToggleBtn');
        if (btn) {
            btn.click();
            console.log('✅ Clique simulado');
        } else {
            console.error('❌ Botão não encontrado para teste');
        }
    }
};

// Disponibilizar debug globalmente
window.adminFiltersDebug = adminFiltersDebug;

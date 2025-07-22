// Admin Filter Toggle Functionality
document.addEventListener('DOMContentLoaded', function() {
    initFilterToggle();
    initMobileFilterToggle();
    initAdminFilters();
});

function initAdminFilters() {
    // Inicializar filtros de produtos
    initProductFilters();

    // Inicializar filtros de dicas
    initTipFilters();

    // Inicializar botões de limpar filtros
    initClearFiltersButtons();
}

function initProductFilters() {
    const searchInput = document.getElementById('adminSearchInput');
    const categoryFilters = document.querySelectorAll('input[name="category"]');
    const promocionalFilters = document.querySelectorAll('input[name="promocional"]');
    const priceFilters = document.querySelectorAll('input[name="priceRanges"]');
    const typeFilters = document.querySelectorAll('input[name="type"]');

    // Event listeners para busca
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterProducts, 300));
    }

    // Event listeners para checkboxes
    [...categoryFilters, ...promocionalFilters, ...priceFilters, ...typeFilters].forEach(filter => {
        filter.addEventListener('change', filterProducts);
    });
}

function initTipFilters() {
    const tipsSearchInput = document.getElementById('tipsSearchInput');
    const tipCategoryFilters = document.querySelectorAll('input[name="tipCategory"]');
    const tipStatusFilters = document.querySelectorAll('input[name="tipStatus"]');
    const tipDateFilters = document.querySelectorAll('input[name="tipDate"]');

    // Event listeners para busca
    if (tipsSearchInput) {
        tipsSearchInput.addEventListener('input', debounce(filterTips, 300));
    }

    // Event listeners para checkboxes
    [...tipCategoryFilters, ...tipStatusFilters, ...tipDateFilters].forEach(filter => {
        filter.addEventListener('change', filterTips);
    });
}

function initClearFiltersButtons() {
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');
    const clearTipsFiltersBtn = document.getElementById('clearTipsFiltersBtn');

    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearProductFilters);
    }

    if (clearTipsFiltersBtn) {
        clearTipsFiltersBtn.addEventListener('click', clearTipFilters);
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

function filterTips() {
    const searchTerm = document.getElementById('tipsSearchInput')?.value.toLowerCase() || '';
    const selectedCategories = Array.from(document.querySelectorAll('input[name="tipCategory"]:checked')).map(cb => cb.value);
    const selectedStatuses = Array.from(document.querySelectorAll('input[name="tipStatus"]:checked')).map(cb => cb.value);
    const selectedDates = Array.from(document.querySelectorAll('input[name="tipDate"]:checked')).map(cb => cb.value);

    // Aqui você pode chamar a função de filtro das dicas
    // Esta função deve estar definida no admin.js
    if (window.applyTipFilters) {
        window.applyTipFilters({
            search: searchTerm,
            categories: selectedCategories,
            statuses: selectedStatuses,
            dates: selectedDates
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

function clearTipFilters() {
    // Limpar campo de busca
    const tipsSearchInput = document.getElementById('tipsSearchInput');
    if (tipsSearchInput) {
        tipsSearchInput.value = '';
    }

    // Desmarcar todos os checkboxes
    const allFilters = document.querySelectorAll('input[name="tipCategory"], input[name="tipStatus"], input[name="tipDate"]');
    allFilters.forEach(filter => {
        filter.checked = false;
    });

    // Aplicar filtros (que agora estarão vazios)
    filterTips();
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
    const tipsFilterCollapseBtn = document.getElementById('tipsFilterCollapseBtn');
    const filterContent = document.getElementById('filterContent');
    const tipsFilterContent = document.getElementById('tipsFilterContent');

    // Desktop collapse functionality for products
    if (filterCollapseBtn && filterContent) {
        filterCollapseBtn.addEventListener('click', function() {
            toggleFilterContent(filterContent, filterCollapseBtn, 'productsFiltersExpanded');
        });
    }

    // Desktop collapse functionality for tips
    if (tipsFilterCollapseBtn && tipsFilterContent) {
        tipsFilterCollapseBtn.addEventListener('click', function() {
            toggleFilterContent(tipsFilterContent, tipsFilterCollapseBtn, 'tipsFiltersExpanded');
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
    const tipsFiltersExpanded = localStorage.getItem('tipsFiltersExpanded');

    const filterContent = document.getElementById('filterContent');
    const tipsFilterContent = document.getElementById('tipsFilterContent');
    const filterCollapseBtn = document.getElementById('filterCollapseBtn');
    const tipsFilterCollapseBtn = document.getElementById('tipsFilterCollapseBtn');

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

    // Set initial state for tips filters
    const shouldExpandTips = tipsFiltersExpanded !== 'false';
    if (tipsFilterContent && tipsFilterCollapseBtn) {
        if (!shouldExpandTips) {
            tipsFilterContent.classList.add('collapsed');
            tipsFilterCollapseBtn.classList.add('collapsed');
            tipsFilterCollapseBtn.setAttribute('aria-expanded', 'false');
        } else {
            tipsFilterCollapseBtn.setAttribute('aria-expanded', 'true');
        }
    }
}

// Utility function to handle responsive behavior
function handleResponsiveFilters() {
    const isMobile = window.innerWidth <= 1023;
    const adminSidebars = document.querySelectorAll('.admin-sidebar');

    adminSidebars.forEach(sidebar => {
        if (isMobile) {
            sidebar.style.position = 'static';
            sidebar.style.maxHeight = 'none';
        } else {
            sidebar.style.position = 'sticky';
            sidebar.style.maxHeight = 'calc(100vh - 4rem)';
        }
    });
}

// Handle window resize for responsive behavior
window.addEventListener('resize', handleResponsiveFilters);

// Initialize responsive behavior
document.addEventListener('DOMContentLoaded', handleResponsiveFilters);


// Handle window resize to manage mobile/desktop states
window.addEventListener('resize', function() {
    const isMobile = window.innerWidth <= 1023;
    const adminSidebars = document.querySelectorAll('.admin-sidebar');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const tipsFilterToggleBtn = document.getElementById('tipsFilterToggleBtn');

    if (!isMobile) {
        // Reset mobile states when switching to desktop
        adminSidebars.forEach(sidebar => {
            sidebar.classList.remove('active');
        });

        if (filterToggleBtn) {
            filterToggleBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros';
            filterToggleBtn.setAttribute('aria-expanded', 'false');
        }

        if (tipsFilterToggleBtn) {
            tipsFilterToggleBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros';
            tipsFilterToggleBtn.setAttribute('aria-expanded', 'false');
        }
    }
});

function initMobileFilterToggle() {
    // Mobile filter toggle for products
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const adminSidebar = document.querySelector('.admin-layout .admin-sidebar');

    if (filterToggleBtn && adminSidebar) {
        filterToggleBtn.addEventListener('click', () => {
            adminSidebar.classList.toggle('active');

            // Atualiza texto do botão
            if (adminSidebar.classList.contains('active')) {
                filterToggleBtn.innerHTML = '<i class="fas fa-times"></i> Fechar Filtros';
            } else {
                filterToggleBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros';
            }
        });
    }

    // Mobile filter toggle for tips
    const tipsFilterToggleBtn = document.getElementById('tipsFilterToggleBtn');
    const tipsAdminSidebar = document.querySelectorAll('.admin-layout .admin-sidebar')[1];

    if (tipsFilterToggleBtn && tipsAdminSidebar) {
        tipsFilterToggleBtn.addEventListener('click', () => {
            tipsAdminSidebar.classList.toggle('active');

            // Atualiza texto do botão
            if (tipsAdminSidebar.classList.contains('active')) {
                tipsFilterToggleBtn.innerHTML = '<i class="fas fa-times"></i> Fechar Filtros';
            } else {
                tipsFilterToggleBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros';
            }
        });
    }
}

/**
 * Script para carregamento dinâmico das dicas na página pública
 * Pet Shop Baronesa - Dicas
 */

// Estado da aplicação
let allTips = [];
let filteredTips = [];
let currentCategory = 'all';
let currentSearchTerm = '';

// Elementos DOM
const tipsContainer = document.getElementById('dicas-container');
const categoryButtons = document.querySelectorAll('.category-btn');
const searchInput = document.getElementById('search-tips');
const clearSearchBtn = document.getElementById('clear-search');
const loadingElement = document.getElementById('loading');
const noTipsMessage = document.getElementById('no-tips-message');
const tipsCount = document.getElementById('tips-count');

/**
 * Inicializa a página de dicas
 */
async function initializeTipsPage() {
    try {
        // Aguardar carregamento do Firebase se disponível
        if (typeof initializeFirebase === 'function') {
            await initializeFirebase();
        }
        
        // Carregar dicas
        await loadPublicTips();
        
        // Configurar eventos
        setupEventListeners();
        
        // Aplicar filtros iniciais
        applyFilters();
        
    } catch (error) {
        console.error('Erro ao inicializar página de dicas:', error);
        showError('Erro ao carregar dicas. Tente novamente.');
    }
}

/**
 * Carrega dicas publicadas
 */
async function loadPublicTips() {
    showLoading();
    
    try {
        // Verificar se o serviço de dicas está disponível
        if (typeof tipsService !== 'undefined') {
            // Aguardar inicialização do serviço
            await tipsService.initialize();
            
            // Obter apenas dicas publicadas
            allTips = tipsService.getPublishedTips();
            
            console.log(`Carregadas ${allTips.length} dicas publicadas`);
        } else {
            // Fallback: carregar dicas do localStorage
            const savedTips = localStorage.getItem('petshop_tips');
            if (savedTips) {
                const tips = JSON.parse(savedTips);
                allTips = tips.filter(tip => tip.status === 'published');
            } else {
                allTips = [];
            }
            
            console.log(`Carregadas ${allTips.length} dicas do localStorage`);
        }
        
    } catch (error) {
        console.error('Erro ao carregar dicas:', error);
        allTips = [];
    } finally {
        hideLoading();
    }
}

/**
 * Configura event listeners
 */
function setupEventListeners() {
    // Filtros de categoria
    categoryButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const category = button.getAttribute('data-category');
            setActiveCategory(category);
            currentCategory = category;
            applyFilters();
        });
    });
    
    // Busca
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearchTerm = e.target.value.trim();
            applyFilters();
            
            // Mostrar/esconder botão de limpar busca
            if (clearSearchBtn) {
                clearSearchBtn.style.display = currentSearchTerm ? 'block' : 'none';
            }
        });
    }
    
    // Limpar busca
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            searchInput.value = '';
            currentSearchTerm = '';
            clearSearchBtn.style.display = 'none';
            applyFilters();
        });
    }
}

/**
 * Define categoria ativa
 */
function setActiveCategory(category) {
    categoryButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-category') === category) {
            btn.classList.add('active');
        }
    });
}

/**
 * Aplica filtros às dicas
 */
function applyFilters() {
    filteredTips = allTips.filter(tip => {
        // Filtro por categoria
        const categoryMatch = currentCategory === 'all' || tip.category === currentCategory;
        
        // Filtro por busca
        const searchMatch = !currentSearchTerm || 
            tip.title.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            tip.summary.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            tip.tags.some(tag => tag.toLowerCase().includes(currentSearchTerm.toLowerCase()));
        
        return categoryMatch && searchMatch;
    });
    
    // Ordenar por data (mais recentes primeiro)
    filteredTips.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Renderizar dicas
    renderTips();
    
    // Atualizar contador
    updateTipsCount();
}

/**
 * Renderiza as dicas na página
 */
function renderTips() {
    if (!tipsContainer) return;
    
    if (filteredTips.length === 0) {
        showNoTipsMessage();
        return;
    }
    
    hideNoTipsMessage();
    
    const tipsHTML = filteredTips.map(tip => createTipCard(tip)).join('');
    tipsContainer.innerHTML = tipsHTML;
}

/**
 * Cria o HTML de um card de dica
 */
function createTipCard(tip) {
    const formattedDate = formatDate(tip.date);
    const truncatedSummary = truncateText(tip.summary, 120);
    
    // Resolver caminho da imagem
    const imagePath = tip.image || 'assets/images/gerais/iconeBaronesa.png';
    const resolvedImagePath = typeof resolvePath === 'function' ? resolvePath(imagePath) : imagePath;
    const fallbackImagePath = typeof resolvePath === 'function' ? resolvePath('assets/images/gerais/iconeBaronesa.png') : 'assets/images/gerais/iconeBaronesa.png';
    
    return `
        <div class="tip-card" data-tip-id="${tip.id}">
            <div class="tip-image">
                <img src="${resolvedImagePath}" alt="${tip.title}" onerror="this.src='${fallbackImagePath}'">
                <div class="tip-category">${tip.category}</div>
            </div>
            <div class="tip-content">
                <h3 class="tip-title">${tip.title}</h3>
                <p class="tip-summary">${truncatedSummary}</p>
                <div class="tip-meta">
                    <span class="tip-date">
                        <i class="fas fa-calendar"></i> ${formattedDate}
                    </span>
                    <div class="tip-tags">
                        ${tip.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Formata data para exibição
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('pt-BR', options);
}

/**
 * Trunca texto para um tamanho específico
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Atualiza contador de dicas
 */
function updateTipsCount() {
    if (tipsCount) {
        const count = filteredTips.length;
        const total = allTips.length;
        
        if (currentCategory === 'all' && !currentSearchTerm) {
            tipsCount.textContent = `${total} dica${total !== 1 ? 's' : ''} disponível${total !== 1 ? 'eis' : ''}`;
        } else {
            tipsCount.textContent = `${count} de ${total} dica${total !== 1 ? 's' : ''} encontrada${count !== 1 ? 's' : ''}`;
        }
    }
}

/**
 * Mostra loading
 */
function showLoading() {
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    if (tipsContainer) {
        tipsContainer.style.display = 'none';
    }
    if (noTipsMessage) {
        noTipsMessage.style.display = 'none';
    }
}

/**
 * Esconde loading
 */
function hideLoading() {
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    if (tipsContainer) {
        tipsContainer.style.display = 'grid';
    }
}

/**
 * Mostra mensagem de sem dicas
 */
function showNoTipsMessage() {
    if (noTipsMessage) {
        noTipsMessage.style.display = 'block';
    }
    if (tipsContainer) {
        tipsContainer.style.display = 'none';
    }
}

/**
 * Esconde mensagem de sem dicas
 */
function hideNoTipsMessage() {
    if (noTipsMessage) {
        noTipsMessage.style.display = 'none';
    }
    if (tipsContainer) {
        tipsContainer.style.display = 'grid';
    }
}

/**
 * Mostra mensagem de erro
 */
function showError(message) {
    hideLoading();
    if (tipsContainer) {
        tipsContainer.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <p>${message}</p>
                <button onclick="location.reload()" class="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        `;
        tipsContainer.style.display = 'block';
    }
}

/**
 * Recarrega as dicas (para atualização em tempo real)
 */
async function refreshTips() {
    await loadPublicTips();
    applyFilters();
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeTipsPage);

// Atualizar dicas a cada 30 segundos (opcional)
setInterval(refreshTips, 30000);

// Disponibilizar funções globalmente
window.refreshTips = refreshTips;
window.loadPublicTips = loadPublicTips;

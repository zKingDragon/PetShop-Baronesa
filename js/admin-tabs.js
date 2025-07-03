/**
 * Admin Tabs Management System
 * Gerencia navegação por abas e funcionalidades de dicas
 */

// Estado global do sistema de abas
let currentTab = 'products';
let tips = [];
let filteredTips = [];
let editingTipId = null;

// Elementos DOM
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');
const addItemBtn = document.getElementById('addItemBtn');
const addItemBtnMobile = document.getElementById('addItemBtnMobile');
const addItemText = document.getElementById('addItemText');
const addItemTextMobile = document.getElementById('addItemTextMobile');

// Elementos específicos de dicas
const tipModal = document.getElementById('tipModal');
const tipForm = document.getElementById('tipForm');
const closeTipModalBtn = document.getElementById('closeTipModalBtn');
const cancelTipBtn = document.getElementById('cancelTipBtn');
const saveTipBtn = document.getElementById('saveTipBtn');
const deleteTipModal = document.getElementById('deleteTipModal');
const closeDeleteTipModalBtn = document.getElementById('closeDeleteTipModalBtn');
const cancelDeleteTipBtn = document.getElementById('cancelDeleteTipBtn');
const confirmDeleteTipBtn = document.getElementById('confirmDeleteTipBtn');

// Elementos de busca e filtros para dicas
const tipsSearchInput = document.getElementById('tipsSearchInput');
const tipCategoryFilters = document.querySelectorAll('.tip-category-filter');
const statusFilters = document.querySelectorAll('.status-filter');
const clearTipsFiltersBtn = document.getElementById('clearTipsFiltersBtn');

// Elementos de estatísticas
const totalTipsCount = document.getElementById('totalTipsCount');
const publishedTipsCount = document.getElementById('publishedTipsCount');
const recentTipsCount = document.getElementById('recentTipsCount');
const filteredTipsCount = document.getElementById('filteredTipsCount');

// Elementos de grid e loading
const adminTipsGrid = document.getElementById('adminTipsGrid');
const tipsLoading = document.getElementById('tipsLoading');
const noTipsMessage = document.getElementById('noTipsMessage');

/**
 * Inicialização do sistema de abas
 */
function initializeTabs() {
    // Event listeners para botões de aba
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });

    // Event listeners para botões de adicionar item
    if (addItemBtn) {
        addItemBtn.addEventListener('click', handleAddItemClick);
    }
    if (addItemBtnMobile) {
        addItemBtnMobile.addEventListener('click', handleAddItemClick);
    }

    // Inicializar primeira aba
    switchTab('products');
}

/**
 * Alterna entre abas
 * @param {string} tabId - ID da aba para ativar
 */
function switchTab(tabId) {
    currentTab = tabId;
    
    // Atualizar botões de aba
    tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('data-tab') === tabId) {
            button.classList.add('active');
        }
    });

    // Atualizar conteúdo das abas
    tabPanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.id === `${tabId}-tab`) {
            pane.classList.add('active');
        }
    });

    // Atualizar texto do botão
    updateAddItemButton();

    // Carregar dados específicos da aba
    if (tabId === 'tips') {
        loadTips();
    }
}

/**
 * Atualiza o texto do botão de adicionar item baseado na aba ativa
 */
function updateAddItemButton() {
    const text = currentTab === 'products' ? 'Novo Produto' : 'Nova Dica';
    if (addItemText) addItemText.textContent = text;
    if (addItemTextMobile) addItemTextMobile.textContent = text;
}

/**
 * Manipula clique no botão de adicionar item
 */
function handleAddItemClick() {
    if (currentTab === 'products') {
        // Chamar função existente para produtos
        if (typeof showProductModal === 'function') {
            showProductModal();
        }
    } else if (currentTab === 'tips') {
        showTipModal();
    }
}

/**
 * Mostra modal para adicionar/editar dica
 * @param {Object} tip - Dados da dica para edição (opcional)
 */
function showTipModal(tip = null) {
    editingTipId = tip ? tip.id : null;
    
    // Atualizar título do modal
    const modalTitle = document.getElementById('tipModalTitle');
    modalTitle.textContent = tip ? 'Editar Dica' : 'Adicionar Dica';
    
    // Limpar formulário ou preencher com dados existentes
    if (tip) {
        fillTipForm(tip);
    } else {
        tipForm.reset();
        document.getElementById('tipDate').value = new Date().toISOString().split('T')[0];
        updateTipImagePreview();
    }
    
    // Mostrar modal
    tipModal.style.display = 'block';
    document.body.classList.add('modal-open');
}

/**
 * Fecha modal de dica
 */
function closeTipModal() {
    tipModal.style.display = 'none';
    document.body.classList.remove('modal-open');
    editingTipId = null;
    tipForm.reset();
}

/**
 * Preenche formulário com dados da dica
 * @param {Object} tip - Dados da dica
 */
function fillTipForm(tip) {
    document.getElementById('tipTitle').value = tip.title || '';
    document.getElementById('tipCategory').value = tip.category || '';
    document.getElementById('tipStatus').value = tip.status || 'draft';
    document.getElementById('tipDate').value = tip.date || '';
    document.getElementById('tipImage').value = tip.image || '';
    document.getElementById('tipSummary').value = tip.summary || '';
    document.getElementById('tipContent').value = tip.content || '';
    document.getElementById('tipTags').value = tip.tags ? tip.tags.join(', ') : '';
    
    updateTipImagePreview();
}

/**
 * Atualiza preview da imagem da dica
 */
function updateTipImagePreview() {
    const imageUrl = document.getElementById('tipImage').value;
    const preview = document.getElementById('tipImagePreview');
    
    if (imageUrl) {
        // Resolver caminho da imagem
        const resolvedPath = typeof resolvePath === 'function' ? resolvePath(imageUrl) : imageUrl;
        preview.src = resolvedPath;
        preview.onerror = function() {
            const fallbackPath = typeof resolvePath === 'function' ? resolvePath('assets/images/gerais/iconeBaronesa.png') : '../assets/images/gerais/iconeBaronesa.png';
            this.src = fallbackPath;
        };
    } else {
        const defaultPath = typeof resolvePath === 'function' ? resolvePath('assets/images/gerais/iconeBaronesa.png') : '../assets/images/gerais/iconeBaronesa.png';
        preview.src = defaultPath;
    }
}

/**
 * Salva dica (nova ou editada)
 */
async function saveTip() {
    const formData = new FormData(tipForm);
    
    const tipData = {
        title: formData.get('title'),
        category: formData.get('category'),
        status: formData.get('status'),
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        image: formData.get('image') || 'assets/images/gerais/iconeBaronesa.png',
        summary: formData.get('summary'),
        content: formData.get('content'),
        tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : []
    };

    try {
        // Mostrar loading
        saveTipBtn.disabled = true;
        saveTipBtn.textContent = 'Salvando...';

        let result;
        if (editingTipId) {
            // Atualizar dica existente
            result = await tipsService.updateTip(editingTipId, tipData);
        } else {
            // Adicionar nova dica
            result = await tipsService.addTip(tipData);
        }

        if (result) {
            // Atualizar interface
            await loadTips();
            closeTipModal();
            
            // Mostrar notificação
            showToast(editingTipId ? 'Dica atualizada com sucesso!' : 'Dica adicionada com sucesso!', 'success');
        } else {
            throw new Error('Erro ao salvar dica');
        }
    } catch (error) {
        console.error('Erro ao salvar dica:', error);
        showToast('Erro ao salvar dica. Tente novamente.', 'error');
    } finally {
        // Restaurar botão
        saveTipBtn.disabled = false;
        saveTipBtn.textContent = 'Salvar Dica';
    }
}

/**
 * Carrega dicas do serviço
 */
async function loadTips() {
    showTipsLoading();
    
    try {
        // Aguardar inicialização do serviço
        await tipsService.initialize();
        
        // Obter dicas do serviço
        tips = tipsService.getAllTips();
        
        applyTipFilters();
        updateTipStatistics();
    } catch (error) {
        console.error('Erro ao carregar dicas:', error);
        showToast('Erro ao carregar dicas', 'error');
    } finally {
        hideTipsLoading();
    }
}

/**
 * Gera dicas de exemplo
 */
function generateSampleTips() {
    return [
        {
            id: 'tip_1',
            title: 'Como dar banho em gatos',
            category: 'Gatos',
            status: 'published',
            date: '2024-01-15',
            image: 'assets/images/banho-tosa/banho-Gato.jpg',
            summary: 'Dicas essenciais para tornar o banho do seu gato menos estressante.',
            content: 'O banho em gatos pode ser uma tarefa desafiadora, mas com as técnicas certas, pode ser uma experiência tranquila...',
            tags: ['higiene', 'gatos', 'banho'],
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
        },
        {
            id: 'tip_2',
            title: 'Cuidados com cães idosos',
            category: 'Cachorros',
            status: 'published',
            date: '2024-01-10',
            image: 'assets/images/dicas/cao-Idoso.png',
            summary: 'Aprenda como cuidar adequadamente do seu cão na terceira idade.',
            content: 'Cães idosos precisam de cuidados especiais para manter sua qualidade de vida...',
            tags: ['saúde', 'cachorros', 'idosos'],
            createdAt: '2024-01-10T14:30:00Z',
            updatedAt: '2024-01-10T14:30:00Z'
        },
        {
            id: 'tip_3',
            title: 'Alimentação para pássaros',
            category: 'Pássaros',
            status: 'draft',
            date: '2024-01-20',
            image: 'assets/images/produtos/misturaParaPassaros.webp',
            summary: 'Guia completo sobre alimentação adequada para diferentes espécies de pássaros.',
            content: 'A alimentação adequada é fundamental para a saúde dos pássaros...',
            tags: ['alimentação', 'pássaros', 'nutrição'],
            createdAt: '2024-01-20T09:15:00Z',
            updatedAt: '2024-01-20T09:15:00Z'
        }
    ];
}

/**
 * Aplica filtros às dicas
 */
function applyTipFilters() {
    let filtered = [...tips];
    
    // Filtro por busca
    const searchTerm = tipsSearchInput?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(tip => 
            tip.title.toLowerCase().includes(searchTerm) ||
            tip.summary.toLowerCase().includes(searchTerm) ||
            tip.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }
    
    // Filtro por categoria
    const selectedCategories = Array.from(tipCategoryFilters || [])
        .filter(filter => filter.checked)
        .map(filter => filter.value);
    
    if (selectedCategories.length > 0) {
        filtered = filtered.filter(tip => selectedCategories.includes(tip.category));
    }
    
    // Filtro por status
    const selectedStatuses = Array.from(statusFilters || [])
        .filter(filter => filter.checked)
        .map(filter => filter.value);
    
    if (selectedStatuses.length > 0) {
        filtered = filtered.filter(tip => selectedStatuses.includes(tip.status));
    }
    
    filteredTips = filtered;
    renderTips();
    updateTipFilteredCount();
}

/**
 * Renderiza dicas na interface
 */
function renderTips() {
    if (!adminTipsGrid) return;
    
    if (filteredTips.length === 0) {
        adminTipsGrid.innerHTML = '';
        noTipsMessage.style.display = 'block';
        return;
    }
    
    noTipsMessage.style.display = 'none';
    
    adminTipsGrid.innerHTML = filteredTips.map(tip => `
        <div class="tip-card">
            <div class="tip-card-header">
                <img src="${tip.image}" alt="${tip.title}" class="tip-card-image">
                <div class="tip-card-status ${tip.status}">${tip.status === 'published' ? 'Publicada' : 'Rascunho'}</div>
                <div class="tip-card-category">${tip.category}</div>
            </div>
            <div class="tip-card-body">
                <h3 class="tip-card-title">${tip.title}</h3>
                <p class="tip-card-summary">${tip.summary}</p>
                <div class="tip-card-meta">
                    <div class="tip-card-date">
                        <i class="fas fa-calendar"></i>
                        <span>${formatDate(tip.date)}</span>
                    </div>
                </div>
                <div class="tip-card-tags">
                    ${tip.tags.map(tag => `<span class="tip-tag">${tag}</span>`).join('')}
                </div>
                <div class="tip-card-actions">
                    <button class="btn btn-outline-primary" onclick="editTip('${tip.id}')">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline-warning" onclick="toggleTipStatus('${tip.id}')">
                        <i class="fas fa-eye${tip.status === 'published' ? '-slash' : ''}"></i> 
                        ${tip.status === 'published' ? 'Despublicar' : 'Publicar'}
                    </button>
                    <button class="btn btn-danger" onclick="deleteTip('${tip.id}')">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

/**
 * Atualiza estatísticas de dicas
 */
function updateTipStatistics() {
    const total = tips.length;
    const published = tips.filter(tip => tip.status === 'published').length;
    const recent = tips.filter(tip => {
        const tipDate = new Date(tip.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return tipDate >= weekAgo;
    }).length;
    
    if (totalTipsCount) totalTipsCount.textContent = total;
    if (publishedTipsCount) publishedTipsCount.textContent = published;
    if (recentTipsCount) recentTipsCount.textContent = recent;
}

/**
 * Atualiza contador de dicas filtradas
 */
function updateTipFilteredCount() {
    if (filteredTipsCount) {
        filteredTipsCount.textContent = filteredTips.length;
    }
}

/**
 * Edita dica
 * @param {string} tipId - ID da dica
 */
function editTip(tipId) {
    const tip = tips.find(t => t.id === tipId);
    if (tip) {
        showTipModal(tip);
    }
}

/**
 * Alterna status da dica
 * @param {string} tipId - ID da dica
 */
async function toggleTipStatus(tipId) {
    try {
        const result = await tipsService.toggleTipStatus(tipId);
        
        if (result) {
            // Atualizar interface
            await loadTips();
            
            const action = result.status === 'published' ? 'publicada' : 'despublicada';
            showToast(`Dica ${action} com sucesso!`, 'success');
        } else {
            throw new Error('Erro ao alterar status da dica');
        }
    } catch (error) {
        console.error('Erro ao alterar status da dica:', error);
        showToast('Erro ao alterar status da dica', 'error');
    }
}

/**
 * Exclui dica
 * @param {string} tipId - ID da dica
 */
function deleteTip(tipId) {
    const tip = tips.find(t => t.id === tipId);
    if (tip) {
        document.getElementById('deleteTipName').textContent = tip.title;
        deleteTipModal.style.display = 'block';
        document.body.classList.add('modal-open');
        
        // Configurar confirmação
        confirmDeleteTipBtn.onclick = async () => {
            try {
                const success = await tipsService.deleteTip(tipId);
                
                if (success) {
                    await loadTips();
                    closeDeleteTipModal();
                    showToast('Dica excluída com sucesso!', 'success');
                } else {
                    throw new Error('Erro ao excluir dica');
                }
            } catch (error) {
                console.error('Erro ao excluir dica:', error);
                showToast('Erro ao excluir dica', 'error');
            }
        };
    }
}

/**
 * Fecha modal de exclusão de dica
 */
function closeDeleteTipModal() {
    deleteTipModal.style.display = 'none';
    document.body.classList.remove('modal-open');
}

/**
 * Mostra loading para dicas
 */
function showTipsLoading() {
    if (tipsLoading) tipsLoading.style.display = 'block';
    if (adminTipsGrid) adminTipsGrid.style.display = 'none';
    if (noTipsMessage) noTipsMessage.style.display = 'none';
}

/**
 * Oculta loading para dicas
 */
function hideTipsLoading() {
    if (tipsLoading) tipsLoading.style.display = 'none';
    if (adminTipsGrid) adminTipsGrid.style.display = 'grid';
}

/**
 * Formata data para exibição
 * @param {string} dateString - Data em formato ISO
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

/**
 * Limpa todos os filtros de dicas
 */
function clearTipFilters() {
    if (tipsSearchInput) tipsSearchInput.value = '';
    
    // Limpar filtros de categoria
    tipCategoryFilters.forEach(filter => filter.checked = false);
    document.getElementById('allTipCategories').checked = true;
    
    // Limpar filtros de status
    statusFilters.forEach(filter => filter.checked = false);
    document.getElementById('allStatus').checked = true;
    
    applyTipFilters();
}

/**
 * Inicialização dos event listeners
 */
function initializeTipEventListeners() {
    // Modal de dica
    if (closeTipModalBtn) closeTipModalBtn.addEventListener('click', closeTipModal);
    if (cancelTipBtn) cancelTipBtn.addEventListener('click', closeTipModal);
    if (tipForm) {
        tipForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveTip();
        });
    }
    
    // Modal de exclusão
    if (closeDeleteTipModalBtn) closeDeleteTipModalBtn.addEventListener('click', closeDeleteTipModal);
    if (cancelDeleteTipBtn) cancelDeleteTipBtn.addEventListener('click', closeDeleteTipModal);
    
    // Preview da imagem
    const tipImageInput = document.getElementById('tipImage');
    if (tipImageInput) {
        tipImageInput.addEventListener('input', updateTipImagePreview);
    }
    
    // Filtros
    if (tipsSearchInput) {
        tipsSearchInput.addEventListener('input', applyTipFilters);
    }
    
    tipCategoryFilters.forEach(filter => {
        filter.addEventListener('change', applyTipFilters);
    });
    
    statusFilters.forEach(filter => {
        filter.addEventListener('change', applyTipFilters);
    });
    
    if (clearTipsFiltersBtn) {
        clearTipsFiltersBtn.addEventListener('click', clearTipFilters);
    }
    
    // Botão de adicionar primeira dica
    const addFirstTipBtn = document.getElementById('addFirstTipBtn');
    if (addFirstTipBtn) {
        addFirstTipBtn.addEventListener('click', () => showTipModal());
    }
    
    // Filtros "Todos"
    const allTipCategories = document.getElementById('allTipCategories');
    if (allTipCategories) {
        allTipCategories.addEventListener('change', function() {
            if (this.checked) {
                tipCategoryFilters.forEach(filter => filter.checked = false);
            }
            applyTipFilters();
        });
    }
    
    const allStatus = document.getElementById('allStatus');
    if (allStatus) {
        allStatus.addEventListener('change', function() {
            if (this.checked) {
                statusFilters.forEach(filter => filter.checked = false);
            }
            applyTipFilters();
        });
    }
}

/**
 * Mostra notificação toast
 * @param {string} message - Mensagem
 * @param {string} type - Tipo da notificação
 */
function showToast(message, type = 'info') {
    // Usar função existente se disponível
    if (typeof showToastMessage === 'function') {
        showToastMessage(message, type);
    } else {
        // Implementação simples
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#28a745' : '#17a2b8'};
            color: white;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeTipEventListeners();
});

// Disponibilizar funções globalmente
window.editTip = editTip;
window.toggleTipStatus = toggleTipStatus;
window.deleteTip = deleteTip;

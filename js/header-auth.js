/**
 * Sistema de autenticação do header
 * Gerencia a alternância entre botões de cadastro e dropdown de usuário
 */

// Elementos do header
let authButtons = null;
let userDropdown = null;
let userNameDisplay = null;
let signupButton = null;

/**
 * Inicializa o sistema de autenticação do header
 */
function initHeaderAuth() {
    // Aguarda o header ser carregado
    setTimeout(() => {
        setupHeaderElements();
        updateHeaderUI();
        
        // Escuta mudanças no estado de autenticação
        document.addEventListener('authStateChanged', (e) => {
            updateHeaderUI();
        });
    }, 500);
}

/**
 * Configura os elementos do header
 */
function setupHeaderElements() {
    // Encontra o botão de cadastro
    signupButton = document.querySelector('.btn-signup');
    
    // Cria ou encontra o dropdown do usuário
    createUserDropdown();
    
    // Configura eventos do dropdown
    setupDropdownEvents();
}

/**
 * Cria o dropdown do usuário no header
 */
function createUserDropdown() {
    // Verifica se já existe
    userDropdown = document.querySelector('.user-dropdown');
    
    if (!userDropdown) {
        // Cria o dropdown
        userDropdown = document.createElement('div');
        userDropdown.className = 'user-dropdown';
        userDropdown.style.display = 'none';
        
        userDropdown.innerHTML = `
            <div class="user-dropdown-toggle">
                <span class="user-name" id="headerUserName">Usuário</span>
                <i class="fas fa-chevron-down"></i>
            </div>
            <div class="user-dropdown-menu">
                <a href="#" class="dropdown-item user-only">
                    <i class="fas fa-user"></i> Minha Conta
                </a>
                <a href="../html/carrinho.html" class="dropdown-item user-only">
                    <i class="fas fa-shopping-cart"></i> Meu Carrinho
                </a>
                <a href="../html/promocoes.html" class="dropdown-item user-only">
                    <i class="fas fa-tag"></i> Promoções
                </a>
                <a href="../html/admin.html" class="dropdown-item admin-only">
                    <i class="fas fa-cog"></i> Painel Admin
                </a>
                <hr class="dropdown-divider">
                <a href="#" class="dropdown-item logout-btn">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            </div>
        `;
        
        // Insere o dropdown no header
        const headerContent = document.querySelector('.header-content');
        if (headerContent && signupButton) {
            headerContent.insertBefore(userDropdown, signupButton);
        }
    }
    
    userNameDisplay = document.getElementById('headerUserName');
}

/**
 * Configura eventos do dropdown
 */
function setupDropdownEvents() {
    if (!userDropdown) return;
    
    // Toggle do dropdown
    const dropdownToggle = userDropdown.querySelector('.user-dropdown-toggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', (e) => {
            e.preventDefault();
            userDropdown.classList.toggle('active');
        });
    }
    
    // Evento de logout
    const logoutBtn = userDropdown.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (window.auth && window.auth.logout) {
                await window.auth.logout();
            }
        });
    }
    
    // Fecha dropdown ao clicar fora
    document.addEventListener('click', (e) => {
        if (!userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
}

/**
 * Atualiza a UI do header baseado no estado de autenticação
 */
async function updateHeaderUI() {
    try {
        const isLoggedIn = window.auth ? window.auth.isAuthenticated() : false;
        
        if (isLoggedIn) {
            // Usuário logado - mostrar dropdown
            if (signupButton) signupButton.style.display = 'none';
            if (userDropdown) userDropdown.style.display = 'block';
            
            // Atualizar nome do usuário
            await updateUserName();
            
            // Atualizar links baseado no tipo de usuário
            await updateUserLinks();
        } else {
            // Usuário não logado - mostrar botão de cadastro
            if (signupButton) signupButton.style.display = 'block';
            if (userDropdown) userDropdown.style.display = 'none';
        }
    } catch (error) {
        console.error('Erro ao atualizar UI do header:', error);
    }
}

/**
 * Atualiza o nome do usuário no dropdown
 */
async function updateUserName() {
    if (!userNameDisplay) return;
    
    try {
        const user = window.auth ? window.auth.getCurrentUser() : null;
        if (!user) {
            userNameDisplay.textContent = 'Usuário';
            return;
        }
        
        const userType = window.auth ? await window.auth.getCurrentUserType() : 'user';
        let displayName = user.displayName || user.email?.split('@')[0] || 'Usuário';
        
        // Pega apenas o primeiro nome
        if (displayName.includes(' ')) {
            displayName = displayName.split(' ')[0];
        }
        
        // Adiciona ícone para admin
        if (userType === 'admin') {
            userNameDisplay.innerHTML = `<i class="fas fa-crown" style="color: gold; margin-right: 5px;"></i>${displayName}`;
        } else {
            userNameDisplay.textContent = displayName;
        }
    } catch (error) {
        console.error('Erro ao atualizar nome do usuário:', error);
        userNameDisplay.textContent = 'Usuário';
    }
}

/**
 * Atualiza os links do dropdown baseado no tipo de usuário
 */
async function updateUserLinks() {
    if (!userDropdown) return;
    
    try {
        const userType = window.auth ? await window.auth.getCurrentUserType() : 'user';
        
        // Controla visibilidade dos links admin
        const adminLinks = userDropdown.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = userType === 'admin' ? 'block' : 'none';
        });
        
        // Ajusta links relativos baseado na página atual
        const currentPath = window.location.pathname;
        const isInHtmlFolder = currentPath.includes('/html/');
        
        const links = userDropdown.querySelectorAll('a[href^="../html/"]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (isInHtmlFolder) {
                // Se estamos na pasta html, remove o '../'
                link.setAttribute('href', href.replace('../html/', ''));
            }
        });
    } catch (error) {
        console.error('Erro ao atualizar links do usuário:', error);
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initHeaderAuth);

// Exporta para uso global
window.headerAuth = {
    updateHeaderUI,
    updateUserName,
    updateUserLinks
};

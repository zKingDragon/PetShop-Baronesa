/**
 * Sistema de autenticação do header
 * Gerencia entre botões de login e dropdown de usuário
 */
(function() {
'use strict';

// Elementos do header
let headerAuthButtons = null;
let userDropdown = null;
let userNameDisplay = null;
let loginButton = null;

/**
 * Inicializa o sistema de autenticação do header
 */
function initHeaderAuth() {
    // Aguarda o header ser carregado (sem atraso artificial)
    setupHeaderElements();
    updateHeaderUI();
    
    // Escuta mudanças no estado de autenticação
    document.addEventListener('authStateChanged', () => {

        // Garante que o dropdown esteja no DOM
        tryInsertDropdown();
        updateHeaderUI();
    });
    
    // Escuta mudanças do Firebase Auth diretamente
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged((user) => {

            // Garante que o dropdown esteja no DOM
            tryInsertDropdown();
            updateHeaderUI();
        });
    }
    
    // Listener adicional para mudanças de DOM
    const observer = new MutationObserver(() => {
        try {
            // Tenta inserir dropdown se ainda não estiver no DOM
            tryInsertDropdown();
            const loggedIn = typeof firebase !== 'undefined' && firebase.auth && !!firebase.auth().currentUser;
            if (loggedIn && userDropdown && userDropdown.style.display === 'none') {

                updateHeaderUI();
            }
        } catch (_) {}
    });
    
    observer.observe(document.body, { 
        childList: true, 
        subtree: true 
    });
}

/**
 * Configura os elementos do header
 */
function setupHeaderElements() {
    // Encontra o botão de login
    loginButton = document.querySelector('.btn-login');
    
    // Cria ou encontra o dropdown do usuário
    createUserDropdown();
    // Garante que o dropdown esteja no DOM
    tryInsertDropdown();
    
    // Configura eventos do dropdown
    setupDropdownEvents();
}

/**
 * Cria o dropdown do usuário no header
 */
function createUserDropdown() {
    // Remove dropdown existente se houver
    const existingDropdown = document.querySelector('.user-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
    }
    
    // Detecta se estamos na raiz ou na pasta html para ajustar caminhos
    const currentPath = window.location.pathname;
    const isInRoot = !currentPath.includes('/html/');
    const pathPrefix = isInRoot ? 'html/' : '';
    
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
            <a href="${pathPrefix}admin.html" class="dropdown-item admin-only">
                <i class="fas fa-cog"></i> Painel Admin
            </a>
            <hr class="dropdown-divider">
            <a href="#" class="dropdown-item logout-btn">
                <i class="fas fa-sign-out-alt"></i> Sair
            </a>
        </div>
    `;
    
    // Insere o dropdown no header de forma mais segura
    const headerContent = document.querySelector('.header-content');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (headerContent && authButtons) {
        // Insere antes dos botões de autenticação
        headerContent.insertBefore(userDropdown, authButtons);
    } else {
        console.warn('Não foi possível inserir o dropdown no local ideal');
        const header = document.querySelector('header');
        if (header) {
            header.appendChild(userDropdown);
        }
    }
    
    userNameDisplay = document.getElementById('headerUserName');

}

// NOVO: helper para reinserir caso o header carregue depois
function tryInsertDropdown() {
    if (!userDropdown) return false;
    // Já está no DOM?
    if (document.body.contains(userDropdown)) return true;

    const headerContent = document.querySelector('.header-content');
    const authButtons = document.querySelector('.auth-buttons');
    if (headerContent) {
        if (authButtons && headerContent.contains(authButtons)) {
            headerContent.insertBefore(userDropdown, authButtons);
        } else {
            headerContent.appendChild(userDropdown);
        }
        return true;
    }
    const header = document.querySelector('header');
    if (header) {
        header.appendChild(userDropdown);
        return true;
    }
    return false;
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
            try {
                if (typeof firebase !== 'undefined' && firebase.auth) {
                    await firebase.auth().signOut();

                    // Dispara evento personalizado
                    document.dispatchEvent(new CustomEvent('authStateChanged'));
                    
                    // Redireciona para a página inicial baseado na localização atual
                    const currentPath = window.location.pathname;
                    const isInRoot = !currentPath.includes('/html/');
                    
                    if (isInRoot) {
                        // Já estamos na raiz, apenas recarrega
                        window.location.reload();
                    } else {
                        // Estamos em subpasta, volta para a raiz
                        window.location.href = '../index.html';
                    }
                }
            } catch (error) {
                console.error('Erro ao fazer logout:', error);
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

        
        // Verifica se está logado usando Firebase diretamente
        let isLoggedIn = false;
        let currentUser = null;
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            currentUser = firebase.auth().currentUser;
            isLoggedIn = !!currentUser;
        }
        

        
        // Garante que o dropdown esteja no DOM antes de mexer na UI
        tryInsertDropdown();
        
        if (isLoggedIn) {
            // Usuário logado - mostrar dropdown

            if (loginButton) {
                loginButton.style.display = 'none';

            }
            if (userDropdown) {
                userDropdown.style.display = 'block';

            }
            
            // Atualizar nome do usuário
            await updateUserName();
            
            // Atualizar links baseado no tipo de usuário
            await updateUserLinks();
        } else {
            // Usuário não logado - mostrar botão de login

            if (loginButton) {
                loginButton.style.display = 'block';

            }
            if (userDropdown) {
                userDropdown.style.display = 'none';

            }
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
        // Verifica se há usuário logado usando Firebase diretamente
        let user = null;
        if (typeof firebase !== 'undefined' && firebase.auth) {
            user = firebase.auth().currentUser;
        }
        
        if (!user) {
            userNameDisplay.textContent = 'Usuário';
            return;
        }
        // Nome rápido: usa cache/localStorage ou dados do próprio user sem bater no Firestore
        let cachedAuth = null;
        try {
            const raw = localStorage.getItem('petshop_baronesa_auth');
            if (raw) cachedAuth = JSON.parse(raw);
        } catch (_) {}

        let displayName = cachedAuth?.displayName || user.displayName || user.email?.split('@')[0] || 'Usuário';
        
        // Pega apenas o primeiro nome
        if (displayName.includes(' ')) {
            displayName = displayName.split(' ')[0];
        }
        // Define nome imediatamente; badge de admin será adicionada por updateUserLinks()
        userNameDisplay.textContent = displayName;
    } catch (error) {
        console.error('Erro ao atualizar nome do usuário:', error);
        userNameDisplay.textContent = 'Usuário';
    }
}

/**
 * Atualiza os links do dropdown baseado no tipo de usuário
 */

// Função robusta para buscar o tipo do usuário
async function getUserType(user) {
    // Tenta buscar pelo sistema global, se existir
    if (typeof window.auth !== 'undefined' && window.auth.checkUserType) {
        try {
            return await window.auth.checkUserType(user.uid);
        } catch (e) {
            console.warn('Erro no window.auth.checkUserType:', e);
        }
    }
    // Busca direto no Firestore
    if (typeof firebase !== 'undefined' && firebase.firestore) {
        try {
            const db = firebase.firestore();
            // Tente ambas as coleções e campos
            let userDoc = await db.collection('ios').doc(user.uid).get();
            if (!userDoc.exists) {
                userDoc = await db.collection('usuarios').doc(user.uid).get();
            }
            if (userDoc.exists) {
                const data = userDoc.data();
                return data.type || data.userType || data.Type || 'guest';
            }
        } catch (e) {
            console.warn('Erro ao buscar tipo no Firestore:', e);
        }
    }
    return 'guest';
}

// Atualiza os links do dropdown baseado no estado de login
async function updateUserLinks() {
    if (!userDropdown) return;
    try {
        const isLoggedIn = typeof firebase !== 'undefined' && firebase.auth && !!firebase.auth().currentUser;
        const adminLinks = userDropdown.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = isLoggedIn ? 'block' : 'none';
        });

        if (isLoggedIn) {
            addAdminBadge();
        } else {
            removeAdminBadge();
        }

    } catch (error) {
        console.error('Erro ao atualizar links do usuário:', error);
    }
}

/**
 * Adiciona badge de admin ao nome do usuário
 */
function addAdminBadge() {
    if (!userNameDisplay) return;
    
    // Remove badge existente
    removeAdminBadge();
    
    // Adiciona novo badge
    const badge = document.createElement('span');
    badge.className = 'admin-badge';
    badge.innerHTML = ' <i class="fas fa-shield-alt" style="color: #28a745; margin-left: 5px;"></i>';
    userNameDisplay.appendChild(badge);
}

/**
 * Remove badge de admin
 */
function removeAdminBadge() {
    if (!userNameDisplay) return;
    
    const existingBadge = userNameDisplay.querySelector('.admin-badge');
    if (existingBadge) {
        existingBadge.remove();
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {

    
    // Função para aguardar Firebase estar pronto
    function waitForFirebase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const check = () => {
                if (typeof firebase !== 'undefined' && firebase.auth && typeof window.auth !== 'undefined') {

                    resolve();
                    return;
                }
                
                attempts++;
                if (attempts >= maxAttempts) {
                    console.warn('⚠️ Timeout aguardando Firebase, continuando...');
                    resolve();
                    return;
                }
                
                setTimeout(check, 100);
            };
            check();
        });
    }
    
    // Aguarda Firebase estar pronto antes de inicializar
    waitForFirebase().then(() => {
        initHeaderAuth();
        // Tenta garantir inserção pós-carregamento
        tryInsertDropdown();
    });
});

// Também tenta inicializar quando o header é carregado via fetch
document.addEventListener('headerLoaded', function() {

    initHeaderAuth();
    tryInsertDropdown();
});

// Exporta para uso global
window.headerAuth = {
    updateHeaderUI,
    updateUserName,
    updateUserLinks
};

})(); // Fecha a IIFE

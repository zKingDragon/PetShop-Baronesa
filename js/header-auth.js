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
    // Aguarda o header ser carregado
    setTimeout(() => {
        setupHeaderElements();
        updateHeaderUI();
        
        // Escuta mudanças no estado de autenticação
        document.addEventListener('authStateChanged', (e) => {
            console.log('🔄 Auth state changed event recebido');
            setTimeout(() => updateHeaderUI(), 500);
        });
        
        // Escuta mudanças do Firebase Auth diretamente
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                console.log('🔄 Firebase Auth state changed:', user ? user.email : 'logged out');
                setTimeout(() => updateHeaderUI(), 500);
            });
        }
        
        // Listener adicional para mudanças de DOM
        const observer = new MutationObserver(() => {
            if (firebase.auth().currentUser && !userDropdown.style.display) {
                console.log('🔄 DOM mudou, re-verificando header...');
                updateHeaderUI();
            }
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
        
    }, 1000);
}

/**
 * Configura os elementos do header
 */
function setupHeaderElements() {
    // Encontra o botão de login
    loginButton = document.querySelector('.btn-login');
    
    // Cria ou encontra o dropdown do usuário
    createUserDropdown();
    
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
            <a href="${pathPrefix}admin.html" class="dropdown-item">
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
    console.log('User dropdown created for:', isInRoot ? 'root page' : 'html subfolder');
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
                    console.log('Logout realizado com sucesso');
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
        console.log('🔄 Iniciando atualização do header UI...');
        
        // Verifica se está logado usando Firebase diretamente
        let isLoggedIn = false;
        let currentUser = null;
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            currentUser = firebase.auth().currentUser;
            isLoggedIn = !!currentUser;
        }
        
        console.log('👤 Status de login:', isLoggedIn, currentUser?.email);
        
        if (isLoggedIn) {
            // Usuário logado - mostrar dropdown
            console.log('✅ Mostrando dropdown de usuário');
            if (loginButton) {
                loginButton.style.display = 'none';
                console.log('✅ Botão login ocultado');
            }
            if (userDropdown) {
                userDropdown.style.display = 'block';
                console.log('✅ Dropdown mostrado');
            }
            
            // Atualizar nome do usuário
            await updateUserName();
            
            // Atualizar links baseado no tipo de usuário
            await updateUserLinks();
        } else {
            // Usuário não logado - mostrar botão de login
            console.log('❌ Mostrando botão de login');
            if (loginButton) {
                loginButton.style.display = 'block';
                console.log('✅ Botão login mostrado');
            }
            if (userDropdown) {
                userDropdown.style.display = 'none';
                console.log('✅ Dropdown ocultado');
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
        
        // Busca o tipo de usuário no Firestore
        let userType = 'guest';
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const userDoc = await db.collection('usuarios').doc(user.uid).get();
                if (userDoc.exists) {
                    userType = userDoc.data().userType || 'guest';
                }
            }
        } catch (error) {
            console.warn('Erro ao buscar tipo de usuário:', error);
        }
        
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

// Atualiza os links do dropdown baseado no tipo de usuário
async function updateUserLinks() {
    if (!userDropdown) return;
    try {
        let userType = 'guest';
        const user = firebase.auth().currentUser;
        if (user) {
            userType = await getUserType(user);
        }
        // Controla visibilidade dos links admin
        const adminLinks = userDropdown.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = userType === 'admin' ? 'block' : 'none';
        });
        // Adiciona indicador visual se for admin
        if (userType === 'admin') {
            addAdminBadge();
        } else {
            removeAdminBadge();
        }
        console.log('✅ Links atualizados para tipo:', userType);
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
    console.log('🏁 DOM carregado, iniciando header auth...');
    
    // Função para aguardar Firebase estar pronto
    function waitForFirebase() {
        return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = 50;
            
            const check = () => {
                if (typeof firebase !== 'undefined' && firebase.auth && typeof window.auth !== 'undefined') {
                    console.log('✅ Firebase e auth prontos');
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
        setTimeout(() => {
            initHeaderAuth();
        }, 1000);
    });
});

// Também tenta inicializar quando o header é carregado via fetch
document.addEventListener('headerLoaded', function() {
    console.log('🎯 Header carregado via fetch');
    setTimeout(() => {
        initHeaderAuth();
    }, 500);
});
// Exporta para uso global
window.headerAuth = {
    updateHeaderUI,
    updateUserName,
    updateUserLinks
};

})(); // Fecha a IIFE

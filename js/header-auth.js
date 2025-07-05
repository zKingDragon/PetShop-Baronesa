/**
 * Sistema de autenticação do header
 * Gerencia a alternância entre botões de cadastro e dropdown de usuário
 */
(function() {
'use strict';

// Elementos do header
let headerAuthButtons = null;
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
        
        // Escuta mudanças do Firebase Auth diretamente
        if (typeof firebase !== 'undefined' && firebase.auth) {
            firebase.auth().onAuthStateChanged((user) => {
                console.log('Firebase Auth state changed:', user ? 'logged in' : 'logged out');
                updateHeaderUI();
            });
        }
    }, 1000); // Aumenta o tempo para dar tempo ao header carregar completamente
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
            <a href="#" class="dropdown-item user-only">
                <i class="fas fa-user"></i> Minha Conta
            </a>
            <a href="${pathPrefix}carrinho.html" class="dropdown-item user-only">
                <i class="fas fa-shopping-cart"></i> Meu Carrinho
            </a>
            <a href="${pathPrefix}promocoes.html" class="dropdown-item user-only">
                <i class="fas fa-tag"></i> Promoções
            </a>
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
        // Verifica se está logado usando Firebase diretamente
        let isLoggedIn = false;
        let currentUser = null;
        
        if (typeof firebase !== 'undefined' && firebase.auth) {
            currentUser = firebase.auth().currentUser;
            isLoggedIn = !!currentUser;
        }
        
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
        let userType = 'user';
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                const db = firebase.firestore();
                const userDoc = await db.collection('users').doc(user.uid).get();
                if (userDoc.exists) {
                    userType = userDoc.data().userType || 'user';
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
async function updateUserLinks() {
    if (!userDropdown) return;
    
    try {
        // Busca o tipo de usuário no Firestore
        let userType = 'user';
        
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
            const user = firebase.auth().currentUser;
            if (user) {
                try {
                    const db = firebase.firestore();
                    const userDoc = await db.collection('users').doc(user.uid).get();
                    if (userDoc.exists) {
                        userType = userDoc.data().userType || 'user';
                    }
                } catch (error) {
                    console.warn('Erro ao buscar tipo de usuário:', error);
                }
            }
        }
        
        // Controla visibilidade dos links admin
        const adminLinks = userDropdown.querySelectorAll('.admin-only');
        adminLinks.forEach(link => {
            link.style.display = userType === 'admin' ? 'block' : 'none';
        });
        
        // Links já estão com caminhos corretos baseados na detecção de localização
        // Não precisa mais ajustar caminhos aqui pois foi feito na criação do dropdown
        
    } catch (error) {
        console.error('Erro ao atualizar links do usuário:', error);
    }
}

// Inicializa quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Aguarda o main.js carregar o header primeiro
    setTimeout(() => {
        initHeaderAuth();
    }, 1500);
});

// Também tenta inicializar quando o header é carregado via fetch
document.addEventListener('headerLoaded', function() {
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

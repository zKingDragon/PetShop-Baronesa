/**
 * Sistema de Proteção de Rotas Administrativas
 * Protege páginas com token (login) e autenticação (admin)
 */

(function() {
'use strict';

// Configurações de segurança
const SECURITY_CONFIG = {
    // Configurações de proteção por tipo
    PROTECTION_TYPES: {
        AUTH: 'auth'           // Requer estar logado
    },
    
    // Páginas protegidas e seus tipos de proteção
    PROTECTED_PAGES: {
        'admin.html': 'auth',            // Protegida por autenticação
        'user-management.html': 'auth',   // Protegida por autenticação
        'admin-register.html': 'auth'    // Protegida por autenticação
    },
    
    // Configurações gerais
    REDIRECT_PAGE: '../index.html',
    REDIRECT_DELAY: 300,
    CLEAR_CONSOLE: false,
    
    // URLs de redirecionamento
    LOGIN_REDIRECT: 'login-required.html'  // Página para mostrar "login necessário"
};

/**
 * Obtém o nome da página atual
 */
function getCurrentPageName() {
    const path = window.location.pathname;
    return path.substring(path.lastIndexOf('/') + 1);
}

/**
 * Verifica se o usuário está logado
 */
function isUserLoggedIn() {
    const logger = window.Logger || console;
    try {
        // Verifica Firebase Auth
        if (typeof firebase !== 'undefined' && firebase.auth) {
            const user = firebase.auth().currentUser;
            if (user) {
                logger.debug ? logger.debug('RouteProtection', `Usuário logado via Firebase: ${user.email}`) : console.log('✅ Usuário logado via Firebase:', user.email);
                return true;
            }
        }
        
        // Verifica localStorage como fallback
        const authData = localStorage.getItem('petshop_baronesa_auth');
        if (authData) {
            try {
                const parsed = JSON.parse(authData);
                if (parsed.uid && parsed.email) {
                    logger.debug ? logger.debug('RouteProtection', `Usuário logado via localStorage: ${parsed.email}`) : console.log('✅ Usuário logado via localStorage:', parsed.email);
                    return true;
                }
            } catch (e) {}
        }
        
        // Verifica sessionStorage
        const sessionAuth = sessionStorage.getItem('admin_authenticated');
        if (sessionAuth === 'true') {
            logger.debug ? logger.debug('RouteProtection', 'Usuário logado via sessionStorage') : console.log('✅ Usuário logado via sessionStorage');
            return true;
        }
        
        logger.debug ? logger.debug('RouteProtection', 'Usuário não está logado') : console.log('❌ Usuário não está logado');
        return false;
    } catch (error) {
        logger.warn ? logger.warn('RouteProtection', 'Erro ao verificar autenticação', error) : console.warn('⚠️ Erro ao verificar autenticação:', error);
        return false;
    }
}

/**
 * Redireciona para página especificada
 */
function redirectTo(page, reason = '') {

    
    setTimeout(() => {
        if (page.startsWith('http') || page.startsWith('/')) {
            window.location.href = page;
        } else {
            // Caminho relativo
            window.location.href = page;
        }
    }, SECURITY_CONFIG.REDIRECT_DELAY);
}

/**
 * Exibe mensagem de acesso negado (alternativa ao redirecionamento)
 */
function showAccessDeniedMessage() {
    document.body.innerHTML = `
        <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: Arial, sans-serif;
            text-align: center;
            margin: 0;
            padding: 20px;
        ">
            <div style="
                background: rgba(255, 255, 255, 0.1);
                padding: 40px;
                border-radius: 20px;
                backdrop-filter: blur(10px);
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
                max-width: 500px;
            ">
                <i style="font-size: 4rem; margin-bottom: 20px; color: #ff6b6b;">🚫</i>
                <h1 style="margin: 0 0 20px 0; font-size: 2rem;">Acesso Negado</h1>
                <p style="margin: 0 0 30px 0; font-size: 1.2rem; opacity: 0.9;">
                    Esta página é restrita e requer autorização especial.
                </p>
                <button onclick="window.location.href='${SECURITY_CONFIG.REDIRECT_PAGE}'" style="
                    background: #ff6b6b;
                    color: white;
                    border: none;
                    padding: 15px 30px;
                    border-radius: 10px;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                " onmouseover="this.style.background='#ff5252'" onmouseout="this.style.background='#ff6b6b'">
                    🏠 Voltar ao Início
                </button>
            </div>
        </div>
    `;
}

/**
 * Bloqueia acesso à página
 */
function blockAccess(reason) {

    
    // Ocultar todo o conteúdo imediatamente
    document.documentElement.style.display = 'none';
    
    // Limpar conteúdo
    if (document.body) {
        document.body.innerHTML = '<div style="display:none;">Acesso negado</div>';
    }
    
    // Redirecionar
    redirectTo(SECURITY_CONFIG.REDIRECT_PAGE, reason);
}

/**
 * Verifica proteção da página atual
 */
function checkPageProtection() {
    const currentPage = getCurrentPageName();
    const protectionType = SECURITY_CONFIG.PROTECTED_PAGES[currentPage];
    
    if (!protectionType) {

        document.documentElement.style.display = '';
        return;
    }
    

    
    if (protectionType === 'auth') {
        // Página protegida por autenticação (admin.html, etc.)
        if (!isUserLoggedIn()) {
            blockAccess('Login necessário');
            return;
        }
        

    }
    
    // Se chegou até aqui, liberar acesso
    document.documentElement.style.display = '';
}

/**
 * Funções utilitárias públicas
 */
window.RouteProtection = {
    /**
     * Verifica se usuário pode acessar área admin
     */
    canAccessAdmin: function() {
        return isUserLoggedIn();
    },
    
    /**
     * Redireciona para área admin (se autenticado)
     */
    goToAdmin: function() {
        if (this.canAccessAdmin()) {
            const path = window.location.pathname.includes('/html/') ? 
                'admin.html' : 'html/admin.html';
            window.location.href = path;
        } else {
            alert('Você precisa estar logado para acessar esta área.');
        }
    },
    
    /**
     * Limpa sessão de segurança
     */
    clearSecuritySession: function() {
        sessionStorage.removeItem('admin_authenticated');

    },
    
    /**
     * Obtém configurações (sem expor token)
     */
    getConfig: function() {
        return {
            protectedPages: SECURITY_CONFIG.PROTECTED_PAGES,
            redirectPage: SECURITY_CONFIG.REDIRECT_PAGE
        };
    },
    
    /**
     * Verifica se tem sessão válida
     */
    hasValidSession: function() {
        const currentPage = getCurrentPageName();
        const protectionType = SECURITY_CONFIG.PROTECTED_PAGES[currentPage];
        
        if (protectionType === 'auth') {
            return isUserLoggedIn();
        }
        
        return true; // Página não protegida
    },
    
    /**
     * Simular login (para testes)
     */
    simulateLogin: function() {
        sessionStorage.setItem('admin_authenticated', 'true');

    },
    
    /**
     * Simular logout (para testes)
     */
    simulateLogout: function() {
        sessionStorage.removeItem('admin_authenticated');

    }
};

// Executar verificação imediatamente
(function() {
    // Ocultar conteúdo imediatamente até verificação
    document.documentElement.style.display = 'none';
    
    // Verificar proteção quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkPageProtection);
    } else {
        checkPageProtection();
    }
})();

// Limpar sessão quando fechar aba/navegador
window.addEventListener('beforeunload', function() {
    // Manter apenas se estiver logado
    if (!isUserLoggedIn()) {
        RouteProtection.clearSecuritySession();
    }
});





})();

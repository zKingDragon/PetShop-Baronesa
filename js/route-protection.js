/**
 * Sistema de Proteção de Rotas Administrativas
 * Protege páginas com token (login) e autenticação (admin)
 */

(function() {
'use strict';

// Configurações de segurança
const SECURITY_CONFIG = {
    // Token secreto para página de login - ALTERE ESTE TOKEN PARA ALGO ÚNICO
    LOGIN_TOKEN: 'PSB_LOGIN_2024_SecretKey789',
    
    // Configurações de proteção por tipo
    PROTECTION_TYPES: {
        TOKEN: 'token',        // Requer token na URL
        AUTH: 'auth'           // Requer estar logado
    },
    
    // Páginas protegidas e seus tipos de proteção
    PROTECTED_PAGES: {
        'admin-login.html': 'token',     // Protegida por token
        'admin.html': 'auth',            // Protegida por autenticação
        'user-management.html': 'auth'   // Protegida por autenticação
    },
    
    // Configurações gerais
    REDIRECT_PAGE: '../index.html',
    TOKEN_VALIDITY: 120,  // 2 horas para sessão de login
    TOKEN_PARAM: 'access_key',
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
 * Verifica se o token está presente na URL
 */
function hasValidToken() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get(SECURITY_CONFIG.TOKEN_PARAM);
    
    if (token === SECURITY_CONFIG.LOGIN_TOKEN) {
        console.log('✅ Token válido encontrado');
        // Salvar token válido na sessão
        sessionStorage.setItem('login_token_valid', 'true');
        sessionStorage.setItem('login_token_time', Date.now().toString());
        return true;
    }
    
    // Verificar se já tem token válido na sessão
    const storedValid = sessionStorage.getItem('login_token_valid');
    const storedTime = sessionStorage.getItem('login_token_time');
    
    if (storedValid === 'true' && storedTime) {
        const elapsed = Date.now() - parseInt(storedTime);
        const maxAge = SECURITY_CONFIG.TOKEN_VALIDITY * 60 * 1000; // converter para ms
        
        if (elapsed < maxAge) {
            console.log('✅ Token da sessão ainda válido');
            return true;
        } else {
            console.log('⏰ Token da sessão expirado');
            sessionStorage.removeItem('login_token_valid');
            sessionStorage.removeItem('login_token_time');
        }
    }
    
    console.log('❌ Token inválido ou ausente');
    return false;
}

/**
 * Limpa o token da URL sem recarregar a página
 */
function cleanTokenFromURL() {
    if (window.location.search.includes(SECURITY_CONFIG.TOKEN_PARAM)) {
        const url = new URL(window.location);
        url.searchParams.delete(SECURITY_CONFIG.TOKEN_PARAM);
        window.history.replaceState({}, document.title, url.pathname + url.search);
        console.log('🧹 Token removido da URL');
    }
}

/**
 * Redireciona para página especificada
 */
function redirectTo(page, reason = '') {
    console.log(`� Redirecionando para: ${page} ${reason ? '(' + reason + ')' : ''}`);
    
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
    console.log(`🚫 Acesso bloqueado: ${reason}`);
    
    // Ocultar todo o conteúdo imediatamente
    document.documentElement.style.display = 'none';
    
    // Limpar conteúdo
    if (document.body) {
        document.body.innerHTML = '<div style="display:none;">Acesso negado</div>';
    }
    
    // Redirecionar
    if (reason.includes('login')) {
        redirectTo(SECURITY_CONFIG.REDIRECT_PAGE, 'login necessário');
    } else {
        redirectTo(SECURITY_CONFIG.REDIRECT_PAGE, 'token inválido');
    }
}

/**
 * Verifica proteção da página atual
 */
function checkPageProtection() {
    const currentPage = getCurrentPageName();
    const protectionType = SECURITY_CONFIG.PROTECTED_PAGES[currentPage];
    
    if (!protectionType) {
        console.log('ℹ️ Página não protegida');
        document.documentElement.style.display = '';
        return;
    }
    
    console.log(`� Verificando proteção para: ${currentPage} (tipo: ${protectionType})`);
    
    if (protectionType === 'token') {
        // Página protegida por token (admin-login.html)
        if (!hasValidToken()) {
            blockAccess('Token inválido ou ausente');
            return;
        }
        
        // Token válido - limpar da URL e continuar
        cleanTokenFromURL();
        console.log('✅ Acesso liberado - token válido');
        
    } else if (protectionType === 'auth') {
        // Página protegida por autenticação (admin.html, etc.)
        if (!isUserLoggedIn()) {
            blockAccess('Login necessário');
            return;
        }
        
        console.log('✅ Acesso liberado - usuário autenticado');
    }
    
    // Se chegou até aqui, liberar acesso
    document.documentElement.style.display = '';
}

/**
 * Funções utilitárias públicas
 */
window.RouteProtection = {
    /**
     * Gera URL com token para página de login
     */
    getLoginURL: function() {
        const baseURL = window.location.origin;
        const path = window.location.pathname.includes('/html/') ? 
            'admin-login.html' : 'html/admin-login.html';
        return `${baseURL}/${path}?${SECURITY_CONFIG.TOKEN_PARAM}=${SECURITY_CONFIG.LOGIN_TOKEN}`;
    },
    
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
        sessionStorage.removeItem('login_token_valid');
        sessionStorage.removeItem('login_token_time');
        sessionStorage.removeItem('admin_authenticated');
        console.log('🧹 Sessão de segurança limpa');
    },
    
    /**
     * Obtém configurações (sem expor token)
     */
    getConfig: function() {
        return {
            protectedPages: SECURITY_CONFIG.PROTECTED_PAGES,
            tokenValidity: SECURITY_CONFIG.TOKEN_VALIDITY,
            redirectPage: SECURITY_CONFIG.REDIRECT_PAGE
        };
    },
    
    /**
     * Verifica se tem sessão válida
     */
    hasValidSession: function() {
        const currentPage = getCurrentPageName();
        const protectionType = SECURITY_CONFIG.PROTECTED_PAGES[currentPage];
        
        if (protectionType === 'token') {
            return hasValidToken();
        } else if (protectionType === 'auth') {
            return isUserLoggedIn();
        }
        
        return true; // Página não protegida
    },
    
    /**
     * Simular login (para testes)
     */
    simulateLogin: function() {
        sessionStorage.setItem('admin_authenticated', 'true');
        console.log('🧪 Login simulado ativado');
    },
    
    /**
     * Simular logout (para testes)
     */
    simulateLogout: function() {
        sessionStorage.removeItem('admin_authenticated');
        console.log('🧪 Logout simulado ativado');
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

console.log('🛡️ Sistema de proteção de rotas inicializado');
console.log('🔑 Use: RouteProtection.getLoginURL() para gerar link de login');
console.log('👤 Use: RouteProtection.canAccessAdmin() para verificar acesso admin');

})();

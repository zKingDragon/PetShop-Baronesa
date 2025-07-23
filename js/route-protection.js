/**
 * Sistema de Proteção de Rotas Administrativas
 * Protege páginas sensíveis com token secreto
 */

(function() {
'use strict';

// Configurações de segurança
const SECURITY_CONFIG = {
    // Token secreto - ALTERE ESTE TOKEN PARA ALGO ÚNICO
    SECRET_TOKEN: 'PSB_ADM_2024_7x9k2mB8nQ5wE3r1vT6y',
    
    // Páginas protegidas (adicione mais conforme necessário)
    PROTECTED_PAGES: [
        'admin-login.html',
        'admin.html',
        'user-management.html'
    ],
    
    // Página de redirecionamento para acesso negado
    REDIRECT_PAGE: '../index.html',
    
    // Tempo de validade do token em sessão (em minutos)
    TOKEN_VALIDITY: 60,
    
    // Nome do parâmetro na URL
    TOKEN_PARAM: 'access_key',
    
    // Configurações adicionais de segurança
    BLOCK_DEVTOOLS: false, // Bloquear DevTools (não recomendado para desenvolvimento)
    CLEAR_CONSOLE: false,  // Limpar console (não recomendado para desenvolvimento)
    REDIRECT_DELAY: 500    // Delay antes do redirecionamento (ms)
};

/**
 * Verifica se a página atual é protegida
 * @returns {boolean}
 */
function isProtectedPage() {
    const currentPage = window.location.pathname.split('/').pop();
    return SECURITY_CONFIG.PROTECTED_PAGES.includes(currentPage);
}

/**
 * Obtém o token da URL
 * @returns {string|null}
 */
function getTokenFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(SECURITY_CONFIG.TOKEN_PARAM);
}

/**
 * Verifica se o token é válido
 * @param {string} token 
 * @returns {boolean}
 */
function isValidToken(token) {
    return token === SECURITY_CONFIG.SECRET_TOKEN;
}

/**
 * Salva o token válido na sessão com timestamp
 * @param {string} token 
 */
function saveTokenSession(token) {
    const sessionData = {
        token: token,
        timestamp: Date.now(),
        validity: SECURITY_CONFIG.TOKEN_VALIDITY * 60 * 1000 // converter para ms
    };
    
    sessionStorage.setItem('admin_session_token', JSON.stringify(sessionData));
    
    console.log('🔐 Token de sessão salvo com validade de', SECURITY_CONFIG.TOKEN_VALIDITY, 'minutos');
}

/**
 * Verifica se existe uma sessão válida
 * @returns {boolean}
 */
function hasValidSession() {
    try {
        const sessionData = sessionStorage.getItem('admin_session_token');
        if (!sessionData) return false;
        
        const data = JSON.parse(sessionData);
        const now = Date.now();
        const isExpired = (now - data.timestamp) > data.validity;
        
        if (isExpired) {
            sessionStorage.removeItem('admin_session_token');
            console.log('⏰ Sessão expirada, removendo token');
            return false;
        }
        
        return isValidToken(data.token);
    } catch (error) {
        console.error('❌ Erro ao verificar sessão:', error);
        sessionStorage.removeItem('admin_session_token');
        return false;
    }
}

/**
 * Remove o token da URL mantendo outros parâmetros
 */
function cleanURL() {
    const url = new URL(window.location);
    url.searchParams.delete(SECURITY_CONFIG.TOKEN_PARAM);
    
    // Atualizar URL sem recarregar a página
    window.history.replaceState({}, document.title, url.toString());
    
    console.log('🧹 URL limpa, token removido da visualização');
}

/**
 * Redireciona para página de acesso negado
 */
function redirectToAccessDenied() {
    console.log('🚫 Acesso negado, redirecionando...');
    
    // Usar delay configurável
    setTimeout(() => {
        window.location.href = SECURITY_CONFIG.REDIRECT_PAGE;
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
 * Oculta completamente o conteúdo da página
 */
function hidePageContent() {
    // Ocultar todo o conteúdo imediatamente
    document.documentElement.style.display = 'none';
    
    // Adicionar estilo inline para garantir que nada seja visível
    const style = document.createElement('style');
    style.textContent = `
        * { display: none !important; }
        body { background: #000 !important; }
    `;
    document.head.appendChild(style);
}

/**
 * Restaura a visibilidade da página
 */
function showPageContent() {
    document.documentElement.style.display = 'block';
    
    // Remove estilos de ocultação se existirem
    const hideStyles = document.head.querySelectorAll('style');
    hideStyles.forEach(style => {
        if (style.textContent.includes('display: none !important')) {
            style.remove();
        }
    });
}

/**
 * Verifica e protege a página atual
 */
function protectPage() {
    // Só proteger se for uma página protegida
    if (!isProtectedPage()) {
        console.log('ℹ️ Página não protegida, continuando normalmente');
        return;
    }
    
    console.log('🛡️ Página protegida detectada, verificando acesso...');
    
    // Ocultar conteúdo imediatamente enquanto verifica
    hidePageContent();
    
    // Verificar se já tem sessão válida
    if (hasValidSession()) {
        console.log('✅ Sessão válida encontrada, permitindo acesso');
        showPageContent();
        return;
    }
    
    // Verificar token na URL
    const token = getTokenFromURL();
    
    if (token && isValidToken(token)) {
        console.log('✅ Token válido fornecido, criando sessão');
        saveTokenSession(token);
        cleanURL();
        showPageContent();
        return;
    }
    
    // Acesso negado
    console.log('🚫 Acesso negado - token inválido ou ausente');
    
    // Escolha uma das opções abaixo:
    
    // Opção 1: Redirecionar para página inicial
    redirectToAccessDenied();
    
    // Opção 2: Mostrar página de erro (descomente a linha abaixo e comente a de cima)
    // showAccessDeniedMessage();
}

/**
 * Gera uma URL de acesso com token (função de desenvolvimento)
 */
function generateAccessURL() {
    const currentURL = new URL(window.location);
    currentURL.searchParams.set(SECURITY_CONFIG.TOKEN_PARAM, SECURITY_CONFIG.SECRET_TOKEN);
    return currentURL.toString();
}

/**
 * Limpa a sessão (logout de segurança)
 */
function clearSecuritySession() {
    sessionStorage.removeItem('admin_session_token');
    console.log('🧹 Sessão de segurança limpa');
}

// Exportar funções para uso global (apenas em desenvolvimento)
window.RouteProtection = {
    generateAccessURL,
    clearSecuritySession,
    isProtectedPage,
    hasValidSession,
    
    // Função para desenvolvedores obterem a URL de acesso
    getAdminURL: function() {
        const baseURL = window.location.origin + window.location.pathname;
        return `${baseURL}?${SECURITY_CONFIG.TOKEN_PARAM}=${SECURITY_CONFIG.SECRET_TOKEN}`;
    },
    
    // Função para gerar URLs de outras páginas protegidas
    getAdminURLFor: function(page) {
        const baseURL = window.location.origin + '/html/' + page;
        return `${baseURL}?${SECURITY_CONFIG.TOKEN_PARAM}=${SECURITY_CONFIG.SECRET_TOKEN}`;
    },
    
    // Informações do sistema (apenas para debug)
    getConfig: function() {
        return {
            protectedPages: SECURITY_CONFIG.PROTECTED_PAGES,
            tokenValidity: SECURITY_CONFIG.TOKEN_VALIDITY,
            tokenParam: SECURITY_CONFIG.TOKEN_PARAM
        };
    }
};

// Executar proteção imediatamente
protectPage();

// Também executar quando a página carregar completamente
document.addEventListener('DOMContentLoaded', protectPage);

console.log('🛡️ Sistema de proteção de rotas inicializado');

})();

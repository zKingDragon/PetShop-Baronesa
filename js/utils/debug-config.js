/**
 * Configuração de Debug para PetShop Baronesa
 * Controla logs e modo de desenvolvimento
 */

// ========================
// CONFIGURAÇÃO DE AMBIENTE
// ========================

// Definir modo debug globalmente
// true = desenvolvimento (logs ativos)
// false = produção (apenas erros)
window.DEBUG_MODE = true; // ALTERE PARA false EM PRODUÇÃO

// ========================
// CONFIGURAÇÕES DE LOG
// ========================

// Configurações específicas por módulo
window.LOG_CONFIG = {
    // Módulos que devem sempre logar (mesmo em produção)
    alwaysLog: [
        'SecurityError',
        'PaymentError', 
        'CriticalSystemError',
        'AuthenticationError'
    ],
    
    // Módulos que podem ser silenciados em produção
    developmentOnly: [
        'ProductsService',
        'FilterDebug',
        'UIDebug',
        'CartDebug',
        'NavigationDebug'
    ],
    
    // Nível de log por módulo (error, warn, info, debug)
    moduleLogLevels: {
        'ProductsService': 'info',
        'AuthService': 'warn',
        'CartService': 'info',
        'AdminPanel': 'debug',
        'Security': 'error'
    }
};

// ========================
// UTILITÁRIOS DE DEBUG
// ========================

// Função para habilitar debug via URL
function enableDebugFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('debug') === 'true') {
        window.DEBUG_MODE = true;
        sessionStorage.setItem('debug_enabled', 'true');
    }
    
    // Permitir debug via sessionStorage
    if (sessionStorage.getItem('debug_enabled') === 'true') {
        window.DEBUG_MODE = true;
    }
}

// Função para debug manual via console
window.enableDebug = function() {
    window.DEBUG_MODE = true;
    sessionStorage.setItem('debug_enabled', 'true');
    if (window.Logger) {
        window.Logger.enableDebug();
        window.Logger.system('Debug', 'Modo debug ativado manualmente');
    }
    console.log('🐛 Modo debug ativado! Use window.disableDebug() para desativar.');
};

window.disableDebug = function() {
    window.DEBUG_MODE = false;
    sessionStorage.removeItem('debug_enabled');
    if (window.Logger) {
        window.Logger.setLevel('error');
        window.Logger.system('Debug', 'Modo debug desativado');
    }
    console.log('🔇 Modo debug desativado.');
};

// Função para ver logs de erro coletados
window.viewErrorLogs = function() {
    if (window.Logger) {
        const logs = window.Logger.getErrorLogs();
        if (logs.length > 0) {
            console.table(logs);
            return logs;
        } else {
            console.log('📋 Nenhum log de erro encontrado.');
            return [];
        }
    }
};

// Função para limpar logs
window.clearLogs = function() {
    if (window.Logger) {
        window.Logger.clearErrorLogs();
        console.log('🧹 Logs limpos.');
    }
};

// ========================
// DETECÇÃO AUTOMÁTICA DE AMBIENTE
// ========================

// Detectar ambiente automaticamente
function detectEnvironment() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname === '' ||
                       window.location.protocol === 'file:';
    
    const isStaging = window.location.hostname.includes('staging') ||
                     window.location.hostname.includes('dev') ||
                     window.location.hostname.includes('test');
    
    const isProduction = window.location.hostname.includes('petshopbaronesa.com') ||
                        window.location.hostname.includes('baronesa.pet') ||
                        (!isLocalhost && !isStaging);
    
    return {
        isLocalhost,
        isStaging, 
        isProduction,
        environment: isProduction ? 'production' : isStaging ? 'staging' : 'development'
    };
}

// ========================
// INICIALIZAÇÃO
// ========================

(function() {
    // Detectar ambiente
    const env = detectEnvironment();
    
    // Configurar modo debug baseado no ambiente
    if (env.isProduction && !window.DEBUG_MODE) {
        window.DEBUG_MODE = false;
    } else if (env.isLocalhost || env.isStaging) {
        enableDebugFromURL();
    }
    
    // Log de inicialização (apenas em desenvolvimento)
    if (window.DEBUG_MODE) {
        console.log(`🏗️ Ambiente detectado: ${env.environment}`);
        console.log('🔧 Comandos disponíveis:');
        console.log('  - window.enableDebug() - Ativar logs');
        console.log('  - window.disableDebug() - Desativar logs'); 
        console.log('  - window.viewErrorLogs() - Ver logs de erro');
        console.log('  - window.clearLogs() - Limpar logs');
    }
    
    // Salvar configurações globalmente
    window.ENV_CONFIG = env;
})();

// ========================
// CONFIGURAÇÃO PARA PRODUÇÃO
// ========================

// Se estiver em produção, remover logs de debug do console
if (!window.DEBUG_MODE) {
    // Manter apenas console.error e console.warn
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.log = function() {};
    console.info = function() {};
    console.debug = function() {};
    
    // Preservar error e warn originais
    console.error = originalError;
    console.warn = originalWarn;
}

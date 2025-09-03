/**
 * Sistema de Desabilitação de Console para Produção
 * Deve ser carregado ANTES de qualquer outro script
 */

(function() {
    'use strict';
    
    /**
     * Detecta se está em ambiente de desenvolvimento
     */
    function isDevelopmentEnvironment() {
        // Verifica se está em localhost ou arquivo local
        const isLocalhost = window.location.hostname === 'localhost' || 
                           window.location.hostname === '127.0.0.1' ||
                           window.location.hostname === '' ||
                           window.location.protocol === 'file:';
        
        // Verifica se está em modo debug via URL
        const urlParams = new URLSearchParams(window.location.search);
        const debugMode = urlParams.get('debug') === 'true';
        
        // Verifica variável global de debug
        const globalDebug = window.DEBUG_MODE === true;
        
        // Verifica se é página de admin
        const isAdminPage = window.location.pathname.includes('admin') || 
                           window.location.pathname.includes('database-init');
        
        return isLocalhost || debugMode || globalDebug || isAdminPage;
    }
    
    /**
     * Desabilita completamente o console em produção
     */
    function disableConsoleInProduction() {
        if (isDevelopmentEnvironment()) {
            // Em desenvolvimento, manter logs
            console.log('🔧 Ambiente de desenvolvimento detectado - logs habilitados');
            return;
        }
        
        // Em produção, desabilitar TODOS os logs
        const noop = function() {};
        
        // Salvar métodos originais (caso precisem ser restaurados)
        window._originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
            debug: console.debug,
            trace: console.trace,
            dir: console.dir,
            dirxml: console.dirxml,
            table: console.table,
            group: console.group,
            groupCollapsed: console.groupCollapsed,
            groupEnd: console.groupEnd,
            time: console.time,
            timeEnd: console.timeEnd,
            count: console.count,
            assert: console.assert
        };
        
        // Desabilitar todos os métodos de console
        console.log = noop;
        console.info = noop;
        console.warn = noop;
        console.error = noop;
        console.debug = noop;
        console.trace = noop;
        console.dir = noop;
        console.dirxml = noop;
        console.table = noop;
        console.group = noop;
        console.groupCollapsed = noop;
        console.groupEnd = noop;
        console.time = noop;
        console.timeEnd = noop;
        console.count = noop;
        console.assert = noop;
        
        // Definir flag global para outros scripts saberem que está em produção
        window.PRODUCTION_MODE = true;
        window.CONSOLE_DISABLED = true;
    }
    
    /**
     * Função para reabilitar console (apenas para debug temporário)
     */
    function enableConsole() {
        if (window._originalConsole) {
            console.log = window._originalConsole.log;
            console.info = window._originalConsole.info;
            console.warn = window._originalConsole.warn;
            console.error = window._originalConsole.error;
            console.debug = window._originalConsole.debug;
            console.trace = window._originalConsole.trace;
            console.dir = window._originalConsole.dir;
            console.dirxml = window._originalConsole.dirxml;
            console.table = window._originalConsole.table;
            console.group = window._originalConsole.group;
            console.groupCollapsed = window._originalConsole.groupCollapsed;
            console.groupEnd = window._originalConsole.groupEnd;
            console.time = window._originalConsole.time;
            console.timeEnd = window._originalConsole.timeEnd;
            console.count = window._originalConsole.count;
            console.assert = window._originalConsole.assert;
            
            window.CONSOLE_DISABLED = false;
            console.log('🔧 Console reabilitado');
        }
    }
    
    /**
     * Função para desabilitar console temporariamente
     */
    function disableConsole() {
        disableConsoleInProduction();
        console.log('🔇 Console desabilitado');
    }
    
    // Executar imediatamente
    disableConsoleInProduction();
    
    // Expor funções globalmente para debug (apenas em desenvolvimento)
    if (isDevelopmentEnvironment()) {
        window.enableConsole = enableConsole;
        window.disableConsole = disableConsole;
        window.checkEnvironment = isDevelopmentEnvironment;
    }
    
})();

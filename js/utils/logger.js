/**
 * Sistema de Logging Profissional para PetShop Baronesa
 * Controla logs baseado no ambiente (desenvolvimento/produção)
 */

class Logger {
    constructor() {
        // Detecta ambiente baseado na URL ou configuração
        this.isDevelopment = this.detectEnvironment();
        this.logLevel = this.isDevelopment ? 'debug' : 'error';
        
        // Níveis de log por ordem de importância
        this.levels = {
            error: 0,
            warn: 1, 
            info: 2,
            debug: 3
        };
        
        // Cores para logs no console (apenas desenvolvimento)
        this.colors = {
            error: '#ff4757',   // Vermelho
            warn: '#ffa726',    // Laranja
            info: '#42a5f5',    // Azul
            debug: '#66bb6a',   // Verde
            system: '#ab47bc'   // Roxo
        };
        
        // Inicializar sistema
        this.init();
    }
    
    /**
     * Detecta se está em ambiente de desenvolvimento
     */
    detectEnvironment() {
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
        
        return isLocalhost || debugMode || globalDebug;
    }
    
    /**
     * Inicializa o sistema de logging
     */
    init() {
        if (this.isDevelopment) {
            this.info('🔧 Logger', 'Sistema de logging inicializado (DESENVOLVIMENTO)');
            this.info('🔧 Logger', `Nível de log: ${this.logLevel}`);
        }
        
        // Em produção, sobrescrever console.log para evitar logs acidentais
        if (!this.isDevelopment) {
            this.disableConsoleLogs();
        }
    }
    
    /**
     * Desabilita console.log em produção
     */
    disableConsoleLogs() {
        const originalLog = console.log;
        const originalInfo = console.info;
        const originalDebug = console.debug;
        
        console.log = () => {}; // Silenciar logs normais
        console.info = () => {}; // Silenciar infos
        console.debug = () => {}; // Silenciar debug
        
        // Manter apenas erro e warn em produção
        // console.error e console.warn permanecem ativos
        
        // Salvar referências originais para desenvolvimento
        this._originalConsole = {
            log: originalLog,
            info: originalInfo,
            debug: originalDebug
        };
    }
    
    /**
     * Verifica se deve logar baseado no nível
     */
    shouldLog(level) {
        return this.levels[level] <= this.levels[this.logLevel];
    }
    
    /**
     * Formatar timestamp
     */
    getTimestamp() {
        return new Date().toLocaleTimeString('pt-BR', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    }
    
    /**
     * Log de erro (sempre exibido)
     */
    error(context, message, data = null) {
        const timestamp = this.getTimestamp();
        const prefix = `❌ [${timestamp}] ${context}:`;
        
        if (data) {
            console.error(prefix, message, data);
        } else {
            console.error(prefix, message);
        }
        
        // Em produção, enviar erros para serviço de monitoramento
        if (!this.isDevelopment) {
            this.sendToErrorTracking(context, message, data);
        }
    }
    
    /**
     * Log de aviso (sempre exibido)
     */
    warn(context, message, data = null) {
        if (!this.shouldLog('warn')) return;
        
        const timestamp = this.getTimestamp();
        const prefix = `⚠️ [${timestamp}] ${context}:`;
        
        if (data) {
            console.warn(prefix, message, data);
        } else {
            console.warn(prefix, message);
        }
    }
    
    /**
     * Log informativo (apenas desenvolvimento)
     */
    info(context, message, data = null) {
        if (!this.shouldLog('info')) return;
        
        const timestamp = this.getTimestamp();
        
        if (this.isDevelopment) {
            const style = `color: ${this.colors.info}; font-weight: bold;`;
            if (data) {

            } else {

            }
        }
    }
    
    /**
     * Log de debug (apenas desenvolvimento)
     */
    debug(context, message, data = null) {
        if (!this.shouldLog('debug')) return;
        
        const timestamp = this.getTimestamp();
        
        if (this.isDevelopment) {
            const style = `color: ${this.colors.debug}; font-size: 0.9em;`;
            if (data) {

            } else {

            }
        }
    }
    
    /**
     * Log de sistema (sempre exibido com destaque)
     */
    system(context, message, data = null) {
        const timestamp = this.getTimestamp();
        
        if (this.isDevelopment) {
            const style = `color: ${this.colors.system}; font-weight: bold; font-size: 1.1em;`;
            if (data) {

            } else {

            }
        } else {
            // Em produção, apenas erros críticos do sistema
            if (message.includes('erro') || message.includes('falhou') || message.includes('error')) {
                console.error(`🛡️ [${timestamp}] ${context}: ${message}`);
            }
        }
    }
    
    /**
     * Log de performance
     */
    performance(context, message, duration = null) {
        if (!this.isDevelopment) return;
        
        const timestamp = this.getTimestamp();
        const durationText = duration ? ` (${duration}ms)` : '';
        
        console.log(
            `%c⚡ [${timestamp}] PERF ${context}:`,
            'color: #f39c12; font-weight: bold;',
            message + durationText
        );
    }
    
    /**
     * Grupo de logs (apenas desenvolvimento)
     */
    group(label, collapsed = false) {
        if (!this.isDevelopment) return;
        
        if (collapsed) {
            console.groupCollapsed(`📁 ${label}`);
        } else {
            console.group(`📂 ${label}`);
        }
    }
    
    /**
     * Fechar grupo de logs
     */
    groupEnd() {
        if (!this.isDevelopment) return;
        console.groupEnd();
    }
    
    /**
     * Log de tabela (apenas desenvolvimento)
     */
    table(context, data) {
        if (!this.isDevelopment) return;
        

        console.table(data);
    }
    
    /**
     * Enviar erros para serviço de monitoramento (produção)
     */
    sendToErrorTracking(context, message, data) {
        // Implementar integração com serviços como Sentry, LogRocket, etc.
        // Por enquanto, apenas registrar no localStorage para análise posterior
        try {
            const errorLog = {
                timestamp: new Date().toISOString(),
                context,
                message,
                data,
                url: window.location.href,
                userAgent: navigator.userAgent
            };
            
            // Manter apenas os últimos 50 erros
            const existingErrors = JSON.parse(localStorage.getItem('petshop_error_logs') || '[]');
            existingErrors.push(errorLog);
            
            if (existingErrors.length > 50) {
                existingErrors.shift(); // Remove o mais antigo
            }
            
            localStorage.setItem('petshop_error_logs', JSON.stringify(existingErrors));
        } catch (e) {
            // Falhou ao salvar erro - não fazer nada para evitar loop
        }
    }
    
    /**
     * Definir nível de log dinamicamente
     */
    setLevel(level) {
        if (this.levels.hasOwnProperty(level)) {
            this.logLevel = level;
            this.info('Logger', `Nível de log alterado para: ${level}`);
        } else {
            this.warn('Logger', `Nível de log inválido: ${level}`);
        }
    }
    
    /**
     * Habilitar modo debug temporariamente
     */
    enableDebug() {
        this.logLevel = 'debug';
        this.info('Logger', 'Modo debug habilitado');
    }
    
    /**
     * Obter logs de erro para análise
     */
    getErrorLogs() {
        try {
            return JSON.parse(localStorage.getItem('petshop_error_logs') || '[]');
        } catch (e) {
            return [];
        }
    }
    
    /**
     * Limpar logs de erro
     */
    clearErrorLogs() {
        localStorage.removeItem('petshop_error_logs');
        this.info('Logger', 'Logs de erro limpos');
    }
}

// Criar instância global
const logger = new Logger();

// Exportar para uso global
window.Logger = logger;

// Conveniência - métodos globais
window.logError = (context, message, data) => logger.error(context, message, data);
window.logWarn = (context, message, data) => logger.warn(context, message, data);
window.logInfo = (context, message, data) => logger.info(context, message, data);
window.logDebug = (context, message, data) => logger.debug(context, message, data);
window.logSystem = (context, message, data) => logger.system(context, message, data);
window.logPerf = (context, message, duration) => logger.performance(context, message, duration);

// Log de inicialização
logger.system('PetShop Baronesa', 'Sistema de logging profissional carregado');

// Exportar para módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = logger;
}

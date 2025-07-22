/**
 * Admin Token System
 * Gerencia tokens JWT específicos para administradores
 */
class AdminTokenManager {
    constructor() {
        this.tokenKey = 'petshop_baronesa_admin_token';
        this.tokenSecret = 'baronesa_admin_2025'; // Chave para verificação
    }

    /**
     * Gerar token admin
     * @param {Object} user - Objeto do usuário
     * @returns {string} - Token JWT
     */
    generateToken(user) {
        if (!user || !user.uid || !user.email) {
            console.error('Dados de usuário inválidos para geração de token');
            return null;
        }

        try {
            // Criar payload do token
            const payload = {
                uid: user.uid,
                email: user.email,
                role: 'admin',
                iat: Date.now(),
                exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 dias
            };

            // Converter para base64
            const payloadBase64 = btoa(JSON.stringify(payload));
            
            // Criar assinatura (simplificada - em produção use algo mais seguro)
            const signature = this.createSignature(payloadBase64);
            
            // Formato: payload.signature
            return `${payloadBase64}.${signature}`;
            
        } catch (error) {
            console.error('Erro ao gerar token admin:', error);
            return null;
        }
    }

    /**
     * Verificar token admin
     * @param {string} token - Token JWT
     * @returns {Object|null} - Dados do usuário ou null se inválido
     */
    verifyToken(token) {
        if (!token) {
            return null;
        }

        try {
            // Separar payload e assinatura
            const [payloadBase64, signature] = token.split('.');
            
            if (!payloadBase64 || !signature) {
                return null;
            }
            
            // Verificar assinatura
            const expectedSignature = this.createSignature(payloadBase64);
            if (signature !== expectedSignature) {
                console.warn('Assinatura de token admin inválida');
                return null;
            }
            
            // Decodificar payload
            const payload = JSON.parse(atob(payloadBase64));
            
            // Verificar expiração
            if (payload.exp < Date.now()) {
                console.warn('Token admin expirado');
                return null;
            }
            
            return {
                uid: payload.uid,
                email: payload.email,
                role: payload.role
            };
            
        } catch (error) {
            console.error('Erro ao verificar token admin:', error);
            return null;
        }
    }

    /**
     * Salvar token admin
     * @param {string} token - Token JWT
     */
    saveToken(token) {
        if (!token) return;
        localStorage.setItem(this.tokenKey, token);
    }

    /**
     * Recuperar token admin
     * @returns {string|null} - Token JWT ou null
     */
    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Remover token admin
     */
    removeToken() {
        localStorage.removeItem(this.tokenKey);
    }

    /**
     * Criar assinatura para o token
     * @param {string} payloadBase64 - Payload em base64
     * @returns {string} - Assinatura
     */
    createSignature(payloadBase64) {
        // Função simplificada de hash - em produção use algo mais seguro
        let hash = 0;
        const str = payloadBase64 + this.tokenSecret;
        
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Converter para 32bit integer
        }
        
        return Math.abs(hash).toString(36);
    }

    /**
     * Verificar se usuário é admin via token
     * @returns {boolean} - True se admin
     */
    isAdminByToken() {
        const token = this.getToken();
        if (!token) return false;
        
        const userData = this.verifyToken(token);
        return !!userData && userData.role === 'admin';
    }
}

// Exportar para uso global
window.AdminTokenManager = new AdminTokenManager();
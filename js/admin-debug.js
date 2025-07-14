/**
 * Debug functions for admin access testing
 */

// Função para testar o status de admin
async function testAdminStatus() {
    console.log('=== TESTE DE STATUS ADMIN ===');

    try {
        // Verifica se Firebase está carregado
        console.log('Firebase carregado:', typeof firebase !== 'undefined');
        console.log('Firebase Auth:', typeof firebase !== 'undefined' && firebase.auth);

        // Verifica funções de autenticação
        console.log('getCurrentUser function:', typeof getCurrentUser === 'function');
        console.log('getCurrentUserType function:', typeof getCurrentUserType === 'function');
        console.log('isAdmin function:', typeof isAdmin === 'function');

        // Verifica usuário atual
        const currentUser = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
        console.log('Usuário atual:', currentUser?.email);

        if (!currentUser) {
            console.log('❌ Nenhum usuário logado');
            return false;
        }

        // Verifica tipo do usuário
        const userType = typeof getCurrentUserType === 'function' ? await getCurrentUserType() : null;
        console.log('Tipo do usuário:', userType);

        // Verifica se é admin
        const isAdminResult = typeof isAdmin === 'function' ? await isAdmin() : false;
        console.log('É admin?', isAdminResult);

        // Verifica dados do localStorage
        const authData = localStorage.getItem('petshop_baronesa_auth');
        if (authData) {
            try {
                const userData = JSON.parse(authData);
                console.log('Dados do localStorage:', userData);
            } catch (error) {
                console.error('Erro ao parsear dados do localStorage:', error);
            }
        }

        console.log('=== RESULTADO ===');
        const hasAccess = userType === 'admin' || isAdminResult;
        console.log('Deveria ter acesso ao admin:', hasAccess);

        return hasAccess;

    } catch (error) {
        console.error('Erro no teste:', error);
        return false;
    }
}

// Função para testar o middleware
async function testAdminMiddleware() {
    console.log('=== TESTE DO MIDDLEWARE ===');

    try {
        // Verifica se o middleware está carregado
        console.log('AdminMiddleware carregado:', typeof AdminMiddleware !== 'undefined');

        // Verifica se existe instância do middleware
        console.log('Window.adminMiddleware:', typeof window.adminMiddleware);

        // Testa as funções do middleware se disponível
        if (window.adminMiddleware) {
            console.log('Testando isUserAuthenticated...');
            const isAuth = window.adminMiddleware.isUserAuthenticated();
            console.log('Is authenticated:', isAuth);

            if (isAuth) {
                console.log('Testando isUserAdmin...');
                const isAdmin = await window.adminMiddleware.isUserAdmin();
                console.log('Is admin:', isAdmin);
            }
        }

    } catch (error) {
        console.error('Erro no teste do middleware:', error);
    }
}

// Função para simular login de admin (para teste)
async function simulateAdminLogin() {
    console.log('=== SIMULANDO LOGIN DE ADMIN ===');

    try {
        // Simula dados de admin no localStorage
        const adminData = {
            uid: 'admin-test-123',
            email: 'admin@petshop.com',
            type: 'admin',
            displayName: 'Admin Test'
        };

        localStorage.setItem('petshop_baronesa_auth', JSON.stringify(adminData));
        console.log('Dados de admin salvos no localStorage');

        // Força uma verificação
        if (window.adminMiddleware) {
            await window.adminMiddleware.checkPageAccess();
        }

    } catch (error) {
        console.error('Erro ao simular login:', error);
    }
}

// Adiciona funções globais para facilitar o teste
window.testAdminStatus = testAdminStatus;
window.testAdminMiddleware = testAdminMiddleware;
window.simulateAdminLogin = simulateAdminLogin;

// Executa testes automaticamente se estiver na página admin
if (window.location.pathname.includes('admin.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🔧 Debug mode ativado para admin.html');
        console.log('Funções disponíveis: testAdminStatus(), testAdminMiddleware(), simulateAdminLogin()');

        // Executa teste após um delay para dar tempo do sistema carregar
        setTimeout(async () => {
            await testAdminStatus();
            await testAdminMiddleware();
        }, 3000);
    });
}

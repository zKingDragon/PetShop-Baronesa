// Script de debug simples
function testAuth() {
    console.log('=== TESTE DE AUTENTICAÇÃO ===');

    // 1. Verificar Firebase
    if (typeof firebase === 'undefined') {
        console.log('❌ Firebase não carregado');
        return;
    }

    const user = firebase.auth().currentUser;
    console.log('👤 Usuário logado:', user ? user.email : 'Nenhum');

    if (user) {
        // 2. Verificar tipo de usuário
        if (window.auth && window.auth.checkUserType) {
            window.auth.checkUserType(user.uid).then(type => {
                console.log('🔑 Tipo de usuário:', type);

                // 3. Verificar se é admin
                window.auth.isAdmin().then(isAdmin => {
                    console.log('👑 É admin?', isAdmin);

                    // 4. Verificar dropdown
                    const dropdown = document.querySelector('.user-dropdown');
                    if (dropdown) {
                        const adminLinks = dropdown.querySelectorAll('.admin-only');
                        console.log('🎨 Links admin encontrados:', adminLinks.length);
                        adminLinks.forEach(link => {
                            console.log('   -', link.textContent.trim(), 'Visível:', link.style.display !== 'none');
                        });

                        const adminBadge = dropdown.querySelector('.admin-badge');
                        console.log('🛡️ Badge de admin:', adminBadge ? 'Presente' : 'Ausente');
                    } else {
                        console.log('❌ Dropdown não encontrado');
                    }
                });
            }).catch(err => {
                console.log('❌ Erro ao verificar tipo:', err);
            });
        } else {
            console.log('❌ window.auth não disponível');
        }
    }
}

// Força atualização do header
function updateHeader() {
    console.log('🔄 Forçando atualização do header...');
    if (window.headerAuth && window.headerAuth.updateHeaderUI) {
        window.headerAuth.updateHeaderUI();
        console.log('✅ Comando de atualização enviado');
    } else {
        console.log('❌ window.headerAuth não disponível');
    }
}

// Função para limpar cache
function clearCache() {
    localStorage.removeItem('petshop_user_type');
    console.log('🗑️ Cache limpo');
}

// Função para recriar dropdown
function recreateDropdown() {
    const existingDropdown = document.querySelector('.user-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();
        console.log('🗑️ Dropdown removido');
    }

    // Aguarda um pouco e força reinicialização
    setTimeout(() => {
        if (window.headerAuth && window.headerAuth.updateHeaderUI) {
            window.headerAuth.updateHeaderUI();
            console.log('🔄 Dropdown recriado');
        }
    }, 500);
}

window.testAuth = testAuth;
window.updateHeader = updateHeader;
window.clearCache = clearCache;
window.recreateDropdown = recreateDropdown;

console.log('🛠️ Funções de teste disponíveis: testAuth(), updateHeader(), clearCache(), recreateDropdown()');

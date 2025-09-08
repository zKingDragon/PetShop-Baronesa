// Script de debug simples
function testAuth() {

    
    // 1. Verificar Firebase
    if (typeof firebase === 'undefined') {

        return;
    }
    
    const user = firebase.auth().currentUser;

    
    if (user) {
        // 2. Verificar tipo de usuário
        if (window.auth && window.auth.checkUserType) {
            window.auth.checkUserType(user.uid).then(type => {

                
                // 3. Verificar se é admin
                window.auth.isAdmin().then(isAdmin => {

                    
                    // 4. Verificar dropdown
                    const dropdown = document.querySelector('.user-dropdown');
                    if (dropdown) {
                        const adminLinks = dropdown.querySelectorAll('.admin-only');

                        adminLinks.forEach(link => {

                        });
                        
                        const adminBadge = dropdown.querySelector('.admin-badge');

                    } else {

                    }
                });
            }).catch(err => {

            });
        } else {

        }
    }
}

// Força atualização do header
function updateHeader() {

    if (window.headerAuth && window.headerAuth.updateHeaderUI) {
        window.headerAuth.updateHeaderUI();

    } else {

    }
}

// Função para limpar cache
function clearCache() {
    localStorage.removeItem('petshop_user_type');

}

// Função para recriar dropdown
function recreateDropdown() {
    const existingDropdown = document.querySelector('.user-dropdown');
    if (existingDropdown) {
        existingDropdown.remove();

    }
    
    // Aguarda um pouco e força reinicialização
    setTimeout(() => {
        if (window.headerAuth && window.headerAuth.updateHeaderUI) {
            window.headerAuth.updateHeaderUI();

        }
    }, 500);
}

window.testAuth = testAuth;
window.updateHeader = updateHeader;
window.clearCache = clearCache;
window.recreateDropdown = recreateDropdown;



/**
 * Sistema de autenticação para o Pet Shop Baronesa
 * Sistema baseado em banco de dados com verificação de tipo de usuário
 */

// Constantes
const AUTH_KEY = "petshop_baronesa_auth"
const USER_TYPE_CACHE_KEY = "petshop_user_type"
const PROTECTED_PAGES = ["admin.html", "/admin.html", "/html/admin.html"]

// Cache para performance
let userTypeCache = null
let cacheTimestamp = null
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

// Elementos DOM
const authButtons = document.querySelector(".auth-buttons")
const userMenu = document.querySelector(".user-menu")
const userNameDisplay = document.getElementById("userNameDisplay")
const logoutButton = document.getElementById("logoutButton")
const loginForm = document.getElementById("loginForm")
const loginError = document.getElementById("loginError")

/**
 * Verifica o tipo de usuário no banco de dados
 * @param {string} uid - UID do usuário
 * @returns {Promise<string>} - Tipo do usuário: 'admin' ou 'guest'
 */
async function checkUserType(uid) {
    if (!uid) return 'guest'

    try {
        // Verificar cache primeiro
        if (userTypeCache && cacheTimestamp &&
            Date.now() - cacheTimestamp < CACHE_DURATION) {
            console.log('Usando cache para tipo de usuário:', userTypeCache)
            return userTypeCache
        }

        console.log('Verificando tipo de usuário no banco de dados para UID:', uid)

        // Tentativa 1: Verificar no Firestore
        if (typeof db !== 'undefined' && db) {
            const userDoc = await db.collection('usuarios').doc(uid).get()
            if (userDoc.exists) {
                const userData = userDoc.data()
                const userType = userData.type || userData.Type || 'admin'

                // Atualizar cache
                userTypeCache = userType
                cacheTimestamp = Date.now()
                localStorage.setItem(USER_TYPE_CACHE_KEY, JSON.stringify({
                    type: userType,
                    timestamp: cacheTimestamp,
                    uid: uid
                }))

                console.log('Tipo de usuário encontrado no Firestore:', userType)
                return userType
            }
        }

        // Tentativa 2: Verificar no cache do localStorage como fallback
        const cachedData = localStorage.getItem(USER_TYPE_CACHE_KEY)
        if (cachedData) {
            const { type, timestamp, uid: cachedUid } = JSON.parse(cachedData)
            if (cachedUid === uid && Date.now() - timestamp < CACHE_DURATION) {
                userTypeCache = type
                cacheTimestamp = timestamp
                console.log('Usando cache localStorage para tipo de usuário:', type)
                return type
            }
        }

        console.warn('Usuário não encontrado no banco de dados, default para admin')
        return 'admin' // Default para admin se não encontrar (apenas admins terão conta)
    } catch (error) {
        console.error('Erro ao verificar tipo de usuário:', error)
        return 'admin' // Default para admin em caso de erro
    }
}

/**
 * Obtém o usuário atual do Firebase Auth
 * @returns {Object|null} - Usuário atual ou null
 */
function getCurrentUser() {
    try {
        if (typeof auth !== 'undefined' && auth && auth.currentUser) {
            return auth.currentUser
        }

        if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
            return firebase.auth().currentUser
        }

        return null
    } catch (error) {
        console.error('Erro ao obter usuário atual:', error)
        return null
    }
}

/**
 * Obtém o tipo de usuário atual
 * @returns {Promise<string>} - Tipo do usuário
 */
async function getCurrentUserType() {
    try {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            return 'guest'
        }

        return await checkUserType(currentUser.uid)
    } catch (error) {
        console.error('Erro ao obter tipo de usuário atual:', error)
        return 'guest'
    }
}

/**
 * Verifica se o usuário é admin
 * @param {Object} user - Usuário (opcional, usa o atual se não fornecido)
 * @returns {Promise<boolean>} - True se for admin
 */
async function isAdmin(user = null) {
    try {
        const currentUser = user || getCurrentUser()
        if (!currentUser) {
            console.log('[isAdmin] Nenhum usuário logado');
            return false
        }

        console.log('[isAdmin] Verificando admin para:', currentUser.email);

        const userType = await checkUserType(currentUser.uid)
        console.log('[isAdmin] Tipo do usuário:', userType);

        const isAdminResult = userType === 'admin';
        console.log('[isAdmin] Resultado:', isAdminResult);

        return isAdminResult;
    } catch (error) {
        console.error('[isAdmin] Erro ao verificar admin:', error)
        return false
    }
}

/**
 * Atualiza o tipo de usuário no banco de dados (apenas para admins)
 * @param {string} uid - UID do usuário
 * @param {string} newType - Novo tipo (apenas 'admin')
 * @returns {Promise<boolean>} - True se atualizado com sucesso
 */
async function updateUserType(uid, newType) {
    try {
        // Verificar se o usuário atual é admin
        const isCurrentUserAdmin = await isAdmin()
        if (!isCurrentUserAdmin) {
            throw new Error('Apenas administradores podem alterar tipos de usuário')
        }

        // Validar o novo tipo (apenas admin é permitido)
        if (newType !== 'admin') {
            throw new Error('Tipo de usuário inválido. Apenas "admin" é permitido')
        }

        console.log(`Atualizando tipo de usuário ${uid} para: ${newType}`)

        // Atualizar no Firestore
        if (typeof db !== 'undefined' && db) {
            await db.collection('usuarios').doc(uid).update({
                type: newType,
                Type: newType, // Garantir compatibilidade com ambos os nomes
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            })
        }

        // Limpar cache se for o usuário atual
        const currentUser = getCurrentUser()
        if (currentUser && currentUser.uid === uid) {
            clearUserTypeCache()
        }

        console.log(`Tipo de usuário atualizado para: ${newType}`)
        return true
    } catch (error) {
        console.error('Erro ao atualizar tipo de usuário:', error)
        throw error
    }
}

/**
 * Limpa o cache do tipo de usuário
 */
function clearUserTypeCache() {
    userTypeCache = null
    cacheTimestamp = null
    localStorage.removeItem(USER_TYPE_CACHE_KEY)
    console.log('Cache de tipo de usuário limpo')
}

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} - Verdadeiro se o usuário estiver autenticado
 */
function isAuthenticated() {
    const currentUser = getCurrentUser()
    return !!currentUser
}

/**
 * Obtém os dados do usuário autenticado
 * @returns {Object|null} - Dados do usuário ou null se não estiver autenticado
 */
function getAuthUser() {
    return getCurrentUser()
}

/**
 * Realiza o login do usuário usando Firebase Auth
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {Promise<boolean>} - Verdadeiro se o login for bem-sucedido
 */
async function login(email, password) {
    try {
        console.log('Tentando fazer login com:', email)

        // Garantir que o Firebase está inicializado
        if (typeof initializeFirebase === 'function') {
            await initializeFirebase()
        }

        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password)

        // Verificar tipo de usuário no banco de dados
        const userType = await checkUserType(userCredential.user.uid)
        console.log('Login realizado com sucesso. Tipo de usuário:', userType)

        // Salvar dados de autenticação
        const authData = {
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: userCredential.user.displayName,
            type: userType
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData))

        return true
    } catch (error) {
        console.error('Erro ao fazer login: Confira as informações inseridas ou entre usando o Google')
        if (loginError) {
            loginError.textContent = "Erro ao fazer login: Confira as informações inseridas ou entre usando o Google "  || "Tente novamente."
            loginError.style.display = "block"
        } else {
            alert("Erro ao fazer login: Confira as informações inseridas ou entre usando o Google" || "Tente novamente.")
        }
        return false
    }
}

/**
 * Realiza o logout do usuário
 */
async function logout() {
    try {
        // Limpar cache de tipo de usuário
        clearUserTypeCache()

        // Fazer logout do Firebase
        if (typeof firebase !== 'undefined' && firebase.auth) {
            await firebase.auth().signOut()
        }

        // Limpar dados locais
        localStorage.removeItem(AUTH_KEY)

        console.log('Logout realizado com sucesso')

        // Atualizar UI
        updateAuthUI()

        // Se estiver em uma página protegida, redireciona para a home
        if (PROTECTED_PAGES.some((page) => window.location.pathname.endsWith(page))) {
            window.location.href = "../index.html"
        }

        // Notifica o footer sobre o logout
        notifyAuthStateChange(null)
    } catch (error) {
        console.error('Erro ao fazer logout:', error)
    }
}

/**
 * Função para notificar mudanças no estado de autenticação
 * @param {Object|null} user - Dados do usuário ou null
 */
function notifyAuthStateChange(user) {
  // Dispara evento customizado para o footer e outros componentes
  const event = new CustomEvent('authStateChanged', {
    detail: { user }
  });
  document.dispatchEvent(event);
}

/**
 * Atualiza a interface de usuário com base no estado de autenticação
 */
async function updateAuthUI() {
    const isLoggedIn = isAuthenticated()
    const user = getCurrentUser()

    if (isLoggedIn && user) {
        try {
            const userType = await getCurrentUserType()
            const displayName = await getUserDisplayName()

            if (authButtons) authButtons.style.display = "none"
            if (userMenu) {
                userMenu.style.display = "block"
                if (userNameDisplay) {
                    userNameDisplay.textContent = displayName

                    // Adicionar indicador visual para admin
                    if (userType === 'admin') {
                        userNameDisplay.innerHTML = `<i class="fas fa-crown" style="color: gold; margin-right: 5px;"></i>${displayName}`
                    }
                }
            }
        } catch (error) {
            console.error('Erro ao atualizar UI:', error)
        }
    } else {
        if (authButtons) authButtons.style.display = "flex"
        if (userMenu) userMenu.style.display = "none"
    }

    // Notifica o footer sobre a mudança de estado
    notifyAuthStateChange(user)
}

/**
 * Obtém o nome de exibição do usuário baseado no tipo
 * @returns {Promise<string>} - Nome de exibição
 */
async function getUserDisplayName() {
    try {
        const currentUser = getCurrentUser()
        if (!currentUser) {
            return 'Visitante'
        }

        // Apenas admins têm conta, então se está logado é admin
        return 'Administrador'
    } catch (error) {
        console.error('Erro ao obter nome de exibição:', error)
        return 'Administrador'
    }
}


// Função para login com Google usando Firebase Auth
async function loginWithGoogle() {
    try {
        // Garante que o Firebase foi inicializado
        if (typeof initializeFirebase === 'function') {
            await initializeFirebase()
        }

        if (!firebase || !firebase.auth) {
            throw new Error("Firebase não está disponível")
        }

        const auth = firebase.auth()
        const provider = new firebase.auth.GoogleAuthProvider()

        const result = await auth.signInWithPopup(provider)

        // Verificar tipo de usuário no banco de dados
        const userType = await checkUserType(result.user.uid)
        console.log('Login com Google realizado. Tipo de usuário:', userType)

        // Salvar dados de autenticação
        const authData = {
            uid: result.user.uid,
            email: result.user.email,
            displayName: result.user.displayName,
            type: userType
        }
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData))

        // Redirecionar sempre para admin (apenas admins fazem login)
        window.location.href = "admin.html"
    } catch (error) {
        console.error('Erro ao fazer login com Google:', error)
        // Mostra mensagem de erro
        if (loginError) {
            loginError.textContent = "Erro ao entrar com Google, tente novamente."
            loginError.style.display = "block"
        } else {
            alert("Erro ao entrar com Google, tente novamente.")
        }
    }
}

// Listener para mudanças no estado de autenticação do Firebase
function setupAuthStateListener() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
        firebase.auth().onAuthStateChanged(async (user) => {
            console.log('Estado de autenticação alterado:', user ? user.email : 'não logado')

            if (user) {
                // Usuário logado - verificar tipo no banco de dados
                const userType = await checkUserType(user.uid)

                // Salvar dados de autenticação
                const authData = {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    type: userType
                }
                localStorage.setItem(AUTH_KEY, JSON.stringify(authData))
            } else {
                // Usuário deslogado - limpar dados
                localStorage.removeItem(AUTH_KEY)
                clearUserTypeCache()
            }

            // Atualizar UI
            await updateAuthUI()

            // Notificar componentes
            notifyAuthStateChange(user)
        })
    }
}

// Inicialização
document.addEventListener("DOMContentLoaded", async () => {
    try {
        // Inicializar Firebase se disponível
        if (typeof initializeFirebase === 'function') {
            await initializeFirebase()
            setupAuthStateListener()
        }

        // Atualiza a UI com base no estado de autenticação
        await updateAuthUI()


        // Configura o botão de logout
        if (logoutButton) {
            logoutButton.addEventListener("click", async (e) => {
                e.preventDefault()
                await logout()
            })
        }

        // Configura o formulário de login
        if (loginForm) {
            loginForm.addEventListener("submit", async (e) => {
                e.preventDefault()

                const email = document.getElementById("email").value
                const password = document.getElementById("password").value

                const loginSuccess = await login(email, password)
                if (loginSuccess) {
                    // Verifica se há uma página para redirecionar após o login
                    const redirectPath = sessionStorage.getItem("redirect_after_login")

                    if (redirectPath) {
                        sessionStorage.removeItem("redirect_after_login")
                        window.location.href = redirectPath
                    } else {
                        // Redirecionar sempre para admin (apenas admins fazem login)
                        window.location.href = "admin.html"
                    }
                } else {
                    // Mostra mensagem de erro
                    if (loginError) {
                        loginError.style.display = "block"
                    }
                }
            })
        }

        // Configura os toggles de senha
        const togglePasswordButtons = document.querySelectorAll(".toggle-password")
        togglePasswordButtons.forEach((button) => {
            button.addEventListener("click", function () {
                const targetId = this.getAttribute("data-target")
                const passwordInput = document.getElementById(targetId)

                // Alternar tipo de input entre password e text
                if (passwordInput.type === "password") {
                    passwordInput.type = "text"
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>'
                } else {
                    passwordInput.type = "password"
                    this.innerHTML = '<i class="fas fa-eye"></i>'
                }
            })
        })

        // Botão de login com Google
        const googleLoginBtn = document.getElementById("googleLoginBtn")
        if (googleLoginBtn) {
            googleLoginBtn.addEventListener("click", async function (e) {
                e.preventDefault()
                await loginWithGoogle()
            })
        }
    } catch (error) {
        console.error('Erro na inicialização do sistema de autenticação:', error)
    }
})

// Exportar funções para uso global
window.auth = {
    isAuthenticated,
    getCurrentUser,
    getCurrentUserType,
    isAdmin,
    updateUserType,
    clearUserTypeCache,
    login,
    logout,
    checkUserType
}

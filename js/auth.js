/**
 * Sistema de autenticação para o Pet Shop Baronesa
 * Este módulo gerencia login, logout e verificação de autenticação
 */

// Constantes
const AUTH_KEY = "petshop_baronesa_auth"
const PROTECTED_PAGES = ["/promocoes.html"]

// Elementos DOM
const authButtons = document.querySelector(".auth-buttons")
const userMenu = document.querySelector(".user-menu")
const userNameDisplay = document.getElementById("userNameDisplay")
const logoutButton = document.getElementById("logoutButton")
const loginForm = document.getElementById("loginForm")
const loginError = document.getElementById("loginError")

// Usuários de exemplo (em um sistema real, isso viria do backend)
const MOCK_USERS = [
  { email: "cliente@exemplo.com", password: "senha123", name: "Cliente Exemplo" },
  { email: "admin@petshopbaronesa.com", password: "admin123", name: "Administrador" },
]

/**
 * Verifica se o usuário está autenticado
 * @returns {boolean} - Verdadeiro se o usuário estiver autenticado
 */
function isAuthenticated() {
  const authData = localStorage.getItem(AUTH_KEY)
  return !!authData
}

/**
 * Obtém os dados do usuário autenticado
 * @returns {Object|null} - Dados do usuário ou null se não estiver autenticado
 */
function getAuthUser() {
  const authData = localStorage.getItem(AUTH_KEY)
  return authData ? JSON.parse(authData) : null
}

/**
 * Realiza o login do usuário
 * @param {string} email - Email do usuário
 * @param {string} password - Senha do usuário
 * @returns {boolean} - Verdadeiro se o login for bem-sucedido
 */
function login(email, password) {
  // Em um sistema real, isso seria uma chamada de API
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password)

  if (user) {
    // Armazena apenas os dados não sensíveis
    const userData = {
      email: user.email,
      name: user.name,
    }

    localStorage.setItem(AUTH_KEY, JSON.stringify(userData))
    return true
  }

  return false
}

/**
 * Realiza o logout do usuário
 */
function logout() {
  localStorage.removeItem(AUTH_KEY)
  updateAuthUI()

  // Se estiver em uma página protegida, redireciona para a home
  if (PROTECTED_PAGES.some((page) => window.location.pathname.endsWith(page))) {
    window.location.href = "index.html"
  }
}

/**
 * Atualiza a interface de usuário com base no estado de autenticação
 */
function updateAuthUI() {
  const isLoggedIn = isAuthenticated()

  if (isLoggedIn) {
    const user = getAuthUser()

    if (authButtons) authButtons.style.display = "none"
    if (userMenu) {
      userMenu.style.display = "block"
      if (userNameDisplay) userNameDisplay.textContent = user.name
    }
  } else {
    if (authButtons) authButtons.style.display = "flex"
    if (userMenu) userMenu.style.display = "none"
  }
}

/**
 * Verifica se a página atual é protegida e redireciona se necessário
 */
function checkProtectedPage() {
  const currentPath = window.location.pathname

  if (PROTECTED_PAGES.some((page) => currentPath.endsWith(page)) && !isAuthenticated()) {
    // Salva a página que o usuário tentou acessar
    sessionStorage.setItem("redirect_after_login", currentPath)

    // Redireciona para a página de login
    window.location.href = "login.html"
  }
}

// Função para login com Google usando Firebase Auth
function loginWithGoogle() {
  // Garante que o Firebase foi inicializado
  if (!window.FirebaseConfig || !window.FirebaseConfig.getAuth) {
    alert("Firebase não está disponível. Tente novamente mais tarde.")
    return
  }
  const auth = window.FirebaseConfig.getAuth()
  const provider = new firebase.auth.GoogleAuthProvider()

  auth.signInWithPopup(provider)
    .then((result) => {
      // Usuário autenticado com sucesso
      // Você pode salvar informações adicionais se desejar
      window.location.href = "admin.html"
    })
    .catch((error) => {
      // Mostra mensagem de erro
      if (loginError) {
        loginError.textContent = "Erro ao entrar com Google: " + (error.message || "Tente novamente.")
        loginError.style.display = "block"
      } else {
        alert("Erro ao entrar com Google: " + (error.message || "Tente novamente."))
      }
    })
}

// Inicialização
document.addEventListener("DOMContentLoaded", () => {
  // Atualiza a UI com base no estado de autenticação
  updateAuthUI()

  // Verifica se a página é protegida
  checkProtectedPage()

  // Configura o botão de logout
  if (logoutButton) {
    logoutButton.addEventListener("click", (e) => {
      e.preventDefault()
      logout()
    })
  }

  // Configura o formulário de login
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault()

      const email = document.getElementById("email").value
      const password = document.getElementById("password").value

      if (login(email, password)) {
        // Verifica se há uma página para redirecionar após o login
        const redirectPath = sessionStorage.getItem("redirect_after_login")

        if (redirectPath) {
          sessionStorage.removeItem("redirect_after_login")
          window.location.href = redirectPath
        } else {
          window.location.href = "index.html"
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
    googleLoginBtn.addEventListener("click", function (e) {
      e.preventDefault()
      // Inicializa o Firebase se necessário, então faz login com Google
      if (window.FirebaseConfig && window.FirebaseConfig.initializeFirebase) {
        window.FirebaseConfig.initializeFirebase()
          .then(() => {
            loginWithGoogle()
          })
          .catch(() => {
            if (loginError) {
              loginError.textContent = "Erro ao inicializar o Firebase. Tente novamente."
              loginError.style.display = "block"
            }
          })
      } else {
        loginWithGoogle()
      }
    })
  }
})

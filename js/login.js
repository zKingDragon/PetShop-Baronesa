/**
 * Script específico para a página de login
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializa Firebase
  try {
    const { auth } = await window.FirebaseConfig.initializeFirebase()
    window.AuthService.initialize(auth)
    
    // Se já estiver logado, redireciona
    if (window.AuthService.isAuthenticated()) {
      window.location.href = '../index.html'
      return
    }
  } catch (error) {
    console.error('Erro ao inicializar Firebase:', error)
  }

  // Elementos do DOM
  const loginForm = document.getElementById('loginForm')
  const loginError = document.getElementById('loginError')
  const loginBtn = document.getElementById('loginBtn')
  const demoBtns = document.querySelectorAll('.demo-btn')
  const togglePasswordBtns = document.querySelectorAll('.toggle-password')

  // Event listeners
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin)
  }

  demoBtns.forEach(btn => {
    btn.addEventListener('click', handleDemoLogin)
  })

  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', togglePasswordVisibility)
  })

  /**
   * Manipula o login do formulário
   */
  async function handleLogin(e) {
    e.preventDefault()
    
    const email = document.getElementById('email').value.trim()
    const password = document.getElementById('password').value
    
    if (!email || !password) {
      showError('Por favor, preencha todos os campos.')
      return
    }

    setLoading(true)
    hideError()

    try {
      await window.AuthService.signInWithEmailAndPassword(email, password)
      
      // Sucesso - redireciona para a página anterior ou home
      const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
      window.location.href = returnUrl
      
    } catch (error) {
      console.error('Erro no login:', error)
      showError('Email ou senha incorretos. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Manipula login com contas de demonstração
   */
  async function handleDemoLogin(e) {
    const email = e.currentTarget.dataset.email
    const password = e.currentTarget.dataset.password
    
    document.getElementById('email').value = email
    document.getElementById('password').value = password
    
    setLoading(true)
    hideError()

    try {
      await window.AuthService.signInWithEmailAndPassword(email, password)
      
      // Sucesso - redireciona
      const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
      window.location.href = returnUrl
      
    } catch (error) {
      console.error('Erro no login de demonstração:', error)
      
      // Se a conta de demo não existir, cria automaticamente
      if (error.message.includes('user-not-found')) {
        try {
          await createDemoAccount(email, password)
          await window.AuthService.signInWithEmailAndPassword(email, password)
          
          const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
          window.location.href = returnUrl
        } catch (createError) {
          console.error('Erro ao criar conta de demonstração:', createError)
          showError('Erro ao criar conta de demonstração. Tente novamente.')
        }
      } else {
        showError('Erro ao fazer login. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Cria conta de demonstração
   */
  async function createDemoAccount(email, password) {
    const displayName = email.includes('admin') ? 'Administrador' : 'Usuário Demonstração'
    await window.AuthService.createUserWithEmailAndPassword(email, password, displayName)
  }

  /**
   * Toggle visibilidade da senha
   */
  function togglePasswordVisibility(e) {
    const targetId = e.currentTarget.dataset.target
    const targetInput = document.getElementById(targetId)
    const icon = e.currentTarget.querySelector('i')
    
    if (targetInput.type === 'password') {
      targetInput.type = 'text'
      icon.classList.remove('fa-eye')
      icon.classList.add('fa-eye-slash')
    } else {
      targetInput.type = 'password'
      icon.classList.remove('fa-eye-slash')
      icon.classList.add('fa-eye')
    }
  }

  /**
   * Mostra erro
   */
  function showError(message) {
    if (loginError) {
      loginError.textContent = message
      loginError.style.display = 'block'
    }
  }

  /**
   * Esconde erro
   */
  function hideError() {
    if (loginError) {
      loginError.style.display = 'none'
    }
  }

  /**
   * Define estado de carregamento
   */
  function setLoading(loading) {
    if (loginBtn) {
      loginBtn.disabled = loading
      loginBtn.innerHTML = loading 
        ? '<i class="fas fa-spinner fa-spin"></i> Entrando...'
        : '<i class="fas fa-sign-in-alt"></i> Entrar'
    }

    demoBtns.forEach(btn => {
      btn.disabled = loading
    })
  }
})

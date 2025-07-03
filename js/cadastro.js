/**
 * Script específico para a página de cadastro
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
  const cadastroForm = document.getElementById('cadastroForm')
  const togglePasswordBtns = document.querySelectorAll('.toggle-password')
  const googleLoginBtn = document.getElementById('googleLoginBtn')

  // Event listeners
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', handleCadastro)
  }

  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', togglePasswordVisibility)
  })

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin)
  }

  // Máscara para telefone
  const phoneInput = document.getElementById('phone')
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhone)
  }

  /**
   * Manipula o cadastro do formulário
   */
  async function handleCadastro(e) {
    e.preventDefault()
    
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim(),
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value
    }
    
    // Validações
    if (!validateForm(formData)) {
      return
    }

    setLoading(true)

    try {
      // Cria conta no Firebase
      await window.AuthService.createUserWithEmailAndPassword(
        formData.email, 
        formData.password, 
        formData.name
      )
      
      // Sucesso - redireciona para a página anterior ou home
      showSuccess('Conta criada com sucesso!')
      setTimeout(() => {
        const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
        window.location.href = returnUrl
      }, 2000)
      
    } catch (error) {
      console.error('Erro no cadastro:', error)
      
      let errorMessage = 'Erro ao criar conta. Tente novamente.'
      
      if (error.message.includes('email-already-in-use')) {
        errorMessage = 'Este email já está em uso. Tente fazer login ou use outro email.'
      } else if (error.message.includes('weak-password')) {
        errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (error.message.includes('invalid-email')) {
        errorMessage = 'Email inválido. Verifique e tente novamente.'
      }
      
      showError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Manipula login com Google
   */
  async function handleGoogleLogin() {
    try {
      setGoogleLoading(true)
      
      // Implementar login com Google aqui quando necessário
      showError('Login com Google será implementado em breve.')
      
    } catch (error) {
      console.error('Erro no login com Google:', error)
      showError('Erro ao fazer login com Google. Tente novamente.')
    } finally {
      setGoogleLoading(false)
    }
  }

  /**
   * Valida o formulário
   */
  function validateForm(data) {
    // Verifica campos obrigatórios
    if (!data.name || !data.email || !data.phone || !data.password || !data.confirmPassword) {
      showError('Por favor, preencha todos os campos.')
      return false
    }

    // Verifica nome (pelo menos 2 palavras)
    if (data.name.split(' ').length < 2) {
      showError('Por favor, insira seu nome completo.')
      return false
    }

    // Verifica email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.email)) {
      showError('Por favor, insira um email válido.')
      return false
    }

    // Verifica telefone
    const phoneClean = data.phone.replace(/\D/g, '')
    if (phoneClean.length < 10) {
      showError('Por favor, insira um telefone válido.')
      return false
    }

    // Verifica senha
    if (data.password.length < 6) {
      showError('A senha deve ter pelo menos 6 caracteres.')
      return false
    }

    // Verifica confirmação de senha
    if (data.password !== data.confirmPassword) {
      showError('As senhas não coincidem.')
      return false
    }

    return true
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
   * Formata o telefone
   */
  function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '')
    
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2')
      value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2')
    }
    
    e.target.value = value
  }

  /**
   * Mostra erro
   */
  function showError(message) {
    // Remove alertas existentes
    removeAlerts()
    
    const alert = document.createElement('div')
    alert.className = 'alert alert-error'
    alert.innerHTML = `
      <i class="fas fa-exclamation-circle"></i>
      ${message}
    `
    
    const form = document.querySelector('.cadastro-form-card')
    form.insertBefore(alert, form.firstChild)
    
    // Remove após 5 segundos
    setTimeout(() => alert.remove(), 5000)
  }

  /**
   * Mostra sucesso
   */
  function showSuccess(message) {
    // Remove alertas existentes
    removeAlerts()
    
    const alert = document.createElement('div')
    alert.className = 'alert alert-success'
    alert.innerHTML = `
      <i class="fas fa-check-circle"></i>
      ${message}
    `
    
    const form = document.querySelector('.cadastro-form-card')
    form.insertBefore(alert, form.firstChild)
  }

  /**
   * Remove alertas existentes
   */
  function removeAlerts() {
    const alerts = document.querySelectorAll('.alert')
    alerts.forEach(alert => alert.remove())
  }

  /**
   * Define estado de carregamento
   */
  function setLoading(loading) {
    const submitBtn = cadastroForm.querySelector('button[type="submit"]')
    
    if (submitBtn) {
      submitBtn.disabled = loading
      submitBtn.innerHTML = loading 
        ? '<i class="fas fa-spinner fa-spin"></i> Criando conta...'
        : 'Cadastrar'
    }

    // Desabilita todos os inputs
    const inputs = cadastroForm.querySelectorAll('input')
    inputs.forEach(input => input.disabled = loading)
  }

  /**
   * Define estado de carregamento do Google
   */
  function setGoogleLoading(loading) {
    if (googleLoginBtn) {
      googleLoginBtn.disabled = loading
      googleLoginBtn.innerHTML = loading 
        ? '<i class="fas fa-spinner fa-spin"></i> Conectando...'
        : '<i class="fab fa-google"></i> Entrar com Google'
    }
  }
})

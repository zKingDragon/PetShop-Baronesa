/**
 * Script específico para a página de cadastro
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Aguardar Firebase estar pronto
  await waitForFirebase();

  // Elementos do DOM
  const cadastroForm = document.getElementById('cadastroForm')
  const cadastroBtn = document.getElementById('cadastroBtn')
  const nameInput = document.getElementById('nome')
  const emailInput = document.getElementById('email')
  const phoneInput = document.getElementById('telefone')
  const passwordInput = document.getElementById('senha')
  const confirmPasswordInput = document.getElementById('confirmarSenha')
  const toggleButtons = document.querySelectorAll('.toggle-password')
  const googleLoginBtn = document.getElementById('googleLoginBtn')

  // Animação de entrada dos elementos
  const animateElements = document.querySelectorAll('.form-group, .benefit-item, .feature-item');

  // Observer para animações
  const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
          if (entry.isIntersecting) {
              entry.target.style.opacity = '1';
              entry.target.style.transform = 'translateY(0)';
          }
      });
  }, {
      threshold: 0.1
  });

  // Aplicar observer aos elementos
  animateElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
      observer.observe(el);
  });

  // Event listeners
  if (cadastroForm) {
    cadastroForm.addEventListener('submit', handleCadastro)
  }

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', togglePasswordVisibility)
  })

  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleLogin)
  }

  // Máscara para telefone
  if (phoneInput) {
    phoneInput.addEventListener('input', formatPhone)
  }

  /**
   * Aguarda Firebase estar disponível
   */
  async function waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  /**
   * Manipula o cadastro do formulário
   */
  async function handleCadastro(e) {
    e.preventDefault()

    const formData = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value
    }

    // Validações
    if (!validateForm(formData)) {
      return
    }

    setLoading(true)

    try {
      console.log('Iniciando cadastro no Firebase...', formData);

      // ETAPA 1: Criar usuário no Firebase Auth
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(formData.email, formData.password)
      const user = userCredential.user
      console.log('✅ Usuário criado no Auth:', user.uid);

      // ETAPA 2: Atualizar perfil
      await user.updateProfile({
        displayName: formData.name
      })
      console.log('✅ Perfil atualizado');

      // ETAPA 3: Salvar no Firestore
      console.log('📝 Salvando dados no Firestore...');

      const userData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: "user",
        Type: "user", // Compatibilidade
        uid: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      try {
        await firebase.firestore().collection("usuarios").doc(user.uid).set(userData);
        console.log('✅ Dados salvos no Firestore');

        // ETAPA 4: Verificar se os dados foram salvos
        const savedDoc = await firebase.firestore().collection("usuarios").doc(user.uid).get();
        if (savedDoc.exists) {
          console.log('✅ Verificação: Dados encontrados no banco:', savedDoc.data());
        } else {
          console.warn('⚠️ Verificação: Dados não encontrados no banco');
        }
      } catch (firestoreError) {
        console.warn('⚠️ Erro ao salvar no Firestore, mas usuário foi criado no Auth:', firestoreError);
        // Não falhamos aqui pois o usuário já foi criado no Auth
        // O Firestore pode ser atualizado posteriormente
      }

      // ETAPA 5: Sucesso
      showAlert('Conta criada com sucesso! Redirecionando...', 'success')

      // Aguardar e redirecionar
      setTimeout(() => {
        // Limpar cache
        if (window.auth && window.auth.clearUserTypeCache) {
          window.auth.clearUserTypeCache();
        }

        // Redirecionar
        const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
        window.location.href = returnUrl
      }, 2000)

    } catch (error) {
      console.error('❌ Erro completo no cadastro:', error);

      let errorMessage = 'Erro ao criar conta. Tente novamente.'
      let showLoginOption = false;

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este email já está cadastrado no sistema.'
          showLoginOption = true;
          break;
        case 'auth/weak-password':
          errorMessage = 'A senha deve ter pelo menos 6 caracteres.'
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido.'
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
          break;
        case 'permission-denied':
          errorMessage = 'Erro de permissão no banco de dados.'
          break;
        case 'unavailable':
          errorMessage = 'Serviço temporariamente indisponível. Tente novamente.'
          break;
        default:
          // Para erros HTTP como 400, 500, etc
          if (error.message && error.message.includes('400')) {
            errorMessage = 'Erro no servidor (400). Tente novamente em alguns minutos.'
          } else if (error.message && error.message.includes('500')) {
            errorMessage = 'Erro interno do servidor. Tente novamente.'
          } else {
            errorMessage = `Erro: ${error.message}`
          }
      }

      if (showLoginOption) {
        console.log('🔄 Mostrando alerta de email já cadastrado...');
        showEmailExistsAlert(errorMessage);
      } else {
        showAlert(errorMessage, 'error');
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * Aguarda Firebase estar disponível
   */
  async function waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (typeof firebase !== 'undefined' && firebase.auth && firebase.firestore) {
          resolve();
        } else {
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

  /**
   * Valida os dados do formulário
   */
  function validateForm(formData) {
    if (!formData.name || formData.name.length < 2) {
      showAlert('Nome deve ter pelo menos 2 caracteres', 'error');
      return false;
    }

    if (!formData.email || !validateEmail(formData.email)) {
      showAlert('Digite um e-mail válido', 'error');
      return false;
    }

    if (!formData.phone || !validatePhone(formData.phone)) {
      showAlert('Digite um telefone válido', 'error');
      return false;
    }

    if (!formData.password || formData.password.length < 6) {
      showAlert('Senha deve ter pelo menos 6 caracteres', 'error');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      showAlert('As senhas não coincidem', 'error');
      return false;
    }

    return true;
  }

  /**
   * Controla o estado de loading
   */
  function setLoading(isLoading) {
    const btnText = cadastroBtn.querySelector('.btn-text');
    const btnLoader = cadastroBtn.querySelector('.btn-loader');

    if (btnText && btnLoader) {
      if (isLoading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        cadastroBtn.disabled = true;
      } else {
        btnText.style.display = 'flex';
        btnLoader.style.display = 'none';
        cadastroBtn.disabled = false;
      }
    }
  }

  /**
   * Funcionalidade de mostrar/ocultar senha
   */
  function togglePasswordVisibility(e) {
    e.preventDefault();

    const targetId = e.target.closest('.toggle-password').getAttribute('data-target');
    let targetInput;

    if (targetId === 'password') {
      targetInput = passwordInput;
    } else if (targetId === 'confirmPassword') {
      targetInput = confirmPasswordInput;
    } else {
      targetInput = document.getElementById(targetId);
    }

    const icon = e.target.closest('.toggle-password').querySelector('i');

    if (targetInput) {
      if (targetInput.type === 'password') {
        targetInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
      } else {
        targetInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
      }
    }
  }

  /**
   * Formatar telefone
   */
  function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');

    if (value.length <= 11) {
      value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
      value = value.replace(/(\d)(\d{4})$/, '$1-$2');
    }

    e.target.value = value;
  }

  /**
   * Login com Google
   */
  async function handleGoogleLogin() {
    try {
      setLoading(true);

      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await firebase.auth().signInWithPopup(provider);
      const user = result.user;

      // Salvar dados do usuário do Google no Firestore
      await firebase.firestore().collection("usuarios").doc(user.uid).set({
        name: user.displayName,
        email: user.email,
        type: "user",
        Type: "user",
        uid: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      showAlert('Login com Google realizado com sucesso!', 'success');

      setTimeout(() => {
        const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html';
        window.location.href = returnUrl;
      }, 1500);

    } catch (error) {
      console.error('Erro no login com Google:', error);
      showAlert('Erro ao fazer login com Google', 'error');
    } finally {
      setLoading(false);
    }
  }
  // Aplicar observer aos elementos
  animateElements.forEach((el, index) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
      observer.observe(el);
  });

  // Configurar toggle de senha
  toggleButtons.forEach(button => {
      button.title = 'Mostrar senha';
      button.setAttribute('aria-label', 'Mostrar senha');
  });

  // Validação em tempo real
  function validateName(name) {
      return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
  }

  function validateEmail(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
  }

  function validatePhone(phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      return cleanPhone.length >= 10;
  }

  function validatePassword(password) {
      return {
          length: password.length >= 8,
          uppercase: /[A-Z]/.test(password),
          lowercase: /[a-z]/.test(password),
      };
  }

  // Função para mostrar alertas
  function showAlert(message, type) {
      // Remove alertas anteriores
      const existingAlerts = document.querySelectorAll('.alert');
      existingAlerts.forEach(alert => alert.remove());

      const alert = document.createElement('div');
      alert.className = `alert alert-${type}`;

      const icon = type === 'success' ? 'fa-check-circle' :
                  type === 'error' ? 'fa-exclamation-triangle' :
                  'fa-info-circle';

      alert.innerHTML = `
          <i class="fas ${icon}"></i>
          <span>${message}</span>
      `;

      // Inserir no início do formulário
      const formCard = document.querySelector('.cadastro-form-card');
      if (formCard) {
          formCard.insertBefore(alert, formCard.firstChild);
      }

      // Ocultar após 5 segundos
      setTimeout(() => {
          alert.remove();
      }, 5000);
  }

  /**
   * Mostra alerta especial para email já cadastrado com opção de ir para login
   */
  function showEmailExistsAlert(message) {
    console.log('📧 Exibindo alerta de email já cadastrado:', message);

    // Remove alertas anteriores
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = 'alert alert-warning email-exists-alert';
    alert.setAttribute('role', 'alert');

    alert.innerHTML = `
      <div class="alert-content">
        <i class="fas fa-exclamation-triangle"></i>
        <div class="alert-text">
          <strong>Email já cadastrado</strong>
          <p>${message}</p>
          <p>Você já possui uma conta com este email. Deseja fazer login?</p>
        </div>
      </div>
      <div class="alert-actions">
        <button type="button" class="btn-secondary" onclick="hideEmailAlert()">
          Cancelar
        </button>
        <button type="button" class="btn-primary" onclick="goToLogin()">
          Ir para Login
        </button>
      </div>
    `;

    // Inserir no início do formulário
    const formCard = document.querySelector('.cadastro-form-card');
    if (formCard) {
      formCard.insertBefore(alert, formCard.firstChild);
    }

    // Auto-hide after 10 seconds if no action
    setTimeout(() => {
      if (document.querySelector('.email-exists-alert')) {
        hideEmailAlert();
      }
    }, 10000);
  }

  /**
   * Oculta o alerta de email existente
   */
  window.hideEmailAlert = function() {
    const alert = document.querySelector('.email-exists-alert');
    if (alert) {
      alert.remove();
    }
  }

  /**
   * Redireciona para a página de login
   */
  window.goToLogin = function() {
    const email = emailInput.value;
    const loginUrl = new URL('./login.html', window.location.href);
    if (email) {
      loginUrl.searchParams.set('email', email);
    }
    window.location.href = loginUrl.toString();
  }

  // Auto-focus no primeiro campo
  if (nameInput) {
      nameInput.focus();
  }

});

// CSS adicional para a página de cadastro
const style = document.createElement('style');
style.textContent = `
    .alert {
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    }

    .alert-success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }

    .alert-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }

    .alert-warning {
        background: #fff3cd;
        border: 1px solid #ffecb5;
        color: #856404;
        flex-direction: column;
        align-items: stretch;
    }

    .alert-content {
        display: flex;
        align-items: flex-start;
        gap: 12px;
        margin-bottom: 12px;
    }

    .alert-content i {
        font-size: 1.25rem;
        margin-top: 2px;
        color: #f39c12;
    }

    .alert-text {
        flex: 1;
    }

    .alert-text strong {
        display: block;
        margin-bottom: 4px;
        font-size: 1.1rem;
    }

    .alert-text p {
        margin: 4px 0;
        line-height: 1.4;
    }

    .alert-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
    }

    .alert-actions .btn-secondary,
    .alert-actions .btn-primary {
        padding: 8px 16px;
        border-radius: 6px;
        border: none;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.3s ease;
        font-size: 14px;
    }

    .alert-actions .btn-secondary {
        background-color: #6c757d;
        color: white;
    }

    .alert-actions .btn-secondary:hover {
        background-color: #5a6268;
    }

    .alert-actions .btn-primary {
        background-color: var(--emerald-green, #28a745);
        color: white;
    }

    .alert-actions .btn-primary:hover {
        background-color: var(--petroleum-blue, #007bff);
        transform: translateY(-1px);
    }

    .toggle-password {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
        color: #666;
        padding: 8px;
        border-radius: 4px;
        transition: all 0.3s ease;
        z-index: 2;
    }

    .toggle-password:hover {
        background: rgba(0, 0, 0, 0.05);
        color: #333;
    }

    .form-group {
        position: relative;
    }

    .form-group input[type="password"],
    .form-group input[type="text"] {
        padding-right: 45px !important;
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

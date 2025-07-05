/**
 * Script específico para a página de login
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🔄 Inicializando página de login...');
  
  // Aguarda Firebase estar disponível (já inicializado globalmente)
  await waitForFirebase()
  console.log('✅ Firebase disponível para login');

  // Aguarda um pouco mais para garantir que todos os listeners estão prontos
  await new Promise(resolve => setTimeout(resolve, 500));

  // Verifica se já está logado
  const currentUser = firebase.auth().currentUser;
  if (currentUser) {
    console.log('✅ Usuário já logado, redirecionando...', currentUser.uid);
    const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
    window.location.href = returnUrl
    return
  }

  console.log('👤 Usuário não logado, configurando formulário...');

  // Pré-preenche o email se veio da página de cadastro
  const urlParams = new URLSearchParams(window.location.search);
  const prefilledEmail = urlParams.get('email');
  if (prefilledEmail) {
    const emailInput = document.getElementById('email');
    if (emailInput) {
      emailInput.value = prefilledEmail;
      // Foca no campo de senha para facilitar o login
      const passwordInput = document.getElementById('password');
      if (passwordInput) {
        setTimeout(() => passwordInput.focus(), 100);
      }
      console.log('📧 Email pré-preenchido:', prefilledEmail);
    }
  }

  // Elementos do DOM
  const loginForm = document.getElementById('loginForm')
  const loginError = document.getElementById('loginError')
  const loginBtn = document.getElementById('loginBtn')
  const demoBtns = document.querySelectorAll('.demo-btn')
  const togglePasswordBtns = document.querySelectorAll('.toggle-password')

  /**
   * Aguarda Firebase estar disponível
   */
  async function waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = () => {
        if (typeof firebase !== 'undefined' && 
            firebase.auth && 
            firebase.firestore &&
            firebase.apps &&
            firebase.apps.length > 0) {
          console.log('✅ Firebase completamente carregado');
          resolve();
        } else {
          console.log('⏳ Aguardando Firebase...');
          setTimeout(checkFirebase, 100);
        }
      };
      checkFirebase();
    });
  }

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
      console.log('Tentando fazer login com:', email);
      
      // Login direto com Firebase
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password)
      const user = userCredential.user
      
      console.log('✅ Login realizado com sucesso:', user.uid);
      
      // Sucesso - redireciona para a página anterior ou home
      const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
      window.location.href = returnUrl
      
    } catch (error) {
      console.error('❌ Erro no login:', error)
      
      let errorMessage = 'Email ou senha incorretos. Tente novamente.'
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Usuário não encontrado. Verifique o email ou cadastre-se.'
          break;
        case 'auth/wrong-password':
          errorMessage = 'Senha incorreta. Tente novamente.'
          break;
        case 'auth/invalid-email':
          errorMessage = 'Email inválido. Verifique o formato.'
          break;
        case 'auth/user-disabled':
          errorMessage = 'Conta desabilitada. Entre em contato com o suporte.'
          break;
        default:
          errorMessage = `Erro: ${error.message}`
      }
      
      showError(errorMessage)
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
      console.log('Tentando login demo com:', email);
      
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password)
      console.log('✅ Login demo realizado:', userCredential.user.uid);
      
      // Sucesso - redireciona
      const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
      window.location.href = returnUrl
      
    } catch (error) {
      console.error('❌ Erro no login de demonstração:', error)
      
      // Se a conta de demo não existir, cria automaticamente
      if (error.code === 'auth/user-not-found') {
        try {
          console.log('🔧 Criando conta demo automaticamente...');
          await createDemoAccount(email, password)
          
          const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password)
          console.log('✅ Login após criação demo:', userCredential.user.uid);
          
          const returnUrl = new URLSearchParams(window.location.search).get('return') || '../index.html'
          window.location.href = returnUrl
        } catch (createError) {
          console.error('❌ Erro ao criar conta de demonstração:', createError)
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
    try {
      const displayName = email.includes('admin') ? 'Administrador Demo' : 'Usuário Demo'
      
      // Criar usuário no Firebase Auth
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password)
      const user = userCredential.user
      
      // Atualizar perfil
      await user.updateProfile({
        displayName: displayName
      })
      
      // Salvar dados no Firestore
      const userData = {
        name: displayName,
        email: email,
        type: email.includes('admin') ? 'admin' : 'user',
        Type: email.includes('admin') ? 'admin' : 'user',
        uid: user.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }
      
      await firebase.firestore().collection("usuarios").doc(user.uid).set(userData)
      console.log('✅ Conta demo criada e salva:', user.uid);
      
    } catch (error) {
      console.error('❌ Erro ao criar conta demo:', error);
      throw error;
    }
  }

  /**
   * Funcionalidade de mostrar/ocultar senha
   */
  function togglePasswordVisibility(e) {
    e.preventDefault();
    
    const targetId = e.target.closest('.toggle-password').getAttribute('data-target');
    let targetInput;
    
    // Mapear o ID correto do input
    if (targetId === 'password') {
      targetInput = document.getElementById('password');
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

document.addEventListener("DOMContentLoaded", () => {
  // Inicializa a transição de página
  initPageTransitions();
  
  // Detecta o caminho correto baseado na localização atual
  const isInHtmlFolder = window.location.pathname.includes('/html/');
  const headerPath = isInHtmlFolder ? "header.html" : "html/header.html";
  const footerPath = isInHtmlFolder ? "footer.html" : "html/footer.html";
  
  // Carrega o header
  fetch(headerPath)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Header not found at ${headerPath}`);
      }
      return res.text();
    })
    .then(data => {
      const header = document.getElementById("header");
      if (header) {
        header.innerHTML = data;
        
        // Dispara evento personalizado para indicar que o header foi carregado
        document.dispatchEvent(new CustomEvent('headerLoaded'));
        
        // Corrige os links do header
        fixHeaderLinks();
        
        initMobileMenu(); // Inicializa o menu mobile após carregar o header
        initSearchEvents(); // Inicializa eventos de pesquisa após carregar o header
        initSmoothNavigation(); // Inicializa navegação suave
        
        // Inicializa sistema de autenticação do header
        if (window.headerAuth) {
          window.headerAuth.updateHeaderUI();
        }
        
        // Inicializa sistema de permissões após carregar o header
        if (window.uiPermissionManager) {
          window.uiPermissionManager.init();
        }
        
        console.log('Header carregado e inicializado');
      }
    })
    .catch(error => {
      console.warn('Erro ao carregar header:', error);
    });

  // Carrega o footer
  fetch(footerPath)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Footer not found at ${footerPath}`);
      }
      return res.text();
    })
    .then(data => {
      const footer = document.getElementById("footer");
      if (footer) {
        footer.innerHTML = data;
      }
    });
  // Atualiza o ano atual no rodapé
  updateCurrentYear();

  // Ajusta visibilidade do texto da logo
  ensureLogoTextVisible();
});

function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!menuToggle) {
    console.error("Elemento menuToggle não encontrado.");
    return;
  }

  if (!mobileMenu) {
    console.error("Elemento mobileMenu não encontrado.");
    return;
  }

  menuToggle.addEventListener("click", () => {
    // Alterna a classe 'active' no menu mobile
    mobileMenu.classList.toggle("active");

    // Alterna o ícone entre 'fa-bars' e 'fa-times'
    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    }
  });
}

function updateCurrentYear() {
  const yearElements = document.querySelectorAll("#currentYear");
  const currentYear = new Date().getFullYear();

  yearElements.forEach(element => {
    element.textContent = currentYear;
  });
}

function ensureLogoTextVisible() {
  const logoText = document.querySelector(".logo-text");
  if (logoText) {
    logoText.style.display = "inline"; // Garante que o texto da logo esteja visível
  }
}

/**
 * Função global para lidar com pesquisa
 * @param {string} searchTerm - Termo de pesquisa
 */
function handleGlobalSearch(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return;
  }

  // Verifica se estamos na página do catálogo
  const currentPath = window.location.pathname;
  const isOnCatalogPage = currentPath.includes('catalogo.html') || currentPath.includes('catalog.html');

  if (isOnCatalogPage) {
    // Se já estamos no catálogo, apenas atualiza a pesquisa
    if (window.CatalogSearch && typeof window.CatalogSearch.performSearch === 'function') {
      window.CatalogSearch.performSearch(searchTerm);
    } else {
      // Fallback: atualiza os campos de pesquisa e aplica filtros
      const searchInput = document.getElementById('searchInput');
      const searchInputMobile = document.getElementById('searchInputMobile');
      
      if (searchInput) searchInput.value = searchTerm;
      if (searchInputMobile) searchInputMobile.value = searchTerm;
      
      // Dispara evento de input para aplicar a pesquisa
      if (searchInput) {
        searchInput.dispatchEvent(new Event('input'));
      }
    }
  } else {
    // Se não estamos no catálogo, redireciona para lá com o termo de pesquisa
    const catalogUrl = determineCatalogPath();
    const searchParams = new URLSearchParams();
    searchParams.set('busca', searchTerm);
    window.location.href = `${catalogUrl}?${searchParams.toString()}`;
  }
}

/**
 * Determina o caminho correto para o catálogo baseado na localização atual
 */
function determineCatalogPath() {
  const currentPath = window.location.pathname;
  
  // Se estamos na raiz do projeto
  if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
    return 'html/catalogo.html';
  }
  
  // Se estamos dentro da pasta html
  if (currentPath.includes('/html/')) {
    return 'catalogo.html';
  }
  
  // Fallback - assumir que estamos na raiz
  return 'html/catalogo.html';
}

/**
 * Inicializa os eventos de pesquisa no header após ele ser carregado
 */
function initSearchEvents() {
  // Pesquisa desktop
  const searchForm = document.querySelector('.search-form');
  const searchInput = document.getElementById('headerSearchInput');
  
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchTerm = searchInput?.value?.trim();
      if (searchTerm) {
        handleGlobalSearchWithTransition(searchTerm);
      }
    });
  }

  // Pesquisa mobile
  const searchFormMobile = document.querySelector('.search-form-mobile');
  const searchInputMobile = document.getElementById('headerSearchInputMobile');
  
  if (searchFormMobile) {
    searchFormMobile.addEventListener('submit', (e) => {
      e.preventDefault();
      const searchTerm = searchInputMobile?.value?.trim();
      if (searchTerm) {
        handleGlobalSearchWithTransition(searchTerm);
      }
    });
  }
}

/**
 * Inicializa as transições de página
 */
function initPageTransitions() {
  // Adiciona a classe page-loaded após um pequeno delay para permitir que o CSS seja aplicado
  setTimeout(() => {
    document.body.classList.add('page-loaded');
  }, 100);

  // Remove loader se existir
  const loader = document.querySelector('.page-loader');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 2000);
    }, 200);
  }
}

/**
 * Inicializa navegação suave para links internos
 */
function initSmoothNavigation() {
  // Intercepta cliques em links internos
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) {
      return; // Ignora âncoras, links externos e emails
    }

    // Verifica se é um link interno do site
    if (href.endsWith('.html') || href.includes('/html/')) {
      e.preventDefault();
      navigateToPage(href);
    }
  });
}

/**
 * Navega para uma página com transição suave
 * @param {string} url - URL da página de destino
 */
function navigateToPage(url) {
  // Adiciona classe de transição
  document.body.classList.add('page-transition');
  document.body.classList.remove('page-loaded');

  // Navega após a animação
  setTimeout(() => {
    window.location.href = url;
  }, 200);
}

/**
 * Função melhorada para lidar com pesquisa com transição suave
 * @param {string} searchTerm - Termo de pesquisa
 */
function handleGlobalSearchWithTransition(searchTerm) {
  if (!searchTerm || searchTerm.trim() === '') {
    return;
  }

  // Verifica se estamos na página do catálogo
  const currentPath = window.location.pathname;
  const isOnCatalogPage = currentPath.includes('catalogo.html') || currentPath.includes('catalog.html');

  if (isOnCatalogPage) {
    // Se já estamos no catálogo, apenas atualiza a pesquisa
    if (window.CatalogSearch && typeof window.CatalogSearch.performSearch === 'function') {
      window.CatalogSearch.performSearch(searchTerm);
    } else {
      // Fallback: atualiza os campos de pesquisa e aplica filtros
      const searchInput = document.getElementById('searchInput');
      const searchInputMobile = document.getElementById('searchInputMobile');
      
      if (searchInput) searchInput.value = searchTerm;
      if (searchInputMobile) searchInputMobile.value = searchTerm;
      
      // Dispara evento de input para aplicar a pesquisa
      if (searchInput) {
        searchInput.dispatchEvent(new Event('input'));
      }
    }
  } else {
    // Se não estamos no catálogo, redireciona para lá com transição suave
    const catalogUrl = determineCatalogPath();
    const searchParams = new URLSearchParams();
    searchParams.set('busca', searchTerm);
    
    // Usa navegação suave
    navigateToPage(`${catalogUrl}?${searchParams.toString()}`);
  }
}

/**
 * Sistema de gerenciamento de UI baseado em permissões
 */
class UIPermissionManager {
  constructor() {
    this.authService = window.AuthService
    this.currentRole = 'guest'
    this.userDisplayName = 'Visitante'
  }

  /**
   * Inicializa o gerenciador de permissões
   */
  async init() {
    if (this.authService) {
      // Escuta mudanças no estado de autenticação
      this.authService.onAuthStateChanged(async (user) => {
        await this.updateUserRole()
        this.updateUI()
        await this.checkPagePermission()
      })
      
      // Atualiza o papel do usuário inicial
      await this.updateUserRole()
    }
    
    this.updateUI()
    await this.checkPagePermission()
  }

  /**
   * Atualiza o papel do usuário atual
   */
  async updateUserRole() {
    if (this.authService) {
      try {
        this.currentRole = await this.authService.getUserRole()
        this.userDisplayName = await this.authService.getUserDisplayName()
      } catch (error) {
        console.error('Erro ao obter papel do usuário:', error)
        this.currentRole = 'guest'
        this.userDisplayName = 'Visitante'
      }
    }
  }

  /**
   * Atualiza a UI com base nas permissões do usuário
   */
  updateUI() {
    this.updateHeader()
    this.updateNavigation()
  }

  /**
   * Atualiza o cabeçalho com base no papel do usuário
   */
  updateHeader() {
    const loginBtn = document.querySelector('.btn-login')
    const userDropdown = document.querySelector('.user-dropdown')
    
    // Remove elementos existentes
    if (userDropdown) {
      userDropdown.remove()
    }

    if (this.currentRole === 'guest') {
      // Mostra o botão de login para admins
      if (loginBtn) {
        loginBtn.style.display = 'inline-block'
      }
    } else {
      // Admin logado - mostra dropdown
      if (loginBtn) {
        loginBtn.style.display = 'none'
      }
      
      this.createUserDropdown()
    }

    // Gerencia visibilidade do botão de promoções (removido)
    this.updatePromotionsButton()
    
    // Gerencia botões de admin
    this.updateAdminButtons()
  }

  /**
   * Cria o dropdown do usuário
   */
  createUserDropdown() {
    const headerContent = document.querySelector('.header-content')
    if (!headerContent) return

    const userDropdown = document.createElement('div')
    userDropdown.className = 'user-dropdown'
    userDropdown.innerHTML = `
      <button class="user-dropdown-btn">
        <i class="fas fa-user"></i>
        <span class="user-name">${this.userDisplayName}</span>
        <i class="fas fa-chevron-down"></i>
      </button>
      <div class="user-dropdown-menu">
        ${this.currentRole === 'admin' ? '<a href="../html/admin.html"><i class="fas fa-cog"></i> Admin</a>' : ''}
        <a href="#" id="logoutBtn"><i class="fas fa-sign-out-alt"></i> Sair</a>
      </div>
    `

    // Insere antes do botão de menu mobile
    const menuToggle = document.querySelector('.menu-toggle')
    if (menuToggle) {
      headerContent.insertBefore(userDropdown, menuToggle)
    } else {
      headerContent.appendChild(userDropdown)
    }

    // Adiciona eventos
    this.setupDropdownEvents(userDropdown)
  }

  /**
   * Configura eventos do dropdown
   */
  setupDropdownEvents(dropdown) {
    const dropdownBtn = dropdown.querySelector('.user-dropdown-btn')
    const dropdownMenu = dropdown.querySelector('.user-dropdown-menu')
    const logoutBtn = dropdown.querySelector('#logoutBtn')

    // Toggle dropdown
    dropdownBtn?.addEventListener('click', (e) => {
      e.stopPropagation()
      dropdownMenu.classList.toggle('active')
    })

    // Fecha dropdown ao clicar fora
    document.addEventListener('click', () => {
      dropdownMenu.classList.remove('active')
    })

    // Logout
    logoutBtn?.addEventListener('click', async (e) => {
      e.preventDefault()
      await this.logout()
    })
  }

  /**
   * Atualiza visibilidade do botão de promoções (removido - não há mais página de promoções)
   */
  updatePromotionsButton() {
    // Função removida - não há mais página de promoções separada
    // Promoções agora são exibidas diretamente no catálogo
  }

  /**
   * Atualiza botões de admin
   */
  updateAdminButtons() {
    const addProductBtns = document.querySelectorAll('.btn-add-product, .admin-add-product')
    const adminLinks = document.querySelectorAll('a[href*="admin"]')
    
    addProductBtns.forEach(btn => {
      if (this.currentRole === 'admin') {
        btn.style.display = 'inline-block'
      } else {
        btn.style.display = 'none'
      }
    })

    adminLinks.forEach(link => {
      if (this.currentRole === 'admin') {
        link.style.display = 'inline-block'
      } else {
        link.style.display = 'none'
      }
    })
  }

  /**
   * Atualiza a navegação mobile
   */
  updateNavigation() {
    const mobileMenu = document.querySelector('.nav-mobile')
    if (!mobileMenu) return

    // Remove elementos existentes de usuário no menu mobile
    const existingUserItems = mobileMenu.querySelectorAll('.mobile-user-item')
    existingUserItems.forEach(item => item.remove())

    const nav = mobileMenu.querySelector('nav ul')
    if (!nav) return

    if (this.currentRole === 'admin') {
      // Adiciona admin no menu mobile
      const adminItem = document.createElement('li')
      adminItem.className = 'mobile-user-item'
      adminItem.innerHTML = '<a href="../html/admin.html">Admin</a>'
      nav.appendChild(adminItem)

      // Evento de logout mobile
      const mobileLogoutBtn = document.getElementById('mobileLogoutBtn')
      mobileLogoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault()
        await this.logout()
      })
    } else {
      // Adiciona login no menu mobile para guests
      const loginItem = document.createElement('li')
      loginItem.className = 'mobile-user-item'
      loginItem.innerHTML = '<a href="../html/login.html">Login Admin</a>'
      nav.appendChild(loginItem)
    }
  }

  /**
   * Realiza logout
   */
  async logout() {
    try {
      if (this.authService) {
        await this.authService.signOut()
      }
      
      // Redireciona para home se estiver em página protegida (apenas admin)
      const protectedPages = ['/admin.html']
      const currentPath = window.location.pathname
      
      if (protectedPages.some(page => currentPath.includes(page))) {
        window.location.href = '../index.html'
      } else {
        // Apenas recarrega a página para atualizar a UI
        window.location.reload()
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
      alert('Erro ao sair da conta. Tente novamente.')
    }
  }

  
  /**
   * Verifica e aplica permissão de acesso à página atual
   */
  async checkPagePermission() {
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop() || '';
    
    let hasPermission = true;
    if (pageName.includes('admin')) {
      hasPermission = this.currentRole === 'admin';
    }
    // Removido verificação de promoções pois não há mais página de promoções
    
    if (!hasPermission) {
      // Redireciona para página de bloqueio
      if (pageName.includes('admin')) {
        window.location.href = '../index.html';
      }
    }
  }
}

// Instância global do gerenciador de permissões
window.uiPermissionManager = new UIPermissionManager()

// Expor funções globalmente para uso em outras páginas
window.GlobalSearch = {
  handleGlobalSearch,
  handleGlobalSearchWithTransition,
  initSearchEvents,
  navigateToPage
};

/**
 * Corrige os links do header após carregamento
 */
function fixHeaderLinks() {
  // Detecta se estamos na raiz ou em subpasta
  const currentPath = window.location.pathname;
  const isInRoot = !currentPath.includes('/html/');
  const pathPrefix = isInRoot ? 'html/' : '';
  const assetPrefix = isInRoot ? '' : '../';
  
  console.log('🔗 Corrigindo links do header para:', isInRoot ? 'página raiz' : 'subpasta html');
  
  // Aguarda um pouco para garantir que o header foi totalmente carregado
  setTimeout(() => {
    // Atualiza logo
    const homeLink = document.querySelector('.header-home-link');
    if (homeLink) {
      homeLink.href = isInRoot ? 'index.html' : '../index.html';
      console.log('✅ Logo link:', homeLink.href);
    }
    
    // Atualiza imagem do logo
    const logoImg = document.querySelector('.header-logo-img');
    if (logoImg) {
      logoImg.src = assetPrefix + 'assets/images/gerais/iconeBaronesa.png';
      console.log('✅ Logo img:', logoImg.src);
    }
    
    // Atualiza todos os links com data-page
    const headerLinks = document.querySelectorAll('.header-link[data-page]');
    console.log('🔍 Links encontrados:', headerLinks.length);
    
    headerLinks.forEach((link, index) => {
      const page = link.getAttribute('data-page');
      if (page) {
        const newHref = pathPrefix + page + '.html';
        link.href = newHref;

        // Remove event listeners antigos para evitar duplicatas
        const newLink = link.cloneNode(true);
        link.parentNode.replaceChild(newLink, link);

        // Adiciona event listener para garantir navegação
        newLink.addEventListener('click', function(e) {
          // Removido controle especial para promoções (não há mais página de promoções)
          const href = this.getAttribute('href');
          if (href && href !== '#') {
            console.log('🔄 Navegando para:', href);
            window.location.href = href;
          } else {
            e.preventDefault();
            console.warn('❌ Link inválido:', href);
          }
        });

        console.log(`✅ Link ${page} configurado:`, newHref);
      }
    });
    
    console.log('✅ Todos os links do header foram corrigidos');
  }, 200);
}

// Corrige os links do header ao carregar a página
document.addEventListener('headerLoaded', fixHeaderLinks);

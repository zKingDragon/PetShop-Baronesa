document.addEventListener("DOMContentLoaded", () => {
  // Inicializa a transição de página
  initPageTransitions();
  
  // Tenta carregar primeiro pelo caminho direto, se falhar tenta pela pasta
  let headerReference = "header.html";
  fetch(headerReference)
    .then(res => {
      if (!res.ok) {
        // Se não encontrar, tenta o caminho com a pasta
        headerReference = "html/header.html";
        return fetch(headerReference);
      }
      return res;
    })
    .then(res => res.text())
    .then(data => {
      const header = document.getElementById("header");
      if (header) {
        header.innerHTML = data;
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
      }
    });

  // Carrega o footer
  let footerReference = "footer.html";
  fetch(footerReference)
    .then(res => {
      if (!res.ok) {
        // Se não encontrar, tenta o caminho com a pasta
        footerReference = "html/footer.html";
        return fetch(footerReference);
      }
      return res;
    })
    .then(res => res.text())
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
      setTimeout(() => loader.remove(), 400);
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
    const signupBtn = document.querySelector('.btn-signup')
    const userDropdown = document.querySelector('.user-dropdown')
    
    // Remove elementos existentes
    if (userDropdown) {
      userDropdown.remove()
    }

    if (this.currentRole === 'guest') {
      // Mostra botão de cadastro para visitantes
      if (signupBtn) {
        signupBtn.style.display = 'inline-block'
        signupBtn.textContent = 'Cadastre-se'
        signupBtn.href = '../html/cadastro.html'
      }
    } else {
      // Esconde botão de cadastro e mostra dropdown do usuário
      if (signupBtn) {
        signupBtn.style.display = 'none'
      }
      
      this.createUserDropdown()
    }

    // Gerencia visibilidade do botão de promoções
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
   * Atualiza visibilidade do botão de promoções
   */
  updatePromotionsButton() {
    const promotionsLink = document.querySelector('a[href*="promocoes"]')
    
    if (promotionsLink) {
      if (this.currentRole === 'guest') {
        promotionsLink.style.display = 'none'
      } else {
        promotionsLink.style.display = 'block'
      }
    }
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

    if (this.currentRole === 'guest') {
      // Adiciona link de cadastro no menu mobile
      const signupItem = document.createElement('li')
      signupItem.className = 'mobile-user-item'
      signupItem.innerHTML = '<a href="../html/cadastro.html">Cadastre-se</a>'
      nav.appendChild(signupItem)
    } else {
      // Adiciona promoções se for usuário ou admin
      const promotionsItem = document.createElement('li')
      promotionsItem.className = 'mobile-user-item'
      promotionsItem.innerHTML = '<a href="../html/promocoes.html">Promoções</a>'
      nav.appendChild(promotionsItem)

      // Adiciona admin se for admin
      if (this.currentRole === 'admin') {
        const adminItem = document.createElement('li')
        adminItem.className = 'mobile-user-item'
        adminItem.innerHTML = '<a href="../html/admin.html">Admin</a>'
        nav.appendChild(adminItem)
      }

      // Adiciona logout
      const logoutItem = document.createElement('li')
      logoutItem.className = 'mobile-user-item'
      logoutItem.innerHTML = `<a href="#" id="mobileLogoutBtn"><i class="fas fa-sign-out-alt"></i> Sair (${this.userDisplayName})</a>`
      nav.appendChild(logoutItem)

      // Evento de logout mobile
      const mobileLogoutBtn = document.getElementById('mobileLogoutBtn')
      mobileLogoutBtn?.addEventListener('click', async (e) => {
        e.preventDefault()
        await this.logout()
      })
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
      
      // Redireciona para home se estiver em página protegida
      const protectedPages = ['/admin.html', '/promocoes.html']
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
   * Verifica se o usuário tem permissão para acessar uma página
   */
  async hasPagePermission(page) {
    if (page.includes('admin')) {
      return this.currentRole === 'admin'
    }
    
    if (page.includes('promocoes')) {
      return this.currentRole === 'user' || this.currentRole === 'admin'
    }
    
    return true // Páginas públicas
  }

  /**
   * Redireciona usuário se não tiver permissão
   */
  async checkPagePermission() {
    const currentPath = window.location.pathname
    
    if (!await this.hasPagePermission(currentPath)) {
      alert('Você não tem permissão para acessar esta página.')
      window.location.href = '../index.html'
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

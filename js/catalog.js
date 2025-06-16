/**
 * Sistema de catálogo para o Pet Shop Baronesa
 * Este módulo gerencia filtros, busca e exibição de produtos
 */

// Elementos DOM
const filterForm = document.querySelector(".filter-card")
const productsGrid = document.querySelector(".products-grid")
const searchForm = document.getElementById("searchForm")
const searchFormMobile = document.getElementById("searchFormMobile")
const searchInput = document.getElementById("searchInput")
const searchInputMobile = document.getElementById("searchInputMobile")
const clearFiltersBtn = document.getElementById("clearFiltersBtn")
const activeFiltersContainer = document.getElementById("activeFilters")
const productCounter = document.getElementById("productCounter")
const filterToggleBtn = document.getElementById("filterToggleBtn")
const catalogSidebar = document.querySelector(".catalog-sidebar")

// Dados dos produtos (em um sistema real, isso viria do backend)
let allProducts = []
let filteredProducts = []

// Estado dos filtros
const filterState = {
  categories: [],
  priceRanges: [],
  types: [],
  search: "",
}

/**
 * Filtra os produtos com base nos filtros selecionados
 * @param {Array} filters - Objeto com os filtros selecionados
 * @returns {Array} - Produtos filtrados
 */
function filterProducts(filters) {
  return allProducts.filter((product) => {
    // Filtro de categoria
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false
    }

    // Filtro de preço
    if (filters.priceRanges.length > 0 && !filters.priceRanges.includes(product.priceRange)) {
      return false
    }

    // Filtro de tipo
    if (filters.types.length > 0 && !filters.types.includes(product.type)) {
      return false
    }

    // Filtro de busca
    if (
      filters.search &&
      !product.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !product.description.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false
    }

    return true
  })
}

/**
 * Renderiza os produtos na grade
 * @param {Array} products - Produtos a serem renderizados
 */
function renderProducts(products) {
  if (!productsGrid) return

  // Limpa a grade atual
  productsGrid.innerHTML = ""

  if (products.length === 0) {
    // Mostra mensagem se não houver produtos
    productsGrid.innerHTML = `
      <div class="no-products">
        <p>Nenhum produto encontrado com os filtros selecionados.</p>
        <button id="clearFiltersInline" class="btn-secondary">Limpar Filtros</button>
      </div>
    `

    // Adiciona event listener ao botão de limpar filtros
    const clearFiltersInline = document.getElementById("clearFiltersInline")
    if (clearFiltersInline) {
      clearFiltersInline.addEventListener("click", clearAllFilters)
    }

    return
  }

  // Adiciona cada produto à grade
  products.forEach((product) => {
    const productElement = document.createElement("div")
    productElement.className = "product-card"
    productElement.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
        <div class="product-category">${product.category}</div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-footer">
          <span class="product-price">R$ ${product.price.toFixed(2)}</span>
          <a href="catalogo.html?produto=${product.slug}" class="read-more">Ver detalhes</a>
        </div>
        <button class="btn-primary btn-block add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
          <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
        </button>
      </div>
    `

    productsGrid.appendChild(productElement)
  })

  // Adiciona event listeners aos botões de adicionar ao carrinho
  initAddToCartButtons()
}

/**
 * Inicializa os botões de adicionar ao carrinho
 */
function initAddToCartButtons() {
  const addToCartButtons = document.querySelectorAll(".add-to-cart-btn")

  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id")
      const productName = button.getAttribute("data-name")
      const productPrice = button.getAttribute("data-price")
      const productImage = button.getAttribute("data-image")

      // Verifica se o módulo de carrinho está disponível
      if (window.addToCart && typeof window.addToCart === "function") {
        window.addToCart({
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
        })
      } else {
        console.log("Produto adicionado ao carrinho:", {
          id: productId,
          name: productName,
          price: productPrice,
          image: productImage,
        })

        // Mostra mensagem de toast
        showToast("Produto adicionado ao carrinho!")
      }
    })
  })
}

/**
 * Atualiza o estado dos filtros com base nos inputs do formulário
 */
function updateFilterState() {
  // Atualiza categorias
  filterState.categories = []
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]:checked')
  categoryCheckboxes.forEach((checkbox) => {
    filterState.categories.push(checkbox.value)
  })

  // Atualiza faixas de preço
  filterState.priceRanges = []
  const priceCheckboxes = document.querySelectorAll('input[name="price"]:checked')
  priceCheckboxes.forEach((checkbox) => {
    filterState.priceRanges.push(checkbox.value)
  })

  // Atualiza tipos de produto
  filterState.types = []
  const typeCheckboxes = document.querySelectorAll('input[name="type"]:checked')
  typeCheckboxes.forEach((checkbox) => {
    filterState.types.push(checkbox.value)
  })

  // Atualiza termo de busca
  filterState.search = searchInput ? searchInput.value : ""
  if (!filterState.search && searchInputMobile) {
    filterState.search = searchInputMobile.value
  }

  // Atualiza URL com estado dos filtros
  updateURL()
}

/**
 * Aplica os filtros e atualiza a exibição dos produtos
 */
function applyFilters() {
  // Filtra produtos com base no estado dos filtros
  filteredProducts = allProducts.filter((product) => {
    // Filtro de categoria
    if (filterState.categories.length > 0 && !filterState.categories.includes(product.category)) {
      return false
    }

    // Filtro de preço
    if (filterState.priceRanges.length > 0 && !filterState.priceRanges.includes(product.priceRange)) {
      return false
    }

    // Filtro de tipo
    if (filterState.types.length > 0 && !filterState.types.includes(product.type)) {
      return false
    }

    // Filtro de busca
    if (
      filterState.search &&
      !product.name.toLowerCase().includes(filterState.search.toLowerCase()) &&
      !product.description.toLowerCase().includes(filterState.search.toLowerCase())
    ) {
      return false
    }

    return true
  })

  // Renderiza produtos filtrados
  renderProducts(filteredProducts)

  // Atualiza exibição dos filtros ativos
  updateActiveFilters()

  // Atualiza contador de produtos
  updateProductCounter()
}

/**
 * Atualiza a exibição dos filtros ativos
 */
function updateActiveFilters() {
  if (!activeFiltersContainer) return

  // Limpa o container
  activeFiltersContainer.innerHTML = ""

  // Verifica se há filtros ativos
  const hasActiveFilters =
    filterState.categories.length > 0 ||
    filterState.priceRanges.length > 0 ||
    filterState.types.length > 0 ||
    filterState.search

  if (!hasActiveFilters) {
    activeFiltersContainer.style.display = "none"
    return
  }

  // Mostra o container
  activeFiltersContainer.style.display = "flex"

  // Adiciona filtros de categoria
  filterState.categories.forEach((category) => {
    const filterTag = createFilterTag(category, () => {
      // Remove esta categoria do estado dos filtros
      const checkbox = document.querySelector(`input[name="category"][value="${category}"]`)
      if (checkbox) checkbox.checked = false

      filterState.categories = filterState.categories.filter((c) => c !== category)
      applyFilters()
    })

    activeFiltersContainer.appendChild(filterTag)
  })

  // Adiciona filtros de faixa de preço
  filterState.priceRanges.forEach((priceRange) => {
    let priceLabel
    switch (priceRange) {
      case "0-50":
        priceLabel = "Até R$ 50"
        break
      case "50-100":
        priceLabel = "R$ 50 a R$ 100"
        break
      case "100-150":
        priceLabel = "R$ 100 a R$ 150"
        break
      case "150+":
        priceLabel = "Acima de R$ 150"
        break
      default:
        priceLabel = priceRange
    }

    const filterTag = createFilterTag(priceLabel, () => {
      // Remove esta faixa de preço do estado dos filtros
      const checkbox = document.querySelector(`input[name="price"][value="${priceRange}"]`)
      if (checkbox) checkbox.checked = false

      filterState.priceRanges = filterState.priceRanges.filter((p) => p !== priceRange)
      applyFilters()
    })

    activeFiltersContainer.appendChild(filterTag)
  })

  // Adiciona filtros de tipo de produto
  filterState.types.forEach((type) => {
    const filterTag = createFilterTag(type, () => {
      // Remove este tipo do estado dos filtros
      const checkbox = document.querySelector(`input[name="type"][value="${type}"]`)
      if (checkbox) checkbox.checked = false

      filterState.types = filterState.types.filter((t) => t !== type)
      applyFilters()
    })

    activeFiltersContainer.appendChild(filterTag)
  })

  // Adiciona filtro de termo de busca
  if (filterState.search) {
    const filterTag = createFilterTag(`Busca: ${filterState.search}`, () => {
      // Limpa campos de busca
      if (searchInput) searchInput.value = ""
      if (searchInputMobile) searchInputMobile.value = ""

      filterState.search = ""
      applyFilters()
    })

    activeFiltersContainer.appendChild(filterTag)
  }

  // Adiciona botão de limpar todos
  const clearAllButton = document.createElement("button")
  clearAllButton.className = "filter-tag clear-all"
  clearAllButton.innerHTML = "Limpar Todos"
  clearAllButton.addEventListener("click", clearAllFilters)

  activeFiltersContainer.appendChild(clearAllButton)
}

/**
 * Cria um elemento de tag de filtro
 * @param {string} text - Texto a exibir
 * @param {Function} onRemove - Função a chamar ao remover
 * @returns {HTMLElement} - O elemento de tag de filtro
 */
function createFilterTag(text, onRemove) {
  const filterTag = document.createElement("div")
  filterTag.className = "filter-tag"
  filterTag.innerHTML = `
    ${text}
    <button class="remove-filter" aria-label="Remover filtro">
      <i class="fas fa-times"></i>
    </button>
  `

  const removeButton = filterTag.querySelector(".remove-filter")
  if (removeButton && onRemove) {
    removeButton.addEventListener("click", onRemove)
  }

  return filterTag
}

/**
 * Atualiza o contador de produtos
 */
function updateProductCounter() {
  if (!productCounter) return

  productCounter.textContent = filteredProducts.length
}

/**
 * Limpa todos os filtros
 */
function clearAllFilters() {
  // Desmarca todos os checkboxes
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]')
  categoryCheckboxes.forEach((checkbox) => {
    checkbox.checked = false
  })

  const priceCheckboxes = document.querySelectorAll('input[name="price"]')
  priceCheckboxes.forEach((checkbox) => {
    checkbox.checked = false
  })

  const typeCheckboxes = document.querySelectorAll('input[name="type"]')
  typeCheckboxes.forEach((checkbox) => {
    checkbox.checked = false
  })

  // Limpa campos de busca
  if (searchInput) searchInput.value = ""
  if (searchInputMobile) searchInputMobile.value = ""

  // Reseta estado dos filtros
  filterState.categories = []
  filterState.priceRanges = []
  filterState.types = []
  filterState.search = ""

  // Aplica filtros (o que mostrará todos os produtos)
  applyFilters()

  // Atualiza URL
  updateURL()
}

/**
 * Aplica os filtros com base nos parâmetros da URL
 */
function applyFiltersFromURL() {
  const urlParams = new URLSearchParams(window.location.search)

  // Obtém categoria da URL
  const categoryParam = urlParams.get("categoria")
  if (categoryParam) {
    const checkbox = document.querySelector(`input[name="category"][value="${categoryParam}"]`)
    if (checkbox) {
      checkbox.checked = true
      filterState.categories.push(categoryParam)
    }
  }

  // Obtém termo de busca da URL
  const searchParam = urlParams.get("busca")
  if (searchParam) {
    if (searchInput) searchInput.value = searchParam
    if (searchInputMobile) searchInputMobile.value = searchParam
    filterState.search = searchParam
  }

  // Aplica filtros se houver parâmetros encontrados
  if (categoryParam || searchParam) {
    applyFilters()
  }
}

/**
 * Atualiza a URL com o estado atual dos filtros
 */
function updateURL() {
  const urlParams = new URLSearchParams()

  // Adiciona categoria à URL se apenas uma estiver selecionada
  if (filterState.categories.length === 1) {
    urlParams.set("categoria", filterState.categories[0])
  }

  // Adiciona termo de busca à URL
  if (filterState.search) {
    urlParams.set("busca", filterState.search)
  }

  // Atualiza a URL sem recarregar a página
  const newUrl = `${window.location.pathname}${urlParams.toString() ? "?" + urlParams.toString() : ""}`
  window.history.replaceState({}, "", newUrl)
}

/**
 * Mostra uma mensagem de toast
 * @param {string} message - Mensagem a exibir
 */
function showToast(message) {
  // Verifica se já existe um toast
  let toast = document.querySelector(".toast")

  if (!toast) {
    // Cria um novo elemento de toast
    toast = document.createElement("div")
    toast.className = "toast"
    document.body.appendChild(toast)
  }

  // Define a mensagem e mostra o toast
  toast.textContent = message
  toast.classList.add("show")

  // Esconde o toast após 3 segundos
  setTimeout(() => {
    toast.classList.remove("show")

    // Remove o toast do DOM após a animação
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

/**
 * Função debounce para limitar a frequência com que uma função é chamada
 * @param {Function} func - Função a debounce
 * @param {number} wait - Tempo para esperar em milissegundos
 * @returns {Function} - Função debounce
 */
function debounce(func, wait) {
  let timeout

  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

/**
 * Carrega produtos da fonte de dados
 * Em um aplicativo real, isso seria uma chamada à API
 */
function loadProducts() {
  // Dados de produtos de amostra - em um aplicativo real, isso viria de uma API
allProducts = [
    {
        id: "1",
        name: "Ração Golden Special para Cães Adultos",
        description: "Ração premium para cães adultos de porte médio. Embalagem de 15kg - Sabor Frango e Carne.",
        price: 149.9,
        image: "assets/images/produtos/cachorroGoldenRacao.jpg",
        category: "Cachorros",
        type: "Alimentação",
        priceRange: "100-150",
        slug: "racao-golden-special-caes-adultos",
    },
    {
        id: "2",
        name: "Ração Premium para Gatos Castrados",
        description: "Ração premium para gatos castrados com controle de peso. Embalagem de 10kg.",
        price: 129.9,
        image: "assets/images/produtos/gatoCastradoRacao.jpg",
        category: "Gatos",
        type: "Alimentação",
        priceRange: "100-150",
        slug: "racao-premium-gatos-castrados",
    },
    {
        id: "3",
        name: "Cama para Cães Pequenos",
        description: "Cama confortável para cães de pequeno porte. Tecido lavável e macio.",
        price: 89.9,
        image: "assets/images/produtos/camaCachorroPequeno.jpg",
        category: "Cachorros",
        type: "Acessórios",
        priceRange: "50-100",
        slug: "cama-caes-pequenos",
    },
    {
        id: "4",
        name: "Kit Brinquedos para Gatos",
        description: "Conjunto com 5 brinquedos sortidos para gatos. Estimula o instinto de caça.",
        price: 59.9,
        image: "assets/images/produtos/brinquedosGatos.jpeg",
        category: "Gatos",
        type: "Brinquedos",
        priceRange: "50-100",
        slug: "kit-brinquedos-gatos",
    },
    {
        id: "5",
        name: "Coleira Antipulgas para Cães",
        description: "Coleira antipulgas e carrapatos para cães. Proteção por até 6 meses.",
        price: 69.9,
        image: "assets/images/produtos/coleiraAntiPulga.jpg",
        category: "Cachorros",
        type: "Acessórios",
        priceRange: "50-100",
        slug: "coleira-antipulgas-caes",
    },
    {
        id: "6",
        name: "Areia Higiênica para Gatos",
        description: "Areia higiênica de granulado fino para gatos. Pacote com 12kg.",
        price: 39.9,
        image: "assets/images/produtos/areiaGato.png",
        category: "Gatos",
        type: "Higiene",
        priceRange: "0-50",
        slug: "areia-higienica-gatos",
    },
    {
        id: "7",
        name: "Ração para Pássaros",
        description: "Mistura de sementes para pássaros pequenos. Embalagem de 5kg.",
        price: 45.9,
        image: "assets/images/produtos/misturaParaPassaros.webp",
        category: "Pássaros",
        type: "Alimentação",
        priceRange: "0-50",
        slug: "racao-passaros",
    },
    {
        id: "8",
        name: "Gaiola para Hamster",
        description: "Gaiola completa para hamster com acessórios. Tamanho médio.",
        price: 119.9,
        image: "assets/images/produtos/gaiolaHamster.webp",
        category: "Outros Pets",
        type: "Acessórios",
        priceRange: "100-150",
        slug: "gaiola-hamster",
    },
    {
        id: "9",
        name: "Shampoo para Cães",
        description: "Shampoo hipoalergênico para cães com pele sensível. Frasco de 500ml.",
        price: 29.9,
        image: "assets/images/produtos/shampooCaes.webp",
        category: "Cachorros",
        type: "Higiene",
        priceRange: "0-50",
        slug: "shampoo-caes",
    },
    {
        id: "10",
        name: "Comedouro Automático para Gatos",
        description: "Comedouro automático programável para gatos. Capacidade de 2kg.",
        price: 159.9,
        image: "assets/images/produtos/comedouroParaGatos.webp",
        category: "Gatos",
        type: "Acessórios",
        priceRange: "150+",
        slug: "comedouro-automatico-gatos",
    },
    {
        id: "11",
        name: "Brinquedo Interativo para Cães",
        description: "Brinquedo interativo que estimula a inteligência do seu cão.",
        price: 49.9,
        image: "assets/images/produtos/brinquedoInterativoCao.webp",
        category: "Cachorros",
        type: "Brinquedos",
        priceRange: "0-50",
        slug: "brinquedo-interativo-caes",
    },
    {
        id: "12",
        name: "Gaiola para Pássaros Grande",
        description: "Gaiola espaçosa para pássaros de médio porte. Com poleiros e comedouros.",
        price: 189.9,
        image: "assets/images/produtos/gaiolaPassaroGrande.webp",
        category: "Pássaros",
        type: "Acessórios",
        priceRange: "150+",
        slug: "gaiola-passaros-grande",
    },
]

  // Inicializa produtos filtrados com todos os produtos
  filteredProducts = [...allProducts]
}

/**
 * Inicializa todos os event listeners
 */
function initEventListeners() {
  // Submit do formulário de filtros
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault()
      applyFilters()
    })
  }

  // Eventos de mudança nos checkboxes para filtragem instantânea
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]')
  categoryCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateFilterState()
      applyFilters()
    })
  })

  const priceCheckboxes = document.querySelectorAll('input[name="price"]')
  priceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateFilterState()
      applyFilters()
    })
  })

  const typeCheckboxes = document.querySelectorAll('input[name="type"]')
  typeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      updateFilterState()
      applyFilters()
    })
  })

  // Submit dos formulários de busca
  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      updateFilterState()
      applyFilters()
    })
  }

  if (searchFormMobile) {
    searchFormMobile.addEventListener("submit", (e) => {
      e.preventDefault()
      updateFilterState()
      applyFilters()
    })
  }

  // Input do campo de busca para filtragem em tempo real
  if (searchInput) {
    searchInput.addEventListener(
      "input",
      debounce(() => {
        updateFilterState()
        applyFilters()
      }, 300),
    )
  }

  if (searchInputMobile) {
    searchInputMobile.addEventListener(
      "input",
      debounce(() => {
        updateFilterState()
        applyFilters()
      }, 300),
    )
  }

  // Botão de limpar filtros
  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearAllFilters)
  }

  // Toggle de filtros móveis
  if (filterToggleBtn && catalogSidebar) {
    filterToggleBtn.addEventListener("click", () => {
      catalogSidebar.classList.toggle("active")

      // Atualiza texto do botão
      if (catalogSidebar.classList.contains("active")) {
        filterToggleBtn.innerHTML = '<i class="fas fa-times"></i> Fechar Filtros'
      } else {
        filterToggleBtn.innerHTML = '<i class="fas fa-filter"></i> Mostrar Filtros'
      }
    })
  }
}

/**
 * Inicializa o sistema de catálogo
 */
function initCatalog() {
  // Carrega produtos
  loadProducts()

  // Inicializa event listeners
  initEventListeners()

  // Aplica filtros a partir dos parâmetros da URL
  applyFiltersFromURL()

  // Renderiza produtos iniciais
  renderProducts(allProducts)
}

// Inicializa o catálogo quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initCatalog)

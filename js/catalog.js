(() => {
  /**
   * Sistema de catálogo para o Pet Shop Baronesa
   * Este módulo gerencia filtros, busca e exibição de produtos usando Firebase Firestore
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

// Serviços
let productsService = null
let authService = null

// Data
let allProducts = []
let filteredProducts = []

// Estado dos filtros
const filterState = {
  categories: [],
  priceRanges: [],
  types: [],
  search: "",
}

// Loading state
let isLoading = false

/**
 * Inicializa os serviços Firebase
 */
async function initializeServices() {
  try {
    // Aguarda os serviços estarem disponíveis
    await waitForServices();

    // Os serviços já são instâncias globais e se inicializam automaticamente
    productsService = window.ProductsService;
    authService = window.AuthService;

    console.log("Services initialized successfully");
  } catch (error) {
    console.error("Error initializing services:", error);
    showError("Erro ao conectar com o banco de dados. Alguns recursos podem não funcionar corretamente.");
  }
}

/**
 * Aguarda os serviços estarem disponíveis
 */
async function waitForServices() {
  return new Promise((resolve) => {
    const checkServices = () => {
      if (window.ProductsService) {
        resolve();
      } else {
        setTimeout(checkServices, 100);
      }
    };
    checkServices();
  });
}

/**
 * Carrega produtos do Firestore
 */
async function loadProducts() {
  if (!productsService) {
    console.error("Products service not initialized")
    return
  }

  try {
    setLoading(true)

    // Check if we have cached products and we're offline
    if (allProducts.length > 0 && !navigator.onLine) {
      console.log("Using cached products (offline)")
      filteredProducts = [...allProducts]
      renderProducts(filteredProducts)
      updateProductCounter()
      return
    }

    // Fetch products from Firestore
    allProducts = await productsService.getAllProducts({
      orderBy: "createdAt",
      orderDirection: "desc",
    })
    // Adiciona priceRange para filtros de preço
    allProducts.forEach(p => {
      if (p.price <= 50) p.priceRange = "0-50"
      else if (p.price <= 100) p.priceRange = "50-100"
      else if (p.price <= 150) p.priceRange = "100-150"
      else p.priceRange = "150+"
    })

    // If no products found, seed with sample data (for development)
    if (allProducts.length === 0) {
      console.log("No products found, seeding with sample data...")
      await seedSampleProducts()
      allProducts = await productsService.getAllProducts()
    }

    // Initialize filtered products
    filteredProducts = [...allProducts]

    // Apply any existing filters
    applyFilters()

    console.log(`Loaded ${allProducts.length} products`)
  } catch (error) {
    console.error("Error loading products:", error)
    showError("Erro ao carregar produtos. Tente novamente mais tarde.")

    // Fallback to sample data if available
    if (allProducts.length === 0) {
      allProducts = getSampleProducts()
      filteredProducts = [...allProducts]
      renderProducts(filteredProducts)
      updateProductCounter()
    }
  } finally {
    setLoading(false)
  }
}

/**
 * Seeds the database with sample products (for development)
 */
async function seedSampleProducts() {
  if (!productsService) return
  const sampleProducts = getSampleProducts()
  try {
    await productsService.bulkCreateProducts(sampleProducts)
    console.log("Sample products seeded successfully")
  } catch (error) {
    console.error("Error seeding sample products:", error)
  }
}

/**
 * Filtra os produtos com base nos filtros selecionados
 */
async function filterProducts() {
  if (!productsService) {
    // Fallback to client-side filtering
    return allProducts.filter((product) => {
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
  }

  try {
    // Use search if available
    if (filterState.search) {
      const searchResults = await productsService.searchProducts(filterState.search)

      // Apply additional filters to search results
      return searchResults.filter((product) => {
        if (filterState.categories.length > 0 && !filterState.categories.includes(product.category)) {
          return false
        }
        if (filterState.priceRanges.length > 0 && !filterState.priceRanges.includes(product.priceRange)) {
          return false
        }
        if (filterState.types.length > 0 && !filterState.types.includes(product.type)) {
          return false
        }
        return true
      })
    }

    // Use Firestore filtering for better performance
    const hasFilters =
      filterState.categories.length > 0 || filterState.types.length > 0 || filterState.priceRanges.length > 0

    if (hasFilters) {
      // Converte faixas de preço para min/max
      let minPrice = undefined
      let maxPrice = undefined

      if (filterState.priceRanges.length > 0) {
        const prices = []
        filterState.priceRanges.forEach(range => {
          switch (range) {
            case "0-50":
              prices.push({ min: 0, max: 50 })
              break
            case "50-100":
              prices.push({ min: 50, max: 100 })
              break
            case "100-150":
              prices.push({ min: 100, max: 150 })
              break
            case "150+":
              prices.push({ min: 150, max: 999999 })
              break
          }
        })

        if (prices.length > 0) {
          minPrice = Math.min(...prices.map(p => p.min))
          maxPrice = Math.max(...prices.map(p => p.max))
        }
      }

      const filters = {
        categories: filterState.categories.length > 0 ? filterState.categories : undefined,
        types: filterState.types.length > 0 ? filterState.types : undefined,
      }

      // Adiciona filtros de preço se houver
      if (minPrice !== undefined) filters.minPrice = minPrice
      if (maxPrice !== undefined && maxPrice !== 999999) filters.maxPrice = maxPrice

      const result = await productsService.getFilteredProducts(filters)

      // Se usamos faixas de preço, ainda precisamos filtrar no lado cliente para múltiplas faixas
      if (filterState.priceRanges.length > 0) {
        return result.filter(product => {
          // Garante que o produto tem priceRange definido
          if (!product.priceRange) {
            if (product.price <= 50) product.priceRange = "0-50"
            else if (product.price <= 100) product.priceRange = "50-100"
            else if (product.price <= 150) product.priceRange = "100-150"
            else product.priceRange = "150+"
          }
          return filterState.priceRanges.includes(product.priceRange)
        })
      }

      return result
    }

    // Return all products if no filters
    return allProducts
  } catch (error) {
    console.error("Error filtering products:", error)
    // Fallback to client-side filtering
    return allProducts.filter((product) => {
      if (filterState.categories.length > 0 && !filterState.categories.includes(product.category)) {
        return false
      }
      if (filterState.priceRanges.length > 0 && !filterState.priceRanges.includes(product.priceRange)) {
        return false
      }
      if (filterState.types.length > 0 && !filterState.types.includes(product.type)) {
        return false
      }
      if (
        filterState.search &&
        !product.name.toLowerCase().includes(filterState.search.toLowerCase()) &&
        !product.description.toLowerCase().includes(filterState.search.toLowerCase())
      ) {
        return false
      }
      return true
    })
  }
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
        <img src="${product.image}" alt="${product.name}" loading="lazy">
        <div class="product-category">${product.category}</div>
      </div>
      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-footer">
          <span class="product-price">R$ ${product.price.toFixed(2)}</span>
        </div>
        <div class="product-buttons">
          <button class="btn-primary add-to-cart-btn btn-top" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-image="${product.image}">
            <i class="fas fa-shopping-cart"></i> Adicionar ao Carrinho
          </button>
          <button class="btn-whatsapp buy-now-btn btn-bottom" data-name="${product.name}" data-price="${product.price}" data-id="${product.id}">
            <i class="fab fa-whatsapp"></i> Comprar Agora
          </button>
        </div>
      </div>
    `

    productsGrid.appendChild(productElement)
  })

  // Adiciona event listeners aos botões de adicionar ao carrinho
  initAddToCartButtons()

  // Adiciona event listeners aos botões de comprar no WhatsApp
  initBuyNowButtons()
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
 * Inicializa os botões de comprar no WhatsApp
 */
function initBuyNowButtons() {
  const buyNowButtons = document.querySelectorAll(".buy-now-btn")

  buyNowButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productName = button.getAttribute("data-name")
      const productPrice = button.getAttribute("data-price")
      const productId = button.getAttribute("data-id")

      // Cria a mensagem para o WhatsApp
      const message = `Olá! Tenho interesse no produto:\n\n*${productName}*\nGostaria de mais informações e finalizar a compra.`

      // Número do WhatsApp do Pet Shop (substitua pelo número real)
      const whatsappNumber = "551334559994" // Formato: código do país + DDD + número

      // Cria a URL do WhatsApp
      const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`

      // Abre o WhatsApp em uma nova aba
      window.open(whatsappURL, "_blank")
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
  const priceCheckboxes = document.querySelectorAll('input[name="priceRanges"]:checked')
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
async function applyFilters() {
  if (isLoading) return

  try {
    setLoading(true)

    // Filtra produtos
    filteredProducts = await filterProducts()

    // Renderiza produtos filtrados
    renderProducts(filteredProducts)

    // Atualiza exibição dos filtros ativos
    updateActiveFilters()

    // Atualiza contador de produtos
    updateProductCounter()
  } catch (error) {
    console.error("Error applying filters:", error)
    showError("Erro ao aplicar filtros. Tente novamente.")
  } finally {
    setLoading(false)
  }
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
      const checkbox = document.querySelector(`input[name="priceRanges"][value="${priceRange}"]`)
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

  const priceCheckboxes = document.querySelectorAll('input[name="priceRanges"]')
  priceCheckboxes.forEach((checkbox) => {
    checkbox.checked = false
  })

  const typeCheckboxes = document.querySelectorAll('input[name="type"]')
  typeCheckboxes.forEach((checkbox) => {
    checkbox.checked = false
  })

  // Desmarca o checkbox "Todos os produtos"
  const allProductsCheckbox = document.getElementById("all-products-checkbox")
  if (allProductsCheckbox) allProductsCheckbox.checked = false

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
 * Limpa todos os filtros e ativa o botão "Todos os produtos"
 */
function clearAllFiltersAndActivateAllBtn() {
  // Desmarca todos os checkboxes
  document.querySelectorAll('input[name="category"], input[name="priceRanges"], input[name="type"]').forEach(cb => cb.checked = false)

  // Limpa campos de busca
  if (searchInput) searchInput.value = ""
  if (searchInputMobile) searchInputMobile.value = ""

  // Reseta estado dos filtros
  filterState.categories = []
  filterState.priceRanges = []
  filterState.types = []
  filterState.search = ""

  // Ativa botão "Todos os produtos"
  const btnTodos = document.getElementById("btn-todos-produtos")
  if (btnTodos) btnTodos.classList.add("ativo")

  // Aplica filtros (mostra todos os produtos)
  applyFilters()
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
 * Define o estado de carregamento
 * @param {boolean} loading - Estado de carregamento
 */
function setLoading(loading) {
  isLoading = loading

  if (!productsGrid) return

  if (loading) {
    productsGrid.innerHTML = `
      <div class="loading-spinner">
        <i class="fas fa-spinner fa-spin"></i>
        <span>Carregando produtos...</span>
      </div>
    `
  }
}

/**
 * Mostra uma mensagem de erro
 * @param {string} message - Mensagem de erro
 */
function showError(message) {
  showToast(message, "error")
}

/**
 * Mostra uma mensagem de toast
 * @param {string} message - Mensagem a exibir
 * @param {string} type - Tipo da mensagem ('success' ou 'error')
 */
function showToast(message, type = "success") {
  // Remove qualquer toast existente
  const existingToast = document.querySelector(".toast")
  if (existingToast) {
    existingToast.remove()
  }

  // Cria um novo elemento de toast
  const toast = document.createElement("div")
  toast.className = `toast ${type === "error" ? "toast-error" : "toast-success"}`
  toast.textContent = message

  // Adiciona ao body
  document.body.appendChild(toast)

  // Força reflow para garantir que a transição funcione
  toast.offsetHeight

  // Mostra o toast
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
 * Inicializa todos os event listeners
 */
function initEventListeners() {
  // Submit do formulário de filtros
  if (filterForm) {
    filterForm.addEventListener("submit", (e) => {
      e.preventDefault()
      updateFilterState()
      applyFilters()
    })
  }

  // Botão "Todos os produtos"
  const btnTodos = document.getElementById("btn-todos-produtos")
  if (btnTodos) {
    // Já inicia ativo
    btnTodos.classList.add("ativo")
    btnTodos.addEventListener("click", function () {
      clearAllFiltersAndActivateAllBtn()
    })
  }

  // Eventos de mudança nos checkboxes para filtragem instantânea
  const categoryCheckboxes = document.querySelectorAll('input[name="category"]')
  categoryCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Remove destaque do botão "Todos os produtos"
      const btnTodos = document.getElementById("btn-todos-produtos")
      if (btnTodos) btnTodos.classList.remove("ativo")
      updateFilterState()
      applyFilters()
    })
  })

  const priceCheckboxes = document.querySelectorAll('input[name="priceRanges"]')
  priceCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Remove destaque do botão "Todos os produtos"
      const btnTodos = document.getElementById("btn-todos-produtos")
      if (btnTodos) btnTodos.classList.remove("ativo")
      updateFilterState()
      applyFilters()
    })
  })

  const typeCheckboxes = document.querySelectorAll('input[name="type"]')
  typeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      // Remove destaque do botão "Todos os produtos"
      const btnTodos = document.getElementById("btn-todos-produtos")
      if (btnTodos) btnTodos.classList.remove("ativo")
      updateFilterState()
      applyFilters()
    })
  })

  // Checkbox "Todos os produtos"
  const allProductsCheckbox = document.getElementById("all-products-checkbox")
  if (allProductsCheckbox) {
    allProductsCheckbox.addEventListener("change", function () {
      if (this.checked) {
        // Desmarca todos os outros filtros
        document.querySelectorAll('input[name="category"], input[name="priceRanges"], input[name="type"]').forEach(cb => cb.checked = false)
        // Limpa busca
        if (searchInput) searchInput.value = ""
        if (searchInputMobile) searchInputMobile.value = ""
        // Reseta estado dos filtros
        filterState.categories = []
        filterState.priceRanges = []
        filterState.types = []
        filterState.search = ""
        // Mostra todos os produtos
        applyFilters()
      }
    })
  }

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

  // Listen for online/offline events
  window.addEventListener("online", () => {
    console.log("Back online, refreshing products...")
    loadProducts()
  })

  window.addEventListener("offline", () => {
    console.log("Gone offline, using cached data")
    showToast("Você está offline. Usando dados em cache.", "info")
  })
}

/**
 * Inicializa o sistema de catálogo
 */
async function initCatalog() {
  try {
    // Inicializa serviços Firebase
    await initializeServices()

    // Inicializa event listeners
    initEventListeners()

    // Carrega produtos (já mostra todos ao abrir)
    await loadProducts()

    // Aplica filtros a partir dos parâmetros da URL (se houver)
    applyFiltersFromURL()

    // Se não houver filtros ativos, mostra todos os produtos
    if (
      filterState.categories.length === 0 &&
      filterState.priceRanges.length === 0 &&
      filterState.types.length === 0 &&
      !filterState.search
    ) {
      applyFilters()
    }
  } catch (error) {
    console.error("Error initializing catalog:", error)
    showError("Erro ao inicializar o catálogo. Alguns recursos podem não funcionar corretamente.")
  }
}

// Inicializa o catálogo quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initCatalog)

// Export functions for admin use
window.CatalogAdmin = {
  async createProduct(productData) {
    if (!productsService) {
      throw new Error("Products service not initialized")
    }

    try {
      await authService.requireAdmin()
      const productId = await productsService.createProduct(productData)
      await loadProducts() // Refresh products
      showToast("Produto criado com sucesso!")
      return productId
    } catch (error) {
      console.error("Error creating product:", error)
      showError(`Erro ao criar produto: ${error.message}`)
      throw error
    }
  },

  async updateProduct(productId, updateData) {
    if (!productsService) {
      throw new Error("Products service not initialized")
    }

    try {
      await authService.requireAdmin()
      await productsService.updateProduct(productId, updateData)
      await loadProducts() // Refresh products
      showToast("Produto atualizado com sucesso!")
    } catch (error) {
      console.error("Error updating product:", error)
      showError(`Erro ao atualizar produto: ${error.message}`)
      throw error
    }
  },

  async deleteProduct(productId) {
    if (!productsService) {
      throw new Error("Products service not initialized")
    }

    try {
      await authService.requireAdmin()
      await productsService.deleteProduct(productId)
      await loadProducts() // Refresh products
      showToast("Produto excluído com sucesso!")
    } catch (error) {
      console.error("Error deleting product:", error)
      showError(`Erro ao excluir produto: ${error.message}`)
      throw error
    }
  },

  async getProductStats() {
    if (!productsService) {
      throw new Error("Products service not initialized")
    }

    try {
      return await productsService.getProductStats()
    } catch (error) {
      console.error("Error getting product stats:", error)
      throw error
    }
  },
}

// Export functions for search
window.CatalogSearch = {
  /**
   * Executa uma pesquisa no catálogo
   * @param {string} searchTerm - Termo de pesquisa
   */
  performSearch(searchTerm) {
    if (!searchTerm || searchTerm.trim() === '') {
      return;
    }

    // Atualiza os campos de pesquisa
    if (searchInput) searchInput.value = searchTerm;
    if (searchInputMobile) searchInputMobile.value = searchTerm;

    // Atualiza o estado do filtro
    filterState.search = searchTerm;

    // Aplica os filtros
    applyFilters();

    // Atualiza a URL
    updateURL();
  }
};

/**
 * Retorna produtos de exemplo para fallback
 */
function getSampleProducts() {
  return [
    {
      id: 'sample-1',
      name: 'Ração Premium para Cães',
      description: 'Ração de alta qualidade para cães adultos',
      price: 89.90,
      image: '../assets/images/produtos/cachorroGoldenRacao.jpg',
      category: 'Cachorros',
      type: 'Alimentação',
      priceRange: '50-100',
      createdAt: new Date()
    },
    {
      id: 'sample-2',
      name: 'Ração para Gatos Castrados',
      description: 'Ração especial para gatos castrados',
      price: 75.50,
      image: '../assets/images/produtos/gatoCastradoRacao.jpg',
      category: 'Gatos',
      type: 'Alimentação',
      priceRange: '50-100',
      createdAt: new Date()
    },
    {
      id: 'sample-3',
      name: 'Brinquedo Interativo para Cães',
      description: 'Brinquedo que estimula a inteligência do seu cão',
      price: 45.00,
      image: '../assets/images/produtos/brinquedoInterativoCao.webp',
      category: 'Cachorros',
      type: 'Brinquedos',
      priceRange: '0-50',
      createdAt: new Date()
    },
    {
      id: 'sample-4',
      name: 'Areia Sanitária para Gatos',
      description: 'Areia absorvente com controle de odor',
      price: 35.90,
      image: '../assets/images/produtos/areiaGato.png',
      category: 'Gatos',
      type: 'Higiene',
      priceRange: '0-50',
      createdAt: new Date()
    },
    {
      id: 'sample-5',
      name: 'Comedouro para Gatos',
      description: 'Comedouro anticolabamento para gatos',
      price: 28.50,
      image: '../assets/images/produtos/comedouroParaGatos.webp',
      category: 'Gatos',
      type: 'Acessórios',
      priceRange: '0-50',
      createdAt: new Date()
    }
  ];
}

// ...existing code...
})();

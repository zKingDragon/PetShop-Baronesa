/**
 * Admin Panel for Pet Shop Baronesa
 * Handles product management functionality
 */

class AdminPanel {
  constructor() {
    this.products = []
    this.filteredProducts = []
    this.currentEditingProduct = null
    this.isLoading = false

    // DOM elements
    this.elements = {
      // Buttons
      addProductBtn: document.getElementById("addProductBtn"),
      addProductBtnMobile: document.getElementById("addProductBtnMobile"),
      addFirstProductBtn: document.getElementById("addFirstProductBtn"),
      clearFiltersBtn: document.getElementById("clearFiltersBtn"),

      // Search and filters
      searchInput: document.getElementById("adminSearchInput"),
      allCategories: document.getElementById("allCategories"),
      categoryFilters: document.querySelectorAll(".category-filter"),
      allTypes: document.getElementById("allTypes"),
      typeFilters: document.querySelectorAll(".type-filter"),

      // Product display
      productsGrid: document.getElementById("adminProductsGrid"),
      productsLoading: document.getElementById("productsLoading"),
      noProductsMessage: document.getElementById("noProductsMessage"),
      filteredProductsCount: document.getElementById("filteredProductsCount"),

      // Stats
      totalProductsCount: document.getElementById("totalProductsCount"),
      categoriesCount: document.getElementById("categoriesCount"),
      averagePrice: document.getElementById("averagePrice"),

      // Modals
      productModal: document.getElementById("productModal"),
      deleteModal: document.getElementById("deleteModal"),

      // Form elements
      productForm: document.getElementById("productForm"),
      modalTitle: document.getElementById("modalTitle"),
      saveBtn: document.getElementById("saveBtn"),
      imagePreview: document.getElementById("imagePreview"),

      // Delete modal elements
      deleteProductName: document.getElementById("deleteProductName"),
      confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),

      // Toast container
      toastContainer: document.getElementById("toastContainer"),
    }

    this.init()
  }

  /**
   * Initialize the admin panel
   */
  async init() {
    try {
      // Set up event listeners
      this.setupEventListeners()

      // Load products
      await this.loadProducts()

      // Update stats
      this.updateStats()

      console.log("Admin panel initialized successfully")
    } catch (error) {
      console.error("Error initializing admin panel:", error)
      this.showToast("Erro ao inicializar painel administrativo", "error")
    }
  }

  /**
   * Set up all event listeners
   */
  setupEventListeners() {
    // Add product buttons
    this.elements.addProductBtn?.addEventListener("click", () => this.openAddProductModal())
    this.elements.addProductBtnMobile?.addEventListener("click", () => this.openAddProductModal())
    this.elements.addFirstProductBtn?.addEventListener("click", () => this.openAddProductModal())

    // Search functionality
    this.elements.searchInput?.addEventListener("input", (e) => {
      this.debounce(() => this.filterProducts(), 300)()
    })

    // Filter functionality
    this.elements.allCategories?.addEventListener("change", (e) => {
      if (e.target.checked) {
        this.elements.categoryFilters.forEach((filter) => (filter.checked = false))
      }
      this.filterProducts()
    })

    this.elements.categoryFilters.forEach((filter) => {
      filter.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.elements.allCategories.checked = false
        }
        this.filterProducts()
      })
    })

    this.elements.allTypes?.addEventListener("change", (e) => {
      if (e.target.checked) {
        this.elements.typeFilters.forEach((filter) => (filter.checked = false))
      }
      this.filterProducts()
    })

    this.elements.typeFilters.forEach((filter) => {
      filter.addEventListener("change", (e) => {
        if (e.target.checked) {
          this.elements.allTypes.checked = false
        }
        this.filterProducts()
      })
    })

    // Clear filters
    this.elements.clearFiltersBtn?.addEventListener("click", () => this.clearFilters())

    // Modal event listeners
    this.setupModalEventListeners()

    // Form event listeners
    this.setupFormEventListeners()
  }

  /**
   * Set up modal event listeners
   */
  setupModalEventListeners() {
    // Product modal
    document.getElementById("closeModalBtn")?.addEventListener("click", () => this.closeProductModal())
    document.getElementById("cancelBtn")?.addEventListener("click", () => this.closeProductModal())

    // Delete modal
    document.getElementById("closeDeleteModalBtn")?.addEventListener("click", () => this.closeDeleteModal())
    document.getElementById("cancelDeleteBtn")?.addEventListener("click", () => this.closeDeleteModal())
    document.getElementById("confirmDeleteBtn")?.addEventListener("click", () => this.confirmDelete())

    // Close modals when clicking outside
    this.elements.productModal?.addEventListener("click", (e) => {
      if (e.target === this.elements.productModal) {
        this.closeProductModal()
      }
    })

    this.elements.deleteModal?.addEventListener("click", (e) => {
      if (e.target === this.elements.deleteModal) {
        this.closeDeleteModal()
      }
    })
  }

  /**
   * Set up form event listeners
   */
  setupFormEventListeners() {
    // Product form submission
    this.elements.productForm?.addEventListener("submit", (e) => {
      e.preventDefault()
      this.saveProduct()
    })

    // Image preview
    document.getElementById("productImage")?.addEventListener("input", (e) => {
      this.updateImagePreview(e.target.value)
    })
  }

  /**
   * Load products from the database
   */
  async loadProducts() {
    try {
      this.setLoading(true)

      // Check if ProductsService is available
      if (!window.ProductsService) {
        throw new Error("ProductsService not available")
      }

      this.products = await window.ProductsService.getAllProducts()
      this.filteredProducts = [...this.products]

      this.renderProducts()
      this.updateProductsCount()
    } catch (error) {
      console.error("Error loading products:", error)
      this.showToast("Erro ao carregar produtos", "error")
    } finally {
      this.setLoading(false)
    }
  }

  /**
   * Set loading state
   */
  setLoading(loading) {
    this.isLoading = loading

    if (this.elements.productsLoading) {
      this.elements.productsLoading.style.display = loading ? "flex" : "none"
    }

    if (this.elements.productsGrid) {
      this.elements.productsGrid.style.display = loading ? "none" : "grid"
    }
  }

  /**
   * Render products in the grid
   */
  renderProducts() {
    if (!this.elements.productsGrid) return

    if (this.filteredProducts.length === 0) {
      this.elements.productsGrid.style.display = "none"
      this.elements.noProductsMessage.style.display = "block"
      return
    }

    this.elements.noProductsMessage.style.display = "none"
    this.elements.productsGrid.style.display = "grid"

    this.elements.productsGrid.innerHTML = this.filteredProducts
      .map((product) => this.createProductCard(product))
      .join("")

    // Add event listeners to product cards
    this.setupProductCardListeners()
  }

  /**
   * Create HTML for a product card
   */
  createProductCard(product) {
    const imageUrl = product.image || "assets/images/placeholder.png"
    const price = typeof product.price === "number" ? product.price.toFixed(2) : "0.00"
    // Promoção
    const onSale = !!product.promocional && product.precoPromo && product.precoPromo < product.price
    const salePrice = onSale ? Number(product.precoPromo).toFixed(2) : null

    return `
      <div class="admin-product-card" data-product-id="${product.id}">
        <div class="product-image">
          <img src="${imageUrl}" alt="${product.name}" loading="lazy">
          <div class="product-category">${product.category}</div>
          ${onSale ? `<div class="product-tag sale-tag">Promoção</div>` : ""}
        </div>

        <div class="product-info">
          <h3>${product.name}</h3>
          <p class="product-description">${product.description}</p>

          <div class="product-details">
            <div class="product-type">
              <i class="fas fa-tag"></i>
              <span>${product.type}</span>
            </div>
            <div class="product-price">
              ${onSale
                ? `<span class="current-price sale-price">R$ ${salePrice}</span> <span class="old-price">R$ ${price}</span>`
                : `<span class="current-price">R$ ${price}</span>`
              }
            </div>
          </div>

          <div class="product-actions">
            <button class="btn-secondary btn-sm edit-product-btn" data-product-id="${product.id}">
              <i class="fas fa-edit"></i> Editar
            </button>
            <button class="btn-danger btn-sm delete-product-btn" data-product-id="${product.id}" data-product-name="${product.name}">
              <i class="fas fa-trash"></i> Excluir
            </button>
          </div>
        </div>
      </div>
    `
  }

  /**
   * Set up event listeners for product cards
   */
  setupProductCardListeners() {
    // Edit buttons
    document.querySelectorAll(".edit-product-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const productId = e.target.closest(".edit-product-btn").dataset.productId
        this.openEditProductModal(productId)
      })
    })

    // Delete buttons
    document.querySelectorAll(".delete-product-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const button = e.target.closest(".delete-product-btn")
        const productId = button.dataset.productId
        const productName = button.dataset.productName
        this.openDeleteModal(productId, productName)
      })
    })
  }

  /**
   * Filter products based on search and filters
   */
  filterProducts() {
    let filtered = [...this.products]

    // Search filter
    const searchTerm = this.elements.searchInput?.value.toLowerCase().trim()
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          product.description.toLowerCase().includes(searchTerm) ||
          product.category.toLowerCase().includes(searchTerm) ||
          product.type.toLowerCase().includes(searchTerm),
      )
    }

    // Category filter
    const selectedCategories = Array.from(this.elements.categoryFilters)
      .filter((filter) => filter.checked)
      .map((filter) => filter.value)

    if (selectedCategories.length > 0 && !this.elements.allCategories?.checked) {
      filtered = filtered.filter((product) => selectedCategories.includes(product.category))
    }

    // Type filter
    const selectedTypes = Array.from(this.elements.typeFilters)
      .filter((filter) => filter.checked)
      .map((filter) => filter.value)

    if (selectedTypes.length > 0 && !this.elements.allTypes?.checked) {
      filtered = filtered.filter((product) => selectedTypes.includes(product.type))
    }

    this.filteredProducts = filtered
    this.renderProducts()
    this.updateProductsCount()
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    // Clear search
    if (this.elements.searchInput) {
      this.elements.searchInput.value = ""
    }

    // Reset category filters
    if (this.elements.allCategories) {
      this.elements.allCategories.checked = true
    }
    this.elements.categoryFilters.forEach((filter) => (filter.checked = false))

    // Reset type filters
    if (this.elements.allTypes) {
      this.elements.allTypes.checked = true
    }
    this.elements.typeFilters.forEach((filter) => (filter.checked = false))

    // Apply filters
    this.filterProducts()
  }

  /**
   * Update products count display
   */
  updateProductsCount() {
    if (this.elements.filteredProductsCount) {
      this.elements.filteredProductsCount.textContent = this.filteredProducts.length
    }
  }

  /**
   * Update statistics
   */
  updateStats() {
    const totalProducts = this.products.length
    const categories = [...new Set(this.products.map((p) => p.category))].length
    const averagePrice =
      totalProducts > 0 ? this.products.reduce((sum, p) => sum + (p.price || 0), 0) / totalProducts : 0

    if (this.elements.totalProductsCount) {
      this.elements.totalProductsCount.textContent = totalProducts
    }

    if (this.elements.categoriesCount) {
      this.elements.categoriesCount.textContent = categories
    }

    if (this.elements.averagePrice) {
      this.elements.averagePrice.textContent = `R$ ${averagePrice.toFixed(2)}`
    }
  }

  /**
   * Open add product modal
   */
  openAddProductModal() {
    this.currentEditingProduct = null
    this.elements.modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar Produto'
    this.elements.saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Produto'

    // Reset form
    this.elements.productForm.reset()

    // Reset form states
    this.resetFormStates()

    // Reset image preview
    this.updateImagePreview("")

    this.elements.productModal.style.display = "flex"
    document.body.style.overflow = "hidden"

    // Focar no primeiro campo
    setTimeout(() => {
      document.getElementById('productName')?.focus()
    }, 100)
  }

  /**
   * Reset form visual states
   */
  resetFormStates() {
    // Remove todos os estados de erro/sucesso
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('error', 'success')
    })

    // Remove mensagens de erro
    document.querySelectorAll('.error-message').forEach(msg => {
      msg.remove()
    })

    // Reset toggle de promoção
    const salePriceInput = document.getElementById('productSalePrice')
    if (salePriceInput) {
      salePriceInput.disabled = true
      salePriceInput.parentElement.style.opacity = '0.6'
    }

    // Reset file upload
    const fileInput = document.getElementById('productImage')
    const fileInfo = document.getElementById('fileInfo')
    const uploadContainer = fileInput?.closest('.file-upload-container')

    if (fileInput) fileInput.value = ''
    if (fileInfo) fileInfo.style.display = 'none'
    if (uploadContainer) {
      uploadContainer.classList.remove('has-file', 'error')
    }
  }

  /**
   * Open edit product modal
   */
  async openEditProductModal(productId) {
    try {
      const product = this.products.find((p) => p.id === productId)
      if (!product) {
        throw new Error("Product not found")
      }

      this.currentEditingProduct = product
      this.elements.modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Produto'
      this.elements.saveBtn.innerHTML = '<i class="fas fa-save"></i> Salvar Alterações'

      // Fill form with product data
      document.getElementById("productName").value = product.name || ""
      document.getElementById("productCategory").value = product.category || ""
      document.getElementById("productType").value = product.type || ""
      document.getElementById("productPrice").value = product.price || ""
      document.getElementById("productDescription").value = product.description || ""

      // Promoção
      const onSaleCheckbox = document.getElementById("productOnSale")
      const salePriceInput = document.getElementById("productSalePrice")

      onSaleCheckbox.checked = !!product.promocional
      salePriceInput.value = product.precoPromo || ""

      // Habilitar/desabilitar preço promocional baseado no estado da promoção
      if (product.promocional) {
        salePriceInput.disabled = false
        salePriceInput.parentElement.style.opacity = '1'
      } else {
        salePriceInput.disabled = true
        salePriceInput.parentElement.style.opacity = '0.6'
      }

      // Limpar input de arquivo (não pode ser preenchido programaticamente)
      const fileInput = document.getElementById("productImage")
      fileInput.value = ""

      // Esconder info de arquivo
      const fileInfo = document.getElementById("fileInfo")
      if (fileInfo) {
        fileInfo.style.display = "none"
      }

      // Resetar container de upload
      const uploadContainer = fileInput.closest('.file-upload-container')
      if (uploadContainer) {
        uploadContainer.classList.remove('has-file', 'error')
      }

      // Atualizar preview com imagem existente
      this.updateImagePreview(product.image)

      this.elements.productModal.style.display = "flex"
      document.body.style.overflow = "hidden"

      // Focar no primeiro campo
      setTimeout(() => {
        document.getElementById('productName')?.focus()
      }, 100)

    } catch (error) {
      console.error("Error opening edit modal:", error)
      this.showToast("Erro ao carregar dados do produto", "error")
    }
  }

  /**
   * Close product modal
   */
  closeProductModal() {
    this.elements.productModal.style.display = "none"
    document.body.style.overflow = "auto"
    this.currentEditingProduct = null
  }

  /**
   * Open delete confirmation modal
   */
  openDeleteModal(productId, productName) {
    this.currentEditingProduct = { id: productId, name: productName }
    this.elements.deleteProductName.textContent = productName
    this.elements.deleteModal.style.display = "flex"
    document.body.style.overflow = "hidden"
  }

  /**
   * Close delete modal
   */
  closeDeleteModal() {
    this.elements.deleteModal.style.display = "none"
    document.body.style.overflow = "auto"
    this.currentEditingProduct = null
  }

  /**
   * Save product (create or update)
   */
  async saveProduct() {
    try {
      // Disable save button
      this.elements.saveBtn.disabled = true
      this.elements.saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...'

      // Get form data
      const formData = new FormData(this.elements.productForm)
      const onSale = !!formData.get("onSale")
      const salePriceRaw = formData.get("salePrice")
      const salePrice = salePriceRaw ? Number.parseFloat(salePriceRaw) : null

      // Prepare product data
      const productData = {
        name: formData.get("name").trim(),
        category: formData.get("category"),
        type: formData.get("type"),
        price: Number.parseFloat(formData.get("price")),
        image: "", // will be set below
        description: formData.get("description").trim(),
        promocional: onSale,
        precoPromo: onSale && salePriceRaw ? salePrice : null,
      }

      // Handle image file input (base64 conversion)
      try {
        const fileInput = document.getElementById('productImage')
        const file = fileInput.files && fileInput.files[0]

        if (file) {
          // Nova imagem foi selecionada
          if (typeof FileUploadManager === 'undefined') {
            throw new Error('FileUploadManager não está disponível');
          }

          const fileUploadManager = new FileUploadManager()
          productData.image = await fileUploadManager.fileToBase64(file)

          // Feedback de sucesso
          this.showToast('Imagem processada com sucesso!', 'success')
        } else {
          // Nenhuma nova imagem selecionada
          if (this.currentEditingProduct && this.currentEditingProduct.image) {
            // Editando produto existente - manter imagem atual
            productData.image = this.currentEditingProduct.image
          } else {
            // Novo produto sem imagem - usar padrão
            productData.image = '../assets/images/gerais/iconeBaronesa.png'
          }
        }
      } catch (error) {
        console.error('Erro ao processar imagem:', error)
        this.showToast('Erro ao processar imagem. Usando imagem padrão.', 'warning')

        // Em caso de erro, preservar imagem existente ou usar padrão
        if (this.currentEditingProduct && this.currentEditingProduct.image) {
          productData.image = this.currentEditingProduct.image
        } else {
          productData.image = '../assets/images/gerais/iconeBaronesa.png'
        }
      }

      // Validate required fields
      if (!productData.name || !productData.category || !productData.type || !productData.description) {
        throw new Error("Todos os campos obrigatórios devem ser preenchidos")
      }

      if (isNaN(productData.price) || productData.price < 0) {
        throw new Error("Preço deve ser um número válido maior ou igual a zero")
      }

      if (productData.promocional && (isNaN(productData.precoPromo) || productData.precoPromo <= 0 || productData.precoPromo >= productData.price)) {
        throw new Error("O preço promocional deve ser menor que o preço original e maior que zero")
      }

      // Save product
      if (this.currentEditingProduct) {
        // Update existing product
        this.showToast('Atualizando produto...', 'info')
        await window.ProductsService.updateProduct(this.currentEditingProduct.id, productData)
        this.showToast("Produto atualizado com sucesso!", "success")
      } else {
        // Create new product
        this.showToast('Criando produto...', 'info')
        await window.ProductsService.createProduct(productData)
        this.showToast("Produto criado com sucesso!", "success")
      }

      // Reload products and close modal
      await this.loadProducts()
      this.updateStats()
      this.closeProductModal()
    } catch (error) {
      console.error("Error saving product:", error)
      this.showToast(error.message || "Erro ao salvar produto", "error")
    } finally {
      // Re-enable save button
      this.elements.saveBtn.disabled = false
      this.elements.saveBtn.innerHTML = this.currentEditingProduct
        ? '<i class="fas fa-save"></i> Salvar Alterações'
        : '<i class="fas fa-save"></i> Salvar Produto'
    }
  }

  /**
   * Confirm product deletion
   */
  async confirmDelete() {
    try {
      if (!this.currentEditingProduct) return

      // Disable delete button
      this.elements.confirmDeleteBtn.disabled = true
      this.elements.confirmDeleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Excluindo...'

      // Delete product
      await window.ProductsService.deleteProduct(this.currentEditingProduct.id)

      this.showToast("Produto excluído com sucesso!", "success")

      // Reload products and close modal
      await this.loadProducts()
      this.updateStats()
      this.closeDeleteModal()
    } catch (error) {
      console.error("Error deleting product:", error)
      this.showToast("Erro ao excluir produto", "error")
    } finally {
      // Re-enable delete button
      this.elements.confirmDeleteBtn.disabled = false
      this.elements.confirmDeleteBtn.innerHTML = '<i class="fas fa-trash"></i> Excluir Produto'
    }
  }

  /**
   * Update image preview
   */
  updateImagePreview(imageUrl) {
    const preview = this.elements.imagePreview
    if (!preview) return

    if (imageUrl && imageUrl.trim()) {
      preview.src = imageUrl
      preview.onerror = () => {
        preview.src = "../assets/images/gerais/iconeBaronesa.png"
      }
    } else {
      preview.src = "../assets/images/gerais/iconeBaronesa.png"
    }
  }

  /**
   * Show toast notification
   */
  showToast(message, type = "info") {
    const toast = document.createElement("div")
    toast.className = `toast toast-${type}`

    const icon = type === "success" ? "check-circle" : type === "error" ? "exclamation-circle" : "info-circle"

    toast.innerHTML = `
      <i class="fas fa-${icon}"></i>
      <span>${message}</span>
    `

    this.elements.toastContainer.appendChild(toast)

    // Show toast
    setTimeout(() => toast.classList.add("show"), 100)

    // Remove toast after 5 seconds
    setTimeout(() => {
      toast.classList.remove("show")
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast)
        }
      }, 300)
    }, 5000)
  }

  /**
   * Debounce function for search
   */
  debounce(func, wait) {
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

  // Função para aplicar filtros de produtos (chamada pelo admin-filters.js)
  applyProductFilters(filters) {
    this.filteredProducts = this.products.filter(product => {
      // Filtro por busca
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesSearch = product.name.toLowerCase().includes(searchLower) ||
                            product.description.toLowerCase().includes(searchLower) ||
                            product.category.toLowerCase().includes(searchLower) ||
                            product.type.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Filtro por categoria
      if (filters.categories.length > 0) {
        if (!filters.categories.includes(product.category)) return false;
      }

      // Filtro por promoção
      if (filters.promocional) {
        if (!product.onSale) return false;
      }

      // Filtro por faixa de preço
      if (filters.priceRanges.length > 0) {
        const price = parseFloat(product.price);
        const matchesPrice = filters.priceRanges.some(range => {
          switch(range) {
            case '0-50': return price <= 50;
            case '50-100': return price > 50 && price <= 100;
            case '100-150': return price > 100 && price <= 150;
            case '150+': return price > 150;
            default: return true;
          }
        });
        if (!matchesPrice) return false;
      }

      // Filtro por tipo
      if (filters.types.length > 0) {
        if (!filters.types.includes(product.type)) return false;
      }

      return true;
    });

    this.renderProducts();
    this.updateProductsCount();
  }

  // Função para aplicar filtros de dicas (chamada pelo admin-filters.js)
  applyTipFilters(filters) {
    // Esta função será implementada quando o sistema de dicas estiver pronto
    console.log('Aplicando filtros de dicas:', filters);
    // Aqui você pode implementar a lógica de filtro para dicas
  }
}



document.addEventListener("DOMContentLoaded", async () => {
  // Aguarde a inicialização do Firebase e dos serviços
  if (typeof window.FirebaseConfig !== "undefined" && window.FirebaseConfig.initializeFirebase) {
    try {
      const { db, auth } = await window.FirebaseConfig.initializeFirebase();
      window.ProductsService.initialize(db, auth);
      window.AuthService.initialize(auth);
    } catch (e) {
      console.error("Erro ao inicializar Firebase:", e);
    }
  }

  // Só então crie o painel admin
  if (document.getElementById("adminProductsGrid")) {
    window.adminPanel = new AdminPanel();
  }
});

// Instanciar o painel admin
const adminPanel = new AdminPanel()

// Tornar as funções de filtro disponíveis globalmente
window.applyProductFilters = (filters) => adminPanel.applyProductFilters(filters);
window.applyTipFilters = (filters) => adminPanel.applyTipFilters(filters);

// Export for global access
window.AdminPanel = AdminPanel;
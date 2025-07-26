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
 * Set up tab system for admin panel
 */
setupTabSystem() {
    console.log('🔧 Configurando sistema de abas...');
    
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabPanes = document.querySelectorAll('.tab-pane');

    if (tabButtons.length === 0) {
        console.warn('⚠️ Nenhum botão de aba encontrado');
        return;
    }

    if (tabPanes.length === 0) {
        console.warn('⚠️ Nenhum painel de aba encontrado');
        return;
    }

    console.log(`📑 Encontrados ${tabButtons.length} botões e ${tabPanes.length} painéis`);

    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetTab = button.getAttribute('data-tab');
            console.log(`🔄 Alternando para aba: ${targetTab}`);
            
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                console.log(`❌ Removendo active de: ${btn.getAttribute('data-tab')}`);
            });
            
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
                console.log(`❌ Ocultando painel: ${pane.id}`);
            });
            
            // Add active class to clicked button
            button.classList.add('active');
            console.log(`✅ Ativando botão: ${targetTab}`);
            
            // Add active class to corresponding pane
            const targetPane = document.getElementById(targetTab + 'Tab');
            if (targetPane) {
                targetPane.classList.add('active');
                console.log(`✅ Exibindo painel: ${targetPane.id}`);
                
                // Se for a aba de slides, inicializar o gerenciador se necessário
                if (targetTab === 'slides' && !window.adminSlidesManager) {
                    console.log('🖼️ Inicializando gerenciador de slides...');
                    window.adminSlidesManager = new AdminSlidesManager();
                }
            } else {
                console.error(`❌ Painel não encontrado: ${targetTab}Tab`);
            }
        });
    });

    // Garantir que a primeira aba esteja ativa
    const firstButton = tabButtons[0];
    const firstPane = tabPanes[0];
    
    if (firstButton && !firstButton.classList.contains('active')) {
        firstButton.classList.add('active');
    }
    
    if (firstPane && !firstPane.classList.contains('active')) {
        firstPane.classList.add('active');
    }

    console.log('✅ Sistema de abas configurado com sucesso');
}

  /**
   * Initialize the admin panel
   */
  // Modifique o método init() para incluir o setupTabSystem:
async init() {
    try {
        // Set up event listeners
        this.setupEventListeners()
        this.setupTabSystem() // Adicione esta linha

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
    // Se já temos produtos carregados e não estamos forçando reload, reutilizar
    if (this.products.length > 0 && this.filteredProducts.length > 0) {
        console.log('📦 Reutilizando produtos já carregados');
        this.renderProducts();
        this.updateProductsCount();
        return;
    }

    try {
        this.setLoading(true);
        console.log('📡 Carregando produtos do banco...');

        // Check if ProductsService is available
        if (!window.ProductsService) {
            throw new Error("ProductsService not available");
        }

        this.products = await window.ProductsService.getAllProducts();
        this.filteredProducts = [...this.products];

        console.log(`✅ ${this.products.length} produtos carregados do banco`);

        this.renderProducts();
        this.updateProductsCount();
    } catch (error) {
        console.error("❌ Error loading products:", error);
        this.showToast("Erro ao carregar produtos", "error");
        
        // Em caso de erro, garantir que a UI seja atualizada
        this.products = [];
        this.filteredProducts = [];
        this.renderProducts();
    } finally {
        this.setLoading(false);
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
    console.log('🔄 Renderizando produtos...', {
        filteredCount: this.filteredProducts.length,
        totalCount: this.products.length
    });

    if (!this.elements.productsGrid) {
        console.error('❌ Elemento productsGrid não encontrado');
        return;
    }

    if (!this.elements.noProductsMessage) {
        console.error('❌ Elemento noProductsMessage não encontrado');
        return;
    }

    // Se não há produtos filtrados, mostrar mensagem
    if (this.filteredProducts.length === 0) {
        this.elements.productsGrid.style.display = "none";
        this.elements.noProductsMessage.style.display = "block";
        console.log('📭 Nenhum produto para exibir');
        return;
    }

    // Há produtos para mostrar
    this.elements.noProductsMessage.style.display = "none";
    this.elements.productsGrid.style.display = "grid";

    // Renderizar produtos
    try {
        const productsHTML = this.filteredProducts
            .map((product) => this.createProductCard(product))
            .join("");

        this.elements.productsGrid.innerHTML = productsHTML;
        
        // Add event listeners to product cards
        this.setupProductCardListeners();
        
        console.log(`✅ ${this.filteredProducts.length} produtos renderizados`);
    } catch (error) {
        console.error('❌ Erro ao renderizar produtos:', error);
        this.elements.productsGrid.innerHTML = `
            <div class="error-message" style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #dc3545;">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Erro ao carregar produtos. Tente recarregar a página.</p>
            </div>
        `;
    }
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

/**
 * Admin Slides Manager for Pet Shop Baronesa
 * Handles slide management functionality
 */

class AdminSlidesManager {
    constructor() {
        this.slides = [];
        this.tempFileData = {};
        this.isLoading = false;
        this.init();
    }

    /**
     * Initialize the slides manager
     */
    init() {
        console.log('🖼️ Inicializando gerenciador de slides...');
        
        this.loadSlidesData();
        this.setupEventListeners();
        this.setupFileUploads();
        this.setupCharacterCounters();
        
        console.log('✅ Gerenciador de slides inicializado');
    }

    /**
     * Load slides data from localStorage or use defaults
     */
    loadSlidesData() {
        try {
            const savedSlides = localStorage.getItem('petshop_baronesa_slides');
            if (savedSlides) {
                this.slides = { ...this.slides, ...JSON.parse(savedSlides) };
                console.log('📁 Dados dos slides carregados do localStorage');
            }
            
            this.updatePreviewsFromData();
        } catch (error) {
            console.error('❌ Erro ao carregar dados dos slides:', error);
        }
    }

    /**
     * Update previews from current data
     */
    updatePreviewsFromData() {
        Object.keys(this.slides).forEach(slideKey => {
            const slideNumber = slideKey.replace('slide', '');
            const titleInput = document.getElementById(`slide${slideNumber}Title`);
            const titlePreview = document.getElementById(`slide${slideNumber}TitlePreview`);
            const imagePreview = document.getElementById(`slide${slideNumber}Preview`);
            
            if (titleInput && this.slides[slideKey].title) {
                titleInput.value = this.slides[slideKey].title;
                this.updateCharCount(slideNumber);
            }
            
            if (titlePreview && this.slides[slideKey].title) {
                titlePreview.textContent = this.slides[slideKey].title;
            }
            
            if (imagePreview && this.slides[slideKey].image) {
                imagePreview.src = this.slides[slideKey].image;
            }
        });
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Save slide buttons
        document.querySelectorAll('.save-slide').forEach(button => {
            button.addEventListener('click', (e) => {
                const slideNumber = e.target.getAttribute('data-slide');
                this.saveSlide(slideNumber);
            });
        });

        // Title input changes (real-time preview)
        for (let i = 1; i <= 3; i++) {
            const titleInput = document.getElementById(`slide${i}Title`);
            if (titleInput) {
                titleInput.addEventListener('input', () => {
                    this.updateTitlePreview(i);
                    this.updateCharCount(i);
                });
            }
        }
    }

    /**
     * Setup file upload functionality
     */
    setupFileUploads() {
        for (let i = 1; i <= 3; i++) {
            this.setupSingleFileUpload(i);
        }
    }

    /**
     * Setup file upload for a single slide
     */
    setupSingleFileUpload(slideNumber) {
        const fileInput = document.getElementById(`slide${slideNumber}Image`);
        const container = fileInput?.closest('.file-upload-container');
        const fileInfo = container?.querySelector('.file-info');
        const removeBtn = container?.querySelector('.remove-file');

        if (!fileInput || !container) return;

        // Drag and drop
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('dragover');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('dragover');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileSelection(slideNumber, files[0]);
            }
        });

        // Click to select
        container.addEventListener('click', () => {
            if (!container.classList.contains('has-file')) {
                fileInput.click();
            }
        });

        // File selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFileSelection(slideNumber, file);
            }
        });

        // Remove file
        removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearFile(slideNumber);
        });
    }

    /**
     * Handle file selection
     */
    async handleFileSelection(slideNumber, file) {
        const container = document.querySelector(`#slide${slideNumber}Image`).closest('.file-upload-container');
        const fileInfo = container.querySelector('.file-info');
        const fileName = fileInfo.querySelector('.file-name');
        const preview = document.getElementById(`slide${slideNumber}Preview`);

        try {
            // Validate file
            if (!this.validateFile(file, container)) {
                return;
            }

            // Show loading
            container.classList.add('slide-loading');

            // Convert to base64
            const base64 = await this.fileToBase64(file);

            // Update UI
            container.classList.add('has-file');
            container.classList.remove('error', 'slide-loading');
            fileInfo.style.display = 'flex';
            fileName.textContent = file.name;

            // Update preview
            if (preview) {
                preview.src = base64;
            }

            // Store temporarily (will be saved when user clicks save)
            this.tempFileData = this.tempFileData || {};
            this.tempFileData[`slide${slideNumber}`] = base64;

            this.showToast(`Imagem do Slide ${slideNumber} carregada com sucesso!`, 'success');

        } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            this.showError(container, 'Erro ao processar arquivo');
        }
    }

    /**
     * Validate file
     */
    validateFile(file, container) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        // Clear previous errors
        this.clearError(container);

        // Check type
        if (!allowedTypes.includes(file.type)) {
            this.showError(container, 'Formato não suportado. Use JPG, PNG ou GIF.');
            return false;
        }

        // Check size
        if (file.size > maxSize) {
            this.showError(container, 'Arquivo muito grande. Máximo 5MB.');
            return false;
        }

        return true;
    }

    /**
     * Show error message
     */
    showError(container, message) {
        container.classList.add('error');
        
        let errorDiv = container.querySelector('.file-error');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'file-error';
            container.appendChild(errorDiv);
        }
        
        errorDiv.textContent = message;
    }

    /**
     * Clear error message
     */
    clearError(container) {
        container.classList.remove('error');
        const errorDiv = container.querySelector('.file-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    /**
     * Clear file selection
     */
    clearFile(slideNumber) {
        const fileInput = document.getElementById(`slide${slideNumber}Image`);
        const container = fileInput.closest('.file-upload-container');
        const fileInfo = container.querySelector('.file-info');
        const preview = document.getElementById(`slide${slideNumber}Preview`);

        // Reset input
        fileInput.value = '';

        // Reset UI
        container.classList.remove('has-file', 'error');
        fileInfo.style.display = 'none';
        this.clearError(container);

        // Restore original image
        if (preview) {
            preview.src = this.slides[`slide${slideNumber}`].image;
        }

        // Clear temp data
        if (this.tempFileData && this.tempFileData[`slide${slideNumber}`]) {
            delete this.tempFileData[`slide${slideNumber}`];
        }
    }

    /**
     * Setup character counters
     */
    setupCharacterCounters() {
        for (let i = 1; i <= 3; i++) {
            this.updateCharCount(i);
        }
    }

    /**
     * Update character count for a slide title
     */
    updateCharCount(slideNumber) {
        const titleInput = document.getElementById(`slide${slideNumber}Title`);
        const countSpan = document.getElementById(`slide${slideNumber}TitleCount`);
        const countContainer = countSpan?.parentElement;

        if (!titleInput || !countSpan) return;

        const currentLength = titleInput.value.length;
        const maxLength = 100;

        countSpan.textContent = currentLength;

        // Update styling based on length
        if (countContainer) {
            countContainer.classList.remove('warning', 'danger');
            
            if (currentLength > maxLength * 0.9) {
                countContainer.classList.add('danger');
            } else if (currentLength > maxLength * 0.7) {
                countContainer.classList.add('warning');
            }
        }
    }

    /**
     * Update title preview in real-time
     */
    updateTitlePreview(slideNumber) {
        const titleInput = document.getElementById(`slide${slideNumber}Title`);
        const titlePreview = document.getElementById(`slide${slideNumber}TitlePreview`);

        if (titleInput && titlePreview) {
            titlePreview.textContent = titleInput.value || 'Título do slide...';
        }
    }

    /**
     * Save slide data
     */
    async saveSlide(slideNumber) {
    const saveButton = document.querySelector(`.save-slide[data-slide="${slideNumber}"]`);
    const slideCard = saveButton?.closest('.slide-card');
    const titleInput = document.getElementById(`slide${slideNumber}Title`);

    if (!saveButton) {
        console.error(`❌ Botão de salvar não encontrado para slide ${slideNumber}`);
        this.showToast(`Erro: Botão não encontrado`, 'error');
        return;
    }

    if (!slideCard) {
        console.error(`❌ Card do slide não encontrado para slide ${slideNumber}`);
        this.showToast(`Erro: Card do slide não encontrado`, 'error');
        return;
    }

    if (!titleInput) {
        console.error(`❌ Input de título não encontrado para slide ${slideNumber}`);
        this.showToast(`Erro: Campo de título não encontrado`, 'error');
        return;
    }

    try {
        // Disable button and show loading
        saveButton.disabled = true;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
        slideCard.classList.add('slide-updating');

        // Get form data
        const title = titleInput.value.trim();

        // Validate
        if (!title) {
            throw new Error('O título não pode estar vazio');
        }

        if (title.length > 100) {
            throw new Error('O título não pode ter mais de 100 caracteres');
        }

        // Inicializar slides se não existir
        if (!this.slides) {
            this.slides = {};
        }

        // Inicializar slide específico se não existir
        if (!this.slides[`slide${slideNumber}`]) {
            this.slides[`slide${slideNumber}`] = {
                title: '',
                image: '../assets/images/gerais/iconeBaronesa.png'
            };
        }

        // Prepare slide data
        const slideData = {
            title: title,
            image: this.slides[`slide${slideNumber}`].image || '../assets/images/gerais/iconeBaronesa.png'
        };

        // Use new image if uploaded
        if (this.tempFileData && this.tempFileData[`slide${slideNumber}`]) {
            slideData.image = this.tempFileData[`slide${slideNumber}`];
            delete this.tempFileData[`slide${slideNumber}`];
        }

        // Update slides data
        this.slides[`slide${slideNumber}`] = slideData;

        // Save to localStorage
        localStorage.setItem('petshop_baronesa_slides', JSON.stringify(this.slides));

        // Update preview
        this.updateTitlePreview(slideNumber);

        // Show success
        slideCard.classList.add('slide-success');
        this.showToast(`Slide ${slideNumber} salvo com sucesso!`, 'success');

        // Reset file upload UI
        this.resetFileUploadUI(slideNumber);

        console.log(`✅ Slide ${slideNumber} salvo:`, slideData);

    } catch (error) {
        console.error(`❌ Erro ao salvar slide ${slideNumber}:`, error);
        slideCard.classList.add('slide-error');
        this.showToast(error.message || `Erro ao salvar slide ${slideNumber}`, 'error');
    } finally {
        // Reset button
        saveButton.disabled = false;
        saveButton.innerHTML = `<i class="fas fa-save"></i> Salvar Slide ${slideNumber}`;
        
        // Remove animation classes
        setTimeout(() => {
            slideCard.classList.remove('slide-updating', 'slide-success', 'slide-error');
        }, 2000);
    }
}

/**
 * Reset file upload UI helper method
 */
resetFileUploadUI(slideNumber) {
    try {
        const fileInput = document.getElementById(`slide${slideNumber}Image`);
        const container = fileInput?.closest('.file-upload-container');
        const fileInfo = container?.querySelector('.file-info');

        if (fileInput) {
            fileInput.value = '';
        }

        if (container) {
            container.classList.remove('has-file');
        }

        if (fileInfo) {
            fileInfo.style.display = 'none';
        }
    } catch (error) {
        console.warn(`⚠️ Erro ao resetar UI do upload para slide ${slideNumber}:`, error);
    }
}

/**
 * Load slides data from localStorage or use defaults
 */
loadSlidesData() {
    try {
        // Inicializar com dados padrão
        this.slides = {
            slide1: {
                title: "Desconto especial na Ração Golden até domingo!",
                image: "../assets/images/slides/caoPoteDesconto.jpg"
            },
            slide2: {
                title: "Banho & Tosa com 20% de desconto às quartas-feiras!",
                image: "../assets/images/slides/goldenBanhoDesconto.jpg"
            },
            slide3: {
                title: "Novos acessórios para seu pet chegaram!",
                image: "../assets/images/slides/gatoCasinha.png"
            }
        };

        // Tentar carregar dados salvos
        const savedSlides = localStorage.getItem('petshop_baronesa_slides');
        if (savedSlides) {
            const parsedSlides = JSON.parse(savedSlides);
            this.slides = { ...this.slides, ...parsedSlides };
            console.log('📁 Dados dos slides carregados do localStorage');
        }
        
        this.updatePreviewsFromData();
    } catch (error) {
        console.error('❌ Erro ao carregar dados dos slides:', error);
        // Manter dados padrão em caso de erro
    }
}

/**
 * Setup event listeners
 */
setupEventListeners() {
    // Save slide buttons
    document.querySelectorAll('.save-slide').forEach(button => {
        button.addEventListener('click', (e) => {
            const slideNumber = e.target.getAttribute('data-slide') || e.currentTarget.getAttribute('data-slide');
            console.log(`🔄 Salvando slide ${slideNumber}`);
            this.saveSlide(slideNumber);
        });
    });

    // Title input changes (real-time preview)
    for (let i = 1; i <= 3; i++) {
        const titleInput = document.getElementById(`slide${i}Title`);
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                this.updateTitlePreview(i);
                this.updateCharCount(i);
            });
        }
    }
}

    /**
     * Convert file to base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        // Use existing toast system if available
        if (window.adminPanel && typeof window.adminPanel.showToast === 'function') {
            window.adminPanel.showToast(message, type);
            return;
        }

        // Fallback toast implementation
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
        `;
        toast.textContent = message;

        document.body.appendChild(toast);

        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 4 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 4000);
    }

    /**
     * Get current slides data (for use by carousel)
     */
    getSlidesData() {
        return this.slides;
    }

    /**
     * Reset all slides to default
     */
    resetToDefaults() {
        if (confirm('Tem certeza que deseja restaurar os slides padrão? Esta ação não pode ser desfeita.')) {
            localStorage.removeItem('petshop_baronesa_slides');
            location.reload();
        }
    }
}
document.addEventListener("DOMContentLoaded", async () => {
  console.log('🔧 Inicializando página admin...');
  
  // Aguarde a inicialização do Firebase e dos serviços
  if (typeof window.FirebaseConfig !== "undefined" && window.FirebaseConfig.initializeFirebase) {
    try {
      const { db, auth } = await window.FirebaseConfig.initializeFirebase();
      window.ProductsService.initialize(db, auth);
      window.AuthService.initialize(auth);
      console.log('✅ Firebase inicializado');
    } catch (e) {
      console.error("Erro ao inicializar Firebase:", e);
    }
  }

  // Só então crie o painel admin
  if (document.getElementById("adminProductsGrid")) {
    window.adminPanel = new AdminPanel();
    
    // Tornar as funções de filtro disponíveis globalmente
    window.applyProductFilters = (filters) => window.adminPanel.applyProductFilters(filters);
    window.applyTipFilters = (filters) => window.adminPanel.applyTipFilters(filters);
    
    console.log('✅ Admin panel inicializado');
  }
});

// Export for global access
window.AdminPanel = AdminPanel;
window.AdminSlidesManager = AdminSlidesManager;

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
    
    // Tornar as funções de filtro disponíveis globalmente
    window.applyProductFilters = (filters) => window.adminPanel.applyProductFilters(filters);
    window.applyTipFilters = (filters) => window.adminPanel.applyTipFilters(filters);
  }
}); //

// Export for global access
window.AdminPanel = AdminPanel;
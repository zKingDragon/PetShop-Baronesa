/**
 * Products Service for Pet Shop Baronesa
 * Handles all product-related da    } catch (error) {
      this.logger.error ? this.logger.error("ProductsService", "Error getting product", error) : console.error("Error getting product:", error)
      throw new Error("Erro ao buscar produto")ase operations
 */

class ProductsService {
  constructor() {
    this.collection = "Produtos"
    this.db = window.db
    this.logger = window.Logger || console // Fallback para console se logger não estiver disponível
  }

  /**
   * Permite inicializar com instâncias customizadas de db/auth
   */
  initialize(db, auth) {
    if (db) this.db = db
    // auth não é usado aqui, mas pode ser útil para futuras permissões
  }

  /**
   * Gera um slug para o produto (para URLs amigáveis)
   */
  generateSlug(name) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
  }

  /**
   * Map Firestore product document to frontend format
   * @param {firebase.firestore.DocumentSnapshot} doc
   * @returns {Object}
   */
  mapFirestoreProduct(doc) {
    const data = doc.data()
    return {
      id: doc.id,
      name: data.nomeProduto,
      description: data.descricao,
      price: parseFloat(data.Preco),
      image: data.urlImg,
      category: data.categoria,
      type: data.tipoProduto,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      slug: data.slug || this.generateSlug(data.nomeProduto || ""),
      promocional: data.promocional || false,
      precoPromo: data.precoPromo ? parseFloat(data.precoPromo) : null,
    }
  }

  /**
   * Get all products from Firestore
   * @returns {Promise<Array>} Array of products
   */
  async getAllProducts() {
    try {
      const snapshot = await this.db.collection(this.collection).orderBy("createdAt", "desc").get()
      return snapshot.docs.map((doc) => this.mapFirestoreProduct(doc))
    } catch (error) {
      console.error("Error getting products:", error)
      throw new Error("Erro ao carregar produtos")
    }
  }

  /**
   * Get a single product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Product data or null if not found
   */
  async getProductById(productId) {
    try {
      const doc = await this.db.collection(this.collection).doc(productId).get()
      if (doc.exists) {
        return this.mapFirestoreProduct(doc)
      }
      return null
    } catch (error) {
      console.error("Error getting product:", error)
      throw new Error("Erro ao carregar produto")
    }
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data
   * @returns {Promise<string>} Created product ID
   */
  async createProduct(productData) {
    try {
      this.validateProductData(productData)
      const slug = this.generateSlug(productData.name)
      const productWithTimestamps = {
        nomeProduto: productData.name,
        descricao: productData.description,
        Preco: productData.price,
        urlImg: productData.image,
        categoria: productData.category,
        tipoProduto: productData.type,
        slug,
        promocional: productData.promocional || false,
        precoPromo: productData.precoPromo || null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }
      const docRef = await this.db.collection(this.collection).add(productWithTimestamps)
      this.logger.info ? this.logger.info("ProductsService", `Product created with ID: ${docRef.id}`) : console.log("Product created with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      this.logger.error ? this.logger.error("ProductsService", "Error creating product", error) : console.error("Error creating product:", error)
      throw new Error("Erro ao criar produto")
    }
  }

  /**
   * Update an existing product
   * @param {string} productId - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  async updateProduct(productId, updateData) {
    try {
      this.validateProductData(updateData)
      const slug = this.generateSlug(updateData.name)
      const updateWithTimestamp = {
        nomeProduto: updateData.name,
        descricao: updateData.description,
        Preco: updateData.price,
        urlImg: updateData.image,
        categoria: updateData.category,
        tipoProduto: updateData.type,
        slug,
        promocional: updateData.promocional || false,
        precoPromo: updateData.precoPromo || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }
      await this.db.collection(this.collection).doc(productId).update(updateWithTimestamp)
      console.log("Product updated:", productId)
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error("Erro ao atualizar produto")
    }
  }

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   */
  async deleteProduct(productId) {
    try {
      await this.db.collection(this.collection).doc(productId).delete()

      console.log("Product deleted:", productId)
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error("Erro ao excluir produto")
    }
  }

  /**
   * Get products by category
   * @param {string} category - Product category
   * @returns {Promise<Array>} Array of products
   */
  async getProductsByCategory(category) {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("categoria", "==", category)
        .orderBy("createdAt", "desc")
        .get()
      return snapshot.docs.map((doc) => this.mapFirestoreProduct(doc))
    } catch (error) {
      console.error("Error getting products by category:", error)
      throw new Error("Erro ao carregar produtos por categoria")
    }
  }

  /**
   * Get products by type
   * @param {string} type - Product type
   * @returns {Promise<Array>} Array of products
   */
  async getProductsByType(type) {
    try {
      const snapshot = await this.db
        .collection(this.collection)
        .where("tipoProduto", "==", type)
        .orderBy("createdAt", "desc")
        .get()
      return snapshot.docs.map((doc) => this.mapFirestoreProduct(doc))
    } catch (error) {
      console.error("Error getting products by type:", error)
      throw new Error("Erro ao carregar produtos por tipo")
    }
  }

  /**
   * Search products by name or description
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of products
   */
  async searchProducts(searchTerm) {
    try {
      // Note: Firestore doesn't support full-text search natively
      // This is a basic implementation that gets all products and filters client-side
      // For production, consider using Algolia or similar service

      const allProducts = await this.getAllProducts()
      const searchLower = searchTerm.toLowerCase()

      return allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) || product.description.toLowerCase().includes(searchLower),
      )
    } catch (error) {
      console.error("Error searching products:", error)
      throw new Error("Erro ao buscar produtos")
    }
  }

  /**
   * Get products with filters
   * @param {Object} filters - Filter options
   * @returns {Promise<Array>} Array of products
   */
  async getFilteredProducts(filters = {}) {
    try {
      let query = this.db.collection(this.collection)
      
      // Aplicar apenas um filtro por vez para evitar necessidade de índices compostos
      if (filters.categories && Array.isArray(filters.categories) && filters.categories.length > 0) {
        query = query.where("categoria", "in", filters.categories.slice(0, 10))
      } else if (filters.category) {
        query = query.where("categoria", "==", filters.category)
      } else if (filters.types && Array.isArray(filters.types) && filters.types.length > 0) {
        query = query.where("tipoProduto", "in", filters.types.slice(0, 10))
      } else if (filters.type) {
        query = query.where("tipoProduto", "==", filters.type)
      } else if (filters.promocional) {
        query = query.where("promocional", "==", true)
      } else {
        // Se não há filtros específicos, apenas ordenar por data
        query = query.orderBy("createdAt", "desc")
      }
      
      if (filters.limit) {
        query = query.limit(filters.limit)
      }
      
      const snapshot = await query.get()
      let products = snapshot.docs.map((doc) => this.mapFirestoreProduct(doc))
      
      // Aplicar filtros restantes no lado cliente
      if (filters.minPrice !== undefined) {
        products = products.filter(product => product.price >= filters.minPrice)
      }
      if (filters.maxPrice !== undefined) {
        products = products.filter(product => product.price <= filters.maxPrice)
      }
      
      // Ordenar por data se não foi feito na consulta
      if (filters.categories || filters.category || filters.types || filters.type || filters.promocional) {
        products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      }
      
      return products
    } catch (error) {
      this.logger.error ? this.logger.error("ProductsService", "Error getting filtered products", error) : console.error("Error getting filtered products:", error)
      throw new Error("Erro ao filtrar produtos")
    }
  }

  /**
   * Validate product data
   * @param {Object} productData - Product data to validate
   * @throws {Error} If validation fails
   */
  validateProductData(productData) {
    const requiredFields = ["name", "category", "type", "price", "description"]

    for (const field of requiredFields) {
      if (!productData[field] || productData[field].toString().trim() === "") {
        throw new Error(`Campo obrigatório: ${field}`)
      }
    }

    // Validate price
    if (typeof productData.price !== "number" || productData.price < 0) {
      throw new Error("Preço deve ser um número válido maior ou igual a zero")
    }

    // Validate promotional price if provided
    if (productData.precoPromo !== undefined && productData.precoPromo !== null) {
      if (typeof productData.precoPromo !== "number" || productData.precoPromo < 0) {
        throw new Error("Preço promocional deve ser um número válido maior ou igual a zero")
      }
      if (productData.precoPromo >= productData.price) {
        throw new Error("Preço promocional deve ser menor que o preço normal")
      }
    }

    // Validate promotional field
    if (productData.promocional !== undefined && typeof productData.promocional !== "boolean") {
      throw new Error("Campo promocional deve ser verdadeiro ou falso")
    }

    // Validate category
    const validCategories = ["Cachorros", "Gatos", "Pássaros", "Outros Pets"]
    if (!validCategories.includes(productData.category)) {
      throw new Error("Categoria inválida")
    }

    // Validate type
    const validTypes = ["Alimentação", "Acessórios", "Higiene", "Brinquedos"]
    if (!validTypes.includes(productData.type)) {
      throw new Error("Tipo de produto inválido")
    }

    // Validate image if provided: allow http(s) URLs, relative paths, or data URLs (base64)
    if (productData.image && productData.image.trim()) {
      const img = productData.image.trim();
      const isDataUrl = img.startsWith('data:image/');
      const isRelative = img.startsWith('./') || img.startsWith('../') || img.startsWith('assets/') || img.startsWith('/assets/');
      if (!isDataUrl && !isRelative) {
        try {
          const u = new URL(img);
          if (!/^https?:$/.test(u.protocol)) {
            throw new Error('invalid-protocol');
          }
        } catch (e) {
          throw new Error("URL da imagem inválida")
        }
      }
    }
  }

  /**
   * Seed initial products (for development/testing)
   * @returns {Promise<void>}
   */
  async seedProducts() {
    try {
      const sampleProducts = [
        {
          name: "Ração Premium para Cães Adultos",
          category: "Cachorros",
          type: "Alimentação",
          price: 89.9,
          image: "assets/images/placeholder.png",
          description: "Ração completa e balanceada para cães adultos de todas as raças.",
        },
        {
          name: "Areia Sanitária para Gatos",
          category: "Gatos",
          type: "Higiene",
          price: 24.9,
          image: "assets/images/placeholder.png",
          description: "Areia sanitária com controle de odor para gatos.",
        },
        {
          name: "Brinquedo Corda para Cães",
          category: "Cachorros",
          type: "Brinquedos",
          price: 15.9,
          image: "assets/images/placeholder.png",
          description: "Brinquedo de corda resistente para cães de todos os tamanhos.",
        },
      ]

      for (const product of sampleProducts) {
        await this.createProduct(product)
      }

      console.log("Sample products seeded successfully")
    } catch (error) {
      console.error("Error seeding products:", error)
      throw new Error("Erro ao criar produtos de exemplo")
    }
  }

  /**
   * Get product statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getProductStats() {
    try {
      const products = await this.getAllProducts()

      const stats = {
        totalProducts: products.length,
        categories: [...new Set(products.map((p) => p.category))].length,
        types: [...new Set(products.map((p) => p.type))].length,
        averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + (p.price || 0), 0) / products.length : 0,
        productsByCategory: {},
        productsByType: {},
      }

      // Count products by category
      products.forEach((product) => {
        stats.productsByCategory[product.category] = (stats.productsByCategory[product.category] || 0) + 1
      })

      // Count products by type
      products.forEach((product) => {
        stats.productsByType[product.type] = (stats.productsByType[product.type] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error("Error getting product stats:", error)
      throw new Error("Erro ao obter estatísticas dos produtos")
    }
  }
}

// Cria instância global do ProductsService
const productsService = new ProductsService();

// Inicializa automaticamente com Firebase quando disponível
if (typeof firebase !== 'undefined' && firebase.firestore) {
  productsService.db = firebase.firestore();
} else {
  // Aguarda Firebase estar disponível
  const checkFirebase = () => {
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      productsService.db = firebase.firestore();
      console.log('ProductsService initialized with Firebase');
    } else {
      setTimeout(checkFirebase, 100);
    }
  };
  checkFirebase();
}

// Disponibiliza globalmente
window.ProductsService = productsService;

// Para compatibilidade, também disponibiliza a classe
window.ProductsServiceClass = ProductsService;

console.log('ProductsService initialized and available globally');

// Para importar e usar corretamente em outro arquivo:
// import productsService from './services/products.js' // ajuste o caminho conforme necessário

// Para criar um produto:
// const novoProduto = {
//   name: "Nome do Produto",
//   category: "Cachorros",
//   type: "Alimentação",
//   price: 99.9,
//   description: "Descrição do produto",
//   image: "url-da-imagem"
// }

// productsService.createProduct(novoProduto)
//   .then((id) => {
//     console.log("Produto criado com ID:", id)
//   })
//   .catch((err) => {
//     console.error(err)
//   })

/**
 * Products Service for Pet Shop Baronesa
 * This service handles all CRUD operations for products in Firestore
 */

import firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

class ProductsService {
  constructor() {
    this.db = null
    this.auth = null
    this.collection = "products"
    this.initialized = false
  }

  /**
   * Initializes the service with Firebase instances
   * @param {firebase.firestore.Firestore} db - Firestore instance
   * @param {firebase.auth.Auth} auth - Auth instance
   */
  initialize(db, auth) {
    this.db = db
    this.auth = auth
    this.initialized = true
  }

  /**
   * Checks if the service is initialized
   * @private
   */
  _checkInitialized() {
    if (!this.initialized) {
      throw new Error("ProductsService not initialized. Call initialize() first.")
    }
  }

  /**
   * Validates product data
   * @param {Object} productData - Product data to validate
   * @private
   */
  _validateProductData(productData) {
    const requiredFields = ["name", "description", "price", "category", "type"]
    const missingFields = requiredFields.filter((field) => !productData[field])

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`)
    }

    if (typeof productData.price !== "number" || productData.price < 0) {
      throw new Error("Price must be a positive number")
    }

    return true
  }

  /**
   * Generates a URL-friendly slug from product name
   * @param {string} name - Product name
   * @returns {string} - URL slug
   * @private
   */
  _generateSlug(name) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // Remove accents
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .trim("-") // Remove leading/trailing hyphens
  }

  /**
   * Determines price range based on price value
   * @param {number} price - Product price
   * @returns {string} - Price range category
   * @private
   */
  _getPriceRange(price) {
    if (price <= 50) return "0-50"
    if (price <= 100) return "50-100"
    if (price <= 150) return "100-150"
    return "150+"
  }

  /**
   * Processes product data before saving
   * @param {Object} productData - Raw product data
   * @returns {Object} - Processed product data
   * @private
   */
  _processProductData(productData) {
    const processed = {
      ...productData,
      slug: this._generateSlug(productData.name),
      priceRange: this._getPriceRange(productData.price),
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }

    // Set default image if not provided
    if (!processed.image) {
      processed.image = "/assets/images/placeholder.png"
    }

    return processed
  }

  /**
   * Fetches all products from Firestore
   * @param {Object} options - Query options
   * @param {string} options.orderBy - Field to order by (default: 'createdAt')
   * @param {string} options.orderDirection - Order direction ('asc' or 'desc', default: 'desc')
   * @param {number} options.limit - Maximum number of products to fetch
   * @returns {Promise<Array>} - Array of products
   */
  async getAllProducts(options = {}) {
    this._checkInitialized()

    try {
      const { orderBy = "createdAt", orderDirection = "desc", limit } = options

      let query = this.db.collection(this.collection)

      // Apply ordering
      query = query.orderBy(orderBy, orderDirection)

      // Apply limit if specified
      if (limit) {
        query = query.limit(limit)
      }

      const snapshot = await query.get()

      if (snapshot.empty) {
        console.log("No products found")
        return []
      }

      const products = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        products.push({
          id: doc.id,
          ...data,
          // Convert Firestore timestamps to JavaScript dates
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        })
      })

      console.log(`Fetched ${products.length} products`)
      return products
    } catch (error) {
      console.error("Error fetching products:", error)
      throw new Error(`Failed to fetch products: ${error.message}`)
    }
  }

  /**
   * Fetches products with filtering options
   * @param {Object} filters - Filter options
   * @param {Array<string>} filters.categories - Categories to filter by
   * @param {Array<string>} filters.types - Types to filter by
   * @param {Array<string>} filters.priceRanges - Price ranges to filter by
   * @returns {Promise<Array>} - Array of filtered products
   */
  async getFilteredProducts(filters = {}) {
    this._checkInitialized()

    try {
      let query = this.db.collection(this.collection)

      // Apply category filter
      if (filters.categories && filters.categories.length > 0) {
        query = query.where("category", "in", filters.categories)
      }

      // Apply type filter
      if (filters.types && filters.types.length > 0) {
        query = query.where("type", "in", filters.types)
      }

      // Apply price range filter
      if (filters.priceRanges && filters.priceRanges.length > 0) {
        query = query.where("priceRange", "in", filters.priceRanges)
      }

      // Order by creation date
      query = query.orderBy("createdAt", "desc")

      const snapshot = await query.get()

      const products = []
      snapshot.forEach((doc) => {
        const data = doc.data()
        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        })
      })

      return products
    } catch (error) {
      console.error("Error fetching filtered products:", error)
      throw new Error(`Failed to fetch filtered products: ${error.message}`)
    }
  }

  /**
   * Fetches a single product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} - Product data or null if not found
   */
  async getProductById(productId) {
    this._checkInitialized()

    try {
      const doc = await this.db.collection(this.collection).doc(productId).get()

      if (!doc.exists) {
        console.log(`Product with ID ${productId} not found`)
        return null
      }

      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      throw new Error(`Failed to fetch product: ${error.message}`)
    }
  }

  /**
   * Fetches a product by slug
   * @param {string} slug - Product slug
   * @returns {Promise<Object|null>} - Product data or null if not found
   */
  async getProductBySlug(slug) {
    this._checkInitialized()

    try {
      const snapshot = await this.db.collection(this.collection).where("slug", "==", slug).limit(1).get()

      if (snapshot.empty) {
        console.log(`Product with slug ${slug} not found`)
        return null
      }

      const doc = snapshot.docs[0]
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      }
    } catch (error) {
      console.error("Error fetching product by slug:", error)
      throw new Error(`Failed to fetch product by slug: ${error.message}`)
    }
  }

  /**
   * Creates a new product
   * @param {Object} productData - Product data
   * @returns {Promise<string>} - Created product ID
   */
  async createProduct(productData) {
    this._checkInitialized()

    try {
      // Validate product data
      this._validateProductData(productData)

      // Process product data
      const processedData = this._processProductData(productData)

      // Check if slug already exists
      const existingProduct = await this.getProductBySlug(processedData.slug)
      if (existingProduct) {
        // Append timestamp to make slug unique
        processedData.slug = `${processedData.slug}-${Date.now()}`
      }

      // Add product to Firestore
      const docRef = await this.db.collection(this.collection).add(processedData)

      console.log("Product created with ID:", docRef.id)
      return docRef.id
    } catch (error) {
      console.error("Error creating product:", error)
      throw new Error(`Failed to create product: ${error.message}`)
    }
  }

  /**
   * Updates an existing product
   * @param {string} productId - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  async updateProduct(productId, updateData) {
    this._checkInitialized()

    try {
      // Check if product exists
      const existingProduct = await this.getProductById(productId)
      if (!existingProduct) {
        throw new Error(`Product with ID ${productId} not found`)
      }

      // Prepare update data
      const processedUpdate = {
        ...updateData,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      }

      // Update slug if name changed
      if (updateData.name && updateData.name !== existingProduct.name) {
        processedUpdate.slug = this._generateSlug(updateData.name)

        // Check if new slug already exists
        const existingSlugProduct = await this.getProductBySlug(processedUpdate.slug)
        if (existingSlugProduct && existingSlugProduct.id !== productId) {
          processedUpdate.slug = `${processedUpdate.slug}-${Date.now()}`
        }
      }

      // Update price range if price changed
      if (updateData.price !== undefined) {
        processedUpdate.priceRange = this._getPriceRange(updateData.price)
      }

      // Update product in Firestore
      await this.db.collection(this.collection).doc(productId).update(processedUpdate)

      console.log("Product updated successfully:", productId)
    } catch (error) {
      console.error("Error updating product:", error)
      throw new Error(`Failed to update product: ${error.message}`)
    }
  }

  /**
   * Deletes a product
   * @param {string} productId - Product ID
   * @returns {Promise<void>}
   */
  async deleteProduct(productId) {
    this._checkInitialized()

    try {
      // Check if product exists
      const existingProduct = await this.getProductById(productId)
      if (!existingProduct) {
        throw new Error(`Product with ID ${productId} not found`)
      }

      // Delete product from Firestore
      await this.db.collection(this.collection).doc(productId).delete()

      console.log("Product deleted successfully:", productId)
    } catch (error) {
      console.error("Error deleting product:", error)
      throw new Error(`Failed to delete product: ${error.message}`)
    }
  }

  /**
   * Searches products by text
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} - Array of matching products
   */
  async searchProducts(searchTerm) {
    this._checkInitialized()

    try {
      if (!searchTerm || searchTerm.trim().length === 0) {
        return []
      }

      const searchTermLower = searchTerm.toLowerCase()

      // Get all products (Firestore doesn't support full-text search natively)
      const allProducts = await this.getAllProducts()

      // Filter products based on search term
      const filteredProducts = allProducts.filter((product) => {
        return (
          product.name.toLowerCase().includes(searchTermLower) ||
          product.description.toLowerCase().includes(searchTermLower) ||
          product.category.toLowerCase().includes(searchTermLower) ||
          product.type.toLowerCase().includes(searchTermLower)
        )
      })

      return filteredProducts
    } catch (error) {
      console.error("Error searching products:", error)
      throw new Error(`Failed to search products: ${error.message}`)
    }
  }

  /**
   * Bulk creates products (useful for initial data seeding)
   * @param {Array<Object>} productsData - Array of product data
   * @returns {Promise<Array<string>>} - Array of created product IDs
   */
  async bulkCreateProducts(productsData) {
    this._checkInitialized()

    try {
      const batch = this.db.batch()
      const productIds = []

      for (const productData of productsData) {
        this._validateProductData(productData)
        const processedData = this._processProductData(productData)

        const docRef = this.db.collection(this.collection).doc()
        batch.set(docRef, processedData)
        productIds.push(docRef.id)
      }

      await batch.commit()
      console.log(`Bulk created ${productIds.length} products`)
      return productIds
    } catch (error) {
      console.error("Error bulk creating products:", error)
      throw new Error(`Failed to bulk create products: ${error.message}`)
    }
  }

  /**
   * Gets product statistics
   * @returns {Promise<Object>} - Product statistics
   */
  async getProductStats() {
    this._checkInitialized()

    try {
      const products = await this.getAllProducts()

      const stats = {
        total: products.length,
        byCategory: {},
        byType: {},
        byPriceRange: {},
        averagePrice: 0,
      }

      let totalPrice = 0

      products.forEach((product) => {
        // Count by category
        stats.byCategory[product.category] = (stats.byCategory[product.category] || 0) + 1

        // Count by type
        stats.byType[product.type] = (stats.byType[product.type] || 0) + 1

        // Count by price range
        stats.byPriceRange[product.priceRange] = (stats.byPriceRange[product.priceRange] || 0) + 1

        // Sum prices for average calculation
        totalPrice += product.price
      })

      // Calculate average price
      if (products.length > 0) {
        stats.averagePrice = totalPrice / products.length
      }

      return stats
    } catch (error) {
      console.error("Error getting product stats:", error)
      throw new Error(`Failed to get product stats: ${error.message}`)
    }
  }
}

// Create and export a singleton instance
const productsService = new ProductsService()

// Export for use in other modules
window.ProductsService = productsService

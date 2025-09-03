/**
 * Slides Service for Pet Shop Baronesa
 * Handles all slide-related database operations
 */

class SlidesService {
  constructor() {
    this.collection = "slides"
    this.db = window.db
  }

  /**
   * Permite inicializar com instâncias customizadas de db/auth
   */
  initialize(db, auth) {
    if (db) this.db = db
  }

  /**
   * Map Firestore slide document to frontend format
   * @param {firebase.firestore.DocumentSnapshot} doc
   * @returns {Object}
   */
  mapFirestoreSlide(doc) {
    const data = doc.data()
    return {
      id: doc.id,
      slideNumber: data.slideNumber,
      title: data.title,
      image: data.image,
      isActive: data.isActive || true,
      order: data.order || 0,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  }

  /**
   * Map frontend slide data to Firestore format
   * @param {Object} slideData
   * @returns {Object}
   */
  mapToFirestore(slideData) {
    return {
      slideNumber: slideData.slideNumber,
      title: slideData.title || "",
      image: slideData.image || "",
      isActive: slideData.isActive !== false,
      order: slideData.order || 0,
      updatedAt: new Date().toISOString()
    }
  }

  /**
   * Get all slides from database
   * @returns {Promise<Array>}
   */
  async getAllSlides() {
    try {
      const logger = window.Logger || console;
      logger.info ? logger.info('SlidesService', 'Carregando slides do banco de dados...') : console.log('📊 Carregando slides do banco de dados...');
      
      const querySnapshot = await this.db
        .collection(this.collection)
        .orderBy('order', 'asc')
        .get()

      const slides = []
      querySnapshot.forEach(doc => {
        slides.push(this.mapFirestoreSlide(doc))
      })

      logger.info ? logger.info('SlidesService', `${slides.length} slides carregados`) : console.log(`✅ ${slides.length} slides carregados`);
      return slides
    } catch (error) {
      const logger = window.Logger || console;
      logger.error ? logger.error('SlidesService', 'Erro ao carregar slides', error) : console.error('❌ Erro ao carregar slides:', error);
      throw new Error(`Erro ao carregar slides: ${error.message}`)
    }
  }

  /**
   * Get slide by ID
   * @param {string} slideId
   * @returns {Promise<Object|null>}
   */
  async getSlideById(slideId) {
    try {
      const doc = await this.db.collection(this.collection).doc(slideId).get()
      
      if (!doc.exists) {
        return null
      }

      return this.mapFirestoreSlide(doc)
    } catch (error) {
      const logger = window.Logger || console;
      logger.error ? logger.error('SlidesService', 'Erro ao buscar slide', error) : console.error('❌ Erro ao buscar slide:', error);
      throw new Error(`Erro ao buscar slide: ${error.message}`)
    }
  }

  /**
   * Create new slide
   * @param {Object} slideData
   * @returns {Promise<string>} - Document ID
   */
  async createSlide(slideData) {
    try {
      const logger = window.Logger || console;
      logger.debug ? logger.debug('SlidesService', 'Criando novo slide', slideData) : console.log('💾 Criando novo slide...', slideData);

      const firestoreData = {
        ...this.mapToFirestore(slideData),
        createdAt: new Date().toISOString()
      }

      const docRef = await this.db.collection(this.collection).add(firestoreData)
      
      logger.info ? logger.info('SlidesService', `Slide criado com ID: ${docRef.id}`) : console.log('✅ Slide criado com ID:', docRef.id);
      return docRef.id
    } catch (error) {
      const logger = window.Logger || console;
      logger.error ? logger.error('SlidesService', 'Erro ao criar slide', error) : console.error('❌ Erro ao criar slide:', error);
      throw new Error(`Erro ao criar slide: ${error.message}`)
    }
  }

  /**
   * Update existing slide
   * @param {string} slideId
   * @param {Object} slideData
   * @returns {Promise<void>}
   */
  async updateSlide(slideId, slideData) {
    try {
      const logger = window.Logger || console;
      logger.debug ? logger.debug('SlidesService', 'Atualizando slide', { slideId, slideData }) : console.log('💾 Atualizando slide:', slideId, slideData);

      const firestoreData = this.mapToFirestore(slideData)

      await this.db.collection(this.collection).doc(slideId).update(firestoreData)
      
      logger.info ? logger.info('SlidesService', 'Slide atualizado com sucesso') : console.log('✅ Slide atualizado com sucesso');
    } catch (error) {
      const logger = window.Logger || console;
      logger.error ? logger.error('SlidesService', 'Erro ao atualizar slide', error) : console.error('❌ Erro ao atualizar slide:', error);
      throw new Error(`Erro ao atualizar slide: ${error.message}`)
    }
  }

  /**
   * Delete slide
   * @param {string} slideId
   * @returns {Promise<void>}
   */
  async deleteSlide(slideId) {
    try {
      const logger = window.Logger || console;
      logger.debug ? logger.debug('SlidesService', `Excluindo slide: ${slideId}`) : console.log('🗑️ Excluindo slide:', slideId);

      await this.db.collection(this.collection).doc(slideId).delete()
      
      logger.info ? logger.info('SlidesService', 'Slide excluído com sucesso') : console.log('✅ Slide excluído com sucesso');
    } catch (error) {
      const logger = window.Logger || console;
      logger.error ? logger.error('SlidesService', 'Erro ao excluir slide', error) : console.error('❌ Erro ao excluir slide:', error);
      throw new Error(`Erro ao excluir slide: ${error.message}`)
    }
  }

  /**
   * Upsert slide (create or update)
   * @param {number} slideNumber
   * @param {Object} slideData
   * @returns {Promise<string>} - Document ID
   */
  async upsertSlide(slideNumber, slideData) {
    try {
      const logger = window.Logger || console;
      logger.debug ? logger.debug('SlidesService', `Upsert slide ${slideNumber}`) : console.log(`🔄 Upsert slide ${slideNumber}...`);

      // Primeiro, tentar encontrar slide existente pelo número
      const querySnapshot = await this.db
        .collection(this.collection)
        .where('slideNumber', '==', slideNumber)
        .get()

      if (!querySnapshot.empty) {
        // Slide existe, atualizar
        const doc = querySnapshot.docs[0]
        await this.updateSlide(doc.id, slideData)
        return doc.id
      } else {
        // Slide não existe, criar
        const slideDataWithNumber = {
          ...slideData,
          slideNumber: slideNumber,
          order: slideNumber
        }
        return await this.createSlide(slideDataWithNumber)
      }
    } catch (error) {
      const logger = window.Logger || console;
      logger.error ? logger.error('SlidesService', 'Erro no upsert do slide', error) : console.error('❌ Erro no upsert do slide:', error);
      throw new Error(`Erro ao salvar slide: ${error.message}`)
    }
  }

  /**
   * Initialize default slides in database
   * @returns {Promise<void>}
   */
  async initializeDefaultSlides() {
    try {
      const logger = window.Logger || console;
      logger.info ? logger.info('SlidesService', 'Inicializando slides padrão...') : console.log('🚀 Inicializando slides padrão...');

      const defaultSlides = [
        {
          slideNumber: 1,
          title: "Banho e Tosa Profissional",
          image: "../assets/images/slides/banhoeETosa.jpg",
          order: 1
        },
        {
          slideNumber: 2,
          title: "Desconto Especial para Pets",
          image: "../assets/images/slides/caoPoteDesconto.jpg",
          order: 2
        },
        {
          slideNumber: 3,
          title: "Casa Confortável para seu Gato",
          image: "../assets/images/slides/gatoCasinha.png",
          order: 3
        },
        {
          slideNumber: 4,
          title: "Golden com Banho Especial",
          image: "../assets/images/slides/goldenBanhoDesconto.jpg",
          order: 4
        }
      ]

      const promises = defaultSlides.map(slide => this.upsertSlide(slide.slideNumber, slide))
      await Promise.all(promises)

      logger.info ? logger.info('SlidesService', 'Slides padrão inicializados com sucesso') : console.log('✅ Slides padrão inicializados com sucesso');
    } catch (error) {
      const logger = window.Logger || console;
      logger.error ? logger.error('SlidesService', 'Erro ao inicializar slides padrão', error) : console.error('❌ Erro ao inicializar slides padrão:', error);
      throw new Error(`Erro ao inicializar slides: ${error.message}`)
    }
  }

  /**
   * Get slides formatted for carousel
   * @returns {Promise<Array>}
   */
  async getSlidesForCarousel() {
    try {
      const slides = await this.getAllSlides()
      return slides
        .filter(slide => slide.isActive)
        .sort((a, b) => a.order - b.order)
        .map(slide => ({
          id: slide.id,
          title: slide.title,
          image: slide.image,
          slideNumber: slide.slideNumber
        }))
    } catch (error) {
      const logger = window.Logger || console;
      logger.error ? logger.error('SlidesService', 'Erro ao buscar slides para carousel', error) : console.error('❌ Erro ao buscar slides para carousel:', error);
      return []
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SlidesService = SlidesService
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SlidesService
}

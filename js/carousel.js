/**
 * Carousel for Pet Shop Baronesa
 * Loads slides dynamically from database
 */

class Carousel {
  constructor() {
    this.carousel = null;
    this.slides = [];
    this.indicators = [];
    this.currentSlide = 0;
    this.interval = null;
    this.slidesService = null;
    this.isLoading = false;
  // Autoplay config
  this.autoPlay = true;
  this.autoPlayDelay = 5000; // milliseconds
  this.hoverPause = true;
  }

  /**
   * Initialize the carousel
   */
  async init() {

    
    this.carousel = document.getElementById("mainCarousel");
    if (!this.carousel) {
      console.error('❌ Elemento carousel não encontrado');
      return;
    }

    // Wait for Firebase to be initialized
    await this.waitForFirebase();
    
    // Initialize slides service
    if (window.SlidesService) {
      this.slidesService = new SlidesService();
    }

    // Load slides from database
    await this.loadSlides();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Ensure autoplay is running after listeners are attached
    if (this.autoPlay && this.slides.length > 0) {
      this.startAutoSlide();
    }
    

  }

  /**
   * Wait for Firebase to be available
   */
  async waitForFirebase() {
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds
    
    while (!window.db && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    
    if (!window.db) {
      console.warn('⚠️ Firebase não disponível, usando dados de fallback');
    }
  }

  /**
   * Load slides from database
   */
  async loadSlides() {
    try {
      this.isLoading = true;
      this.showLoading(true);


      let slidesData = [];

      // Try to load from database first
      if (this.slidesService && window.db) {
        try {
          slidesData = await this.slidesService.getSlidesForCarousel();

        } catch (error) {
          console.warn('⚠️ Erro ao carregar do banco, usando fallback:', error.message);
        }
      }

      // Fallback to default slides if database fails or no slides found
      if (slidesData.length === 0) {

        slidesData = this.getDefaultSlides();
      }

      // Render slides
      this.renderSlides(slidesData);
      
    } catch (error) {
      console.error('❌ Erro ao carregar slides:', error);
      // Use default slides as final fallback
      this.renderSlides(this.getDefaultSlides());
    } finally {
      this.isLoading = false;
      this.showLoading(false);
    }
  }

  /**
   * Show/hide loading state
   */
  showLoading(show) {
    const loadingElement = document.getElementById('carouselLoading');
    if (loadingElement) {
      loadingElement.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Get default slides for fallback
   */
  getDefaultSlides() {
    return [
      {
        id: 'default-1',
        title: 'Banho e Tosa Profissional',
        image: 'assets/images/slides/banhoeETosa.jpg',
        slideNumber: 1
      },
      {
        id: 'default-2', 
        title: 'Desconto Especial para Pets',
        image: 'assets/images/slides/caoPoteDesconto.jpg',
        slideNumber: 2
      },
      {
        id: 'default-3',
        title: 'Casa Confortável para seu Gato', 
        image: 'assets/images/slides/gatoCasinha.png',
        slideNumber: 3
      }
    ];
  }

  /**
   * Render slides dynamically
   */
  renderSlides(slidesData) {
    if (!this.carousel) return;
    


    // Clear existing content
    this.carousel.innerHTML = '';
    const indicatorsContainer = document.getElementById('carouselIndicators');
    if (indicatorsContainer) {
      indicatorsContainer.innerHTML = '';
    }

    // Create slides HTML
    slidesData.forEach((slide, index) => {
      // Create slide element
      const slideElement = document.createElement('div');
      slideElement.className = `carousel-slide ${index === 0 ? 'active' : ''}`;
      
      const imageUrl = window.buildStorageUrl ? window.buildStorageUrl(slide.image) : slide.image;

      slideElement.innerHTML = `
        <img src="${imageUrl}" alt="${slide.title}" loading="lazy">
        <div class="carousel-caption">
          <div class="caption-box">
            <h2>${slide.title}</h2>
          </div>
        </div>
      `;
      
      this.carousel.appendChild(slideElement);

      // Create indicator
      if (indicatorsContainer) {
        const indicator = document.createElement('button');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.setAttribute('data-slide', index.toString());
        indicatorsContainer.appendChild(indicator);
      }
    });

    // Update internal references
    this.slides = this.carousel.querySelectorAll('.carousel-slide');
    this.indicators = indicatorsContainer ? indicatorsContainer.querySelectorAll('.indicator') : [];
    
    // Start carousel if we have slides
    if (this.autoPlay && this.slides.length > 0) {
      this.startAutoSlide();
    }
  }

  /**
   * Show specific slide
   */
  showSlide(index) {
    if (!this.slides.length) return;

    // Remove active class from all slides and indicators
    this.slides.forEach(slide => slide.classList.remove('active'));
    this.indicators.forEach(indicator => indicator.classList.remove('active'));

    // Add active class to current slide and indicator
    if (this.slides[index]) {
      this.slides[index].classList.add('active');
    }
    if (this.indicators[index]) {
      this.indicators[index].classList.add('active');
    }

    this.currentSlide = index;
  }

  /**
   * Move to next slide
   */
  nextSlide() {
    if (!this.slides.length) return;
    
    let next = this.currentSlide + 1;
    if (next >= this.slides.length) {
      next = 0;
    }
    this.showSlide(next);
  }

  /**
   * Move to previous slide
   */
  prevSlide() {
    if (!this.slides.length) return;
    
    let prev = this.currentSlide - 1;
    if (prev < 0) {
      prev = this.slides.length - 1;
    }
    this.showSlide(prev);
  }

  /**
   * Start auto-sliding
   */
  startAutoSlide() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.interval = setInterval(() => this.nextSlide(), this.autoPlayDelay);
  }

  /**
   * Stop automatic slideshow
   */
  stopAutoSlide() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Navigation buttons
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        this.prevSlide();
        this.stopAutoSlide();
        this.startAutoSlide();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextSlide();
        this.stopAutoSlide();
        this.startAutoSlide();
      });
    }

    // Indicators (will be set up after slides are rendered)
    this.setupIndicatorListeners();

    // Pause on hover
    if (this.hoverPause && this.carousel) {
      this.carousel.addEventListener('mouseenter', () => this.stopAutoSlide());
      this.carousel.addEventListener('mouseleave', () => this.startAutoSlide());
    }

    // Pause when tab not visible to save resources, resume when visible
    document.addEventListener('visibilitychange', () => {
      if (!this.autoPlay) return;
      if (document.hidden) {
        this.stopAutoSlide();
      } else if (this.slides.length > 0) {
        this.startAutoSlide();
      }
    });
  }

  /**
   * Setup indicator event listeners
   */
  setupIndicatorListeners() {
    this.indicators.forEach((indicator, index) => {
      indicator.addEventListener('click', () => {
        this.showSlide(index);
        this.stopAutoSlide();
        this.startAutoSlide();
      });
    });
  }

  /**
   * Refresh slides from database
   */
  async refresh() {

    this.stopAutoSlide();
    await this.loadSlides();
    this.setupIndicatorListeners();
  }
}

// Initialize carousel when DOM is loaded
let carousel = null;

document.addEventListener('DOMContentLoaded', async () => {
  // Wait a bit for other scripts to load
  setTimeout(async () => {
    carousel = new Carousel();
    await carousel.init();
    
    // Make carousel globally available for refresh
    window.carousel = carousel;
  }, 1000);
});

// Global function to refresh carousel from external scripts
window.refreshCarousel = async function() {
  if (window.carousel) {

    await window.carousel.refresh();
    return 'Carousel atualizado com sucesso!';
  } else {
    console.warn('⚠️ Carousel não está inicializado');
    return 'Carousel não disponível';
  }
};

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.Carousel = Carousel;
}

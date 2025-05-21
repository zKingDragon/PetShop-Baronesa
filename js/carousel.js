// Função para inicializar o carrossel
function initCarousel() {
  const carousel = document.getElementById("mainCarousel")

  if (!carousel) return

  const slides = carousel.querySelectorAll(".carousel-slide")
  const indicators = document.getElementById("carouselIndicators").querySelectorAll(".indicator")
  const prevBtn = document.getElementById("prevBtn")
  const nextBtn = document.getElementById("nextBtn")

  let currentSlide = 0
  let interval

  // Função para mostrar um slide específico
  function showSlide(index) {
    // Remover classe active de todos os slides e indicadores
    slides.forEach((slide) => slide.classList.remove("active"))
    indicators.forEach((indicator) => indicator.classList.remove("active"))

    // Adicionar classe active ao slide e indicador atual
    slides[index].classList.add("active")
    indicators[index].classList.add("active")

    // Atualizar o índice do slide atual
    currentSlide = index
  }

  // Função para avançar para o próximo slide
  function nextSlide() {
    let next = currentSlide + 1
    if (next >= slides.length) {
      next = 0
    }
    showSlide(next)
  }

  // Função para voltar para o slide anterior
  function prevSlide() {
    let prev = currentSlide - 1
    if (prev < 0) {
      prev = slides.length - 1
    }
    showSlide(prev)
  }

  // Iniciar o carrossel automático
  function startAutoSlide() {
    interval = setInterval(nextSlide, 5000)
  }

  // Parar o carrossel automático
  function stopAutoSlide() {
    clearInterval(interval)
  }

  // Adicionar event listeners aos botões
  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide()
      stopAutoSlide()
      startAutoSlide()
    })
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide()
      stopAutoSlide()
      startAutoSlide()
    })
  }

  // Adicionar event listeners aos indicadores
  indicators.forEach((indicator, index) => {
    indicator.addEventListener("click", () => {
      showSlide(index)
      stopAutoSlide()
      startAutoSlide()
    })
  })

  // Iniciar o carrossel
  startAutoSlide()

  // Pausar o carrossel quando o mouse estiver sobre ele
  carousel.addEventListener("mouseenter", stopAutoSlide)
  carousel.addEventListener("mouseleave", startAutoSlide)
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initCarousel)

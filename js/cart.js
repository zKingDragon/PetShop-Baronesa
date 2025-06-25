/**
 * Sistema de carrinho de compras para o Pet Shop Baronesa
 * Este módulo gerencia adição, remoção e atualização de itens no carrinho
 */

// Constantes
const CART_KEY = "petshop_baronesa_cart"

// Elementos DOM
const cartCountElements = document.querySelectorAll("#cartCount, #cartCountMobile")
const cartItemsList = document.getElementById("cartItemsList")
const cartSubtotal = document.getElementById("cartSubtotal")
const cartTotal = document.getElementById("cartTotal")
const cartEmpty = document.getElementById("cartEmpty")
const cartContent = document.getElementById("cartContent")
const clearCartButton = document.getElementById("clearCartButton")
const checkoutButton = document.getElementById("checkoutButton")
const addToCartButtons = document.querySelectorAll(".add-to-cart-btn")

/**
 * Obtém os itens do carrinho do localStorage
 * @returns {Array} - Array de itens do carrinho
 */
function getCartItems() {
  const cartData = localStorage.getItem(CART_KEY)
  return cartData ? JSON.parse(cartData) : []
}

/**
 * Salva os itens do carrinho no localStorage
 * @param {Array} items - Array de itens do carrinho
 */
function saveCartItems(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items))
}

/**
 * Adiciona um item ao carrinho
 * @param {Object} product - Produto a ser adicionado
 */
function addToCart(product) {
  const cartItems = getCartItems()

  // Verifica se o produto já está no carrinho
  const existingItemIndex = cartItems.findIndex((item) => item.id === product.id)

  if (existingItemIndex >= 0) {
    // Incrementa a quantidade se o produto já estiver no carrinho
    cartItems[existingItemIndex].quantity += 1
  } else {
    // Adiciona o novo produto ao carrinho
    cartItems.push({
      ...product,
      quantity: 1,
    })
  }

  // Salva o carrinho atualizado
  saveCartItems(cartItems)

  // Atualiza a UI
  updateCartUI()

  // Mostra feedback ao usuário
  showToast("Produto adicionado ao carrinho!")
}

/**
 * Remove um item do carrinho
 * @param {string} productId - ID do produto a ser removido
 */
function removeFromCart(productId) {
  let cartItems = getCartItems()

  // Filtra o item a ser removido
  cartItems = cartItems.filter((item) => item.id !== productId)

  // Salva o carrinho atualizado
  saveCartItems(cartItems)

  // Atualiza a UI
  updateCartUI()
}

/**
 * Atualiza a quantidade de um item no carrinho
 * @param {string} productId - ID do produto
 * @param {number} quantity - Nova quantidade
 */
function updateCartItemQuantity(productId, quantity) {
  const cartItems = getCartItems()

  // Encontra o item no carrinho
  const itemIndex = cartItems.findIndex((item) => item.id === productId)

  if (itemIndex >= 0) {
    // Atualiza a quantidade ou remove se for zero
    if (quantity > 0) {
      cartItems[itemIndex].quantity = quantity
    } else {
      cartItems.splice(itemIndex, 1)
    }

    // Salva o carrinho atualizado
    saveCartItems(cartItems)

    // Atualiza a UI
    updateCartUI()
  }
}

/**
 * Limpa todos os itens do carrinho
 */
function clearCart() {
  // Limpa o localStorage
  localStorage.removeItem(CART_KEY)

  // Atualiza a UI
  updateCartUI()
}

/**
 * Calcula o total do carrinho
 * @returns {number} - Valor total do carrinho
 */
function calculateCartTotal() {
  const cartItems = getCartItems()

  return cartItems.reduce((total, item) => {
    return total + Number.parseFloat(item.price) * item.quantity
  }, 0)
}

/**
 * Atualiza a contagem de itens no carrinho na UI
 */
function updateCartCount() {
  const cartItems = getCartItems()
  const itemCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  // Atualiza todos os elementos de contagem do carrinho
  cartCountElements.forEach((element) => {
    if (element) element.textContent = itemCount
  })
}

/**
 * Renderiza os itens do carrinho na página de carrinho
 */
function renderCartItems() {
  if (!cartItemsList) return

  const cartItems = getCartItems()

  // Limpa a lista atual
  cartItemsList.innerHTML = ""

  // Adiciona cada item à lista
  cartItems.forEach((item) => {
    const cartItemElement = document.createElement("div")
    cartItemElement.className = "cart-item"
    cartItemElement.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.name}">
      </div>
      <div class="cart-item-details">
        <h3 class="cart-item-name">${item.name}</h3>
        <div class="cart-item-price">R$ ${Number.parseFloat(item.price).toFixed(2)}</div>
        <div class="cart-item-actions">
          <div class="quantity-control">
            <button class="quantity-btn decrease-btn" data-id="${item.id}">-</button>
            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
            <button class="quantity-btn increase-btn" data-id="${item.id}">+</button>
          </div>
          <button class="remove-item" data-id="${item.id}">
            <i class="fas fa-trash"></i> Remover
          </button>
        </div>
      </div>
    `

    cartItemsList.appendChild(cartItemElement)
  })

  // Adiciona event listeners aos botões
  addCartItemEventListeners()
}

/**
 * Adiciona event listeners aos elementos do carrinho
 */
function addCartItemEventListeners() {
  // Botões de diminuir quantidade
  const decreaseButtons = document.querySelectorAll(".decrease-btn")
  decreaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id")
      const currentItem = getCartItems().find((item) => item.id === productId)

      if (currentItem && currentItem.quantity > 1) {
        updateCartItemQuantity(productId, currentItem.quantity - 1)
      } else {
        removeFromCart(productId)
      }
    })
  })

  // Botões de aumentar quantidade
  const increaseButtons = document.querySelectorAll(".increase-btn")
  increaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id")
      const currentItem = getCartItems().find((item) => item.id === productId)

      if (currentItem) {
        updateCartItemQuantity(productId, currentItem.quantity + 1)
      }
    })
  })

  // Inputs de quantidade
  const quantityInputs = document.querySelectorAll(".quantity-input")
  quantityInputs.forEach((input) => {
    input.addEventListener("change", () => {
      const productId = input.getAttribute("data-id")
      const newQuantity = Number.parseInt(input.value, 10)

      if (newQuantity > 0) {
        updateCartItemQuantity(productId, newQuantity)
      } else {
        input.value = 1
        updateCartItemQuantity(productId, 1)
      }
    })
  })

  // Botões de remover
  const removeButtons = document.querySelectorAll(".remove-item")
  removeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id")
      removeFromCart(productId)
    })
  })
}

/**
 * Atualiza o resumo do carrinho (subtotal, total)
 */
function updateCartSummary() {
  if (!cartSubtotal || !cartTotal) return

  const total = calculateCartTotal()

  cartSubtotal.textContent = `R$ ${total.toFixed(2)}`
  cartTotal.textContent = `R$ ${total.toFixed(2)}`
}

/**
 * Atualiza a visibilidade do carrinho vazio ou com itens
 */
function updateCartVisibility() {
  if (!cartEmpty || !cartContent) return

  const cartItems = getCartItems()

  if (cartItems.length === 0) {
    cartEmpty.style.display = "block"
    cartContent.style.display = "none"
  } else {
    cartEmpty.style.display = "none"
    cartContent.style.display = "grid"
  }
}

/**
 * Atualiza toda a UI do carrinho
 */
function updateCartUI() {
  updateCartCount()
  renderCartItems()
  updateCartSummary()
  updateCartVisibility()
}

/**
 * Mostra uma mensagem de toast
 * @param {string} message - Mensagem a ser exibida
 */
function showToast(message) {
  // Verifica se já existe um toast
  let toast = document.querySelector(".toast")

  if (!toast) {
    // Cria um novo elemento toast
    toast = document.createElement("div")
    toast.className = "toast"
    document.body.appendChild(toast)

    // Adiciona estilos ao toast
    toast.style.position = "fixed"
    toast.style.bottom = "20px"
    toast.style.right = "20px"
    toast.style.backgroundColor = "var(--emerald-green)"
    toast.style.color = "white"
    toast.style.padding = "12px 20px"
    toast.style.borderRadius = "4px"
    toast.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)"
    toast.style.zIndex = "1000"
    toast.style.transition = "opacity 0.3s ease"
  }

  // Define a mensagem e mostra o toast
  toast.textContent = message
  toast.style.opacity = "1"

  // Esconde o toast após 3 segundos
  setTimeout(() => {
    toast.style.opacity = "0"
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, 3000)
}

/**
 * Inicializa o sistema de carrinho
 */
function initCart() {
  // Atualiza a UI inicial
  updateCartUI()

  // Configura o botão de limpar carrinho
  if (clearCartButton) {
    clearCartButton.addEventListener("click", () => {
      if (confirm("Tem certeza que deseja limpar o carrinho?")) {
        clearCart()
      }
    })
  }

  // Configura o botão de finalizar compra
  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      const cartItems = getCartItems()
      const total = calculateCartTotal()

      // Constrói a mensagem para o WhatsApp
      let message = "Olá! Gostaria de fazer um pedido:\n\n"

      cartItems.forEach((item) => {
        message += `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}\n`
      })

      message += `\nTotal: R$ ${total.toFixed(2)}`

      // Codifica a mensagem para URL
      const encodedMessage = encodeURIComponent(message)

      // Abre o WhatsApp com a mensagem
      window.open(`https://wa.me/5513996825624?text=${encodedMessage}`, "_blank")
    })
  }

  // Configura os botões de adicionar ao carrinho
  addToCartButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.getAttribute("data-id")
      const productName = button.getAttribute("data-name")
      const productPrice = button.getAttribute("data-price")
      const productImage = button.getAttribute("data-image")

      addToCart({
        id: productId,
        name: productName,
        price: productPrice,
        image: productImage,
      })
    })
  })
}

// Inicializa o carrinho quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", initCart)

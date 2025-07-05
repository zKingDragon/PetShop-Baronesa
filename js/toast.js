/**
 * Sistema de Toast Universal para Pet Shop Baronesa
 * Funciona bem em desktop e mobile
 */

class ToastManager {
  constructor() {
    this.container = null
    this.activeToasts = new Set()
    this.init()
  }

  init() {
    // Criar container se não existir
    if (!this.container) {
      this.container = document.createElement('div')
      this.container.className = 'toast-wrapper'
      this.container.id = 'toastWrapper'
      document.body.appendChild(this.container)
    }
  }

  /**
   * Mostra um toast
   * @param {string} message - Mensagem a exibir
   * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
   * @param {number} duration - Duração em ms (padrão: 3000)
   */
  show(message, type = 'success', duration = 3000) {
    const toast = this.createToast(message, type)
    
    // Adiciona ao container
    this.container.appendChild(toast)
    this.activeToasts.add(toast)

    // Força reflow para animação
    toast.offsetHeight

    // Mostra o toast
    requestAnimationFrame(() => {
      toast.classList.add('show')
    })

    // Remove após duração especificada
    setTimeout(() => {
      this.hide(toast)
    }, duration)

    return toast
  }

  createToast(message, type) {
    const toast = document.createElement('div')
    toast.className = `toast-notification toast-${type}`

    const icon = this.getIcon(type)
    
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${icon} toast-icon"></i>
        <span class="toast-message">${message}</span>
      </div>
    `

    return toast
  }

  getIcon(type) {
    const icons = {
      success: 'check-circle',
      error: 'exclamation-circle',
      info: 'info-circle',
      warning: 'exclamation-triangle'
    }
    return icons[type] || 'info-circle'
  }

  hide(toast) {
    if (!this.activeToasts.has(toast)) return

    toast.classList.remove('show')
    this.activeToasts.delete(toast)

    // Remove do DOM após animação
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }

  hideAll() {
    this.activeToasts.forEach(toast => {
      this.hide(toast)
    })
  }
}

// Instância global
const toastManager = new ToastManager()

// Função global para compatibilidade
window.showToast = function(message, type = 'success', duration = 3000) {
  return toastManager.show(message, type, duration)
}

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToastManager, toastManager }
}

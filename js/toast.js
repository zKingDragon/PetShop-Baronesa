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
   * @param {Array} actions - Array de ações com {label, callback, className}
   */
  show(message, type = 'success', duration = 3000, actions = []) {
    // Remove qualquer toast existente para evitar acumulação
    this.hideAll()
    
    const toast = this.createToast(message, type, actions)
    
    // Adiciona ao container
    this.container.appendChild(toast)
    this.activeToasts.add(toast)

    // Adiciona event listeners para as ações APÓS inserir no DOM
    if (actions.length > 0) {
      setTimeout(() => {
        const actionButtons = toast.querySelectorAll('.toast-action-btn')
        actionButtons.forEach((button, index) => {
          button.addEventListener('click', (e) => {
            e.stopPropagation()
            if (actions[index] && typeof actions[index].callback === 'function') {
              actions[index].callback()
            }
            // Remove o toast após executar a ação
            this.hide(toast)
          })
        })
      }, 10)
    }

    // Força reflow para animação
    toast.offsetHeight

    // Mostra o toast
    requestAnimationFrame(() => {
      toast.classList.add('show')
    })

    // Remove após duração especificada se não tiver ações (para não interferir com interação)
    if (actions.length === 0) {
      setTimeout(() => {
        this.hide(toast)
      }, duration)
    } else {
      // Com ações, duração mais longa para permitir interação
      setTimeout(() => {
        this.hide(toast)
      }, duration * 2)
    }

    return toast
  }

  createToast(message, type, actions = []) {
    const toast = document.createElement('div')
    toast.className = `toast-notification toast-${type}`

    const icon = this.getIcon(type)
    
    let actionsHtml = ''
    if (actions.length > 0) {
      actionsHtml = `
        <div class="toast-actions">
          ${actions.map((action, index) => `
            <button class="toast-action-btn ${action.className || ''}" data-action-index="${index}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      `
    }
    
    toast.innerHTML = `
      <div class="toast-content">
        <i class="fas fa-${icon} toast-icon"></i>
        <span class="toast-message">${message}</span>
      </div>
      ${actionsHtml}
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

// Disponibiliza globalmente
window.toastManager = toastManager

// Função global para compatibilidade
window.showToast = function(message, type = 'success', duration = 3000, actions = []) {
  return toastManager.show(message, type, duration, actions)
}

// Exportar para uso modular
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ToastManager, toastManager }
}

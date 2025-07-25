// Função para inicializar os formulários
document.addEventListener("DOMContentLoaded", () => {
  initAppointmentForm()
  initCadastroForm()
  initPasswordToggles()
})

// Função para inicializar o formulário de agendamento
// ...existing code...

/**
 * Inicializa formulário de agendamento de banho e tosa
 */
function initAppointmentForm() {
    const form = document.getElementById('appointmentForm');
    if (!form) return;

    console.log('✅ Formulário de agendamento encontrado');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        // Coletar dados do formulário
        const formData = new FormData(form);
        const data = {
            petName: formData.get('petName'),
            petType: formData.get('petType'),
            date: formData.get('date'),
            ownerName: formData.get('ownerName'),
            notes: formData.get('notes') || ''
        };

        // Validar dados
        if (!data.petName || !data.petType || !data.date || !data.ownerName) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Validar data (não pode ser no passado)
        const selectedDate = new Date(data.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            alert('Por favor, selecione uma data futura.');
            return;
        }

        // Criar mensagem para WhatsApp
        const message = createWhatsAppMessage(data);

        // Abrir WhatsApp
        openWhatsApp(message);
    });

    // Definir data mínima como hoje
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
    }
}

/**
 * Cria mensagem formatada para WhatsApp
 */
function createWhatsAppMessage(data) {
    const formattedDate = new Date(data.date).toLocaleDateString('pt-BR');

    let message = `🐾 *AGENDAMENTO BANHO & TOSA*\n\n`;
    message += `👤 *Dono: * ${data.ownerName}\n`;
    message += `🐕 *Pet: * ${data.petName}\n`;
    message += `🐾 *Tipo de pet: * ${data.petType}\n`;
    message += `📅 *Quais horários teriam para o dia: * ${formattedDate}\n`;

    if (data.notes) {
        message += `📝 *Observações: * ${data.notes}\n`;
    }

    message += `\nGostaria de confirmar o agendamento! 😊`;

    return encodeURIComponent(message);
}

/**
 * Abre WhatsApp com mensagem pré-formatada
 */
function openWhatsApp(message) {
    // Número do WhatsApp do Pet Shop (substitua pelo número real)
    const phoneNumber = '5513996825624'; // Formato: código do país + DDD + número

    // URL para WhatsApp Web
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;

    // Abrir em nova aba
    window.open(whatsappURL, '_blank');
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...

    // Inicializar formulário de agendamento se estiver na página
    initAppointmentForm();
});


// Função para inicializar o formulário de cadastro
function initCadastroForm() {
  const cadastroForm = document.getElementById("cadastroForm")

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", async (e) => {
      e.preventDefault()

      const name = document.getElementById("nome").value
      const email = document.getElementById("email").value
      const phone = document.getElementById("telefone").value
      const password = document.getElementById("senha").value
      const confirmPassword = document.getElementById("confirmarSenha").value

      if (password !== confirmPassword) {
        alert("As senhas não coincidem. Por favor, verifique.")
        return
      }

      try {
        // Garantir que o Firebase está inicializado
        if (typeof initializeFirebase === 'function') {
          await initializeFirebase()
        }

        // Cria o usuário no Firebase Auth
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password)
        const user = userCredential.user

        // Atualiza o perfil do usuário com o nome
        await user.updateProfile({
          displayName: name
        })

        // Salva dados adicionais na coleção "usuarios" (com "U" maiúsculo)
        await firebase.firestore().collection("usuarios").doc(user.uid).set({
          name: name,
          email: email,
          phone: phone,
          type: "user", // Tipo padrão para novos usuários
          Type: "user", // Garantir compatibilidade
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        })

        console.log('Usuário cadastrado com sucesso:', user.uid)
        showSuccessMessage()
      } catch (error) {
        console.error('Erro ao cadastrar:', error)
        let errorMessage = "Erro ao cadastrar: "

        // Mensagens de erro mais específicas
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage += "Este email já está em uso."
            break
          case 'auth/weak-password':
            errorMessage += "A senha deve ter pelo menos 6 caracteres."
            break
          case 'auth/invalid-email':
            errorMessage += "Email inválido."
            break
          default:
            errorMessage += error.message || "Tente novamente."
        }

        alert(errorMessage)
      }
    })
  }
}

// Função para mostrar mensagem de sucesso após o cadastro
function showSuccessMessage() {
  // Obter o container principal
  const container = document.querySelector(".cadastro-grid")

  if (container) {
    // Criar o HTML da mensagem de sucesso
    const successHTML = `
            <div class="success-message">
                <div class="success-icon">
                    <i class="fas fa-check"></i>
                </div>
                <h2>Cadastro Realizado!</h2>
                <p>Seu cadastro foi realizado com sucesso. Agora você pode aproveitar todos os benefícios da Pet Shop Baronesa!</p>
                <a href="index.html" class="btn-primary">Voltar para a página inicial</a>
            </div>
        `

    // Substituir o conteúdo do container
    container.innerHTML = successHTML

    // Adicionar estilos para a mensagem de sucesso
    const style = document.createElement("style")
    style.textContent = `
            .success-message {
                background-color: white;
                border-radius: 0.5rem;
                padding: 2rem;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                text-align: center;
                max-width: 32rem;
                margin: 0 auto;
            }

            .success-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 4rem;
                height: 4rem;
                background-color: #34d399;
                border-radius: 9999px;
                margin-bottom: 1rem;
            }

            .success-icon i {
                color: white;
                font-size: 2rem;
            }

            .success-message h2 {
                font-weight: 700;
                color: #005f73;
                margin-bottom: 0.5rem;
                font-size: 1.5rem;
            }

            .success-message p {
                color: #6b7280;
                margin-bottom: 1.5rem;
            }

            .success-message .btn-primary {
                display: inline-block;
            }
        `

    document.head.appendChild(style)
  }
}

// Função para inicializar os toggles de senha
function initPasswordToggles() {
  const toggleButtons = document.querySelectorAll(".toggle-password")

  toggleButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target")
      const passwordInput = document.getElementById(targetId)

      // Alternar tipo de input entre password e text
      if (passwordInput.type === "senha") {
        passwordInput.type = "text"
        this.innerHTML = '<i class="fas fa-eye-slash"></i>'
      } else {
        passwordInput.type = "senha"
        this.innerHTML = '<i class="fas fa-eye"></i>'
      }
    })
  })
}

// Constante para armazenar dados de endereço
const ADDRESS_KEY = "petshop_baronesa_address"

/**
 * Obtém os dados de endereço do localStorage
 * @returns {Object|null} - Dados do endereço ou null se não existir
 */
function getAddressData() {
  const addressData = localStorage.getItem(ADDRESS_KEY)
  return addressData ? JSON.parse(addressData) : null
}

/**
 * Salva os dados de endereço no localStorage
 * @param {Object} addressData - Dados do endereço
 */
function saveAddressData(addressData) {
  localStorage.setItem(ADDRESS_KEY, JSON.stringify(addressData))
}

/**
 * Limpa os dados de endereço do localStorage
 */
function clearAddressData() {
  localStorage.removeItem(ADDRESS_KEY)
}

/**
 * Verifica se o endereço está completo
 * @returns {boolean} - True se o endereço estiver completo
 */
function isAddressComplete() {
  const address = getAddressData()
  return address &&
         address.name &&
         address.street &&
         address.number &&
         address.neighborhood
}

/**
 * Mostra o modal de endereço
 */
function showAddressModal() {
  // Remove modal existente se houver
  const existingModal = document.getElementById("addressModal")
  if (existingModal) {
    existingModal.remove()
  }

  // Obter dados existentes
  const existingAddress = getAddressData() || {}

  // Criar o modal
  const modalHTML = `
    <div id="addressModal" class="address-modal">
      <div class="address-modal-content">
        <div class="address-modal-header">
          <h2><i class="fas fa-map-marker-alt"></i> Informações de Entrega</h2>
          <button class="address-modal-close" onclick="closeAddressModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <form id="addressForm" class="address-form">
          <div class="form-group">
            <label for="customerName">Nome Completo *</label>
            <input type="text" id="customerName" name="name" required
                   value="${existingAddress.name || ''}"
                   placeholder="Digite seu nome completo">
          </div>

          <div class="form-group">
            <label for="streetName">Nome da Rua *</label>
            <input type="text" id="streetName" name="street" required
                   value="${existingAddress.street || ''}"
                   placeholder="Ex: Rua das Flores">
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="streetNumber">Número *</label>
              <input type="text" id="streetNumber" name="number" required
                     value="${existingAddress.number || ''}"
                     placeholder="Ex: 123">
            </div>

            <div class="form-group">
              <label for="complement">Complemento</label>
              <input type="text" id="complement" name="complement"
                     value="${existingAddress.complement || ''}"
                     placeholder="Ex: Apto 45">
            </div>
          </div>

          <div class="form-group">
            <label for="neighborhood">Bairro *</label>
            <input type="text" id="neighborhood" name="neighborhood" required
                   value="${existingAddress.neighborhood || ''}"
                   placeholder="Ex: Centro">
          </div>

          <div class="form-group">
            <label for="reference">Ponto de Referência</label>
            <textarea id="reference" name="reference" rows="2"
                      placeholder="Ex: Próximo ao supermercado">${existingAddress.reference || ''}</textarea>
          </div>

          <div class="address-form-actions">
            <button type="button" class="btn-secondary" onclick="closeAddressModal()">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button type="submit" class="btn-primary">
              <i class="fas fa-save"></i> Salvar Endereço
            </button>
          </div>
        </form>
      </div>
    </div>
  `

  // Adicionar ao body
  document.body.insertAdjacentHTML('beforeend', modalHTML)

  // Adicionar estilos
  addAddressModalStyles()

  // Configurar eventos
  setupAddressFormEvents()
}

/**
 * Fecha o modal de endereço
 */
function closeAddressModal() {
  const modal = document.getElementById("addressModal")
  if (modal) {
    modal.remove()
  }
}

/**
 * Configura os eventos do formulário de endereço
 */
function setupAddressFormEvents() {
  const addressForm = document.getElementById("addressForm")

  if (addressForm) {
    addressForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Coletar dados do formulário
      const formData = new FormData(addressForm)
      const addressData = {
        name: formData.get('name').trim(),
        street: formData.get('street').trim(),
        number: formData.get('number').trim(),
        complement: formData.get('complement').trim(),
        neighborhood: formData.get('neighborhood').trim(),
        reference: formData.get('reference').trim()
      }

      // Validar campos obrigatórios
      if (!addressData.name || !addressData.street || !addressData.number || !addressData.neighborhood) {
        alert('Por favor, preencha todos os campos obrigatórios.')
        return
      }

      // Salvar dados
      saveAddressData(addressData)

      // Fechar modal
      closeAddressModal()

      // Atualizar interface
      updateAddressDisplay()

      // Mostrar mensagem de sucesso
      showAddressSuccessMessage()
    })
  }
}

/**
 * Atualiza a exibição do endereço no resumo do pedido
 */
function updateAddressDisplay() {
  const addressSection = document.getElementById("addressSection")
  const checkoutButton = document.getElementById("checkoutButton")

  if (!addressSection) return

  const address = getAddressData()

  if (address && isAddressComplete()) {
    // Endereço completo - mostrar dados e habilitar finalizar compra
    addressSection.innerHTML = `
      <div class="address-info">
        <div class="address-header">
          <i class="fas fa-map-marker-alt"></i>
          <span>Endereço de Entrega</span>
          <button class="edit-address-btn" onclick="showAddressModal()" title="Editar endereço">
            <i class="fas fa-edit"></i>
          </button>
        </div>
        <div class="address-details">
          <p><strong>${address.name}</strong></p>
          <p>${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}</p>
          <p>${address.neighborhood}</p>
          ${address.reference ? `<p class="address-reference"><i class="fas fa-info-circle"></i> ${address.reference}</p>` : ''}
        </div>
      </div>
    `

    // Habilitar botão de finalizar compra
    if (checkoutButton) {
      checkoutButton.disabled = false
      checkoutButton.style.opacity = '1'
      checkoutButton.style.cursor = 'pointer'
    }
  } else {
    // Endereço incompleto - mostrar botão para adicionar
    addressSection.innerHTML = `
      <div class="address-required">
        <div class="address-icon">
          <i class="fas fa-map-marker-alt"></i>
        </div>
        <div class="address-message">
          <h3>Adicione seu endereço</h3>
          <p>Para finalizar a compra, precisamos do seu endereço de entrega.</p>
        </div>
        <button class="btn-address" onclick="showAddressModal()">
          <i class="fas fa-plus"></i> Adicionar Endereço
        </button>
      </div>
    `

    // Desabilitar botão de finalizar compra
    if (checkoutButton) {
      checkoutButton.disabled = true
      checkoutButton.style.opacity = '0.5'
      checkoutButton.style.cursor = 'not-allowed'
    }
  }
}

/**
 * Mostra mensagem de sucesso após salvar endereço
 */
function showAddressSuccessMessage() {
  // Criar notificação
  const notification = document.createElement('div')
  notification.className = 'address-notification success'
  notification.innerHTML = `
    <i class="fas fa-check-circle"></i>
    <span>Endereço salvo com sucesso!</span>
  `

  // Adicionar ao body
  document.body.appendChild(notification)

  // Mostrar animação
  setTimeout(() => {
    notification.classList.add('show')
  }, 100)

  // Remover após 3 segundos
  setTimeout(() => {
    notification.classList.remove('show')
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

/**
 * Adiciona os estilos CSS para o modal de endereço
 */
function addAddressModalStyles() {
  // Verificar se os estilos já foram adicionados
  if (document.getElementById('addressModalStyles')) return

  const style = document.createElement('style')
  style.id = 'addressModalStyles'
  style.textContent = `
    .address-modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease;
    }

    .address-modal-content {
      background: white;
      border-radius: 8px;
      padding: 0;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideIn 0.3s ease;
    }

    .address-modal-header {
      background: #005f73;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px 8px 0 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .address-modal-header h2 {
      margin: 0;
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .address-modal-close {
      background: none;
      border: none;
      color: white;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background 0.3s ease;
    }

    .address-modal-close:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    .address-form {
      padding: 1.5rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #005f73;
      box-shadow: 0 0 0 2px rgba(0, 95, 115, 0.1);
    }

    .address-form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 1.5rem;
      padding-top: 1rem;
      border-top: 1px solid #eee;
    }

    .address-info {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 6px;
      padding: 1rem;
      margin-bottom: 1rem;
    }

    .address-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      color: #005f73;
      font-weight: 500;
    }

    .address-header i {
      margin-right: 0.5rem;
    }

    .edit-address-btn {
      background: none;
      border: none;
      color: #007bff;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 3px;
      transition: background 0.3s ease;
    }

    .edit-address-btn:hover {
      background: rgba(0, 123, 255, 0.1);
    }

    .address-details p {
      margin: 0.25rem 0;
      color: #333;
    }

    .address-reference {
      color: #666;
      font-size: 0.9rem;
      margin-top: 0.5rem;
    }

    .address-reference i {
      margin-right: 0.25rem;
    }

    .address-required {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      border-radius: 6px;
      padding: 1.5rem;
      text-align: center;
      margin-bottom: 1rem;
    }

    .address-icon {
      font-size: 2rem;
      color: #856404;
      margin-bottom: 1rem;
    }

    .address-message h3 {
      margin: 0 0 0.5rem 0;
      color: #856404;
    }

    .address-message p {
      margin: 0 0 1rem 0;
      color: #856404;
    }

    .btn-address {
      background: #007bff;
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1rem;
      transition: background 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-address:hover {
      background: #0056b3;
    }

    .address-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 4px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }

    .address-notification.show {
      transform: translateX(0);
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .address-form-actions {
        flex-direction: column;
      }

      .address-modal-content {
        width: 95%;
        margin: 1rem;
      }

      .address-notification {
        right: 10px;
        left: 10px;
      }
    }
  `

  document.head.appendChild(style)
}

// Exportar funções para uso global
window.addressManager = {
  showAddressModal,
  closeAddressModal,
  updateAddressDisplay,
  isAddressComplete,
  getAddressData,
  saveAddressData,
  clearAddressData
}

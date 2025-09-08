

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



    // Adicionar evento para mostrar/ocultar campo de porte do cachorro
    const petTypeSelect = document.getElementById('petType');
    const dogSizeGroup = document.getElementById('dogSizeGroup');
    const dogSizeSelect = document.getElementById('dogSize');

    if (petTypeSelect && dogSizeGroup) {
        petTypeSelect.addEventListener('change', function() {
            if (this.value === 'Cão') {
                dogSizeGroup.style.display = 'block';
                dogSizeSelect.required = true;
            } else {
                dogSizeGroup.style.display = 'none';
                dogSizeSelect.required = false;
                dogSizeSelect.value = ''; // Limpar seleção quando oculto
            }
        });
    }

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Coletar dados do formulário
        const formData = new FormData(form);
        const data = {
            petName: formData.get('petName'),
            petType: formData.get('petType'),
            dogSize: formData.get('dogSize') || '',
            serviceType: formData.get('serviceType'),
            date: formData.get('date'),
            ownerName: formData.get('ownerName'),
            notes: formData.get('notes') || ''
        };

        // Validar dados
        if (!data.petName || !data.petType || !data.serviceType || !data.date || !data.ownerName) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Validar porte do cachorro se for cão
        if (data.petType === 'Cão' && !data.dogSize) {
            alert('Por favor, selecione o porte do cachorro.');
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
    
    // Adicionar porte do cachorro se for cão
    if (data.petType === 'Cão' && data.dogSize) {
        message += `📏 *Porte: * ${data.dogSize}\n`;
    }
    
    message += `✂️ *Serviço: * ${data.serviceType}\n`;
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
    const phoneNumber = '551334559994'; // Formato: código do país + DDD + número

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
          <div class="form-row">
            <div class="form-group">
              <label for="cep">CEP</label>
              <input type="text" id="cep" name="cep" inputmode="numeric" maxlength="9"
                     value="${existingAddress.cep || ''}"
                     placeholder="Ex: 11750-000" required>
              <small id="cepHelp" style="display:block;color:#6b7280;margin-top:4px;">Digite o CEP para preencher rua e bairro automaticamente.</small>
            </div>
          </div>
          <div class="form-group">
            <label for="customerName">Nome Completo</label>
            <input type="text" id="customerName" name="name" required 
                   value="${existingAddress.name || ''}" 
                   placeholder="Digite seu nome completo">
          </div>
          
          <div class="form-group">
            <label for="streetName">Nome da Rua </label>
            <input type="text" id="streetName" name="street" required 
                   value="${existingAddress.street || ''}" 
                   placeholder="Ex: Rua das Flores">
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="streetNumber">Número</label>
              <input type="text" id="streetNumber" name="number" required 
                     value="${existingAddress.number || ''}" 
                     placeholder="Ex: 123">
            </div>
            
            <div class="form-group">
              <label for="complement">Complemento (Opcional)</label>
              <input type="text" id="complement" name="complement" 
                     value="${existingAddress.complement || ''}" 
                     placeholder="Ex: Apto 45">
            </div>
          </div>
          
          <div class="form-group">
            <label for="neighborhood">Bairro</label>
            <select id="neighborhood" name="neighborhood" required disabled>
              <option value="" data-frete="0">Selecione o bairro</option>
              <option value="Centro" data-frete="3">Centro </option>
              <option value="Park D'aville" data-frete="3">Park D'aville </option>
              <option value="Jardim Jangada" data-frete="3">Jardim Jangada </option>
              <option value="Stella Maris" data-frete="3">Stella Maris </option>
              <option value="Novo Horizonte" data-frete="3">Novo Horizonte </option>
              <option value="Flórida" data-frete="3">Flórida </option>
              <option value="Vila Romar" data-frete="4">Vila Romar </option>
              <option value="São João Batista II" data-frete="4">São João Batista II </option>
              <option value="Veneza" data-frete="4">Veneza </option>
              <option value="Jardim Caraguava" data-frete="5">Jardim Caraguava</option>
              <option value="Caraminguava" data-frete="5">Caraminguava</option>
              <option value="Oasis" data-frete="6">Oasis </option>
              <option value="Nova Peruíbe" data-frete="6">Nova Peruíbe </option>
              <option value="Villa Erminda" data-frete="6">Villa Erminda </option>
              <option value="Santa Izabel" data-frete="6">Santa Izabel</option>
              <option value="Estância dos Eucaliptos" data-frete="6">Estância dos Eucaliptos </option>
              <option value="Bougainville Res." data-frete="7">Bougainville Res. </option>
              <option value="Ruínas" data-frete="8">Ruínas</option>
            </select>
           </div>
          
          <div class="form-group">
            <label for="reference">Ponto de Referência (Opcional)</label>
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
document.addEventListener('change', function (e) {
  if (e.target && e.target.id === 'neighborhood') {
    const selected = e.target.selectedOptions[0];
    const frete = selected ? Number(selected.getAttribute('data-frete')) : 0;
    const freteSpan = document.getElementById('cartFrete');
    if (freteSpan) {
      freteSpan.textContent = `R$ ${frete.toFixed(2).replace('.', ',')}`;
    }
    // Atualize o total do carrinho se necessário
    if (typeof updateCartSummary === 'function') updateCartSummary();
  }
});

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
  const cepInput = document.getElementById('cep')
  const streetInput = document.getElementById('streetName')
  const neighborhoodSelect = document.getElementById('neighborhood')

  // Utilidades de CEP/bairro
  function normalize(str) {
    return (str || '').toString().normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
  }
  // Constrói mapa com as opções atuais do select (suporta novas opções adicionadas)
  function buildNeighborhoodBaseMap() {
    const map = {}
    if (!neighborhoodSelect) return map
    Array.from(neighborhoodSelect.options).forEach(opt => {
      const val = (opt.value || '').trim()
      if (val) {
        map[normalize(val)] = val
      }
    })
    return map
  }
  // Sinônimos comuns mapeados para o nome canônico (normalizado)
  const synonyms = {
    "park daville": "park d'aville",
    "oasis": "oasis",
    "oasis ": "oasis",
    "oásis": "oasis",
    "sao joao batista ii": "são joão batista ii",
    "sao joao batista 2": "são joão batista ii",
    "bougainville residencial": "bougainville res.",
    "bougainville res": "bougainville res.",
    "vila erminda": "villa erminda"
  }
  function getCanonicalNeighborhoodName(name) {
    if (!name) return null
    const baseMap = buildNeighborhoodBaseMap()
    const norm = normalize(name)
    if (baseMap[norm]) return baseMap[norm]
    const syn = synonyms[norm]
    if (syn && baseMap[normalize(syn)]) return baseMap[normalize(syn)]
    return null
  }
  function formatCep(value) {
    // Remove todos os caracteres não numéricos
    const digits = (value || '').replace(/\D/g, '').slice(0, 8)
    
    // Formatar com hífen apenas se tiver mais de 5 dígitos
    if (digits.length > 5) {
      return digits.slice(0, 5) + '-' + digits.slice(5)
    }
    
    return digits
  }
  function selectNeighborhoodByName(name) {
    const target = getCanonicalNeighborhoodName(name) || (Array.from(neighborhoodSelect.options).find(opt => normalize(opt.value) === normalize(name))?.value)
    if (target) {
      neighborhoodSelect.value = target
      neighborhoodSelect.dispatchEvent(new Event('change', { bubbles: true }))
  // Sincroniza hidden se estiver bloqueado
  const hidden = document.getElementById('neighborhoodHidden')
  if (hidden) hidden.value = neighborhoodSelect.value || ''
      return true
    }
    return false
  }
  function lockNeighborhood() {
    if (!neighborhoodSelect) return
    neighborhoodSelect.disabled = true
    neighborhoodSelect.dataset.locked = 'true'
    // Quando desabilitado, certifique-se que um input hidden replique o valor para submissão
    let hidden = document.getElementById('neighborhoodHidden')
    if (!hidden) {
      hidden = document.createElement('input')
      hidden.type = 'hidden'
      hidden.name = 'neighborhood'
      hidden.id = 'neighborhoodHidden'
      neighborhoodSelect.form?.appendChild(hidden)
    }
    hidden.value = neighborhoodSelect.value || ''
    const help = document.getElementById('cepHelp')
    if (help) help.textContent = 'Bairro definido automaticamente pelo CEP. Para alterar, edite o CEP.'
  }
  function unlockNeighborhood() {
    if (!neighborhoodSelect) return
    neighborhoodSelect.disabled = false
    delete neighborhoodSelect.dataset.locked
    // Remover hidden auxiliar para evitar duplicidade
    const hidden = document.getElementById('neighborhoodHidden')
    if (hidden) hidden.remove()
    const help = document.getElementById('cepHelp')
    if (help) help.textContent = 'Digite o CEP para preencher rua e bairro automaticamente.'
  }
  async function fetchAddressByCep(cep) {
    try {
      const clean = (cep || '').replace(/\D/g, '')
      if (clean.length !== 8) return
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      if (!res.ok) return
      const data = await res.json()
      if (data.erro) return
    if (data.logradouro && streetInput) streetInput.value = data.logradouro
      if (data.bairro && neighborhoodSelect) {
        const ok = selectNeighborhoodByName(data.bairro)
        if (!ok) {
          const help = document.getElementById('cepHelp')
          if (help) help.textContent = `Bairro pelo CEP: ${data.bairro}. Selecione o correspondente na lista.`
          unlockNeighborhood()
        } else {
      lockNeighborhood()
        }
      }
    } catch (e) { console.warn('ViaCEP falhou', e) }
  }

  // Reforça bloqueio: se tentar focar no select enquanto bloqueado, impedir interação
  if (neighborhoodSelect) {
    neighborhoodSelect.addEventListener('focus', () => {
      if (neighborhoodSelect.disabled) {
        neighborhoodSelect.blur()
      }
    });
  }

  if (cepInput) {
    cepInput.addEventListener('input', (e) => {
      const input = e.target
      const oldValue = input.value
      const oldCaret = input.selectionStart
      
      // Formatar o valor
      const newValue = formatCep(oldValue)
      
      // Calcular nova posição do cursor
      let newCaret = oldCaret
      
      // Se o valor mudou (formatação aplicada)
      if (newValue !== oldValue) {
        // Contar quantos dígitos há antes da posição do cursor
        const digitsBeforeCaret = oldValue.slice(0, oldCaret).replace(/\D/g, '').length
        
        // Encontrar a posição correspondente no novo valor
        let digitCount = 0
        newCaret = 0
        
        for (let i = 0; i < newValue.length; i++) {
          if (/\d/.test(newValue[i])) {
            digitCount++
            if (digitCount >= digitsBeforeCaret) {
              newCaret = i + 1
              break
            }
          }
          if (digitCount < digitsBeforeCaret) {
            newCaret = i + 1
          }
        }
        
        // Ajustar se o cursor estava no final
        if (oldCaret >= oldValue.length) {
          newCaret = newValue.length
        }
      }
      
      // Aplicar valor formatado
      input.value = newValue
      
      // Restaurar posição do cursor
      try { 
        input.setSelectionRange(newCaret, newCaret) 
      } catch(_) {}
      
      // Não liberar bairro apenas por CEP incompleto; manter bloqueado até validação/consulta
    })
    cepInput.addEventListener('blur', () => fetchAddressByCep(cepInput.value))
  }

  if (addressForm) {
    addressForm.addEventListener("submit", async (e) => {
      e.preventDefault()
      
      // Coletar dados do formulário
      const formData = new FormData(addressForm)
      const safe = (v) => (v == null ? '' : String(v)).trim()
      // Campo disabled não é incluído no FormData; usar fallback do DOM
      let neighborhoodValue = safe(formData.get('neighborhood'))
      if (!neighborhoodValue && neighborhoodSelect) {
        neighborhoodValue = safe(neighborhoodSelect.value)
      }
      const addressData = {
        name: safe(formData.get('name')),
        cep: safe(formatCep(formData.get('cep') || '')),
        street: safe(formData.get('street')),
        number: safe(formData.get('number')),
        complement: safe(formData.get('complement')),
        neighborhood: neighborhoodValue,
        reference: safe(formData.get('reference'))
      }
      
      // Validar campos obrigatórios
      if (!addressData.name || !addressData.street || !addressData.number || !addressData.neighborhood) {
        alert('Por favor, preencha todos os campos obrigatórios.')
        return
      }

      // Validação de consistência CEP x Bairro
      const cleanCep = (addressData.cep || '').replace(/\D/g, '')
      if (cleanCep.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
          if (res.ok) {
            const data = await res.json()
            if (!data.erro && data.bairro) {
              const canonical = getCanonicalNeighborhoodName(data.bairro)
              if (canonical && canonical !== addressData.neighborhood) {
                alert(`O bairro informado pelo CEP (${data.bairro}) não corresponde ao selecionado. Por favor, ajuste o CEP ou o bairro.`)
                return
              }
            }
          }
        } catch (err) {
          // se ViaCEP falhar, seguimos sem bloquear
          console.warn('Validação CEP x Bairro indisponível', err)
        }
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
    // Estado inicial ao abrir o modal
    try {
      // Por padrão, manter bairro bloqueado até validação/CEP
      if (neighborhoodSelect) {
        neighborhoodSelect.disabled = true;
      }
      const existing = getAddressData() || {};
      const cepVal = (cepInput?.value || existing.cep || '').replace(/\D/g, '');
      if (cepVal.length === 8) {
        // Se já temos bairro salvo, aplicar e bloquear
        if (existing.neighborhood) {
          const matched = selectNeighborhoodByName(existing.neighborhood);
          if (!matched && neighborhoodSelect) {
            neighborhoodSelect.value = existing.neighborhood;
          }
          lockNeighborhood();
        } else if (cepInput && cepInput.value) {
          // Tentar buscar endereço e bloquear no retorno
          fetchAddressByCep(cepInput.value);
        }
      }
    } catch(_) {}
  }
}
/**
 * Atualiza a exibição do endereço no resumo do pedido - VERSÃO ATUALIZADA COM BOTÃO LIMPAR
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
          <div class="address-actions">
            <button class="edit-address-btn" onclick="showAddressModal()" title="Editar endereço">
              <i class="fas fa-edit"></i>
            </button>
            <button class="clear-address-btn" onclick="clearAddressInfo()" title="Limpar endereço">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
        <div class="address-details">
          <p><strong>${address.name}</strong></p>
          ${address.cep ? `<p>CEP: ${address.cep}</p>` : ''}
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
 * Limpa as informações do endereço com confirmação
 */
function clearAddressInfo() {

  
  // Modal de confirmação personalizado
  showConfirmationModal({
    title: 'Limpar Endereço',
    message: 'Tem certeza que deseja remover as informações de endereço?',
    confirmText: 'Sim, Limpar',
    cancelText: 'Cancelar',
    onConfirm: () => {

      
      // Limpar dados do localStorage
      clearAddressData()

      
      // Atualizar interface
      updateAddressDisplay()

      
      // Mostrar mensagem de sucesso
      showAddressClearMessage()

    }
  })
}

/**
 * Mostra modal de confirmação personalizado
 */
function showConfirmationModal({ title, message, confirmText, cancelText, onConfirm }) {
  // Remover modal existente se houver
  const existingModal = document.getElementById("confirmationModal")
  if (existingModal) {
    existingModal.remove()
  }

  // Criar o modal
  const modalHTML = `
    <div id="confirmationModal" class="confirmation-modal">
      <div class="confirmation-modal-content">
        <div class="confirmation-modal-header">
          <h3><i class="fas fa-question-circle"></i> ${title}</h3>
          <button class="confirmation-modal-close" onclick="closeConfirmationModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="confirmation-modal-body">
          <div class="confirmation-icon">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p>${message}</p>
        </div>
        
        <div class="confirmation-modal-actions">
          <button type="button" class="btn-secondary" onclick="closeConfirmationModal()">
            <i class="fas fa-times"></i> ${cancelText}
          </button>
          <button type="button" class="btn-danger" onclick="confirmAction()">
            <i class="fas fa-check"></i> ${confirmText}
          </button>
        </div>
      </div>
    </div>
  `

  // Adicionar ao body
  document.body.insertAdjacentHTML('beforeend', modalHTML)

  // Adicionar estilos
  addConfirmationModalStyles()

  // Salvar callback
  window.confirmationCallback = onConfirm
}

/**
 * Fecha o modal de confirmação
 */
function closeConfirmationModal() {
  const modal = document.getElementById("confirmationModal")
  if (modal) {
    modal.remove()
  }
  window.confirmationCallback = null
}

/**
 * Executa a ação confirmada
 */
function confirmAction() {
  if (window.confirmationCallback) {
    window.confirmationCallback()
  }
  closeConfirmationModal()
}

/**
 * Mostra mensagem de sucesso após limpar endereço
 */
function showAddressClearMessage() {
  // Criar notificação
  const notification = document.createElement('div')
  notification.className = 'address-notification clear'
  notification.innerHTML = `
    <i class="fas fa-trash-alt"></i>
    <span>Endereço removido com sucesso!</span>
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
 * Adiciona estilos específicos para os modais de endereço
 */
function addAddressModalStyles() {
  // Os estilos já estão incluídos no CSS principal
  // Esta função é mantida para compatibilidade, mas não precisa fazer nada
  // pois os estilos estão em styles.css
}

/**
 * Adiciona estilos específicos para o modal de confirmação
 */
function addConfirmationModalStyles() {
  // Os estilos já estão incluídos no CSS principal
  // Esta função é mantida para compatibilidade
  addAddressModalStyles()
}

// Exportar funções para uso global - VERSÃO ATUALIZADA
window.addressManager = {
  showAddressModal,
  closeAddressModal,
  updateAddressDisplay,
  isAddressComplete,
  getAddressData,
  saveAddressData,
  clearAddressData,
  clearAddressInfo,
  showConfirmationModal,
  closeConfirmationModal
}

// Adicionar funções globais para os onclick
window.clearAddressInfo = clearAddressInfo
window.showConfirmationModal = showConfirmationModal
window.closeConfirmationModal = closeConfirmationModal
window.confirmAction = confirmAction
window.updateAddressDisplay = updateAddressDisplay
window.showAddressModal = showAddressModal
window.closeAddressModal = closeAddressModal

console.log('✅ Funções globais exportadas:', {
  clearAddressInfo: typeof window.clearAddressInfo,
  updateAddressDisplay: typeof window.updateAddressDisplay,
  showAddressModal: typeof window.showAddressModal
})
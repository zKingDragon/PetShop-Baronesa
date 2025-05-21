// Função para inicializar os formulários
document.addEventListener("DOMContentLoaded", () => {
  initAppointmentForm()
  initCadastroForm()
  initPasswordToggles()
})

// Função para inicializar o formulário de agendamento
function initAppointmentForm() {
  const appointmentForm = document.getElementById("appointmentForm")

  if (appointmentForm) {
    appointmentForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Coletar dados do formulário
      const petName = document.getElementById("petName").value
      const petType = document.getElementById("petType").value
      const date = document.getElementById("date").value
      const time = document.getElementById("time").value
      const ownerName = document.getElementById("ownerName").value
      const phone = document.getElementById("phone").value
      const notes = document.getElementById("notes").value

      // Construir a mensagem para o WhatsApp
      const message = `
Olá! Gostaria de agendar um horário para banho e tosa.

Nome do pet: ${petName}
Tipo de pet: ${petType}
Data: ${date}
Horário: ${time}
Nome do dono: ${ownerName}
Telefone: ${phone}
Observações: ${notes}
            `

      // Codificar a mensagem para URL
      const encodedMessage = encodeURIComponent(message)

      // Abrir o WhatsApp com a mensagem
      window.open(`https://wa.me/5511999999999?text=${encodedMessage}`, "_blank")
    })
  }
}

// Função para inicializar o formulário de cadastro
function initCadastroForm() {
  const cadastroForm = document.getElementById("cadastroForm")

  if (cadastroForm) {
    cadastroForm.addEventListener("submit", (e) => {
      e.preventDefault()

      // Validar senha
      const password = document.getElementById("password").value
      const confirmPassword = document.getElementById("confirmPassword").value

      if (password !== confirmPassword) {
        alert("As senhas não coincidem. Por favor, verifique.")
        return
      }

      // Aqui você implementaria a lógica de cadastro
      // Por enquanto, apenas simularemos um cadastro bem-sucedido

      // Redirecionar para uma página de sucesso ou mostrar uma mensagem
      showSuccessMessage()
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
      if (passwordInput.type === "password") {
        passwordInput.type = "text"
        this.innerHTML = '<i class="fas fa-eye-slash"></i>'
      } else {
        passwordInput.type = "password"
        this.innerHTML = '<i class="fas fa-eye"></i>'
      }
    })
  })
}

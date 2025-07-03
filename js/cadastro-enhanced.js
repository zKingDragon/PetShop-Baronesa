// Script para melhorar a interatividade da página de cadastro

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const cadastroForm = document.getElementById('cadastroForm');
    const cadastroBtn = document.getElementById('cadastroBtn');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    const googleBtn = document.getElementById('googleLoginBtn');
    
    // Animação de entrada dos elementos
    const animateElements = document.querySelectorAll('.form-group, .benefit-item, .feature-item');
    
    // Observer para animações
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Aplicar observer aos elementos
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.6s ease-out ${index * 0.1}s`;
        observer.observe(el);
    });
    
    // Funcionalidade de mostrar/ocultar senha
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
                this.title = 'Ocultar senha';
            } else {
                targetInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
                this.title = 'Mostrar senha';
            }
        });
    });
    
    // Validação em tempo real
    function validateName(name) {
        return name.trim().length >= 2 && /^[a-zA-ZÀ-ÿ\s]+$/.test(name.trim());
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePhone(phone) {
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10;
    }
    
    function validatePassword(password) {
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
        };
    }
    
    function getPasswordStrength(password) {
        const validations = validatePassword(password);
        const score = Object.values(validations).filter(Boolean).length;
    
        if (score < 2) return 'weak';
        if (score < 3) return 'medium';
        return 'strong';
    }
    
    // Feedback visual para campos
    function updateFieldStatus(field, isValid, message = '') {
        const parentGroup = field.closest('.form-group');
        let feedbackElement = parentGroup.querySelector('.field-feedback');
        
        // Remove feedback anterior
        if (feedbackElement) {
            feedbackElement.remove();
        }
        
        if (isValid) {
            field.style.borderColor = '#34d399';
            field.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
        } else {
            field.style.borderColor = '#f44336';
            field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
            
            // Adicionar mensagem de erro
            if (message) {
                feedbackElement = document.createElement('div');
                feedbackElement.className = 'field-feedback error';
                feedbackElement.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
                parentGroup.appendChild(feedbackElement);
            }
        }
    }
    
    // Criar indicador de força da senha
    function createPasswordStrengthIndicator(passwordField) {
        const parentGroup = passwordField.closest('.form-group');
        
        const strengthContainer = document.createElement('div');
        strengthContainer.className = 'password-strength';
        
        const strengthBar = document.createElement('div');
        strengthBar.className = 'password-strength-bar';
        strengthContainer.appendChild(strengthBar);
        
        const requirementsContainer = document.createElement('div');
        requirementsContainer.className = 'password-requirements';
        requirementsContainer.innerHTML = `
            <div class="requirement" data-req="length">
                <i class="fas fa-times"></i>
                <span>Mínimo 8 caracteres</span>
            </div>
            <div class="requirement" data-req="uppercase">
                <i class="fas fa-times"></i>
                <span>Uma letra maiúscula</span>
            </div>
            <div class="requirement" data-req="lowercase">
                <i class="fas fa-times"></i>
                <span>Uma letra minúscula</span>
            </div>
        `;
        
        parentGroup.appendChild(strengthContainer);
        parentGroup.appendChild(requirementsContainer);
        
        return { strengthBar, requirementsContainer };
    }
    
    // Atualizar indicador de força da senha
    function updatePasswordStrength(password, strengthBar, requirementsContainer) {
        const validations = validatePassword(password);
        const strength = getPasswordStrength(password);
        
        // Atualizar barra de força
        strengthBar.className = `password-strength-bar password-strength-${strength}`;
        
        const scores = { weak: 30, medium: 60, strong: 100 };
        strengthBar.style.width = `${scores[strength]}%`;
        
        // Atualizar requisitos
        Object.entries(validations).forEach(([key, isValid]) => {
            const requirement = requirementsContainer.querySelector(`[data-req="${key}"]`);
            if (requirement) {
                const icon = requirement.querySelector('i');
                if (isValid) {
                    requirement.classList.add('valid');
                    requirement.classList.remove('invalid');
                    icon.className = 'fas fa-check';
                } else {
                    requirement.classList.add('invalid');
                    requirement.classList.remove('valid');
                    icon.className = 'fas fa-times';
                }
            }
        });
    }
    
    // Configurar indicador de força da senha
    if (passwordInput) {
        const { strengthBar, requirementsContainer } = createPasswordStrengthIndicator(passwordInput);
        
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            updatePasswordStrength(password, strengthBar, requirementsContainer);
            
            const validations = validatePassword(password);
            const isValid = Object.values(validations).every(Boolean);
            updateFieldStatus(this, isValid);
        });
    }
    
    // Validação em tempo real dos campos
    if (nameInput) {
        nameInput.addEventListener('input', function() {
            const isValid = validateName(this.value);
            const message = isValid ? '' : 'Nome deve ter pelo menos 2 caracteres e conter apenas letras';
            updateFieldStatus(this, isValid, message);
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            const isValid = validateEmail(this.value);
            const message = isValid ? '' : 'Digite um e-mail válido';
            updateFieldStatus(this, isValid, message);
        });
    }
    
    if (phoneInput) {
        // Máscara de telefone
        phoneInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            
            if (value.length <= 11) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                value = value.replace(/(\d)(\d{4})$/, '$1-$2');
            }
            
            this.value = value;
            
            const isValid = validatePhone(this.value);
            const message = isValid ? '' : 'Digite um telefone válido';
            updateFieldStatus(this, isValid, message);
        });
    }
    
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            const isValid = this.value === passwordInput.value && this.value.length > 0;
            const message = isValid ? '' : 'As senhas não coincidem';
            updateFieldStatus(this, isValid, message);
        });
    }
    
    // Animação do botão de cadastro
    if (cadastroBtn) {
        cadastroBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validar todos os campos
            const isNameValid = validateName(nameInput.value);
            const isEmailValid = validateEmail(emailInput.value);
            const isPhoneValid = validatePhone(phoneInput.value);
            const passwordValidations = validatePassword(passwordInput.value);
            const isPasswordValid = Object.values(passwordValidations).every(Boolean);
            const isConfirmPasswordValid = confirmPasswordInput.value === passwordInput.value;
            
            if (!isNameValid || !isEmailValid || !isPhoneValid || !isPasswordValid || !isConfirmPasswordValid) {
                showAlert('Por favor, preencha todos os campos corretamente.', 'error');
                
                // Destacar campos inválidos
                if (!isNameValid) updateFieldStatus(nameInput, false, 'Nome inválido');
                if (!isEmailValid) updateFieldStatus(emailInput, false, 'E-mail inválido');
                if (!isPhoneValid) updateFieldStatus(phoneInput, false, 'Telefone inválido');
                if (!isPasswordValid) updateFieldStatus(passwordInput, false, 'Senha não atende aos requisitos');
                if (!isConfirmPasswordValid) updateFieldStatus(confirmPasswordInput, false, 'Senhas não coincidem');
                
                return;
            }
            
            // Mostrar loading
            const btnText = this.querySelector('.btn-text');
            const btnLoader = this.querySelector('.btn-loader');
            
            if (btnText && btnLoader) {
                btnText.style.display = 'none';
                btnLoader.style.display = 'flex';
            }
            
            this.disabled = true;
            
            // Simular processo de cadastro
            setTimeout(() => {
                // Restaurar botão
                if (btnText && btnLoader) {
                    btnText.style.display = 'flex';
                    btnLoader.style.display = 'none';
                }
                this.disabled = false;
                
                // Simular cadastro bem-sucedido
                showAlert('Cadastro realizado com sucesso! Bem-vindo à Pet Shop Baronesa!', 'success');
                
                // Aqui você pode adicionar a lógica real de cadastro
                // Por exemplo, chamar a função de cadastro do Firebase
                if (window.handleRegister) {
                    window.handleRegister({
                        name: nameInput.value,
                        email: emailInput.value,
                        phone: phoneInput.value,
                        password: passwordInput.value
                    });
                }
            }, 2500);
        });
    }
    
    // Função para mostrar alertas
    function showAlert(message, type) {
        // Remove alertas anteriores
        const existingAlerts = document.querySelectorAll('.alert');
        existingAlerts.forEach(alert => alert.remove());
        
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-triangle' : 
                    'fa-info-circle';
        
        alert.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        // Inserir no início do formulário
        const formCard = document.querySelector('.cadastro-form-card');
        if (formCard) {
            formCard.insertBefore(alert, formCard.firstChild);
        }
        
        // Ocultar após 5 segundos
        setTimeout(() => {
            alert.remove();
        }, 5000);
    }
    
    // Efeitos de hover nos benefit items
    const benefitItems = document.querySelectorAll('.benefit-item');
    benefitItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Parallax effect para a imagem
    const cadastroImage = document.querySelector('.cadastro-image');
    if (cadastroImage) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            cadastroImage.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Adicionar ripple effect aos botões
    const buttons = document.querySelectorAll('.btn-primary, .btn-google');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.classList.add('ripple');
            
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
    
    // Auto-focus no primeiro campo
    if (nameInput) {
        nameInput.focus();
    }
    
    // Smooth scroll para elementos internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Validação final antes do envio
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Trigger click do botão para manter consistência
            if (cadastroBtn) {
                cadastroBtn.click();
            }
        });
    }
    
    // Animação de pulse para ícones importantes
    const pulseIcons = document.querySelectorAll('.fa-user-plus, .fa-heart, .fa-star');
    pulseIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.5s ease-in-out';
        });
        
        icon.addEventListener('animationend', function() {
            this.style.animation = 'pulse 2s infinite';
        });
    });
    
    // Contador de caracteres para campos de texto
    function addCharacterCounter(input, maxLength) {
        const parentGroup = input.closest('.form-group');
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.innerHTML = `<span class="current">0</span>/${maxLength}`;
        
        parentGroup.appendChild(counter);
        
        input.addEventListener('input', function() {
            const current = this.value.length;
            const currentSpan = counter.querySelector('.current');
            currentSpan.textContent = current;
            
            if (current > maxLength * 0.8) {
                counter.style.color = '#ff9800';
            } else {
                counter.style.color = '#666';
            }
        });
    }
    
    // Adicionar contadores de caracteres
    if (nameInput) addCharacterCounter(nameInput, 50);
    
    // Prevenção de envio duplo
    let isSubmitting = false;
    
    if (cadastroForm) {
        cadastroForm.addEventListener('submit', function(e) {
            if (isSubmitting) {
                e.preventDefault();
                return;
            }
            isSubmitting = true;
            
            setTimeout(() => {
                isSubmitting = false;
            }, 3000);
        });
    }
});

// CSS adicional para novos elementos
const style = document.createElement('style');
style.textContent = `
    .field-feedback {
        margin-top: 0.5rem;
        padding: 0.5rem;
        border-radius: 6px;
        font-size: 0.85rem;
        display: flex;
        align-items: center;
        gap: 6px;
    }
    
    .field-feedback.error {
        background: #ffeaa7;
        color: #d63031;
        border: 1px solid #fdcb6e;
    }
    
    .character-counter {
        text-align: right;
        font-size: 0.8rem;
        color: #666;
        margin-top: 0.25rem;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

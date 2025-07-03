// Script para melhorar a interatividade da página de login

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const toggleButtons = document.querySelectorAll('.toggle-password');
    const demoButtons = document.querySelectorAll('.demo-btn');
    const rememberCheckbox = document.getElementById('rememberMe');
    
    // Animação de entrada dos elementos
    const animateElements = document.querySelectorAll('.form-group, .demo-accounts, .benefit-item');
    
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
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.6s ease-out';
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
    
    // Funcionalidade dos botões de demonstração
    demoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const email = this.getAttribute('data-email');
            const password = this.getAttribute('data-password');
            
            // Animação de preenchimento
            emailInput.value = '';
            passwordInput.value = '';
            
            // Simular digitação
            typeText(emailInput, email, 50);
            setTimeout(() => {
                typeText(passwordInput, password, 50);
            }, email.length * 50 + 200);
        });
    });
    
    // Função para simular digitação
    function typeText(element, text, speed) {
        let i = 0;
        const interval = setInterval(() => {
            element.value += text.charAt(i);
            element.dispatchEvent(new Event('input'));
            i++;
            if (i >= text.length) {
                clearInterval(interval);
                element.focus();
            }
        }, speed);
    }
    
    // Validação em tempo real
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validatePassword(password) {
        return password.length >= 6;
    }
    
    // Feedback visual para campos
    function updateFieldStatus(field, isValid) {
        if (isValid) {
            field.style.borderColor = '#34d399';
            field.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)';
        } else {
            field.style.borderColor = '#f44336';
            field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
        }
    }
    
    // Validação em tempo real dos campos
    emailInput.addEventListener('input', function() {
        const isValid = validateEmail(this.value);
        updateFieldStatus(this, isValid);
    });
    
    passwordInput.addEventListener('input', function() {
        const isValid = validatePassword(this.value);
        updateFieldStatus(this, isValid);
    });
    
    // Animação do botão de login
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Validar campos
        const isEmailValid = validateEmail(emailInput.value);
        const isPasswordValid = validatePassword(passwordInput.value);
        
        if (!isEmailValid || !isPasswordValid) {
            showAlert('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }
        
        // Mostrar loading
        const btnText = this.querySelector('.btn-text');
        const btnLoader = this.querySelector('.btn-loader');
        
        btnText.style.display = 'none';
        btnLoader.style.display = 'flex';
        this.disabled = true;
        
        // Simular processo de login
        setTimeout(() => {
            // Restaurar botão
            btnText.style.display = 'flex';
            btnLoader.style.display = 'none';
            this.disabled = false;
            
            // Simular login bem-sucedido
            showAlert('Login realizado com sucesso!', 'success');
            
            // Aqui você pode adicionar a lógica real de login
            // Por exemplo, chamar a função de login do Firebase
            if (window.handleLogin) {
                window.handleLogin(emailInput.value, passwordInput.value, rememberCheckbox.checked);
            }
        }, 2000);
    });
    
    // Função para mostrar alertas
    function showAlert(message, type) {
        const alertId = type === 'success' ? 'loginSuccess' : 'loginError';
        const alertElement = document.getElementById(alertId);
        
        if (alertElement) {
            alertElement.textContent = message;
            alertElement.style.display = 'flex';
            
            // Ocultar após 5 segundos
            setTimeout(() => {
                alertElement.style.display = 'none';
            }, 5000);
        }
    }
    
    // Efeitos de hover nos benefit items
    const benefitItems = document.querySelectorAll('.benefit-item');
    benefitItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Parallax effect para a imagem
    const loginImage = document.querySelector('.login-image');
    if (loginImage) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            loginImage.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Animação de pulse para ícones importantes
    const pulseIcons = document.querySelectorAll('.fa-paw, .fa-heart, .fa-star');
    pulseIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.animation = 'pulse 0.5s ease-in-out';
        });
        
        icon.addEventListener('animationend', function() {
            this.style.animation = 'pulse 2s infinite';
        });
    });
    
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
    
    // Adicionar ripple effect aos botões
    const buttons = document.querySelectorAll('.btn-primary, .btn-google, .demo-btn');
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
    if (emailInput) {
        emailInput.focus();
    }
    
    // Salvar dados do formulário no localStorage (se "lembrar de mim" estiver marcado)
    if (rememberCheckbox) {
        // Carregar dados salvos
        const savedEmail = localStorage.getItem('loginEmail');
        const savedRemember = localStorage.getItem('loginRemember');
        
        if (savedEmail && savedRemember === 'true') {
            emailInput.value = savedEmail;
            rememberCheckbox.checked = true;
        }
        
        // Salvar dados quando o formulário for enviado
        loginForm.addEventListener('submit', function() {
            if (rememberCheckbox.checked) {
                localStorage.setItem('loginEmail', emailInput.value);
                localStorage.setItem('loginRemember', 'true');
            } else {
                localStorage.removeItem('loginEmail');
                localStorage.removeItem('loginRemember');
            }
        });
    }
});

// CSS para o efeito ripple
const style = document.createElement('style');
style.textContent = `
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

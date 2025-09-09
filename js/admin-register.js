document.addEventListener('DOMContentLoaded', function() {
    const authService = window.AuthService; // Corrigido: Usa a instância global inicializada
    const registerForm = document.getElementById('registerForm');
    const registerBtn = document.getElementById('registerBtn');
    const btnText = registerBtn.querySelector('.btn-text');
    const btnLoader = registerBtn.querySelector('.btn-loader');
    const successAlert = document.getElementById('registerSuccess');
    const errorAlert = document.getElementById('registerError');

    // Função para alternar visibilidade da senha
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.dataset.target;
            const passwordInput = document.getElementById(targetId);
            const icon = this.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });

    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Limpar alertas
        successAlert.style.display = 'none';
        errorAlert.style.display = 'none';
        successAlert.textContent = '';
        errorAlert.textContent = '';

        // Validações
        if (!name || !email || !password || !confirmPassword) {
            errorAlert.textContent = 'Por favor, preencha todos os campos.';
            errorAlert.style.display = 'block';
            return;
        }
        if (password.length < 6) {
            errorAlert.textContent = 'A senha deve ter no mínimo 6 caracteres.';
            errorAlert.style.display = 'block';
            return;
        }
        if (password !== confirmPassword) {
            errorAlert.textContent = 'As senhas não coincidem.';
            errorAlert.style.display = 'block';
            return;
        }

        // Mostrar loader
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        registerBtn.disabled = true;

        try {
            // Usar o método do AuthService para criar o usuário e definir a função
            const userCredential = await authService.createAdminUser(email, password, name);
            
            if (userCredential && userCredential.user) {
                successAlert.textContent = `Administrador "${name}" (${email}) cadastrado com sucesso!`;
                successAlert.style.display = 'block';
                registerForm.reset();
            } else {
                throw new Error('Não foi possível criar o usuário.');
            }

        } catch (error) {
            console.error("Erro ao cadastrar administrador:", error);
            let errorMessage = 'Ocorreu um erro ao cadastrar. Tente novamente.';
            if (error.code === 'auth/email-already-in-use') {
                errorMessage = 'Este e-mail já está em uso por outra conta.';
            } else if (error.code === 'auth/invalid-email') {
                errorMessage = 'O formato do e-mail é inválido.';
            } else if (error.code === 'auth/weak-password') {
                errorMessage = 'A senha é muito fraca. Tente uma mais forte.';
            }
            errorAlert.textContent = errorMessage;
            errorAlert.style.display = 'block';
        } finally {
            // Esconder loader
            btnText.style.display = 'inline-block';
            btnLoader.style.display = 'none';
            registerBtn.disabled = false;
        }
    });
});

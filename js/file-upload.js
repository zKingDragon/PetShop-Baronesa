/**
 * Gerenciador de upload de arquivos
 */
class FileUploadManager {
    constructor() {
        this.initializeUploads();
    }

    initializeUploads() {
        // Upload de produto
        this.setupFileUpload('productImage', 'fileInfo', 'removeFile', 'imagePreview');

        // Upload de dica
        this.setupFileUpload('tipImage', 'tipFileInfo', 'removeTipFile', 'tipImagePreview');
    }

    setupFileUpload(inputId, fileInfoId, removeButtonId, previewId) {
        const fileInput = document.getElementById(inputId);
        const fileInfo = document.getElementById(fileInfoId);
        const removeButton = document.getElementById(removeButtonId);
        const preview = document.getElementById(previewId);
        const container = fileInput?.closest('.file-upload-container');

        if (!fileInput || !container) return;

        // Drag and drop
        container.addEventListener('dragover', (e) => {
            e.preventDefault();
            container.classList.add('dragover');
        });

        container.addEventListener('dragleave', () => {
            container.classList.remove('dragover');
        });

        container.addEventListener('drop', (e) => {
            e.preventDefault();
            container.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFile(files[0], fileInput, fileInfo, container, preview);
            }
        });

        // Seleção de arquivo
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.handleFile(file, fileInput, fileInfo, container, preview);
            }
        });

        // Remover arquivo - MELHORADO
        removeButton?.addEventListener('click', () => {
            this.clearFileWithAnimation(fileInput, fileInfo, container, preview);
        });
    }

    handleFile(file, fileInput, fileInfo, container, preview) {
        // Validar arquivo
        if (!this.validateFile(file, container)) {
            return;
        }

        // Exibir informações do arquivo
        this.displayFileInfo(file, fileInfo);

        // Atualizar UI
        container.classList.add('has-file');
        container.classList.remove('error');
        fileInfo.classList.remove('error');
        fileInfo.classList.add('success');
        fileInfo.style.display = 'flex';

        // Gerar preview
        if (preview) {
            this.generatePreview(file, preview);
        }

        // Remover mensagem de erro anterior
        this.clearError(container);

        // Adicionar feedback visual
        this.showSuccessMessage(container, 'Arquivo carregado com sucesso!');
    }

    displayFileInfo(file, fileInfo) {
        const fileName = fileInfo.querySelector('.file-name');
        const fileSize = fileInfo.querySelector('.file-size');

        if (fileName) {
            fileName.textContent = file.name;
        }

        if (fileSize) {
            fileSize.textContent = this.formatFileSize(file.size);
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    generatePreview(file, preview) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (preview) {
                preview.style.opacity = '0';
                preview.style.transition = 'opacity 0.3s ease';

                setTimeout(() => {
                    preview.src = e.target.result;
                    preview.style.opacity = '1';
                }, 100);
            }

            // Atualizar preview global se disponível
            if (window.updateProductImagePreview) {
                window.updateProductImagePreview(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    }

    // FUNÇÃO MELHORADA PARA LIMPAR ARQUIVO
    clearFileWithAnimation(fileInput, fileInfo, container, preview) {
        // Adicionar animação de saída
        fileInfo.classList.add('removing');

        // Aguardar animação antes de remover
        setTimeout(() => {
            // Limpar input
            fileInput.value = '';

            // Esconder file info
            fileInfo.style.display = 'none';
            fileInfo.classList.remove('removing', 'success', 'error');

            // Atualizar container
            container.classList.remove('has-file', 'error');

            // Restaurar preview padrão com animação
            if (preview) {
                preview.style.opacity = '0';
                setTimeout(() => {
                    preview.src = '../assets/images/gerais/iconeBaronesa.png';
                    preview.style.opacity = '1';
                }, 150);
            }

            // Remover mensagens de erro
            this.clearError(container);

            // Mostrar mensagem de sucesso
            this.showSuccessMessage(container, 'Arquivo removido!', 2000);

            // Focar no input para melhor UX
            fileInput.focus();

        }, 300); // Tempo da animação CSS
    }

    clearFile(fileInput, fileInfo, container, preview) {
        // Usar a versão com animação
        this.clearFileWithAnimation(fileInput, fileInfo, container, preview);
    }

    validateFile(file, container) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];

        // Verificar tipo
        if (!allowedTypes.includes(file.type)) {
            this.showError(container, 'Formato não suportado. Use JPG, PNG ou GIF.');
            return false;
        }

        // Verificar tamanho
        if (file.size > maxSize) {
            this.showError(container, 'Arquivo muito grande. Máximo 5MB.');
            return false;
        }

        return true;
    }

    showError(container, message) {
        container.classList.add('error');

        // Remover erro anterior
        this.clearError(container);

        // Adicionar nova mensagem de erro
        const errorDiv = document.createElement('div');
        errorDiv.className = 'file-error';
        errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        container.appendChild(errorDiv);

        // Remover erro automaticamente após 5 segundos
        setTimeout(() => {
            this.clearError(container);
            container.classList.remove('error');
        }, 5000);
    }

    clearError(container) {
        const errorMsg = container.querySelector('.file-error');
        if (errorMsg) {
            errorMsg.remove();
        }
    }

    showSuccessMessage(container, message, duration = 3000) {
        // Remover mensagem anterior
        const existingSuccess = container.querySelector('.file-success');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        // Adicionar nova mensagem de sucesso
        const successDiv = document.createElement('div');
        successDiv.className = 'file-success';
        successDiv.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        container.appendChild(successDiv);

        // Remover após o tempo especificado
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.style.opacity = '0';
                setTimeout(() => {
                    successDiv.remove();
                }, 300);
            }
        }, duration);
    }

    // Método para converter arquivo para base64
    async fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Método para upload para Firebase Storage (opcional)
    async uploadToFirebase(file, path) {
        // Implementar se você quiser usar Firebase Storage
        // Por enquanto, retorna base64
        return await this.fileToBase64(file);
    }
}

// Funções para melhorar a experiência do formulário
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar FileUploadManager
    new FileUploadManager();

    // Inicializar melhorias do formulário
    initializeFormEnhancements();
});

function initializeFormEnhancements() {
    // Toggle de promoção
    const promoToggle = document.getElementById('productOnSale');
    const salePriceInput = document.getElementById('productSalePrice');

    if (promoToggle && salePriceInput) {
        promoToggle.addEventListener('change', function() {
            if (this.checked) {
                salePriceInput.disabled = false;
                salePriceInput.focus();
                salePriceInput.parentElement.style.opacity = '1';
            } else {
                salePriceInput.disabled = true;
                salePriceInput.value = '';
                salePriceInput.parentElement.style.opacity = '0.6';
            }
        });
    }

    // Validação em tempo real
    const requiredInputs = document.querySelectorAll('#productForm [required]');
    requiredInputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });

    // Formatação de preço
    const priceInputs = document.querySelectorAll('#productPrice, #productSalePrice');
    priceInputs.forEach(input => {
        input.addEventListener('input', formatPrice);
    });

    // Modal animations
    const modal = document.getElementById('productModal');
    const modalContent = modal?.querySelector('.modal-content');

    if (modal && modalContent) {
        // Smooth open/close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProductModal();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeProductModal();
            }
        });
    }
}

function validateField(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');

    if (!formGroup) return;

    // Remove previous error states
    formGroup.classList.remove('error', 'success');
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) existingError.remove();

    // Check if field is valid
    if (field.checkValidity()) {
        formGroup.classList.add('success');
    } else {
        formGroup.classList.add('error');

        // Add error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message';
        errorMessage.textContent = getFieldErrorMessage(field);
        formGroup.appendChild(errorMessage);
    }
}

function clearFieldError(e) {
    const field = e.target;
    const formGroup = field.closest('.form-group');

    if (formGroup) {
        formGroup.classList.remove('error');
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) errorMessage.remove();
    }
}

function getFieldErrorMessage(field) {
    if (field.validity.valueMissing) {
        return 'Este campo é obrigatório';
    }
    if (field.validity.typeMismatch) {
        return 'Formato inválido';
    }
    if (field.validity.rangeUnderflow) {
        return 'Valor deve ser maior que zero';
    }
    return 'Campo inválido';
}

function formatPrice(e) {
    let value = e.target.value;

    // Remove caracteres não numéricos exceto ponto
    value = value.replace(/[^\d.]/g, '');

    // Limita a 2 casas decimais
    const parts = value.split('.');
    if (parts.length > 2) {
        value = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
        value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    e.target.value = value;
}

// Melhorar as funções de modal (se não existirem)
function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');

    if (!modal) return;

    if (product) {
        modalTitle.innerHTML = '<i class="fas fa-edit"></i> Editar Produto';
        // Preencher campos com dados do produto
        if (window.AdminPanel && window.AdminPanel.populateProductForm) {
            window.AdminPanel.populateProductForm(product);
        }
    } else {
        modalTitle.innerHTML = '<i class="fas fa-plus-circle"></i> Adicionar Produto';
        form.reset();
        // Reset estados visuais
        resetFormStates();
    }

    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Focus no primeiro campo
    setTimeout(() => {
        document.getElementById('productName')?.focus();
    }, 100);
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    const modalContent = modal?.querySelector('.modal-content');

    if (modalContent) {
        modalContent.style.animation = 'modalSlideOut 0.3s ease-in';
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            modalContent.style.animation = '';
        }, 300);
    }
}

function resetFormStates() {
    // Remove todos os estados de erro/sucesso
    document.querySelectorAll('.form-group').forEach(group => {
        group.classList.remove('error', 'success');
    });

    // Remove mensagens de erro
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.remove();
    });

    // Reset toggle de promoção
    const salePriceInput = document.getElementById('productSalePrice');
    if (salePriceInput) {
        salePriceInput.disabled = true;
        salePriceInput.parentElement.style.opacity = '0.6';
    }

    // Reset preview de imagem
    const imagePreview = document.getElementById('imagePreview');
    if (imagePreview) {
        imagePreview.src = '../assets/images/gerais/iconeBaronesa.png';
    }
}

// Função global para integração com AdminPanel
window.updateProductImagePreview = function(imageUrl) {
    const preview = document.getElementById('imagePreview');
    if (preview) {
        preview.src = imageUrl || '../assets/images/gerais/iconeBaronesa.png';
    }
};

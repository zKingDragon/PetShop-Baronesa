/**
 * Utilitário para resolver caminhos relativos
 * Funciona em hospedagens como GitHub Pages
 */

/**
 * Resolve caminho baseado na localização atual
 * @param {string} path - Caminho relativo
 * @returns {string} - Caminho resolvido
 */
function resolvePath(path) {
    // Detectar se estamos na pasta html/ ou na raiz
    const isInHtmlFolder = window.location.pathname.includes('/html/');
    
    if (isInHtmlFolder) {
        // Se estamos na pasta html/, usar caminho relativo para subir um nível
        if (path.startsWith('./')) {
            return path.replace('./', '../');
        }
        if (!path.startsWith('../') && !path.startsWith('http')) {
            return '../' + path;
        }
        return path;
    } else {
        // Se estamos na raiz, usar caminho direto
        if (path.startsWith('../')) {
            return path.replace('../', './');
        }
        if (!path.startsWith('./') && !path.startsWith('http') && !path.startsWith('/')) {
            return './' + path;
        }
        return path;
    }
}

/**
 * Aplica correções de caminhos aos elementos da página
 */
function fixPaths() {
    // Corrigir imagens
    const images = document.querySelectorAll('img[src]');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            img.src = resolvePath(src);
        }
    });
    
    // Corrigir links CSS
    const links = document.querySelectorAll('link[href]');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.includes('cdnjs') && !href.includes('googleapis')) {
            link.href = resolvePath(href);
        }
    });
    
    // Corrigir scripts
    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http') && !src.includes('gstatic') && !src.includes('cdnjs')) {
            script.src = resolvePath(src);
        }
    });
    
    // Corrigir links de navegação
    const navLinks = document.querySelectorAll('a[href]');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && !href.startsWith('#') && !href.startsWith('mailto:') && !href.startsWith('tel:')) {
            link.href = resolvePath(href);
        }
    });
}

/**
 * Corrige caminhos de imagens com erro
 */
function fixImageErrors() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.onerror = function() {
            // Tentar caminho alternativo para a imagem padrão
            const defaultImage = resolvePath('assets/images/gerais/iconeBaronesa.png');
            if (this.src !== defaultImage) {
                this.src = defaultImage;
            }
        };
    });
}

// Aplicar correções quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    fixPaths();
    fixImageErrors();
});

// Disponibilizar funções globalmente
window.resolvePath = resolvePath;
window.fixPaths = fixPaths;
window.fixImageErrors = fixImageErrors;

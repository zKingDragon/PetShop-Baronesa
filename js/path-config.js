/**
 * Configuração de caminhos para GitHub Pages
 * Pet Shop Baronesa
 */

// Configuração base para diferentes ambientes
const PathConfig = {
    // Detectar se estamos no GitHub Pages
    isGitHubPages: window.location.hostname.includes('github.io'),
    
    // Base path para GitHub Pages (nome do repositório)
    gitHubBasePath: '/PetShop-Baronesa',
    
    // Função para obter o caminho base correto
    getBasePath: function() {
        if (this.isGitHubPages) {
            return this.gitHubBasePath;
        }
        return '';
    },
    
    // Função para resolver caminhos
    resolve: function(path) {
        // Se é uma URL absoluta, retorna como está
        if (path.startsWith('http') || path.startsWith('//')) {
            return path;
        }
        
        // Se é um caminho absoluto local, retorna como está
        if (path.startsWith('/')) {
            return this.getBasePath() + path;
        }
        
        // Para caminhos relativos, precisamos ajustar baseado na localização atual
        const currentPath = window.location.pathname;
        const isInHtmlFolder = currentPath.includes('/html/');
        
        if (isInHtmlFolder) {
            // Estamos na pasta html/
            if (path.startsWith('../')) {
                return this.getBasePath() + '/' + path.substring(3);
            } else {
                return this.getBasePath() + '/' + path;
            }
        } else {
            // Estamos na raiz
            if (path.startsWith('../')) {
                return this.getBasePath() + '/' + path.substring(3);
            } else if (path.startsWith('./')) {
                return this.getBasePath() + '/' + path.substring(2);
            } else {
                return this.getBasePath() + '/' + path;
            }
        }
    }
};

// Sobrescrever a função resolvePath original
window.resolvePath = function(path) {
    return PathConfig.resolve(path);
};

// Aplicar correções automáticas
function applyPathCorrections() {
    // Aguardar o DOM estar pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyPathCorrections);
        return;
    }
    
    // Corrigir imagens
    document.querySelectorAll('img[src]').forEach(img => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('http') && !src.startsWith('data:')) {
            img.src = PathConfig.resolve(src);
        }
    });
    
    // Corrigir links CSS (apenas os locais)
    document.querySelectorAll('link[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && !href.startsWith('http') && 
            !href.includes('cdnjs') && 
            !href.includes('googleapis') && 
            !href.includes('gstatic')) {
            link.href = PathConfig.resolve(href);
        }
    });
    
    // Corrigir scripts (apenas os locais)
    document.querySelectorAll('script[src]').forEach(script => {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http') && 
            !src.includes('gstatic') && 
            !src.includes('cdnjs') && 
            !src.includes('googleapis')) {
            script.src = PathConfig.resolve(src);
        }
    });
    
    // Corrigir links de navegação
    document.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href');
        if (href && 
            !href.startsWith('http') && 
            !href.startsWith('#') && 
            !href.startsWith('mailto:') && 
            !href.startsWith('tel:') &&
            !href.startsWith('javascript:')) {
            link.href = PathConfig.resolve(href);
        }
    });
}

// Aplicar correções quando o script carregar
applyPathCorrections();

// Exportar configuração
window.PathConfig = PathConfig;

console.log('Path Utils carregado - Ambiente:', PathConfig.isGitHubPages ? 'GitHub Pages' : 'Local');

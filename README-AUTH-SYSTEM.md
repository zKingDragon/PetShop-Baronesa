# 🔐 Sistema de Autenticação Baseado em Banco de Dados - Pet Shop Baronesa

## 📋 Visão Geral

Este sistema de autenticação substitui completamente o sistema anterior baseado em emails hardcoded por uma solução robusta e dinâmica que utiliza o campo "Type" da tabela "usuarios" no banco de dados Firestore para determinar permissões de acesso.

## 🎯 Principais Funcionalidades

### ✅ Autenticação Baseada em Banco de Dados
- **Verificação Dinâmica**: Todas as permissões são verificadas em tempo real no banco de dados
- **Campo "Type"**: Utiliza o campo `type` ou `Type` da coleção `usuarios` no Firestore
- **Valores Suportados**: `"user"` (usuário comum) e `"admin"` (administrador)
- **Cache Inteligente**: Sistema de cache com localStorage para otimizar performance

### 🚀 Performance e Otimização
- **Cache de 5 minutos**: Reduz consultas desnecessárias ao banco
- **Fallback Robusto**: Sistema de fallback para garantir funcionamento mesmo com problemas de conectividade
- **Limpeza Automática**: Cache é limpo automaticamente no logout e mudanças críticas

### 🔒 Segurança
- **Verificação Server-Side**: Todas as permissões são sempre verificadas no banco
- **Middleware de Proteção**: Proteção automática de páginas administrativas
- **Limpeza de Dados**: Dados sensíveis são limpos automaticamente

## 📁 Estrutura dos Arquivos

### 🆕 Arquivos Criados/Atualizados

```
js/
├── auth.js                  ✅ ATUALIZADO - Sistema principal de autenticação
├── footer-permissions.js    ✅ ATUALIZADO - Gerenciamento de permissões no footer
├── index-permissions.js     🆕 NOVO - Permissões para a página inicial
├── admin-middleware.js      🆕 NOVO - Middleware de proteção admin
└── user-management.js       🆕 NOVO - Sistema de gerenciamento de usuários

html/
├── admin.html              ✅ ATUALIZADO - Adicionada proteção e aba de usuários
├── footer.html             ✅ JÁ TINHA - Elementos baseados em permissões
└── index.html              ✅ ATUALIZADO - Elementos para permissões dinâmicas

css/
└── footer-permissions.css  ✅ JÁ EXISTIA - Estilos para elementos de permissão

teste-sistema-auth.html     🆕 NOVO - Página de testes completa
```

## 🔧 Principais Funções do Sistema

### 📄 `js/auth.js` - Sistema Principal

#### Funções Principais:
```javascript
// Verificação de tipo de usuário no banco
async checkUserType(uid)

// Obter usuário atual
getCurrentUser()

// Obter tipo de usuário atual
async getCurrentUserType()

// Verificações de permissão
async isAdmin(user = null)
async isUser(user = null)

// Atualizar tipo de usuário (admin only)
async updateUserType(uid, newType)

// Limpeza de cache
clearUserTypeCache()

// Login/Logout
async login(email, password)
async logout()
```

#### Cache System:
- **Duração**: 5 minutos
- **Armazenamento**: localStorage + memória
- **Invalidação**: Automática no logout e mudanças de permissão

### 🦶 `js/footer-permissions.js` - Permissões do Footer

#### Classes de Permissão:
- `.guest-only` - Visível apenas para visitantes
- `.user-only` - Visível para usuários logados (user + admin)
- `.admin-only` - Visível apenas para administradores

#### Elementos Dinâmicos:
- Links de login/logout
- Informações do usuário
- Indicadores de admin (👑)
- Links administrativos

### 🏠 `js/index-permissions.js` - Permissões da Página Inicial

#### Funcionalidades:
- **Promoções Personalizadas**: Diferentes para guests, users e admins
- **Saudações Personalizadas**: Nome do usuário e status
- **Ações Rápidas Admin**: Links diretos para funcionalidades administrativas
- **Indicadores Visuais**: Badges e elementos específicos por tipo de usuário

### 🛡️ `js/admin-middleware.js` - Proteção de Páginas

#### Recursos:
- **Proteção Automática**: Verifica permissões antes de carregar páginas admin
- **Redirecionamento Inteligente**: Redireciona não-autorizados para páginas apropriadas
- **Mensagens de Erro**: Interfaces amigáveis para erros de permissão
- **Atalhos de Teclado**: Ctrl+Alt+P, Ctrl+Alt+U, Ctrl+Alt+H para ações rápidas

#### Páginas Protegidas:
- `/admin.html`
- `/html/admin.html` 
- `admin.html`

### 👥 `js/user-management.js` - Gerenciamento de Usuários

#### Funcionalidades:
- **Listagem de Usuários**: Todos os usuários da coleção `usuarios`
- **Mudança de Tipo**: Promover/rebaixar entre user ↔ admin
- **Filtros e Busca**: Por tipo, nome, email
- **Ações em Lote**: Múltiplas operações simultâneas
- **Exclusão de Usuários**: Com confirmação de segurança

#### Interface:
- Tabela responsiva com paginação
- Filtros dinâmicos
- Indicadores visuais (👑 para admins)
- Estatísticas em tempo real

## 🎮 Como Usar

### 1. **Verificar Permissões**
```javascript
// Verificar se usuário é admin
const isAdmin = await window.auth.isAdmin();

// Verificar tipo específico
const userType = await window.auth.getCurrentUserType();

// Verificar autenticação
const isAuthenticated = window.auth.isAuthenticated();
```

### 2. **Usar Classes CSS de Permissão**
```html
<!-- Visível apenas para visitantes -->
<div class="guest-only">
    <a href="login.html">Faça Login</a>
</div>

<!-- Visível para usuários logados -->
<div class="user-only">
    <a href="promocoes.html">Promoções</a>
</div>

<!-- Visível apenas para admins -->
<div class="admin-only">
    <a href="admin.html">Painel Admin</a>
</div>
```

### 3. **Gerenciar Usuários (Admin Only)**
```javascript
// Atualizar tipo de usuário
await window.auth.updateUserType(userId, 'admin');

// Acessar gerenciamento de usuários
window.userManagement.loadUsers();
```

### 4. **Proteger Páginas**
```javascript
// Verificação automática em admin.html
// O middleware executa automaticamente

// Verificação manual
const hasAccess = await window.adminMiddleware.hasAdminAccess();
```

## 🗄️ Estrutura do Banco de Dados

### Coleção: `usuarios`
```json
{
  "userId": {
    "name": "Nome do Usuário",
    "email": "usuario@exemplo.com",
    "type": "user", // ou "admin"
    "Type": "user", // Compatibilidade
    "createdAt": "timestamp",
    "lastLogin": "timestamp",
    "updatedAt": "timestamp"
  }
}
```

### Valores do Campo `type`:
- **`"user"`**: Usuário comum (acesso a promoções, carrinho, etc.)
- **`"admin"`**: Administrador (acesso total + painel administrativo)

## 🔄 Fluxo de Autenticação

### 1. **Login**
```
Usuário faz login → Firebase Auth → Busca tipo no Firestore → Cache → UI atualizada
```

### 2. **Verificação de Permissão**
```
Página carrega → Middleware verifica → Cache consultado → Banco consultado (se necessário) → Decisão tomada
```

### 3. **Logout**
```
Logout iniciado → Cache limpo → Firebase logout → localStorage limpo → UI atualizada → Redirecionamento
```

## 🧪 Sistema de Testes

### Arquivo: `teste-sistema-auth.html`

#### Categorias de Teste:
1. **Status Atual**: Verificação do estado do sistema
2. **Autenticação**: Testes básicos de login/logout
3. **Permissões**: Verificação de roles e tipos
4. **Cache**: Performance e funcionamento do cache
5. **Middleware**: Proteção de páginas
6. **Gerenciamento**: Funções administrativas
7. **Integração**: Testes entre componentes

#### Como Usar:
1. Abra `teste-sistema-auth.html` no navegador
2. Execute testes individuais ou todos de uma vez
3. Verifique resultados em tempo real
4. Use ações rápidas para simulações

## 🛠️ Configuração e Instalação

### 1. **Firebase Setup**
Certifique-se de que o Firebase está configurado em `js/firebase-config.js`:
```javascript
// Configuração do Firestore
const db = firebase.firestore();
const auth = firebase.auth();
```

### 2. **Estrutura HTML**
Adicione os scripts necessários:
```html
<!-- Firebase -->
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js"></script>

<!-- Sistema de Auth -->
<script src="js/firebase-config.js"></script>
<script src="js/auth.js"></script>
<script src="js/footer-permissions.js"></script>
<script src="js/index-permissions.js"></script>
<script src="js/admin-middleware.js"></script>
<script src="js/user-management.js"></script>
```

### 3. **Elementos HTML de Permissão**
Adicione containers para elementos dinâmicos:
```html
<!-- Na página inicial -->
<div id="guest-cta" class="guest-only" style="display: none;"></div>
<div id="user-promotions" class="user-only" style="display: none;"></div>
<div id="admin-quick-actions" class="admin-only" style="display: none;"></div>

<!-- No admin.html -->
<div id="user-management-container"></div>
```

## 📱 Compatibilidade

### ✅ Sistemas Suportados:
- **GitHub Pages**: Totalmente compatível
- **Firebase Hosting**: Totalmente compatível
- **Dispositivos Móveis**: Interface responsiva
- **Navegadores**: Chrome, Firefox, Safari, Edge

### 🔧 Dependências:
- **Firebase SDK v9**: Auth + Firestore
- **Font Awesome**: Ícones
- **CSS Grid/Flexbox**: Layout responsivo

## 🚨 Resolução de Problemas

### **Erro: "Auth system not available"**
```javascript
// Aguardar inicialização
await new Promise(resolve => {
    const checkAuth = () => {
        if (typeof window.auth !== 'undefined') {
            resolve();
        } else {
            setTimeout(checkAuth, 100);
        }
    };
    checkAuth();
});
```

### **Cache não funcionando**
```javascript
// Limpar cache manualmente
window.auth.clearUserTypeCache();

// Verificar localStorage
console.log(localStorage.getItem('petshop_user_type'));
```

### **Permissões não atualizando**
```javascript
// Forçar atualização
await window.footerPermissionManager.refreshPermissions();
await window.indexPermissionManager.refreshPermissions();
```

## 🔮 Próximos Passos

### 📋 Melhorias Planejadas:
- [ ] Sistema de roles mais granular
- [ ] Logs de auditoria
- [ ] Notificações em tempo real
- [ ] Interface de configuração
- [ ] Backup automático de permissões

### 🔧 Otimizações:
- [ ] Service Worker para cache offline
- [ ] Lazy loading de componentes
- [ ] Compressão de dados
- [ ] Métricas de performance

## 📞 Suporte

Para dúvidas ou problemas com o sistema de autenticação:

1. **Verifique o arquivo de testes**: `teste-sistema-auth.html`
2. **Console do navegador**: Erros detalhados são logados
3. **Firebase Console**: Verifique a estrutura da coleção `usuarios`
4. **Network tab**: Monitore chamadas para o Firestore

---

**Sistema desenvolvido para Pet Shop Baronesa**  
*Versão: 2.0 - Database-Driven Authentication*  
*Data: Janeiro 2025*

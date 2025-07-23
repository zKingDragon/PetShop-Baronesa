# Sistema de Proteção de Rotas - Pet Shop Baronesa

## 🔐 Segurança Implementada

O sistema agora possui proteção avançada para páginas administrativas sensíveis.

### Páginas Protegidas

- ✅ `admin-login.html` - Login administrativo
- ✅ `admin.html` - Painel administrativo principal
- ⚠️ `user-management.html` - (se existir, adicionar proteção)

### Como Funciona

1. **Token Secreto**: `BARONESA_ADMIN_2025_SECURE_TOKEN`
2. **Verificação Automática**: O script executa imediatamente ao carregar a página
3. **Sessão Temporária**: Token válido por 60 minutos após acesso autorizado
4. **Redirecionamento**: Usuários não autorizados são redirecionados para a página inicial

### 🚀 Como Acessar (Para Desenvolvedores)

#### Método 1: URL com Token
```
http://localhost/html/admin-login.html?access_key=PSB_ADM_2024_7x9k2mB8nQ5wE3r1vT6y
```

#### Método 2: Console do Navegador
1. Abra o console do navegador (F12)
2. Digite: `RouteProtection.getAdminURL()`
3. Copie a URL gerada e acesse

#### Método 3: URLs para Páginas Específicas
```javascript
// No console do navegador
RouteProtection.getAdminURLFor('admin-login.html')
RouteProtection.getAdminURLFor('admin.html')
```

### 🛠️ Configurações de Segurança

O arquivo `js/route-protection.js` contém:

```javascript
const SECURITY_CONFIG = {
    SECRET_TOKEN: 'PSB_ADM_2024_7x9k2mB8nQ5wE3r1vT6y', // ⚠️ ALTERE EM PRODUÇÃO
    PROTECTED_PAGES: ['admin-login.html', 'admin.html'],
    REDIRECT_PAGE: '../index.html',
    TOKEN_VALIDITY: 60, // minutos
    TOKEN_PARAM: 'access_key',
    REDIRECT_DELAY: 500 // ms
};
```

### 🔧 Para Alterar o Token

1. Edite o arquivo `js/route-protection.js`
2. Modifique a constante `SECRET_TOKEN`
3. **IMPORTANTE**: Use um token único e complexo em produção

### 🎯 Exemplo de Token Seguro

```javascript
SECRET_TOKEN: 'PSB_' + btoa(Date.now().toString()).replace(/=/g, '') + '_ADMIN'
```

### 📋 Comandos Úteis (Console)

```javascript
// Gerar URL de acesso para página atual
RouteProtection.getAdminURL()

// Gerar URL para página específica
RouteProtection.getAdminURLFor('admin-login.html')
RouteProtection.getAdminURLFor('admin.html')

// Limpar sessão (forçar re-autenticação)
RouteProtection.clearSecuritySession()

// Verificar se página é protegida
RouteProtection.isProtectedPage()

// Verificar se tem sessão válida
RouteProtection.hasValidSession()

// Ver configurações do sistema
RouteProtection.getConfig()
```

### ⚠️ Avisos de Segurança

1. **NUNCA** compartilhe o token secreto publicamente
2. **SEMPRE** altere o token antes do deploy em produção
3. **CONSIDERE** usar tokens dinâmicos ou rotacionamento automático
4. **MONITORE** logs de acesso para detectar tentativas não autorizadas

### 🔄 Sessão e Validade

- **Duração**: 60 minutos por padrão
- **Armazenamento**: SessionStorage (limpa ao fechar aba)
- **Renovação**: Automática enquanto a aba estiver ativa
- **Limpeza**: Automática ao expirar ou fechar navegador

### 🚨 Em Caso de Emergência

Se você perder acesso:

1. **Método 1**: Temporariamente comente a linha de proteção no HTML
2. **Método 2**: Acesse via console com `RouteProtection.getAdminURL()`
3. **Método 3**: Edite o token no arquivo `route-protection.js`

### 📊 Status da Implementação

- ✅ Proteção ativa
- ✅ Redirecionamento funcional
- ✅ Sessão temporária
- ✅ Limpeza automática de URL
- ✅ Funções de debug disponíveis
- ✅ Logs detalhados no console

---

**Desenvolvido para Pet Shop Baronesa** 🐾
*Sistema de segurança implementado em 2024*

# 🔐 Sistema de Proteção de Rotas - Pet Shop Baronesa

## � Estrutura de Proteção

### 🔑 Proteção por Token (admin-login.html)
- **Acesso:** Apenas com token na URL
- **URL:** `/html/admin-login.html?access_key=PSB_LOGIN_2024_SecretKey789`
- **Finalidade:** Permitir acesso ao formulário de login via link compartilhado

### 🛡️ Proteção por Autenticação (admin.html)
- **Acesso:** Apenas usuários logados
- **URL:** `/html/admin.html` (sem token necessário)
- **Finalidade:** Área administrativa restrita a usuários autenticados

## 🚀 Como Usar

### Para Administradores
1. **Primeiro Acesso:** Use o link com token para acessar a página de login
2. **Fazer Login:** Entre com suas credenciais na página de login
3. **Acessar Painel:** Após login, acesse admin.html normalmente

### Para Desenvolvedores
```javascript
// Gerar link de login
RouteProtection.getLoginURL()

// Verificar se pode acessar admin
RouteProtection.canAccessAdmin()

// Ir para painel admin (se logado)
RouteProtection.goToAdmin()

// Limpar sessão
RouteProtection.clearSecuritySession()
```

## � Configuração

### Token de Login
```javascript
LOGIN_TOKEN: 'PSB_LOGIN_2024_SecretKey789'
```

### Páginas Protegidas
```javascript
PROTECTED_PAGES: {
    'admin-login.html': 'token',     // Requer token
    'admin.html': 'auth',            // Requer login
    'user-management.html': 'auth'   // Requer login
}
```

## �️ Recursos de Segurança

✅ **Bloqueio Imediato:** Conteúdo oculto antes da verificação
✅ **Limpeza de URL:** Token removido automaticamente após validação
✅ **Sessão Temporária:** Token válido por 2 horas
✅ **Redirecionamento:** Acesso negado redireciona para página inicial
✅ **Múltiplas Verificações:** Firebase Auth, localStorage, sessionStorage

## ⚠️ Importante

1. **ALTERE O TOKEN** antes do deploy (`PSB_LOGIN_2024_SecretKey789`)
2. **Mantenha Secreto:** Nunca compartilhe o token publicamente
3. **Link Seguro:** Compartilhe apenas com administradores autorizados

## 📱 Fluxo de Acesso

```
1. Admin recebe link: admin-login.html?access_key=TOKEN
2. Sistema verifica token → Acesso liberado
3. Admin faz login no formulário
4. Após login → admin.html acessível normalmente
5. Sem login → admin.html bloqueado
```

### 📋 Comandos Úteis (Console)

```javascript
// Gerar URL de login com token
RouteProtection.getLoginURL()

// Verificar se pode acessar admin
RouteProtection.canAccessAdmin()

// Ir para área admin (se logado)
RouteProtection.goToAdmin()

// Simular login (para teste)
RouteProtection.simulateLogin()

// Simular logout (para teste)
RouteProtection.simulateLogout()

// Limpar sessão (forçar re-autenticação)
RouteProtection.clearSecuritySession()

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

- **Duração Login Token**: 120 minutos por padrão
- **Armazenamento**: SessionStorage (limpa ao fechar aba)
- **Renovação**: Automática enquanto a aba estiver ativa
- **Limpeza**: Automática ao expirar ou fechar navegador

### 🚨 Em Caso de Emergência

Se você perder acesso:

1. **Método 1**: Temporariamente comente a linha de proteção no HTML
2. **Método 2**: Acesse via console com `RouteProtection.getLoginURL()`
3. **Método 3**: Edite o token no arquivo `route-protection.js`
4. **Método 4**: Use `RouteProtection.simulateLogin()` para teste

### 📊 Status da Implementação

- ✅ Proteção ativa por token (login)
- ✅ Proteção ativa por autenticação (admin)
- ✅ Redirecionamento funcional
- ✅ Sessão temporária
- ✅ Limpeza automática de URL
- ✅ Funções de debug disponíveis
- ✅ Logs detalhados no console

---

**Desenvolvido para Pet Shop Baronesa** 🐾
*Sistema de segurança atualizado em 2024*

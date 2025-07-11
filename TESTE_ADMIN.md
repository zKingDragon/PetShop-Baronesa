# Como Testar o Sistema de Admin

## 🧪 **Instruções de Teste**

### 1. **Faça Login com conta admin**
1. Faça login normalmente
2. Abra o console do navegador (F12)
3. Execute o comando: `testAuth()`

### 2. **O que deve aparecer no console:**
```
=== TESTE DE AUTENTICAÇÃO ===
👤 Usuário logado: seuemail@gmail.com
🔑 Tipo de usuário: admin
👑 É admin? true
🎨 Links admin encontrados: 1
   - Painel Admin Visível: true
🛡️ Badge de admin: Presente
```

### 3. **O que deve aparecer visualmente:**
- ✅ Dropdown do usuário no lugar do botão "Cadastre-se"
- ✅ Ícone de escudo (🛡️) ao lado do nome do usuário
- ✅ Link "Painel Admin" visível no dropdown

### 4. **Se não funcionar:**

#### Passo 1: Força atualização
```javascript
updateHeader()
```

#### Passo 2: Limpa cache
```javascript
clearCache()
updateHeader()
```

#### Passo 3: Recria dropdown
```javascript
recreateDropdown()
```

### 5. **Verificação Manual:**
Execute no console:
```javascript
// Ver tipo do usuário atual
firebase.auth().currentUser
window.auth.checkUserType(firebase.auth().currentUser.uid)

// Ver se dropdown existe
document.querySelector('.user-dropdown')

// Ver links de admin
document.querySelectorAll('.admin-only')
```

## 🔧 **Principais Correções Feitas:**

1. ✅ **Coleção correta**: Agora busca em `Usuarios` (com U maiúsculo)
2. ✅ **Campo correto**: Agora busca `type` em vez de `userType`
3. ✅ **Badge visual**: Adiciona ícone de escudo para admins
4. ✅ **Logs detalhados**: Console mostra o que está acontecendo
5. ✅ **Funções de teste**: Ferramentas para diagnosticar problemas

## 🎯 **Se AINDA não funcionar:**

Isso indica que:
- O usuário não tem `type: "admin"` no banco de dados Firestore
- A coleção está com nome diferente
- Há problema de cache no navegador

Execute `testAuth()` e me envie o resultado completo do console!

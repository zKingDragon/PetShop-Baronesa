# Pet Shop Baronesa - Sistema de Autenticação

## 🔧 Configuração do Sistema

### Funcionalidades Implementadas:

1. **Sistema de Autenticação Completo**
   - Cadastro de novos usuários
   - Login/logout
   - Diferenciação entre usuários e admins
   - Persistência de sessão

2. **Interface Dinâmica**
   - Header com dropdown para usuários logados
   - Botão "Cadastre-se" para visitantes
   - Footer com links baseados em permissões
   - Controle de acesso a páginas

3. **Gerenciamento de Endereços**
   - Modal para adicionar endereço
   - Validação de campos obrigatórios
   - Integração com carrinho de compras

## 🚀 Como Usar

### Para Usuários Comuns:

1. **Cadastro**: Acesse a página de cadastro e preencha os dados
2. **Login**: Use email e senha para entrar
3. **Carrinho**: Adicione endereço antes de finalizar compra
4. **Navegação**: Acesse promoções e outras páginas exclusivas

### Para Admins:

1. **Primeiro Admin**: Execute o script `admin-setup.js` no console
2. **Acesso**: Login normal, mas com permissões extras
3. **Painel Admin**: Acesse através do dropdown do usuário

## 🛠️ Setup Inicial

### 1. Criar Primeiro Admin

```javascript
// No console do navegador (F12), após fazer login:
createAdmin()
```

### 2. Estrutura do Banco de Dados

A coleção `Usuarios` no Firestore deve ter:
```javascript
{
  uid: "id_do_usuario",
  name: "Nome do Usuário",
  email: "email@exemplo.com",
  phone: "telefone",
  type: "user" | "admin",
  Type: "user" | "admin", // compatibilidade
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### 3. Tipos de Usuário

- **guest**: Visitante não logado
- **user**: Usuário comum cadastrado
- **admin**: Administrador com permissões especiais

## 📁 Arquivos Principais

### JavaScript
- `js/auth.js` - Sistema de autenticação principal
- `js/header-auth.js` - Gerenciamento do header
- `js/footer-permissions.js` - Permissões do footer
- `js/forms.js` - Formulários (cadastro, endereço)
- `js/firebase-config.js` - Configuração do Firebase

### HTML
- `html/header.html` - Header com dropdown
- `html/footer.html` - Footer com permissões
- `html/cadastro.html` - Página de cadastro
- `html/login.html` - Página de login
- `html/carrinho.html` - Carrinho com endereços

### CSS
- `css/styles.css` - Estilos incluindo dropdown e endereços

## 🔒 Segurança

1. **Validações**: Campos obrigatórios e formatos
2. **Proteção**: Páginas protegidas por autenticação
3. **Roles**: Sistema de permissões baseado em roles
4. **Persistência**: Dados salvos no Firebase

## 🌐 GitHub Pages

Para funcionar no GitHub Pages:
1. Todos os caminhos são relativos
2. Links ajustados automaticamente
3. Carregamento dinâmico de header/footer
4. Fallbacks para diferentes estruturas de pasta

## 📱 Responsividade

- Mobile-first design
- Dropdown adaptativo
- Modal responsivo
- Navegação touch-friendly

## 🎯 Próximos Passos

1. **Testes**: Testar todas as funcionalidades
2. **Dados**: Adicionar mais usuários de teste
3. **Validações**: Melhorar feedback de erro
4. **Performance**: Otimizar carregamento

## 📞 Suporte

Para questões técnicas, verifique:
1. Console do navegador para erros
2. Firebase Console para dados
3. Network tab para requisições
4. Local Storage para persistência

---

**Desenvolvido para Pet Shop Baronesa** 🐾

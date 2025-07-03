# Pet Shop Baronesa 🐾

Sistema completo para pet shop com painel administrativo, catálogo de produtos, sistema de dicas dinâmicas e integração com Firebase.

## 🚀 Deploy no GitHub Pages

### Configuração Automática
O sistema está configurado para funcionar automaticamente no GitHub Pages. Os caminhos são resolvidos automaticamente pelo script `js/path-config.js`.

### Passos para Deploy:

1. **Fork ou Clone o Repositório**
   ```bash
   git clone https://github.com/seu-usuario/PetShop-Baronesa.git
   cd PetShop-Baronesa
   ```

2. **Configurar GitHub Pages**
   - Vá para Settings → Pages
   - Selecione "Deploy from a branch"
   - Escolha "main" branch
   - Escolha "/ (root)" como folder
   - Clique em "Save"

3. **Acessar o Site**
   - O site estará disponível em: `https://seu-usuario.github.io/PetShop-Baronesa`

### Configuração do Firebase (Opcional)
Para funcionalidades completas, configure o Firebase:

1. **Criar Projeto Firebase**
   - Acesse [Firebase Console](https://console.firebase.google.com/)
   - Crie um novo projeto
   - Ative Firestore Database e Authentication

2. **Configurar Credenciais**
   - Edite `js/firebase-config.js`
   - Substitua as credenciais pelas do seu projeto

3. **Configurar Regras do Firestore**
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

## 📁 Estrutura do Projeto

```
PetShop-Baronesa/
├── index.html              # Página inicial
├── html/                   # Páginas HTML
│   ├── admin.html          # Painel administrativo
│   ├── dicas.html          # Página de dicas
│   ├── catalogo.html       # Catálogo de produtos
│   └── ...
├── js/                     # Scripts JavaScript
│   ├── path-config.js      # Configuração de caminhos
│   ├── services/           # Serviços de dados
│   └── ...
├── css/                    # Arquivos de estilo
├── assets/                 # Imagens e recursos
└── README.md
```

## 🔧 Funcionalidades

### ✅ Implementadas
- **Sistema de Dicas Dinâmicas**
  - Painel admin para gerenciar dicas
  - Página pública com filtros
  - Integração com Firebase/Firestore
  - Sistema de abas no admin

- **Catálogo de Produtos**
  - Listagem dinâmica
  - Filtros por categoria
  - Carrinho de compras
  - Sistema de favoritos

- **Páginas Funcionais**
  - Home com carrossel
  - Agendamento de banho e tosa
  - Promoções
  - Sistema de login/cadastro

### 🛠️ Recursos Técnicos
- **Responsive Design**: Layout adaptável para mobile
- **Firebase Integration**: Banco de dados e autenticação
- **Path Resolution**: Caminhos automáticos para GitHub Pages
- **Progressive Enhancement**: Funciona com e sem JavaScript

## 🎯 Como Usar

### Para Administradores:
1. Acesse `/html/admin.html`
2. Navegue para a aba "Dicas"
3. Adicione, edite ou remova dicas
4. Apenas dicas "Publicadas" aparecem na página pública

### Para Usuários:
1. Acesse `/html/dicas.html`
2. Navegue pelas dicas usando filtros
3. Busque por palavras-chave
4. Explore o catálogo em `/html/catalogo.html`

## 📱 Compatibilidade

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Mobile (iOS/Android)
- ✅ GitHub Pages
- ✅ Netlify, Vercel
- ✅ Localhost

## 🔄 Atualizações Automáticas

O sistema verifica automaticamente por novas dicas a cada 30 segundos na página pública, garantindo que o conteúdo esteja sempre atualizado.

## 📞 Suporte

Para dúvidas ou problemas:
- Abra uma issue no GitHub
- Contate via WhatsApp: (13) 99682-5624
- Email: contato@petshopbaronesa.com

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

---

**Pet Shop Baronesa** - Cuidando do seu pet com amor desde 2015 🐾

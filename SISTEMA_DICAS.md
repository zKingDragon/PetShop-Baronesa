# Sistema de Dicas Dinâmicas - Pet Shop Baronesa

## Visão Geral

O sistema de dicas dinâmicas foi implementado para permitir que o administrador adicione, edite e gerencie dicas através do painel administrativo (admin.html), e essas dicas apareçam automaticamente na página pública de dicas (dicas.html).

## Estrutura do Sistema

### 1. Backend (Firebase/Firestore)
- **Coleção**: `Dicas`
- **Campos principais**:
  - `conteudo`: Texto da dica (conteúdo principal)
  - `dataDePublicacao`: Data de publicação da dica
  - `fileURL`: URL da imagem da dica
  - `title`: Título da dica
  - `category`: Categoria (Cachorros, Gatos, Pássaros, Geral)
  - `status`: Status da dica (published/draft)
  - `resumo`: Resumo da dica (para cards)
  - `tags`: Array de tags para classificação

### 2. Frontend - Painel Administrativo

#### Arquivo: `html/admin.html`
- Sistema de abas para alternar entre "Produtos" e "Dicas"
- Interface completa para CRUD de dicas
- Modais para adicionar/editar/excluir dicas
- Filtros e busca por dicas
- Estatísticas de dicas

#### Arquivo: `js/admin-tabs.js`
- Gerencia navegação entre abas
- Controla modais e formulários de dicas
- Integra com o serviço de dicas para operações CRUD
- Filtros e busca no admin

#### Arquivo: `css/admin-tabs.css`
- Estilos para as abas do admin
- Estilos para cards de dicas no admin
- Modais e formulários responsivos

### 3. Frontend - Página Pública

#### Arquivo: `html/dicas.html`
- Página pública que exibe dicas dinâmicas
- Filtros por categoria
- Busca por texto
- Cards responsivos para dicas
- Loading states e mensagens de erro

#### Arquivo: `js/tips-public.js`
- Carrega dicas publicadas do banco de dados
- Aplica filtros de categoria e busca
- Renderiza cards de dicas dinamicamente
- Atualização automática (polling)

#### Arquivo: `css/tips-public.css`
- Estilos para filtros e cards de dicas
- Grid responsivo para dicas
- Animações e transições

### 4. Serviço de Dados

#### Arquivo: `js/services/tips.js`
- Classe `TipsService` para integração com Firebase
- Métodos CRUD assíncronos
- Fallback para localStorage se Firebase não estiver disponível
- Cache local para melhor performance

## Funcionalidades Implementadas

### Para Administradores:
1. **Adicionar Dicas**:
   - Título, categoria, resumo, conteúdo
   - Status (rascunho/publicada)
   - Imagem (URL)
   - Tags para classificação
   - Data de publicação

2. **Editar Dicas**:
   - Todos os campos são editáveis
   - Preview de imagem
   - Validação de formulário

3. **Excluir Dicas**:
   - Modal de confirmação
   - Remoção do banco de dados

4. **Gerenciar Status**:
   - Alternar entre rascunho e publicada
   - Apenas dicas publicadas aparecem na página pública

5. **Filtros e Busca**:
   - Filtrar por categoria
   - Filtrar por status
   - Buscar por texto

6. **Estatísticas**:
   - Total de dicas
   - Dicas publicadas
   - Dicas recentes

### Para Usuários Públicos:
1. **Visualizar Dicas**:
   - Cards com imagem, título, resumo
   - Data de publicação
   - Tags da dica
   - Categoria visual

2. **Filtros**:
   - Filtrar por categoria (Cachorros, Gatos, Pássaros, Geral)
   - Buscar por texto (título, resumo, tags)
   - Contador de dicas encontradas

3. **Responsividade**:
   - Layout adaptável para mobile
   - Cards otimizados para diferentes tamanhos de tela

## Integração com Firebase

### Configuração:
1. O sistema usa Firebase/Firestore como banco de dados
2. Fallback para localStorage se Firebase não estiver disponível
3. Configuração no arquivo `js/firebase-config.js`

### Estrutura de Dados:
```javascript
{
  title: "Título da dica",
  category: "Cachorros|Gatos|Pássaros|Geral",
  status: "published|draft",
  dataDePublicacao: "2024-01-15",
  fileURL: "https://exemplo.com/imagem.jpg",
  resumo: "Resumo da dica para o card",
  conteudo: "Conteúdo completo da dica",
  tags: ["saúde", "alimentação", "cuidados"]
}
```

## Fluxo de Dados

1. **Adicionar Dica**:
   - Admin preenche formulário → `TipsService.addTip()` → Firebase → Atualiza interface

2. **Visualizar Dicas Públicas**:
   - Página carrega → `TipsService.getPublishedTips()` → Firebase → Renderiza cards

3. **Filtrar Dicas**:
   - Usuário filtra → JavaScript local → Atualiza exibição

4. **Editar Dica**:
   - Admin edita → `TipsService.updateTip()` → Firebase → Atualiza interfaces

## Arquivos Principais

```
html/
├── admin.html          # Painel administrativo
├── dicas.html          # Página pública de dicas

js/
├── admin-tabs.js       # Lógica do admin
├── tips-public.js      # Lógica da página pública
├── services/
│   └── tips.js         # Serviço de dados

css/
├── admin-tabs.css      # Estilos do admin
└── tips-public.css     # Estilos da página pública
```

## Próximos Passos

1. **Upload de Imagens**:
   - Integrar com Firebase Storage
   - Upload direto de arquivos
   - Redimensionamento automático

2. **Editor de Texto Rico**:
   - Formatação avançada para conteúdo
   - Inserção de links e listas
   - Preview em tempo real

3. **Notificações**:
   - Notificar quando novas dicas são publicadas
   - Sistema de assinatura de categorias

4. **Analytics**:
   - Visualizações de dicas
   - Dicas mais populares
   - Relatórios de engajamento

## Considerações Técnicas

- **Performance**: Cache local + sincronização com Firebase
- **Fallback**: Sistema funciona mesmo se Firebase estiver offline
- **Validação**: Validação client-side e server-side
- **Responsividade**: Design mobile-first
- **Acessibilidade**: Estrutura semântica e navegação por teclado

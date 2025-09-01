# Sistema Dinâmico de Preços - Banho & Tosa

## 📋 Funcionalidade Implementada

Foi adicionada uma nova aba **"Serviços B&T"** no painel administrativo que permite alterar dinamicamente os preços dos serviços de banho e tosa com **persistência no banco de dados Firebase Firestore**.

## 🎯 Como Usar

### 1. Acessar o Painel Administrativo

```
URL: http://localhost:5000/html/admin-login.html?access_key=PSB_LOGIN_2024_SecretKey789
```

### 2. Navegar para a Aba "Serviços B&T"

1. Faça login no painel administrativo
2. Clique na aba "Serviços B&T" (ícone de tesoura)
3. Você verá o status de conexão com o banco de dados
4. Configure os preços no formulário

### 3. Configurar os Preços

#### Preços Base:
- **Cães**: Configure preços por porte (Pequeno, Médio, Grande, Gigante)
- **Gatos**: Configure preços únicos
- **Serviços**: Banho, Tosa Higiênica, Tosa Total, Banho e Tosa

#### Serviços Adicionais:
- **Corte de Unhas**: Preços separados para cães e gatos
- **Limpeza de Ouvidos**: Preços separados para cães e gatos
- **Hidratação**: Percentual do preço base + valor mínimo
- **Perfumaria**: Preços fixos
- **Desembolo de Nós**: Preços por tipo de pelagem

#### Multiplicadores:
- **Pelagem Curta**: 1.0 (padrão)
- **Pelagem Média**: 1.05 (5% a mais)
- **Pelagem Longa**: 1.10 (10% a mais)

### 4. Botões de Ação

1. **"Carregar do Banco"**: Carrega os preços salvos no Firestore
2. **"Sincronizar"**: Força a sincronização com o banco de dados
3. **"Salvar no Banco"**: Salva as alterações diretamente no Firestore
4. **"Restaurar Padrão"**: Volta aos valores padrão do sistema

## 🗄️ Persistência no Banco de Dados

### Firebase Firestore
- **Coleção**: `settings`
- **Documento**: `servicePricing`
- **Estrutura**:
  ```javascript
  {
    pricing: { /* objeto com todos os preços */ },
    lastUpdated: "2025-09-01T12:00:00.000Z",
    updatedBy: "admin@petshop.com"
  }
  ```

### Sistema de Fallback
1. **Primeiro**: Tenta carregar do Firestore (banco de dados)
2. **Segundo**: Usa cache do localStorage (se disponível)
3. **Terceiro**: Carrega do arquivo JSON original (fallback)

## 🔄 Funcionalidades Avançadas

### Atualização em Tempo Real
- ✅ **Firestore Realtime**: Mudanças refletem automaticamente em todas as páginas abertas
- ✅ **Cache Local**: localStorage sincronizado automaticamente
- ✅ **Notificações**: Usuários veem quando preços são atualizados

### Sistema de Auditoria
- ✅ **Timestamp**: Registra quando os preços foram alterados
- ✅ **Usuário**: Registra quem fez a alteração
- ✅ **Histórico**: Mantém registro das últimas sincronizações

### Indicadores Visuais
- 🟢 **Conectado**: Firebase disponível e funcionando
- 🔴 **Desconectado**: Usando dados locais/arquivo JSON
- ⏰ **Última Sync**: Mostra quando foi a última sincronização

## 📂 Arquivos Modificados/Criados

### Novos Arquivos:
- `js/services/service-pricing-manager.js` - Gerenciador de preços com Firestore

### Arquivos Modificados:
- `html/admin.html` - Nova aba com indicadores de status
- `css/admin-tabs.css` - Estilos para nova aba e status
- `js/admin.js` - Suporte à nova aba
- `js/banho-tosa.js` - Carregamento do Firestore + tempo real
- `docs/SERVICOS_DINAMICOS.md` - Esta documentação

## 🎨 Interface da Nova Aba

A interface inclui:

1. **Status de Conexão**
   - Indicador visual de conexão com o banco
   - Timestamp da última sincronização

2. **Seção de Preços Base**
   - Cards organizados por tipo de animal
   - Inputs para cada combinação de porte/serviço

3. **Seção de Adicionais**
   - Cards para cada tipo de adicional
   - Configurações específicas por tipo

4. **Seção de Multiplicadores**
   - Configuração de multiplicadores por pelagem

5. **Botões de Ação**
   - Carregar do banco
   - Sincronizar dados
   - Salvar no banco
   - Restaurar padrão

## 🚀 Benefícios com Banco de Dados

- ✅ **Persistente**: Dados salvos permanentemente no Firestore
- ✅ **Tempo Real**: Atualizações instantâneas em todas as páginas
- ✅ **Confiável**: Sistema de fallback para garantir funcionamento
- ✅ **Auditável**: Registro de quem e quando alterou
- ✅ **Escalável**: Suporta múltiplos administradores simultaneamente
- ✅ **Sincronizado**: Todos os dispositivos sempre atualizados

## 🔧 Para Desenvolvedores

### Estrutura no Firestore:

```javascript
// Documento: settings/servicePricing
{
  pricing: {
    "currency": "BRL",
    "base": {
      "Cao": {
        "Pequeno": { "Banho": 45, "TosaHigienica": 55, ... },
        // ... outros portes
      },
      "Gato": {
        "Unico": { "Banho": 70, "TosaHigienica": 85, ... }
      }
    },
    "addons": { ... },
    "coatMultipliers": { "Curta": 1.0, "Media": 1.05, "Longa": 1.10 }
  },
  lastUpdated: "2025-09-01T12:00:00.000Z",
  updatedBy: "admin@petshop.com"
}
```

### Event Listeners:

```javascript
// Escutar mudanças do painel admin
window.addEventListener('servicePricingUpdated', (event) => {
  const newPricing = event.detail.pricing;
  // Atualizar sistema conforme necessário
});

// Escutar mudanças em tempo real do Firestore
db.collection('settings').doc('servicePricing').onSnapshot((doc) => {
  if (doc.exists) {
    const data = doc.data();
    // Processar mudanças
  }
});
```

### API do ServicePricingManager:

```javascript
// Métodos disponíveis
await servicePricingManager.loadCurrentPrices(); // Carrega do Firestore
await servicePricingManager.savePrices();        // Salva no Firestore
await servicePricingManager.syncFromFirestore(); // Força sincronização
servicePricingManager.resetToDefault();          // Restaura padrão
servicePricingManager.updateConnectionStatus();  // Atualiza status UI
```

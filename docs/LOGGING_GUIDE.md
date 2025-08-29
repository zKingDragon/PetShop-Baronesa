# Sistema de Logging Profissional - PetShop Baronesa

## 📋 Visão Geral

Sistema profissional de logging que substitui `console.log` por um sistema inteligente que:

- ✅ **Desenvolvimento**: Logs coloridos e detalhados  
- ✅ **Produção**: Apenas erros críticos
- ✅ **Performance**: Não impacta a experiência do usuário
- ✅ **Profissional**: Sem logs desnecessários no console público

## 🚀 Como Usar

### Configuração de Ambiente

```javascript
// Em js/utils/debug-config.js
window.DEBUG_MODE = true;  // ← ALTERE PARA false EM PRODUÇÃO
```

### Tipos de Log Disponíveis

```javascript
// 1. ERRO (sempre exibido)
logError('ModuleName', 'Mensagem de erro', errorObject);
Logger.error('ModuleName', 'Mensagem de erro', errorObject);

// 2. AVISO (sempre exibido)  
logWarn('ModuleName', 'Mensagem de aviso', dataObject);
Logger.warn('ModuleName', 'Mensagem de aviso', dataObject);

// 3. INFORMAÇÃO (apenas desenvolvimento)
logInfo('ModuleName', 'Mensagem informativa', dataObject);
Logger.info('ModuleName', 'Mensagem informativa', dataObject);

// 4. DEBUG (apenas desenvolvimento)
logDebug('ModuleName', 'Mensagem de debug', dataObject);
Logger.debug('ModuleName', 'Mensagem de debug', dataObject);

// 5. SISTEMA (crítico - sempre exibido)
logSystem('ModuleName', 'Mensagem do sistema', dataObject);
Logger.system('ModuleName', 'Mensagem do sistema', dataObject);

// 6. PERFORMANCE (apenas desenvolvimento)
logPerf('ModuleName', 'Operação concluída', 150); // 150ms
Logger.performance('ModuleName', 'Operação concluída', 150);
```

## 🔄 Migração de Console.log

### ❌ Antes (não profissional)
```javascript
console.log('Produto carregado:', product);
console.error('Erro ao salvar:', error);
console.warn('Atenção:', warning);
```

### ✅ Depois (profissional)
```javascript
logInfo('ProductsService', 'Produto carregado', product);
logError('ProductsService', 'Erro ao salvar', error);
logWarn('ProductsService', 'Atenção', warning);
```

### 🔧 Migração Compatível
```javascript
// Para manter compatibilidade durante migração
const logger = window.Logger || console;

// Uso seguro
logger.error ? logger.error('Context', 'Message', data) : console.error('Message:', data);
logger.info ? logger.info('Context', 'Message', data) : console.log('Message:', data);
```

## 🎛️ Comandos do Console

### Durante Desenvolvimento
```javascript
// Ativar logs manualmente
window.enableDebug();

// Desativar logs
window.disableDebug(); 

// Ver logs de erro coletados
window.viewErrorLogs();

// Limpar logs armazenados
window.clearLogs();

// Ativar debug via URL
// http://localhost/sua-pagina.html?debug=true
```

### Grupos de Log (Desenvolvimento)
```javascript
Logger.group('Processamento de Pedido');
logInfo('OrderService', 'Validando dados...');
logInfo('PaymentService', 'Processando pagamento...');
logInfo('EmailService', 'Enviando confirmação...');
Logger.groupEnd();
```

### Log de Tabela (Desenvolvimento)
```javascript
Logger.table('Produtos Carregados', productsArray);
```

## 🏗️ Estrutura dos Arquivos

```
js/
├── utils/
│   ├── debug-config.js    # ← Configurações de ambiente
│   └── logger.js          # ← Sistema de logging
```

## 📦 Integração

### HTML
```html
<!-- Ordem IMPORTANTE: debug-config deve vir antes do logger -->
<script src="js/utils/debug-config.js"></script>
<script src="js/utils/logger.js"></script>
```

### JavaScript  
```javascript
class MyService {
    constructor() {
        this.logger = window.Logger || console; // Fallback seguro
    }
    
    myMethod() {
        try {
            // Sua lógica aqui
            this.logger.info ? this.logger.info('MyService', 'Operação bem-sucedida') : console.log('Sucesso');
        } catch (error) {
            this.logger.error ? this.logger.error('MyService', 'Erro na operação', error) : console.error('Erro:', error);
        }
    }
}
```

## ⚙️ Configurações Avançadas

### Níveis por Módulo
```javascript
// Em debug-config.js
window.LOG_CONFIG = {
    moduleLogLevels: {
        'ProductsService': 'info',    // info, warn, error
        'AuthService': 'warn',        // warn, error  
        'CartService': 'debug',       // debug, info, warn, error
        'Security': 'error'           // apenas errors
    }
};
```

### Detecção Automática de Ambiente
```javascript
// Sistema detecta automaticamente:
✅ localhost -> desenvolvimento (logs ativos)
✅ staging -> logs moderados  
✅ domínio-producao.com -> apenas erros
```

## 🔍 Monitoramento de Produção

### Logs de Erro Coletados
```javascript
// Em produção, erros são salvos automaticamente no localStorage
const errorLogs = Logger.getErrorLogs();
console.table(errorLogs); // Para análise posterior
```

### Integração com Serviços Externos
```javascript
// Em logger.js, método sendToErrorTracking()
// Pronto para integrar com:
// - Sentry
// - LogRocket  
// - Google Analytics
// - Outros serviços de monitoramento
```

## 📊 Benefícios

### Para Desenvolvimento
- 🎨 **Logs coloridos** e organizados
- 🔍 **Debug detalhado** com contexto
- 📊 **Análise de performance** 
- 📁 **Agrupamento** de logs relacionados

### Para Produção  
- 🚫 **Zero logs desnecessários** no console
- ⚡ **Performance otimizada**
- 📝 **Coleta automática** de erros críticos
- 🔒 **Mais profissional** para usuários finais

### Para Manutenção
- 🔧 **Fácil ativação** de debug quando necessário
- 📈 **Monitoramento** de erros em produção
- 🎯 **Logs contextualizados** para debugging
- 📋 **Histórico** de problemas

## 🎯 Exemplos Práticos

### E-commerce (Carrinho)
```javascript
// ❌ Antes
console.log('Item adicionado ao carrinho:', item);

// ✅ Depois  
logInfo('CartService', 'Item adicionado ao carrinho', {
    productId: item.id,
    quantity: item.quantity,
    price: item.price
});
```

### Autenticação
```javascript
// ❌ Antes
console.log('Usuário logado:', user.email);
console.error('Erro no login:', error);

// ✅ Depois
logInfo('AuthService', `Usuário autenticado: ${user.email}`);
logError('AuthService', 'Falha na autenticação', { 
    email: user.email, 
    error: error.message 
});
```

### API Calls
```javascript
// ❌ Antes
console.log('Fazendo requisição para:', url);
console.log('Resposta recebida:', data);

// ✅ Depois
logDebug('APIService', `Requisição iniciada: ${url}`);
logInfo('APIService', 'Dados recebidos com sucesso', { 
    recordCount: data.length,
    responseTime: '150ms'
});
```

---

**💡 Dica:** Mantenha `DEBUG_MODE = true` durante desenvolvimento e altere para `false` antes de fazer deploy em produção!

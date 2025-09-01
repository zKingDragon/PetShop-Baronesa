/**
 * Script de Inicialização do Banco de Dados
 * Cria a estrutura inicial de preços no Firestore
 */

// Dados iniciais para o sistema de preços
const initialServicePricing = {
  pricing: {
    currency: "BRL",
    base: {
      Cao: {
        Pequeno: { 
          Banho: 45, 
          TosaHigienica: 55, 
          TosaTotal: 90, 
          BanhoTosa: 120 
        },
        Medio: { 
          Banho: 60, 
          TosaHigienica: 70, 
          TosaTotal: 110, 
          BanhoTosa: 145 
        },
        Grande: { 
          Banho: 80, 
          TosaHigienica: 95, 
          TosaTotal: 140, 
          BanhoTosa: 185 
        },
        Gigante: { 
          Banho: 100, 
          TosaHigienica: 120, 
          TosaTotal: 180, 
          BanhoTosa: 240 
        }
      },
      Gato: {
        Unico: { 
          Banho: 70, 
          TosaHigienica: 85, 
          TosaTotal: 120, 
          BanhoTosa: 150 
        }
      }
    },
    addons: {
      corteUnhas: {
        label: "Corte de Unhas",
        prices: { Cao: 15, Gato: 20 }
      },
      limpezaOuvidos: {
        label: "Limpeza de Ouvidos",
        prices: { Cao: 10, Gato: 15 }
      },
      hidratacao: {
        label: "Hidratação",
        percentOfBase: 0.15,
        min: 15
      },
      perfume: {
        label: "Perfumaria",
        prices: { Cao: 5, Gato: 5 }
      },
      desembolo: {
        label: "Desembolo de nós",
        tieredByCoat: { Curta: 15, Media: 25, Longa: 40 }
      }
    },
    coatMultipliers: { 
      Curta: 1.0, 
      Media: 1.05, 
      Longa: 1.10 
    }
  },
  lastUpdated: new Date().toISOString(),
  updatedBy: "system_initialization"
};

/**
 * Função para inicializar a estrutura no Firestore
 */
async function initializeServicePricing() {
  try {
    // Verificar se o Firebase está disponível
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      throw new Error('Firebase não está carregado corretamente');
    }

    const db = firebase.firestore();
    
    // Verificar se já existe o documento
    const docRef = db.collection('settings').doc('servicePricing');
    const doc = await docRef.get();
    
    if (doc.exists) {
      console.log('📋 Documento de preços já existe no Firestore');
      console.log('Dados atuais:', doc.data());
      
      const overwrite = confirm('O documento já existe. Deseja sobrescrever com os dados padrão?');
      if (!overwrite) {
        console.log('❌ Operação cancelada pelo usuário');
        return;
      }
    }
    
    // Criar/Atualizar o documento
    await docRef.set(initialServicePricing);
    
    console.log('✅ Estrutura de preços criada/atualizada com sucesso no Firestore!');
    console.log('📊 Dados salvos:', initialServicePricing);
    
    // Verificar se foi salvo corretamente
    const verification = await docRef.get();
    if (verification.exists) {
      console.log('✅ Verificação: Documento salvo corretamente');
      alert('✅ Estrutura de preços inicializada com sucesso no Firestore!');
    } else {
      throw new Error('Falha na verificação: documento não foi salvo');
    }
    
  } catch (error) {
    console.error('❌ Erro ao inicializar estrutura de preços:', error);
    alert('❌ Erro ao inicializar: ' + error.message);
  }
}

/**
 * Função para verificar a estrutura atual
 */
async function checkCurrentPricing() {
  try {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      throw new Error('Firebase não está carregado');
    }

    const db = firebase.firestore();
    const doc = await db.collection('settings').doc('servicePricing').get();
    
    if (doc.exists) {
      console.log('📋 Estrutura atual no Firestore:');
      console.log(doc.data());
      return doc.data();
    } else {
      console.log('📋 Nenhuma estrutura encontrada no Firestore');
      return null;
    }
  } catch (error) {
    console.error('❌ Erro ao verificar estrutura:', error);
    return null;
  }
}

/**
 * Função para deletar a estrutura (usar com cuidado)
 */
async function deleteServicePricing() {
  try {
    const confirm = prompt('Digite "DELETAR" para confirmar a exclusão da estrutura de preços:');
    if (confirm !== 'DELETAR') {
      console.log('❌ Operação cancelada');
      return;
    }

    if (typeof firebase === 'undefined' || !firebase.firestore) {
      throw new Error('Firebase não está carregado');
    }

    const db = firebase.firestore();
    await db.collection('settings').doc('servicePricing').delete();
    
    console.log('🗑️ Estrutura de preços deletada do Firestore');
    alert('🗑️ Estrutura deletada com sucesso');
    
  } catch (error) {
    console.error('❌ Erro ao deletar estrutura:', error);
    alert('❌ Erro ao deletar: ' + error.message);
  }
}

// Exportar funções para uso global
window.initializeServicePricing = initializeServicePricing;
window.checkCurrentPricing = checkCurrentPricing;
window.deleteServicePricing = deleteServicePricing;

// Auto-inicialização quando o script é carregado (opcional)
document.addEventListener('DOMContentLoaded', () => {
  console.log('🔧 Script de inicialização de preços carregado');
  console.log('💡 Funções disponíveis:');
  console.log('   - initializeServicePricing() - Criar estrutura inicial');
  console.log('   - checkCurrentPricing() - Verificar estrutura atual');
  console.log('   - deleteServicePricing() - Deletar estrutura (cuidado!)');
});

console.log('📦 Módulo de inicialização de preços carregado');

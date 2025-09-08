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


      
      const overwrite = confirm('O documento já existe. Deseja sobrescrever com os dados padrão?');
      if (!overwrite) {

        return;
      }
    }
    
    // Criar/Atualizar o documento
    await docRef.set(initialServicePricing);
    


    
    // Verificar se foi salvo corretamente
    const verification = await docRef.get();
    if (verification.exists) {

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


      return doc.data();
    } else {

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

      return;
    }

    if (typeof firebase === 'undefined' || !firebase.firestore) {
      throw new Error('Firebase não está carregado');
    }

    const db = firebase.firestore();
    await db.collection('settings').doc('servicePricing').delete();
    

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





});

/**
 * Verifica e adiciona campos faltantes 'BanhoTosa' no documento 'servicePricing'
 * Não sobrescreve outros campos existentes.
 */
window.addMissingBanhoTosa = async function() {
  try {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      alert('Firebase não está disponível nesta página.');
      return;
    }

    const db = firebase.firestore();
    const docRef = db.collection('settings').doc('servicePricing');
    const snap = await docRef.get();

    if (!snap.exists) {
      alert('Documento servicePricing não encontrado. Você pode inicializá-lo primeiro.');
      return;
    }

    const remote = snap.data().pricing || snap.data();
    const updates = {};

    // Verificar cães
    const dogSizes = ['Pequeno','Medio','Grande','Gigante'];
    dogSizes.forEach(size => {
      const has = remote?.base?.Cao?.[size] && (remote.base.Cao[size].hasOwnProperty('BanhoTosa'));
      if (!has) {
        const defaultVal = initialServicePricing.pricing.base.Cao?.[size]?.BanhoTosa;
        if (defaultVal !== undefined) {
          updates[`pricing.base.Cao.${size}.BanhoTosa`] = defaultVal;
        }
      }
    });

    // Verificar gato único
    const gatoHas = remote?.base?.Gato?.Unico && (remote.base.Gato.Unico.hasOwnProperty('BanhoTosa'));
    if (!gatoHas) {
      const defaultVal = initialServicePricing.pricing.base.Gato?.Unico?.BanhoTosa;
      if (defaultVal !== undefined) {
        updates[`pricing.base.Gato.Unico.BanhoTosa`] = defaultVal;
      }
    }

    if (Object.keys(updates).length === 0) {
      alert('Nenhum campo BanhoTosa faltando foi encontrado.');
      return;
    }

    // Aplicar atualização parcial
    await docRef.update(updates);
    alert('Campos BanhoTosa adicionados com sucesso.');
  } catch (error) {
    console.error('Erro ao adicionar BanhoTosa:', error);
    alert('Erro ao adicionar BanhoTosa: ' + (error.message || error));
  }
};

/**
 * Preenche explicitamente os valores padrão de 'BanhoTosa' que estejam ausentes
 * Usa set(..., { merge: true }) para garantir que apenas campos faltantes sejam adicionados
 */
window.fillMissingBanhoTosaValues = async function() {
  try {
    if (typeof firebase === 'undefined' || !firebase.firestore) {
      alert('Firebase não está disponível nesta página.');
      return;
    }

    const db = firebase.firestore();
    const docRef = db.collection('settings').doc('servicePricing');
    const snap = await docRef.get();

    if (!snap.exists) {
      alert('Documento servicePricing não encontrado. Você pode inicializá-lo primeiro.');
      return;
    }

    const remote = snap.data().pricing || snap.data();

    const patch = { pricing: { base: { Cao: {}, Gato: { Unico: {} } } } };
    let needUpdate = false;

    const dogSizes = ['Pequeno','Medio','Grande','Gigante'];
    dogSizes.forEach(size => {
      const current = remote?.base?.Cao?.[size];
      const hasValue = current && (current.BanhoTosa !== undefined && current.BanhoTosa !== null);
      if (!hasValue) {
        const defaultVal = initialServicePricing.pricing.base.Cao?.[size]?.BanhoTosa;
        if (defaultVal !== undefined) {
          patch.pricing.base.Cao[size] = { BanhoTosa: defaultVal };
          needUpdate = true;
        }
      }
    });

    const gatoCurrent = remote?.base?.Gato?.Unico;
    const gatoHas = gatoCurrent && (gatoCurrent.BanhoTosa !== undefined && gatoCurrent.BanhoTosa !== null);
    if (!gatoHas) {
      const defaultVal = initialServicePricing.pricing.base.Gato?.Unico?.BanhoTosa;
      if (defaultVal !== undefined) {
        patch.pricing.base.Gato.Unico = { BanhoTosa: defaultVal };
        needUpdate = true;
      }
    }

    if (!needUpdate) {
      alert('Nenhum valor faltante de BanhoTosa encontrado.');
      return;
    }

    // Aplicar patch com merge para garantir que apenas os campos adicionados sejam escritos
    await docRef.set(patch, { merge: true });

    // Verificar resultado
    const verify = await docRef.get();
    const newRemote = verify.data().pricing || verify.data();
    let added = [];
    dogSizes.forEach(size => {
      const v = newRemote?.base?.Cao?.[size]?.BanhoTosa;
      if (v !== undefined && v !== null) added.push(`Cao.${size}=${v}`);
    });
    const vg = newRemote?.base?.Gato?.Unico?.BanhoTosa;
    if (vg !== undefined && vg !== null) added.push(`Gato.Unico=${vg}`);

    alert('Atualização concluída. Campos adicionados/confirmados: ' + added.join(', '));
  } catch (error) {
    console.error('Erro ao preencher BanhoTosa:', error);
    alert('Erro ao preencher BanhoTosa: ' + (error.message || error));
  }
};



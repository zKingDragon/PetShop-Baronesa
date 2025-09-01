/**
 * SCRIPT SIMPLES PARA EXECUTAR NO CONSOLE DO NAVEGADOR
 * 
 * INSTRUÇÕES:
 * 1. Abra qualquer página do seu site que tenha Firebase carregado
 * 2. Pressione F12 para abrir o console do navegador
 * 3. Cole este código completo no console
 * 4. Pressione Enter para executar
 */

(async function() {
    console.log('🚀 Iniciando script de inicialização do banco de dados...');
    
    // Verificar se Firebase está disponível
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase não está carregado! Certifique-se de estar em uma página do site.');
        return;
    }
    
    if (!firebase.firestore) {
        console.error('❌ Firestore não está disponível!');
        return;
    }
    
    console.log('✅ Firebase detectado, prosseguindo...');
    
    // Dados para inicializar
    const initialData = {
        pricing: {
            currency: "BRL",
            base: {
                Cao: {
                    Pequeno: { Banho: 45, TosaHigienica: 55, TosaTotal: 90, BanhoTosa: 120 },
                    Medio: { Banho: 60, TosaHigienica: 70, TosaTotal: 110, BanhoTosa: 145 },
                    Grande: { Banho: 80, TosaHigienica: 95, TosaTotal: 140, BanhoTosa: 185 },
                    Gigante: { Banho: 100, TosaHigienica: 120, TosaTotal: 180, BanhoTosa: 240 }
                },
                Gato: {
                    Unico: { Banho: 70, TosaHigienica: 85, TosaTotal: 120, BanhoTosa: 150 }
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
            coatMultipliers: { Curta: 1.0, Media: 1.05, Longa: 1.10 }
        },
        lastUpdated: new Date().toISOString(),
        updatedBy: "console_script"
    };
    
    try {
        const db = firebase.firestore();
        
        // Verificar se já existe
        console.log('🔍 Verificando se documento já existe...');
        const docRef = db.collection('settings').doc('servicePricing');
        const existingDoc = await docRef.get();
        
        if (existingDoc.exists()) {
            console.log('⚠️ Documento já existe! Dados atuais:');
            console.log(existingDoc.data());
            
            const overwrite = confirm('O documento já existe. Deseja sobrescrever? (OK = Sim, Cancelar = Não)');
            if (!overwrite) {
                console.log('❌ Operação cancelada pelo usuário');
                return;
            }
        }
        
        // Criar/atualizar documento
        console.log('💾 Salvando dados no Firestore...');
        await docRef.set(initialData);
        
        // Verificar se foi salvo
        console.log('🔄 Verificando se foi salvo corretamente...');
        const verification = await docRef.get();
        
        if (verification.exists()) {
            console.log('✅ SUCESSO! Estrutura criada/atualizada no Firestore!');
            console.log('📊 Dados salvos:', verification.data());
            console.log('🎉 Agora você pode usar o sistema de preços dinâmico!');
        } else {
            console.error('❌ Erro: Documento não foi salvo corretamente');
        }
        
    } catch (error) {
        console.error('❌ Erro durante a operação:', error);
        console.log('💡 Dica: Verifique se você tem permissões para escrever no Firestore');
    }
})();

// Funções auxiliares disponíveis após executar o script
window.checkServicePricing = async function() {
    try {
        const doc = await firebase.firestore().collection('settings').doc('servicePricing').get();
        if (doc.exists()) {
            console.log('📊 Dados atuais no Firestore:');
            console.log(doc.data());
        } else {
            console.log('❌ Nenhum documento encontrado');
        }
    } catch (error) {
        console.error('❌ Erro ao verificar:', error);
    }
};

window.deleteServicePricing = async function() {
    if (confirm('ATENÇÃO: Isso irá deletar TODA a estrutura de preços! Tem certeza?')) {
        try {
            await firebase.firestore().collection('settings').doc('servicePricing').delete();
            console.log('🗑️ Estrutura deletada com sucesso');
        } catch (error) {
            console.error('❌ Erro ao deletar:', error);
        }
    }
};

console.log('💡 Script carregado! Funções disponíveis:');
console.log('   - checkServicePricing() - Verificar dados atuais');
console.log('   - deleteServicePricing() - Deletar estrutura (cuidado!)');

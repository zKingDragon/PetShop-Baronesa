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

    
    // Verificar se Firebase está disponível
    if (typeof firebase === 'undefined') {
        console.error('❌ Firebase não está carregado! Certifique-se de estar em uma página do site.');
        return;
    }
    
    if (!firebase.firestore) {
        console.error('❌ Firestore não está disponível!');
        return;
    }
    

    
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

        const docRef = db.collection('settings').doc('servicePricing');
        const existingDoc = await docRef.get();
        
        if (existingDoc.exists()) {


            
            const overwrite = confirm('O documento já existe. Deseja sobrescrever? (OK = Sim, Cancelar = Não)');
            if (!overwrite) {

                return;
            }
        }
        
        // Criar/atualizar documento

        await docRef.set(initialData);
        
        // Verificar se foi salvo

        const verification = await docRef.get();
        
        if (verification.exists()) {



        } else {
            console.error('❌ Erro: Documento não foi salvo corretamente');
        }
        
    } catch (error) {
        console.error('❌ Erro durante a operação:', error);

    }
})();

// Funções auxiliares disponíveis após executar o script
window.checkServicePricing = async function() {
    try {
        const doc = await firebase.firestore().collection('settings').doc('servicePricing').get();
        if (doc.exists()) {


        } else {

        }
    } catch (error) {
        console.error('❌ Erro ao verificar:', error);
    }
};

window.deleteServicePricing = async function() {
    if (confirm('ATENÇÃO: Isso irá deletar TODA a estrutura de preços! Tem certeza?')) {
        try {
            await firebase.firestore().collection('settings').doc('servicePricing').delete();

        } catch (error) {
            console.error('❌ Erro ao deletar:', error);
        }
    }
};





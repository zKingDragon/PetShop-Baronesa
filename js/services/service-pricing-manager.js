/**
 * Service Pricing Manager
 * Gerencia a configuração dinâmica de preços dos serviços de banho e tosa
 */

class ServicePricingManager {
    constructor() {
        this.pricingFile = '../assets/config/service-pricing.json';
        this.currentPricing = null;
        this.init();
    }

    /**
     * Inicializa o gerenciador
     */
    init() {
        this.bindEvents();
        this.updateConnectionStatus();
        this.loadCurrentPrices();
    }

    /**
     * Atualiza o status de conexão
     */
    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        const statusText = document.getElementById('statusText');
        const lastSyncElement = document.getElementById('lastSync');
        const lastSyncTime = document.getElementById('lastSyncTime');
        
        if (!statusElement || !statusText) return;

        if (window.db) {
            statusElement.className = 'connection-status connected';
            statusText.textContent = 'Conectado ao Firebase Firestore';
            
            // Verificar última sincronização
            if (lastSyncElement && lastSyncTime) {
                const savedData = localStorage.getItem('servicePricing');
                if (savedData) {
                    const lastUpdate = localStorage.getItem('servicePricingLastUpdate');
                    if (lastUpdate) {
                        lastSyncTime.textContent = new Date(lastUpdate).toLocaleString();
                        lastSyncElement.style.display = 'flex';
                    }
                }
            }
        } else {
            statusElement.className = 'connection-status error';
            statusText.textContent = 'Desconectado - Usando dados locais';
        }
    }

    /**
     * Carrega os preços atuais do Firestore ou arquivo JSON como fallback
     */
    async loadCurrentPrices() {
        try {
            // Primeiro, tentar carregar do Firestore
            if (window.db) {
                try {
                    const doc = await window.db.collection('settings').doc('servicePricing').get();
                    if (doc.exists) {
                        this.currentPricing = doc.data().pricing;
                        this.populateForm();
                        this.updateLastSyncTime(doc.data().lastUpdated);
                        
                        if (window.Logger) {
                            window.Logger.info('ServicePricingManager', 'Preços carregados do Firestore');
                        }
                        return;
                    }
                } catch (firestoreError) {
                    console.warn('⚠️ Erro ao carregar do Firestore, tentando arquivo JSON:', firestoreError);
                }
            }

            // Fallback: carregar do arquivo JSON
            const response = await fetch(this.pricingFile);
            if (!response.ok) {
                throw new Error('Erro ao carregar arquivo de preços');
            }
            
            this.currentPricing = await response.json();
            this.populateForm();
            
            if (window.Logger) {
                window.Logger.info('ServicePricingManager', 'Preços carregados do arquivo JSON');
            }
        } catch (error) {
            console.error('Erro ao carregar preços:', error);
            if (window.showToast) {
                window.showToast('Erro ao carregar preços atuais', 'error');
            } else {
                alert('Erro ao carregar preços atuais');
            }
        }
    }

    /**
     * Popula o formulário com os dados atuais
     */
    populateForm() {
        if (!this.currentPricing) return;

        // Preços base - Cães
        const dogSizes = ['Pequeno', 'Medio', 'Grande', 'Gigante'];
        const services = ['Banho', 'TosaHigienica', 'TosaTotal', 'BanhoTosa'];
        
        dogSizes.forEach(size => {
            services.forEach(service => {
                const value = this.currentPricing.base?.Cao?.[size]?.[service];
                if (value !== undefined) {
                    const inputId = `cao-${size.toLowerCase()}-${service.toLowerCase().replace('tosa', 'tosa-').replace('higienica', 'higienica').replace('total', 'total').replace('banho-tosa', 'banho-tosa')}`;
                    const input = document.getElementById(inputId);
                    if (input) {
                        input.value = value;
                    }
                }
            });
        });

        // Preços base - Gatos
        services.forEach(service => {
            const value = this.currentPricing.base?.Gato?.Unico?.[service];
            if (value !== undefined) {
                const inputId = `gato-unico-${service.toLowerCase().replace('tosa', 'tosa-').replace('higienica', 'higienica').replace('total', 'total').replace('banho-tosa', 'banho-tosa')}`;
                const input = document.getElementById(inputId);
                if (input) {
                    input.value = value;
                }
            }
        });

        // Adicionais
        if (this.currentPricing.addons) {
            // Corte de unhas
            const corteUnhas = this.currentPricing.addons.corteUnhas;
            if (corteUnhas?.prices) {
                this.setInputValue('addon-corte-unhas-cao', corteUnhas.prices.Cao);
                this.setInputValue('addon-corte-unhas-gato', corteUnhas.prices.Gato);
            }

            // Limpeza de ouvidos
            const limpezaOuvidos = this.currentPricing.addons.limpezaOuvidos;
            if (limpezaOuvidos?.prices) {
                this.setInputValue('addon-limpeza-ouvidos-cao', limpezaOuvidos.prices.Cao);
                this.setInputValue('addon-limpeza-ouvidos-gato', limpezaOuvidos.prices.Gato);
            }

            // Hidratação
            const hidratacao = this.currentPricing.addons.hidratacao;
            if (hidratacao) {
                this.setInputValue('addon-hidratacao-percent', hidratacao.percentOfBase);
                this.setInputValue('addon-hidratacao-min', hidratacao.min);
            }

            // Perfume
            const perfume = this.currentPricing.addons.perfume;
            if (perfume?.prices) {
                this.setInputValue('addon-perfume-cao', perfume.prices.Cao);
                this.setInputValue('addon-perfume-gato', perfume.prices.Gato);
            }

            // Desembolo
            const desembolo = this.currentPricing.addons.desembolo;
            if (desembolo?.tieredByCoat) {
                this.setInputValue('addon-desembolo-curta', desembolo.tieredByCoat.Curta);
                this.setInputValue('addon-desembolo-media', desembolo.tieredByCoat.Media);
                this.setInputValue('addon-desembolo-longa', desembolo.tieredByCoat.Longa);
            }
        }

        // Multiplicadores
        if (this.currentPricing.coatMultipliers) {
            this.setInputValue('multiplier-curta', this.currentPricing.coatMultipliers.Curta);
            this.setInputValue('multiplier-media', this.currentPricing.coatMultipliers.Media);
            this.setInputValue('multiplier-longa', this.currentPricing.coatMultipliers.Longa);
        }
    }

    /**
     * Define o valor de um input
     */
    setInputValue(id, value) {
        const input = document.getElementById(id);
        if (input && value !== undefined) {
            input.value = value;
        }
    }

    /**
     * Coleta os dados do formulário
     */
    collectFormData() {
        const data = {
            currency: "BRL",
            base: {
                Cao: {
                    Pequeno: {},
                    Medio: {},
                    Grande: {},
                    Gigante: {}
                },
                Gato: {
                    Unico: {}
                }
            },
            addons: {
                corteUnhas: {
                    label: "Corte de Unhas",
                    prices: {}
                },
                limpezaOuvidos: {
                    label: "Limpeza de Ouvidos",
                    prices: {}
                },
                hidratacao: {
                    label: "Hidratação",
                    percentOfBase: 0.15,
                    min: 15
                },
                perfume: {
                    label: "Perfumaria",
                    prices: {}
                },
                desembolo: {
                    label: "Desembolo de nós",
                    tieredByCoat: {}
                }
            },
            coatMultipliers: {}
        };

        // Coletar preços base - Cães
        const dogSizes = ['Pequeno', 'Medio', 'Grande', 'Gigante'];
        const services = {
            'banho': 'Banho',
            'tosa-higienica': 'TosaHigienica',
            'tosa-total': 'TosaTotal',
            'banho-tosa': 'BanhoTosa'
        };

        dogSizes.forEach(size => {
            Object.entries(services).forEach(([key, service]) => {
                const inputId = `cao-${size.toLowerCase()}-${key}`;
                const value = this.getInputValue(inputId);
                if (value !== null) {
                    data.base.Cao[size][service] = value;
                }
            });
        });

        // Coletar preços base - Gatos
        Object.entries(services).forEach(([key, service]) => {
            const inputId = `gato-unico-${key}`;
            const value = this.getInputValue(inputId);
            if (value !== null) {
                data.base.Gato.Unico[service] = value;
            }
        });

        // Coletar adicionais
        data.addons.corteUnhas.prices.Cao = this.getInputValue('addon-corte-unhas-cao') || 15;
        data.addons.corteUnhas.prices.Gato = this.getInputValue('addon-corte-unhas-gato') || 20;

        data.addons.limpezaOuvidos.prices.Cao = this.getInputValue('addon-limpeza-ouvidos-cao') || 10;
        data.addons.limpezaOuvidos.prices.Gato = this.getInputValue('addon-limpeza-ouvidos-gato') || 15;

        data.addons.hidratacao.percentOfBase = this.getInputValue('addon-hidratacao-percent') || 0.15;
        data.addons.hidratacao.min = this.getInputValue('addon-hidratacao-min') || 15;

        data.addons.perfume.prices.Cao = this.getInputValue('addon-perfume-cao') || 5;
        data.addons.perfume.prices.Gato = this.getInputValue('addon-perfume-gato') || 5;

        data.addons.desembolo.tieredByCoat.Curta = this.getInputValue('addon-desembolo-curta') || 15;
        data.addons.desembolo.tieredByCoat.Media = this.getInputValue('addon-desembolo-media') || 25;
        data.addons.desembolo.tieredByCoat.Longa = this.getInputValue('addon-desembolo-longa') || 40;

        // Coletar multiplicadores
        data.coatMultipliers.Curta = this.getInputValue('multiplier-curta') || 1.0;
        data.coatMultipliers.Media = this.getInputValue('multiplier-media') || 1.05;
        data.coatMultipliers.Longa = this.getInputValue('multiplier-longa') || 1.10;

        return data;
    }

    /**
     * Obtém o valor de um input
     */
    getInputValue(id) {
        const input = document.getElementById(id);
        if (!input || !input.value) return null;
        return parseFloat(input.value);
    }

    /**
     * Salva os preços no Firestore e localStorage
     */
    async savePrices() {
        try {
            const data = this.collectFormData();
            
            // Validar dados antes de salvar
            if (!this.validatePricingData(data)) {
                if (window.showToast) {
                    window.showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
                } else {
                    alert('Por favor, preencha todos os campos obrigatórios');
                }
                return;
            }

            // Adicionar metadados
            const pricingData = {
                pricing: data,
                lastUpdated: new Date().toISOString(),
                updatedBy: this.getCurrentUser()
            };
            
            // Salvar no Firestore se disponível
            if (window.db) {
                try {
                    await window.db.collection('settings').doc('servicePricing').set(pricingData);
                    
                    if (window.Logger) {
                        window.Logger.info('ServicePricingManager', 'Preços salvos no Firestore');
                    }
                } catch (firestoreError) {
                    console.error('Erro ao salvar no Firestore:', firestoreError);
                    if (window.showToast) {
                        window.showToast('Erro ao salvar no banco de dados: ' + firestoreError.message, 'error');
                    } else {
                        alert('Erro ao salvar no banco de dados: ' + firestoreError.message);
                    }
                    return;
                }
            }
            
            // Salvar no localStorage para uso imediato
            const jsonString = JSON.stringify(data, null, 2);
            localStorage.setItem('servicePricing', jsonString);
            localStorage.setItem('servicePricingLastUpdate', new Date().toISOString());
            this.currentPricing = data;
            
            // Atualizar indicador de última sincronização
            this.updateLastSyncTime();
            
            // Notificar outras partes do sistema sobre a atualização
            window.dispatchEvent(new CustomEvent('servicePricingUpdated', { 
                detail: { pricing: data } 
            }));
            
            // Também criar download como backup
            this.downloadJSON(jsonString, 'service-pricing-backup.json');
            
            if (window.showToast) {
                window.showToast('Preços salvos com sucesso no banco de dados!', 'success');
            } else {
                alert('Preços salvos com sucesso no banco de dados!');
            }
            
        } catch (error) {
            console.error('Erro ao salvar preços:', error);
            if (window.showToast) {
                window.showToast('Erro ao salvar preços: ' + error.message, 'error');
            } else {
                alert('Erro ao salvar preços: ' + error.message);
            }
        }
    }

    /**
     * Atualiza o indicador de última sincronização
     */
    updateLastSyncTime(timestamp = null) {
        const lastSyncElement = document.getElementById('lastSync');
        const lastSyncTime = document.getElementById('lastSyncTime');
        
        if (lastSyncElement && lastSyncTime) {
            const time = timestamp ? new Date(timestamp) : new Date();
            lastSyncTime.textContent = time.toLocaleString();
            lastSyncElement.style.display = 'flex';
            
            if (!timestamp) {
                localStorage.setItem('servicePricingLastUpdate', time.toISOString());
            }
        }
    }

    /**
     * Obtém o usuário atual para auditoria
     */
    getCurrentUser() {
        try {
            if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
                return window.firebase.auth().currentUser.email;
            }
            
            // Fallback para localStorage
            const authData = localStorage.getItem('petshop_baronesa_auth');
            if (authData) {
                const parsed = JSON.parse(authData);
                return parsed.email || 'admin';
            }
            
            return 'admin';
        } catch (error) {
            return 'admin';
        }
    }

    /**
     * Valida os dados de preços
     */
    validatePricingData(data) {
        // Verificar se há pelo menos alguns preços base configurados
        const dogSizes = ['Pequeno', 'Medio', 'Grande', 'Gigante'];
        const services = ['Banho', 'TosaHigienica', 'TosaTotal', 'BanhoTosa'];
        
        let hasValidPrices = false;
        
        // Verificar preços dos cães
        dogSizes.forEach(size => {
            services.forEach(service => {
                if (data.base?.Cao?.[size]?.[service] > 0) {
                    hasValidPrices = true;
                }
            });
        });
        
        // Verificar preços dos gatos
        services.forEach(service => {
            if (data.base?.Gato?.Unico?.[service] > 0) {
                hasValidPrices = true;
            }
        });
        
        return hasValidPrices;
    }

    /**
     * Cria um download do arquivo JSON
     */
    downloadJSON(jsonString, filename) {
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Sincroniza dados do Firestore
     */
    async syncFromFirestore() {
        try {
            if (!window.db) {
                if (window.showToast) {
                    window.showToast('Firebase não está disponível', 'error');
                } else {
                    alert('Firebase não está disponível');
                }
                return;
            }

            const doc = await window.db.collection('settings').doc('servicePricing').get();
            if (doc.exists) {
                const data = doc.data();
                this.currentPricing = data.pricing;
                this.populateForm();

                // Atualizar localStorage também
                localStorage.setItem('servicePricing', JSON.stringify(data.pricing));
                this.updateLastSyncTime(data.lastUpdated);

                if (window.showToast) {
                    window.showToast(`Dados sincronizados do Firestore. Última atualização: ${new Date(data.lastUpdated).toLocaleString()}`, 'success');
                } else {
                    alert(`Dados sincronizados do Firestore. Última atualização: ${new Date(data.lastUpdated).toLocaleString()}`);
                }

                if (window.Logger) {
                    window.Logger.info('ServicePricingManager', 'Dados sincronizados do Firestore');
                }
            } else {
                if (window.showToast) {
                    window.showToast('Nenhum dado encontrado no Firestore', 'warning');
                } else {
                    alert('Nenhum dado encontrado no Firestore');
                }
            }
        } catch (error) {
            console.error('Erro ao sincronizar do Firestore:', error);
            if (window.showToast) {
                window.showToast('Erro ao sincronizar: ' + error.message, 'error');
            } else {
                alert('Erro ao sincronizar: ' + error.message);
            }
        }
    }
    resetToDefault() {
        if (confirm('Tem certeza que deseja restaurar os preços padrão? Esta ação não pode ser desfeita.')) {
            const defaultPricing = {
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
            };

            this.currentPricing = defaultPricing;
            this.populateForm();

            if (window.showToast) {
                window.showToast('Preços restaurados para o padrão', 'info');
            }
        }
    }

    /**
     * Vincula os eventos
     */
    bindEvents() {
        // Carregar preços atuais
        const loadBtn = document.getElementById('loadCurrentPrices');
        if (loadBtn) {
            loadBtn.addEventListener('click', () => this.loadCurrentPrices());
        }

        // Salvar preços
        const saveBtn = document.getElementById('savePrices');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => this.savePrices());
        }

        // Restaurar padrão
        const resetBtn = document.getElementById('resetPrices');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetToDefault());
        }

        // Sincronizar do Firestore
        const syncBtn = document.getElementById('syncFromFirestore');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => this.syncFromFirestore());
        }
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    // Aguardar um pouco para garantir que a aba de serviços existe
    setTimeout(() => {
        const servicesTab = document.getElementById('services-tab');
        if (servicesTab) {
            window.servicePricingManager = new ServicePricingManager();
        }
    }, 100);
});

// Exportar para uso global
window.ServicePricingManager = ServicePricingManager;

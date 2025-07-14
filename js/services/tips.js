/**
 * Serviço de gerenciamento de dicas
 * Pet Shop Baronesa - Integração com Firebase/Firestore
 */

class TipsService {
    constructor() {
        this.tips = [];
        this.storageKey = 'petshop_tips';
        this.collectionName = 'Dicas';
        this.initialize();
    }

    /**
     * Inicializa o serviço
     */
    async initialize() {
        try {
            // Verifica se o Firebase está disponível
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                await this.loadFromFirestore();
            } else {
                // Fallback para localStorage se Firebase não estiver disponível
                this.loadFromStorage();
            }

            if (this.tips.length === 0) {
                this.createSampleTips();
            }
        } catch (error) {
            console.error('Erro ao inicializar TipsService:', error);
            // Fallback para localStorage em caso de erro
            this.loadFromStorage();
        }
    }

    /**
     * Carrega dicas do Firestore
     */
    async loadFromFirestore() {
        try {
            const snapshot = await db.collection(this.collectionName).get();
            this.tips = [];

            snapshot.forEach(doc => {
                const data = doc.data();
                this.tips.push({
                    id: doc.id,
                    title: data.title || '',
                    category: data.category || '',
                    status: data.status || 'draft',
                    date: data.dataDePublicacao || new Date().toISOString().split('T')[0],
                    image: data.fileURL || '',
                    summary: data.resumo || '',
                    content: data.conteudo || '',
                    tags: data.tags || []
                });
            });

            console.log(`Carregadas ${this.tips.length} dicas do Firestore`);
        } catch (error) {
            console.error('Erro ao carregar dicas do Firestore:', error);
            throw error;
        }
    }

    /**
     * Carrega dicas do localStorage (fallback)
     */
    loadFromStorage() {
        const stored = localStorage.getItem(this.storageKey);
        if (stored) {
            this.tips = JSON.parse(stored);
        }
    }

    /**
     * Salva dica no Firestore
     */
    async saveToFirestore(tip) {
        try {
            const docData = {
                title: tip.title,
                category: tip.category,
                status: tip.status,
                dataDePublicacao: tip.date,
                fileURL: tip.image || '',
                resumo: tip.summary,
                conteudo: tip.content,
                tags: tip.tags || []
            };

            if (tip.id && tip.id.startsWith('tip_')) {
                // Novo documento, usar add()
                const docRef = await db.collection(this.collectionName).add(docData);
                tip.id = docRef.id;
            } else {
                // Documento existente, usar set()
                await db.collection(this.collectionName).doc(tip.id).set(docData);
            }

            console.log('Dica salva no Firestore:', tip.id);
            return tip;
        } catch (error) {
            console.error('Erro ao salvar dica no Firestore:', error);
            throw error;
        }
    }

    /**
     * Remove dica do Firestore
     */
    async removeFromFirestore(tipId) {
        try {
            await db.collection(this.collectionName).doc(tipId).delete();
            console.log('Dica removida do Firestore:', tipId);
        } catch (error) {
            console.error('Erro ao remover dica do Firestore:', error);
            throw error;
        }
    }

    /**
     * Salva dicas no localStorage (fallback)
     */
    saveToStorage() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.tips));
    }

    /**
     * Cria dicas de exemplo
     */
    createSampleTips() {
        const sampleTips = [
            {
                id: 'tip_sample_1',
                title: 'Como dar banho em gatos sem estresse',
                category: 'Gatos',
                status: 'published',
                date: '2024-01-15',
                image: 'assets/images/banho-tosa/banho-Gato.jpg',
                summary: 'Dicas essenciais para tornar o banho do seu gato menos estressante para vocês dois.',
                content: `
                    <p>O banho em gatos pode ser uma tarefa desafiadora, mas com as técnicas certas, pode ser uma experiência tranquila para você e seu felino.</p>

                    <h3>Preparação é fundamental</h3>
                    <ul>
                        <li>Corte as unhas do gato antes do banho</li>
                        <li>Escove bem o pelo para remover nós</li>
                        <li>Prepare todos os materiais antes de começar</li>
                    </ul>

                    <h3>Durante o banho</h3>
                    <ul>
                        <li>Use água morna, nunca quente</li>
                        <li>Molhe gradualmente, começando pelas patas</li>
                        <li>Use shampoo específico para gatos</li>
                        <li>Mantenha a calma e fale suavemente</li>
                    </ul>

                    <h3>Após o banho</h3>
                    <ul>
                        <li>Seque bem com toalha macia</li>
                        <li>Use secador em temperatura baixa se necessário</li>
                        <li>Mantenha o gato aquecido até secar completamente</li>
                    </ul>
                `,
                tags: ['higiene', 'gatos', 'banho', 'cuidados'],
                createdAt: '2024-01-15T10:00:00Z',
                updatedAt: '2024-01-15T10:00:00Z'
            },
            {
                id: 'tip_sample_2',
                title: 'Cuidados especiais com cães idosos',
                category: 'Cachorros',
                status: 'published',
                date: '2024-01-10',
                image: 'assets/images/dicas/cao-Idoso.png',
                summary: 'Aprenda como cuidar adequadamente do seu cão na terceira idade para garantir qualidade de vida.',
                content: `
                    <p>Cães idosos precisam de cuidados especiais para manter sua qualidade de vida e saúde em dia.</p>

                    <h3>Alimentação adequada</h3>
                    <ul>
                        <li>Ração específica para cães seniores</li>
                        <li>Porções menores e mais frequentes</li>
                        <li>Alimentos de fácil digestão</li>
                        <li>Suplementos conforme orientação veterinária</li>
                    </ul>

                    <h3>Exercícios adaptados</h3>
                    <ul>
                        <li>Caminhadas mais curtas e frequentes</li>
                        <li>Evite exercícios intensos</li>
                        <li>Natação é uma excelente opção</li>
                        <li>Mantenha a rotina de atividades</li>
                    </ul>

                    <h3>Cuidados médicos</h3>
                    <ul>
                        <li>Consultas veterinárias mais frequentes</li>
                        <li>Exames de rotina regulares</li>
                        <li>Atenção a sinais de dor ou desconforto</li>
                        <li>Medicamentos conforme prescrição</li>
                    </ul>
                `,
                tags: ['saúde', 'cachorros', 'idosos', 'cuidados'],
                createdAt: '2024-01-10T14:30:00Z',
                updatedAt: '2024-01-10T14:30:00Z'
            },
            {
                id: 'tip_sample_3',
                title: 'Alimentação balanceada para pássaros',
                category: 'Pássaros',
                status: 'published',
                date: '2024-01-05',
                image: '../assets/images/produtos/misturaParaPassaros.webp',
                summary: 'Guia completo sobre alimentação adequada para diferentes espécies de pássaros domésticos.',
                content: `
                    <p>A alimentação adequada é fundamental para a saúde e bem-estar dos pássaros domésticos.</p>

                    <h3>Alimentos básicos</h3>
                    <ul>
                        <li>Mistura de sementes de qualidade</li>
                        <li>Ração extrusada específica para a espécie</li>
                        <li>Frutas frescas (maçã, banana, laranja)</li>
                        <li>Verduras folhosas (couve, almeirão)</li>
                    </ul>

                    <h3>Alimentos proibidos</h3>
                    <ul>
                        <li>Chocolate e cafeína</li>
                        <li>Abacate</li>
                        <li>Cebola e alho</li>
                        <li>Alimentos salgados ou doces</li>
                    </ul>

                    <h3>Dicas importantes</h3>
                    <ul>
                        <li>Água fresca sempre disponível</li>
                        <li>Varie os alimentos oferecidos</li>
                        <li>Ofereça porções adequadas ao tamanho</li>
                        <li>Retire alimentos perecíveis após algumas horas</li>
                    </ul>
                `,
                tags: ['alimentação', 'pássaros', 'nutrição', 'saúde'],
                createdAt: '2024-01-05T09:15:00Z',
                updatedAt: '2024-01-05T09:15:00Z'
            },
            {
                id: 'tip_sample_4',
                title: 'Primeiros socorros para pets',
                category: 'Geral',
                status: 'draft',
                date: '2024-01-20',
                image: 'assets/images/dicas/emergenciaPet.jpeg',
                summary: 'Conhecimentos básicos de primeiros socorros que todo tutor deve saber.',
                content: `
                    <p>Saber o básico de primeiros socorros pode salvar a vida do seu pet em situações de emergência.</p>

                    <h3>Sinais de emergência</h3>
                    <ul>
                        <li>Dificuldade para respirar</li>
                        <li>Sangramento excessivo</li>
                        <li>Vômitos ou diarreia persistente</li>
                        <li>Convulsões</li>
                        <li>Perda de consciência</li>
                    </ul>

                    <h3>Kit de primeiros socorros</h3>
                    <ul>
                        <li>Gaze e ataduras</li>
                        <li>Esparadrapo</li>
                        <li>Tesoura sem ponta</li>
                        <li>Termômetro</li>
                        <li>Solução fisiológica</li>
                    </ul>

                    <h3>Importante lembrar</h3>
                    <ul>
                        <li>Mantenha a calma</li>
                        <li>Contate imediatamente um veterinário</li>
                        <li>Não medique sem orientação profissional</li>
                        <li>Tenha sempre contatos de emergência</li>
                    </ul>
                `,
                tags: ['emergência', 'primeiros socorros', 'saúde', 'segurança'],
                createdAt: '2024-01-20T16:45:00Z',
                updatedAt: '2024-01-20T16:45:00Z'
            }
        ];

        this.tips = sampleTips;
        this.saveToStorage();
    }

    /**
     * Obtém todas as dicas
     * @returns {Array} Lista de dicas
     */
    getAllTips() {
        return [...this.tips];
    }

    /**
     * Obtém dicas publicadas
     * @returns {Array} Lista de dicas publicadas
     */
    getPublishedTips() {
        return this.tips.filter(tip => tip.status === 'published');
    }

    /**
     * Obtém dica por ID
     * @param {string} id - ID da dica
     * @returns {Object|null} Dica ou null se não encontrada
     */
    getTipById(id) {
        return this.tips.find(tip => tip.id === id) || null;
    }

    /**
     * Obtém dicas por categoria
     * @param {string} category - Categoria
     * @returns {Array} Lista de dicas da categoria
     */
    getTipsByCategory(category) {
        return this.tips.filter(tip => tip.category === category);
    }

    /**
     * Busca dicas por termo
     * @param {string} term - Termo de busca
     * @returns {Array} Lista de dicas encontradas
     */
    searchTips(term) {
        const searchTerm = term.toLowerCase();
        return this.tips.filter(tip =>
            tip.title.toLowerCase().includes(searchTerm) ||
            tip.summary.toLowerCase().includes(searchTerm) ||
            tip.content.toLowerCase().includes(searchTerm) ||
            tip.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
    }

    /**
     * Adiciona nova dica
     * @param {Object} tipData - Dados da dica
     * @returns {Object} Dica criada
     */
    async addTip(tipData) {
        const tip = {
            id: this.generateId(),
            ...tipData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                await this.saveToFirestore(tip);
                // Atualizar lista local
                this.tips.push(tip);
            } else {
                // Fallback para localStorage
                this.tips.push(tip);
                this.saveToStorage();
            }
            return tip;
        } catch (error) {
            console.error('Erro ao adicionar dica:', error);
            // Fallback para localStorage em caso de erro
            this.tips.push(tip);
            this.saveToStorage();
            return tip;
        }
    }

    /**
     * Atualiza dica existente
     * @param {string} id - ID da dica
     * @param {Object} updateData - Dados para atualização
     * @returns {Object|null} Dica atualizada ou null se não encontrada
     */
    async updateTip(id, updateData) {
        const index = this.tips.findIndex(tip => tip.id === id);
        if (index === -1) return null;

        const updatedTip = {
            ...this.tips[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                await this.saveToFirestore(updatedTip);
                // Atualizar lista local
                this.tips[index] = updatedTip;
            } else {
                // Fallback para localStorage
                this.tips[index] = updatedTip;
                this.saveToStorage();
            }
            return updatedTip;
        } catch (error) {
            console.error('Erro ao atualizar dica:', error);
            // Fallback para localStorage em caso de erro
            this.tips[index] = updatedTip;
            this.saveToStorage();
            return updatedTip;
        }
    }

    /**
     * Remove dica
     * @param {string} id - ID da dica
     * @returns {boolean} True se removida com sucesso
     */
    async deleteTip(id) {
        const index = this.tips.findIndex(tip => tip.id === id);
        if (index === -1) return false;

        try {
            if (typeof firebase !== 'undefined' && firebase.firestore) {
                await this.removeFromFirestore(id);
                // Remover da lista local
                this.tips.splice(index, 1);
            } else {
                // Fallback para localStorage
                this.tips.splice(index, 1);
                this.saveToStorage();
            }
            return true;
        } catch (error) {
            console.error('Erro ao remover dica:', error);
            // Fallback para localStorage em caso de erro
            this.tips.splice(index, 1);
            this.saveToStorage();
            return true;
        }
    }

    /**
     * Alterna status da dica
     * @param {string} id - ID da dica
     * @returns {Object|null} Dica atualizada ou null se não encontrada
     */
    async toggleTipStatus(id) {
        const tip = this.getTipById(id);
        if (!tip) return null;

        const newStatus = tip.status === 'published' ? 'draft' : 'published';
        return await this.updateTip(id, { status: newStatus });
    }

    /**
     * Obtém estatísticas das dicas
     * @returns {Object} Estatísticas
     */
    getStatistics() {
        const total = this.tips.length;
        const published = this.tips.filter(tip => tip.status === 'published').length;
        const draft = this.tips.filter(tip => tip.status === 'draft').length;

        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recent = this.tips.filter(tip => {
            const tipDate = new Date(tip.createdAt);
            return tipDate >= weekAgo;
        }).length;

        const categories = [...new Set(this.tips.map(tip => tip.category))];

        return {
            total,
            published,
            draft,
            recent,
            categories: categories.length,
            categoryBreakdown: categories.map(cat => ({
                category: cat,
                count: this.tips.filter(tip => tip.category === cat).length
            }))
        };
    }

    /**
     * Gera ID único
     * @returns {string} ID único
     */
    generateId() {
        return 'tip_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Exporta dicas para JSON
     * @returns {string} JSON das dicas
     */
    exportTips() {
        return JSON.stringify(this.tips, null, 2);
    }

    /**
     * Importa dicas de JSON
     * @param {string} jsonData - Dados JSON
     * @returns {boolean} True se importação bem-sucedida
     */
    importTips(jsonData) {
        try {
            const importedTips = JSON.parse(jsonData);
            if (Array.isArray(importedTips)) {
                this.tips = importedTips;
                this.saveToStorage();
                return true;
            }
        } catch (error) {
            console.error('Erro ao importar dicas:', error);
        }
        return false;
    }
}

// Criar instância global do serviço
const tipsService = new TipsService();

// Exportar para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TipsService;
}

// Disponibilizar globalmente
window.TipsService = TipsService;
window.tipsService = tipsService;

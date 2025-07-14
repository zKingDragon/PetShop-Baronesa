/**
 * Script para criar usuário admin no banco de dados
 * Execute este script no console do navegador após fazer login com a conta que será admin
 */

async function createAdmin() {
    try {
        // Verificar se o Firebase está inicializado
        if (typeof firebase === 'undefined') {
            throw new Error('Firebase não inicializado');
        }

        // Verificar se há um usuário logado
        const currentUser = firebase.auth().currentUser;
        if (!currentUser) {
            throw new Error('Nenhum usuário logado. Faça login primeiro.');
        }

        console.log('Criando admin para usuário:', currentUser.email);

        // Atualizar o documento do usuário no Firestore
        await firebase.firestore().collection('usuarios').doc(currentUser.uid).update({
            type: 'admin',
            Type: 'admin',
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log('✅ Usuário promovido a admin com sucesso!');
        console.log('Faça logout e login novamente para aplicar as permissões.');

        return true;
    } catch (error) {
        console.error('❌ Erro ao criar admin:', error.message);
        return false;
    }
}

// Exemplo de uso:
// 1. Abra o console do navegador (F12)
// 2. Faça login com a conta que será admin
// 3. Execute: createAdmin()

console.log('Para criar um admin, execute: createAdmin()');

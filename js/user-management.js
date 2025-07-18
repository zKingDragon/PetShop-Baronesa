/**
 * User Management System for Pet Shop Baronesa
 * Provides comprehensive user management capabilities for administrators
 * Handles user listing, role changes, and user administration
 */

class UserManagement {
    constructor() {
        this.currentUser = null;
        this.userRole = 'guest';
        this.users = [];
        this.isInitialized = false;
        this.selectedUsers = new Set();

        this.init();
    }

    /**
     * Initialize the user management system
     */
    async init() {
        try {
            console.log('Initializing user management system...');

            // Check if user is admin
            await this.checkAdminAccess();

            // Setup UI elements
            this.setupUserManagementUI();

            // Setup event listeners
            this.setupEventListeners();

            // Load users
            await this.loadUsers();

            this.isInitialized = true;
            console.log('User management system initialized');
        } catch (error) {
             console.error('Error initializing user management:', error);
        }
    }

    /**
     * Check admin access
     */
    async checkAdminAccess() {
        try {
            // Wait for auth system
            await this.waitForAuthSystem();

            // Check if user is admin
            const isAdmin = await this.isUserAdmin();
            if (!isAdmin) {
                throw new Error('Access denied: User is not an administrator');
            }

            this.userRole = 'admin';
            this.currentUser = this.getCurrentUser();
        } catch (error) {
            console.error('Admin access check failed:', error);
            throw error;
        }
    }

    /**
     * Wait for auth system to be available
     */
    async waitForAuthSystem() {
        console.log('[UserManagement] Aguardando sistema de autenticação...');
        let retryCount = 0;
        const maxRetries = 100;

        return new Promise((resolve) => {
            const checkAuth = () => {
                // Check if our auth functions are loaded
                const authFunctionsReady = typeof getCurrentUser === 'function' &&
                                         typeof getCurrentUserType === 'function' &&
                                         typeof isAdmin === 'function';

                console.log(`[UserManagement] Check ${retryCount + 1}/${maxRetries} - Auth Functions Ready: ${authFunctionsReady}`);

                if (authFunctionsReady || retryCount >= maxRetries) {
                    console.log('[UserManagement] Sistema de autenticação pronto ou timeout atingido');
                    resolve();
                    return;
                }

                retryCount++;
                setTimeout(checkAuth, 100);
            };

            checkAuth();
        });
    }

    /**
     * Check if current user is admin
     */
    async isUserAdmin() {
        try {
            console.log('[UserManagement] Verificando se usuário é admin...');

            // Use global isAdmin function if available
            if (typeof isAdmin === 'function') {
                const result = await isAdmin();
                console.log('[UserManagement] isAdmin() result:', result);
                return result;
            }

            // Use getCurrentUserType function if available
            if (typeof getCurrentUserType === 'function') {
                const userType = await getCurrentUserType();
                console.log('[UserManagement] getCurrentUserType() result:', userType);
                return userType === 'admin';
            }

            // Fallback to window.auth
            if (typeof window.auth !== 'undefined' && window.auth.isAdmin) {
                const result = await window.auth.isAdmin();
                console.log('[UserManagement] window.auth.isAdmin() result:', result);
                return result;
            }

            console.log('[UserManagement] Nenhuma função de verificação admin encontrada');
            return false;
        } catch (error) {
            console.error('[UserManagement] Error checking admin status:', error);
            return false;
        }
    }

    /**
     * Get current user
     */
    getCurrentUser() {
        try {
            console.log('[UserManagement] Obtendo usuário atual...');

            // Use global getCurrentUser function if available
            if (typeof getCurrentUser === 'function') {
                const user = getCurrentUser();
                console.log('[UserManagement] getCurrentUser() found:', user ? user.email : 'null');
                return user;
            }

            // Fallback to window.auth
            if (typeof window.auth !== 'undefined' && window.auth.getCurrentUser) {
                const user = window.auth.getCurrentUser();
                console.log('[UserManagement] window.auth.getCurrentUser() found:', user ? user.email : 'null');
                return user;
            }

            console.log('[UserManagement] Nenhuma função getCurrentUser encontrada');
            return null;
        } catch (error) {
            console.error('[UserManagement] Error getting current user:', error);
            return null;
        }
    }

    /**
     * Setup user management UI
     */
    setupUserManagementUI() {
        const userManagementContainer = document.getElementById('user-management-container');
        if (!userManagementContainer) {
            console.warn('User management container not found');
            return;
        }

        userManagementContainer.innerHTML = `
            <div class="user-management-panel">
                <div class="user-management-header">
                    <h3><i class="fas fa-users"></i> Gerenciamento de Usuários</h3>
                    <div class="user-management-actions">
                        <button id="refresh-users-btn" class="btn btn-secondary">
                            <i class="fas fa-sync"></i> Atualizar
                        </button>
                        <button id="bulk-actions-btn" class="btn btn-primary" disabled>
                            <i class="fas fa-cog"></i> Ações em Lote
                        </button>
                    </div>
                </div>

                <div class="user-management-filters">
                    <div class="filter-group">
                        <label for="user-type-filter">Filtrar por tipo:</label>
                        <select id="user-type-filter">
                            <option value="all">Todos</option>
                            <option value="user">Usuários</option>
                            <option value="admin">Administradores</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label for="user-search">Buscar:</label>
                        <input type="text" id="user-search" placeholder="Nome ou email...">
                    </div>
                </div>

                <div class="user-management-content">
                    <div class="user-table-container">
                        <table id="users-table" class="users-table">
                            <thead>
                                <tr>
                                    <th>
                                        <input type="checkbox" id="select-all-users">
                                    </th>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Tipo</th>
                                    <th>Último Login</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody id="users-table-body">
                                <tr>
                                    <td colspan="6" class="loading">
                                        <i class="fas fa-spinner fa-spin"></i> Carregando usuários...
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="user-management-pagination">
                        <button id="prev-page-btn" class="btn btn-secondary" disabled>
                            <i class="fas fa-chevron-left"></i> Anterior
                        </button>
                        <span id="page-info">Página 1 de 1</span>
                        <button id="next-page-btn" class="btn btn-secondary" disabled>
                            Próximo <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Add styles
        this.addUserManagementStyles();
    }

    /**
     * Add CSS styles for user management
     */
    addUserManagementStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .user-management-panel {
                background: white;
                border-radius: 8px;
                padding: 1.5rem;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
                margin: 1rem 0;
            }

            .user-management-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 1rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e9ecef;
            }

            .user-management-actions {
                display: flex;
                gap: 0.5rem;
            }

            .user-management-filters {
                display: flex;
                gap: 1rem;
                margin-bottom: 1rem;
                flex-wrap: wrap;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 0.25rem;
            }

            .filter-group label {
                font-weight: 500;
                font-size: 0.9rem;
                color: #495057;
            }

            .filter-group select,
            .filter-group input {
                padding: 0.5rem;
                border: 1px solid #ced4da;
                border-radius: 4px;
                font-size: 0.9rem;
            }

            .users-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 1rem;
            }

            .users-table th,
            .users-table td {
                padding: 0.75rem;
                text-align: left;
                border-bottom: 1px solid #e9ecef;
            }

            .users-table th {
                background-color: #f8f9fa;
                font-weight: 600;
                color: #495057;
            }

            .users-table tbody tr:hover {
                background-color: #f8f9fa;
            }

            .user-type-badge {
                padding: 0.25rem 0.5rem;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 500;
            }

            .user-type-badge.admin {
                background-color: #dc3545;
                color: white;
            }

            .user-type-badge.user {
                background-color: #28a745;
                color: white;
            }

            .user-actions {
                display: flex;
                gap: 0.25rem;
            }

            .user-actions button {
                padding: 0.25rem 0.5rem;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
            }

            .user-actions .btn-edit {
                background-color: #007bff;
                color: white;
            }

            .user-actions .btn-delete {
                background-color: #dc3545;
                color: white;
            }

            .user-management-pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 1rem;
                padding-top: 1rem;
                border-top: 1px solid #e9ecef;
            }

            .loading {
                text-align: center;
                padding: 2rem;
                color: #6c757d;
            }

            @media (max-width: 768px) {
                .user-management-filters {
                    flex-direction: column;
                }

                .user-management-header {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: flex-start;
                }

                .user-management-actions {
                    width: 100%;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Refresh users button
        const refreshBtn = document.getElementById('refresh-users-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.loadUsers());
        }

        // Bulk actions button
        const bulkActionsBtn = document.getElementById('bulk-actions-btn');
        if (bulkActionsBtn) {
            bulkActionsBtn.addEventListener('click', () => this.showBulkActionsMenu());
        }

        // User type filter
        const userTypeFilter = document.getElementById('user-type-filter');
        if (userTypeFilter) {
            userTypeFilter.addEventListener('change', () => this.filterUsers());
        }

        // User search
        const userSearch = document.getElementById('user-search');
        if (userSearch) {
            userSearch.addEventListener('input', () => this.filterUsers());
        }

        // Select all users
        const selectAllUsers = document.getElementById('select-all-users');
        if (selectAllUsers) {
            selectAllUsers.addEventListener('change', (e) => this.toggleSelectAllUsers(e.target.checked));
        }

        // Pagination
        const prevPageBtn = document.getElementById('prev-page-btn');
        const nextPageBtn = document.getElementById('next-page-btn');

        if (prevPageBtn) {
            prevPageBtn.addEventListener('click', () => this.previousPage());
        }

        if (nextPageBtn) {
            nextPageBtn.addEventListener('click', () => this.nextPage());
        }
    }

    /**
     * Load users from database
     */
    async loadUsers() {
        try {
            console.log('Loading users...');

            const tableBody = document.getElementById('users-table-body');
            if (tableBody) {
                tableBody.innerHTML = '<tr><td colspan="6" class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando usuários...</td></tr>';
            }

            // Get users from Firestore
            const users = await this.fetchUsersFromDatabase();

            this.users = users;
            this.renderUsersTable();

            console.log(`Loaded ${users.length} users`);
        } catch (error) {
            console.error('Error loading users:', error);
            this.showError('Erro ao carregar usuários: ' + error.message);
        }
    }

    /**
     * Fetch users from database
     */
    async fetchUsersFromDatabase() {
        try {
            if (typeof db === 'undefined' || !db) {
                throw new Error('Database not available');
            }

            const usersSnapshot = await db.collection('usuarios').get();
            const users = [];

            usersSnapshot.forEach((doc) => {
                const userData = doc.data();
                users.push({
                    id: doc.id,
                    uid: doc.id,
                    name: userData.name || userData.displayName || 'N/A',
                    email: userData.email || 'N/A',
                    type: userData.type || userData.Type || 'guest',
                    lastLogin: userData.lastLogin || userData.lastSignInTime || null,
                    createdAt: userData.createdAt || userData.creationTime || null,
                    ...userData
                });
            });

            return users;
        } catch (error) {
            console.error('Error fetching users from database:', error);
            throw error;
        }
    }

    /**
     * Render users table
     */
    renderUsersTable() {
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        if (this.users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">Nenhum usuário encontrado</td></tr>';
            return;
        }

        let html = '';
        this.users.forEach(user => {
            html += this.renderUserRow(user);
        });

        tableBody.innerHTML = html;
        this.updateSelectAllState();
    }

    /**
     * Render user row
     */
    renderUserRow(user) {
        const lastLogin = user.lastLogin ?
            new Date(user.lastLogin.seconds * 1000).toLocaleDateString('pt-BR') :
            'Nunca';

        return `
            <tr data-user-id="${user.id}">
                <td>
                    <input type="checkbox" class="user-select" value="${user.id}">
                </td>
                <td>
                    <div class="user-info">
                        <strong>${user.name}</strong>
                        ${user.type === 'admin' ? '<i class="fas fa-crown" style="color: gold; margin-left: 5px;"></i>' : ''}
                    </div>
                </td>
                <td>${user.email}</td>
                <td>
                    <span class="user-type-badge ${user.type}">
                        ${user.type === 'admin' ? 'Administrador' : 'Usuário'}
                    </span>
                </td>
                <td>${lastLogin}</td>
                <td>
                    <div class="user-actions">
                        <button class="btn-edit" onclick="window.userManagement.editUser('${user.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-delete" onclick="window.userManagement.deleteUser('${user.id}')" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    /**
     * Edit user
     */
    async editUser(userId) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            const newType = user.type === 'admin' ? 'guest' : 'admin';
            const confirmMessage = `Tem certeza que deseja ${newType === 'admin' ? 'promover' : 'remover'} ${user.name} ${newType === 'admin' ? 'para administrador' : 'de administrador'}?`;

            if (confirm(confirmMessage)) {
                await this.updateUserType(userId, newType);
                this.showSuccess(`Usuário ${user.name} ${newType === 'admin' ? 'promovido para administrador' : 'removido de administrador'} com sucesso!`);
                await this.loadUsers();
            }
        } catch (error) {
            console.error('Error editing user:', error);
            this.showError('Erro ao editar usuário: ' + error.message);
        }
    }

    /**
     * Update user type
     */
    async updateUserType(userId, newType) {
        try {
            if (typeof window.auth !== 'undefined' && window.auth.updateUserType) {
                await window.auth.updateUserType(userId, newType);
            } else {
                throw new Error('Auth system not available');
            }
        } catch (error) {
            console.error('Error updating user type:', error);
            throw error;
        }
    }

    /**
     * Delete user
     */
    async deleteUser(userId) {
        try {
            const user = this.users.find(u => u.id === userId);
            if (!user) {
                throw new Error('Usuário não encontrado');
            }

            // Prevent admin from deleting themselves
            if (user.id === this.currentUser?.uid) {
                throw new Error('Você não pode excluir sua própria conta');
            }

            if (confirm(`Tem certeza que deseja excluir o usuário ${user.name}? Esta ação não pode ser desfeita.`)) {
                await this.deleteUserFromDatabase(userId);
                this.showSuccess(`Usuário ${user.name} excluído com sucesso!`);
                await this.loadUsers();
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showError('Erro ao excluir usuário: ' + error.message);
        }
    }

    /**
     * Delete user from database
     */
    async deleteUserFromDatabase(userId) {
        try {
            if (typeof db === 'undefined' || !db) {
                throw new Error('Database not available');
            }

            await db.collection('usuarios').doc(userId).delete();
        } catch (error) {
            console.error('Error deleting user from database:', error);
            throw error;
        }
    }

    /**
     * Filter users
     */
    filterUsers() {
        const typeFilter = document.getElementById('user-type-filter')?.value || 'all';
        const searchFilter = document.getElementById('user-search')?.value.toLowerCase() || '';

        let filteredUsers = this.users;

        // Filter by type
        if (typeFilter !== 'all') {
            filteredUsers = filteredUsers.filter(user => user.type === typeFilter);
        }

        // Filter by search
        if (searchFilter) {
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(searchFilter) ||
                user.email.toLowerCase().includes(searchFilter)
            );
        }

        this.renderFilteredUsers(filteredUsers);
    }

    /**
     * Render filtered users
     */
    renderFilteredUsers(users) {
        const tableBody = document.getElementById('users-table-body');
        if (!tableBody) return;

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="loading">Nenhum usuário encontrado com os filtros aplicados</td></tr>';
            return;
        }

        let html = '';
        users.forEach(user => {
            html += this.renderUserRow(user);
        });

        tableBody.innerHTML = html;
    }

    /**
     * Toggle select all users
     */
    toggleSelectAllUsers(checked) {
        const userSelects = document.querySelectorAll('.user-select');
        userSelects.forEach(select => {
            select.checked = checked;
        });
        this.updateSelectedUsers();
    }

    /**
     * Update selected users
     */
    updateSelectedUsers() {
        const selectedCheckboxes = document.querySelectorAll('.user-select:checked');
        this.selectedUsers.clear();

        selectedCheckboxes.forEach(checkbox => {
            this.selectedUsers.add(checkbox.value);
        });

        // Update bulk actions button
        const bulkActionsBtn = document.getElementById('bulk-actions-btn');
        if (bulkActionsBtn) {
            bulkActionsBtn.disabled = this.selectedUsers.size === 0;
        }
    }

    /**
     * Update select all state
     */
    updateSelectAllState() {
        const selectAllCheckbox = document.getElementById('select-all-users');
        const userSelects = document.querySelectorAll('.user-select');

        if (selectAllCheckbox && userSelects.length > 0) {
            const checkedCount = document.querySelectorAll('.user-select:checked').length;
            selectAllCheckbox.checked = checkedCount === userSelects.length;
            selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < userSelects.length;
        }
    }

    /**
     * Show bulk actions menu
     */
    showBulkActionsMenu() {
        const selectedCount = this.selectedUsers.size;
        if (selectedCount === 0) return;

        const actions = [
            { label: 'Promover para Admin', action: 'promote' },
            { label: 'Remover de Admin', action: 'demote' },
            { label: 'Excluir Selecionados', action: 'delete' }
        ];

        let menu = 'Selecione uma ação para os usuários selecionados:\n\n';
        actions.forEach((action, index) => {
            menu += `${index + 1}. ${action.label}\n`;
        });

        const choice = prompt(menu + '\nDigite o número da ação desejada (1-3):');

        if (choice && choice.match(/^[1-3]$/)) {
            const actionIndex = parseInt(choice) - 1;
            this.executeBulkAction(actions[actionIndex].action);
        }
    }

    /**
     * Execute bulk action
     */
    async executeBulkAction(action) {
        try {
            const selectedUserIds = Array.from(this.selectedUsers);

            switch (action) {
                case 'promote':
                    await this.bulkPromoteUsers(selectedUserIds);
                    break;
                case 'demote':
                    await this.bulkDemoteUsers(selectedUserIds);
                    break;
                case 'delete':
                    await this.bulkDeleteUsers(selectedUserIds);
                    break;
            }

            await this.loadUsers();
            this.selectedUsers.clear();
        } catch (error) {
            console.error('Error executing bulk action:', error);
            this.showError('Erro ao executar ação em lote: ' + error.message);
        }
    }

    /**
     * Bulk promote users
     */
    async bulkPromoteUsers(userIds) {
        for (const userId of userIds) {
            await this.updateUserType(userId, 'admin');
        }
        this.showSuccess(`${userIds.length} usuários promovidos para administrador com sucesso!`);
    }

    /**
     * Bulk demote users
     */
    async bulkDemoteUsers(userIds) {
        for (const userId of userIds) {
            await this.updateUserType(userId, 'guest');
        }
        this.showSuccess(`${userIds.length} usuários removidos de administrador com sucesso!`);
    }

    /**
     * Bulk delete users
     */
    async bulkDeleteUsers(userIds) {
        if (confirm(`Tem certeza que deseja excluir ${userIds.length} usuários? Esta ação não pode ser desfeita.`)) {
            for (const userId of userIds) {
                await this.deleteUserFromDatabase(userId);
            }
            this.showSuccess(`${userIds.length} usuários excluídos com sucesso!`);
        }
    }

    /**
     * Previous page
     */
    previousPage() {
        // Implementation for pagination
        console.log('Previous page');
    }

    /**
     * Next page
     */
    nextPage() {
        // Implementation for pagination
        console.log('Next page');
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'user-management-notification success';
        successDiv.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(successDiv);

        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'user-management-notification error';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(errorDiv);

        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    /**
     * Get user statistics
     */
    getUserStats() {
        const totalUsers = this.users.length;
        const adminCount = this.users.filter(u => u.type === 'admin').length;
        const guestCount = this.users.filter(u => u.type === 'guest').length;

        return {
            total: totalUsers,
            admins: adminCount,
            guests: guestCount
        };
    }

    /**
     * Export users data
     */
    exportUsers() {
        const data = this.users.map(user => ({
            nome: user.name,
            email: user.email,
            tipo: user.type,
            ultimoLogin: user.lastLogin ? new Date(user.lastLogin.seconds * 1000).toLocaleDateString('pt-BR') : 'Nunca'
        }));

        const csvContent = this.convertToCSV(data);
        this.downloadCSV(csvContent, 'usuarios_petshop_baronesa.csv');
    }

    /**
     * Convert data to CSV
     */
    convertToCSV(data) {
        const headers = Object.keys(data[0]);
        const csvRows = [headers.join(',')];

        data.forEach(row => {
            const values = headers.map(header => row[header]);
            csvRows.push(values.join(','));
        });

        return csvRows.join('\n');
    }

    /**
     * Download CSV file
     */
    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Initialize user management when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Only initialize if on admin page and user management container exists
    if (document.getElementById('user-management-container')) {
        window.userManagement = new UserManagement();
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManagement;
}

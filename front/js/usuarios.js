document.addEventListener('DOMContentLoaded', function() {
    // Variables para paginación
    let currentPage = 1;
    const usersPerPage = 10;
    let allUsers = [];
    
    // Elementos del DOM
    const usersTableBody = document.getElementById('users-table-body');
    const addUserBtn = document.getElementById('add-user-btn');
    const userModal = document.getElementById('user-modal');
    const resetPasswordModal = document.getElementById('reset-password-modal');
    const userForm = document.getElementById('user-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const prevPageBtn = document.getElementById('prev-page');
    const nextPageBtn = document.getElementById('next-page');
    const pageInfo = document.getElementById('page-info');
    
    // Cargar usuarios al iniciar
    loadUsers();
    
    // Función para cargar usuarios desde la API
    function loadUsers() {
        // Simulación de datos - en la práctica harías una petición fetch a tu API
        // fetch('/api/users')
        //   .then(response => response.json())
        //   .then(data => {
        //       allUsers = data;
        //       renderUsers();
        //   });
        
        // Datos de ejemplo
        allUsers = [
            { id: 1, firstName: 'Admin', lastName: 'Principal', email: 'admin@tienda.com', 
              role: 'admin', lastLogin: '2023-06-15 14:30:22', status: 'active', phone: '5551234567' },
            { id: 2, firstName: 'Juan', lastName: 'Pérez', email: 'juan@tienda.com', 
              role: 'cashier', lastLogin: '2023-06-14 09:15:43', status: 'active', phone: '5557654321' },
            { id: 3, firstName: 'María', lastName: 'Gómez', email: 'maria@tienda.com', 
              role: 'inventory', lastLogin: '2023-06-10 16:22:18', status: 'active', phone: '5559876543' },
            { id: 4, firstName: 'Pedro', lastName: 'Martínez', email: 'pedro@tienda.com', 
              role: 'cashier', lastLogin: '2023-05-28 11:05:37', status: 'inactive', phone: '5554567890' }
        ];
        
        renderUsers();
    }
    
    // Función para renderizar usuarios en la tabla
    function renderUsers() {
        // Filtrar usuarios según los filtros seleccionados
        const roleFilter = document.getElementById('role-filter').value;
        const statusFilter = document.getElementById('status-filter').value;
        const searchTerm = document.getElementById('user-search').value.toLowerCase();
        
        let filteredUsers = allUsers.filter(user => {
            return (roleFilter === 'all' || user.role === roleFilter) &&
                   (statusFilter === 'all' || user.status === statusFilter) &&
                   (searchTerm === '' || 
                    user.firstName.toLowerCase().includes(searchTerm) || 
                    user.lastName.toLowerCase().includes(searchTerm) || 
                    user.email.toLowerCase().includes(searchTerm));
        });
        
        // Paginación
        const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
        const startIndex = (currentPage - 1) * usersPerPage;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + usersPerPage);
        
        // Actualizar controles de paginación
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
        
        // Limpiar tabla
        usersTableBody.innerHTML = '';
        
        // Llenar tabla con usuarios
        paginatedUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Formatear fecha de último acceso
            const lastLogin = user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Nunca';
            
            // Determinar clase de estado
            const statusClass = user.status === 'active' ? 'active' : 'inactive';
            
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.firstName} ${user.lastName}</td>
                <td>${user.email}</td>
                <td>${getRoleName(user.role)}</td>
                <td>${lastLogin}</td>
                <td><span class="status-badge ${statusClass}">${user.status === 'active' ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                    <button class="btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i></button>
                    <button class="btn-delete" data-id="${user.id}"><i class="fas fa-trash"></i></button>
                    <button class="btn-reset" data-id="${user.id}" data-email="${user.email}"><i class="fas fa-key"></i></button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
        
        // Agregar event listeners a los botones de cada fila
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', () => editUser(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteUser(btn.dataset.id));
        });
        
        document.querySelectorAll('.btn-reset').forEach(btn => {
            btn.addEventListener('click', () => showResetPasswordModal(btn.dataset.id, btn.dataset.email));
        });
    }
    
    // Función para obtener el nombre del rol
    function getRoleName(roleKey) {
        const roles = {
            'admin': 'Administrador',
            'cashier': 'Cajero',
            'inventory': 'Inventario'
        };
        return roles[roleKey] || roleKey;
    }
    
    // Función para mostrar el modal de nuevo usuario
    addUserBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Nuevo Usuario';
        document.getElementById('user-id').value = '';
        document.getElementById('password-group').style.display = 'block';
        userForm.reset();
        userModal.style.display = 'block';
    });
    
    // Función para editar usuario
    function editUser(userId) {
        const user = allUsers.find(u => u.id == userId);
        if (!user) return;
        
        document.getElementById('modal-title').textContent = 'Editar Usuario';
        document.getElementById('user-id').value = user.id;
        document.getElementById('first-name').value = user.firstName;
        document.getElementById('last-name').value = user.lastName;
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('status').value = user.status;
        document.getElementById('phone').value = user.phone || '';
        
        // Ocultar campo de contraseña al editar
        document.getElementById('password-group').style.display = 'none';
        
        userModal.style.display = 'block';
    }
    
    // Función para mostrar modal de restablecer contraseña
    function showResetPasswordModal(userId, userEmail) {
        document.getElementById('reset-user-id').value = userId;
        document.querySelector('#reset-password-modal .modal-header h3').textContent = 
            `Restablecer contraseña para ${userEmail}`;
        resetPasswordForm.reset();
        resetPasswordModal.style.display = 'block';
    }
    
    // Función para eliminar usuario
    function deleteUser(userId) {
        if (!confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
            return;
        }
        
        // En una aplicación real, harías una petición DELETE a tu API
        // fetch(`/api/users/${userId}`, { method: 'DELETE' })
        //   .then(response => {
        //       if (response.ok) {
        //           loadUsers(); // Recargar la lista
        //       }
        //   });
        
        // Simulación de eliminación
        allUsers = allUsers.filter(user => user.id != userId);
        renderUsers();
        alert('Usuario eliminado correctamente');
    }
    
    // Manejar envío del formulario de usuario
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('user-id').value;
        const isNewUser = userId === '';
        
        // Validación básica
        if (!document.getElementById('first-name').value || 
            !document.getElementById('last-name').value || 
            !document.getElementById('email').value) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }
        
        // En una aplicación real, harías una petición POST/PUT a tu API
        // const method = isNewUser ? 'POST' : 'PUT';
        // const url = isNewUser ? '/api/users' : `/api/users/${userId}`;
        
        // const userData = {
        //     firstName: document.getElementById('first-name').value,
        //     lastName: document.getElementById('last-name').value,
        //     email: document.getElementById('email').value,
        //     role: document.getElementById('role').value,
        //     status: document.getElementById('status').value,
        //     phone: document.getElementById('phone').value || null
        // };
        
        // if (isNewUser) {
        //     userData.password = document.getElementById('password').value;
        // }
        
        // fetch(url, {
        //     method: method,
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(userData)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     loadUsers(); // Recargar la lista
        //     userModal.style.display = 'none';
        // });
        
        // Simulación de guardado
        if (isNewUser) {
            // Crear nuevo usuario
            const newUser = {
                id: allUsers.length > 0 ? Math.max(...allUsers.map(u => u.id)) + 1 : 1,
                firstName: document.getElementById('first-name').value,
                lastName: document.getElementById('last-name').value,
                email: document.getElementById('email').value,
                role: document.getElementById('role').value,
                status: document.getElementById('status').value,
                phone: document.getElementById('phone').value || null,
                lastLogin: null
            };
            
            allUsers.push(newUser);
        } else {
            // Actualizar usuario existente
            const userIndex = allUsers.findIndex(u => u.id == userId);
            if (userIndex !== -1) {
                allUsers[userIndex] = {
                    ...allUsers[userIndex],
                    firstName: document.getElementById('first-name').value,
                    lastName: document.getElementById('last-name').value,
                    email: document.getElementById('email').value,
                    role: document.getElementById('role').value,
                    status: document.getElementById('status').value,
                    phone: document.getElementById('phone').value || null
                };
            }
        }
        
        renderUsers();
        userModal.style.display = 'none';
        alert(`Usuario ${isNewUser ? 'creado' : 'actualizado'} correctamente`);
    });
    
    // Manejar envío del formulario de restablecer contraseña
    resetPasswordForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }
        
        if (newPassword.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        const userId = document.getElementById('reset-user-id').value;
        
        // En una aplicación real, harías una petición a tu API
        // fetch(`/api/users/${userId}/reset-password`, {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify({ password: newPassword })
        // })
        // .then(response => {
        //     if (response.ok) {
        //         resetPasswordModal.style.display = 'none';
        //         alert('Contraseña actualizada correctamente');
        //     }
        // });
        
        // Simulación de actualización
        resetPasswordModal.style.display = 'none';
        alert('Contraseña actualizada correctamente');
    });
    
    // Paginación
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderUsers();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        const totalPages = Math.ceil(allUsers.length / usersPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderUsers();
        }
    });
    
    // Filtros
    document.getElementById('role-filter').addEventListener('change', () => {
        currentPage = 1;
        renderUsers();
    });
    
    document.getElementById('status-filter').addEventListener('change', () => {
        currentPage = 1;
        renderUsers();
    });
    
    document.getElementById('user-search').addEventListener('input', () => {
        currentPage = 1;
        renderUsers();
    });
    
    // Mostrar/ocultar contraseña
    document.getElementById('show-password').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
    
    document.querySelector('.show-password').addEventListener('click', function() {
        const passwordInput = document.getElementById('new-password');
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            passwordInput.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    });
    
    // Cerrar modales
    document.querySelectorAll('.close-modal, .btn-cancel').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.modal').forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });
    
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
});
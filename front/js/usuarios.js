let allUsers = [];

async function cargarRoles() {
    const res = await fetch('/api/usuarios/roles', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });

    const roles = await res.json();
    const select = document.getElementById('role');
    select.innerHTML = '<option value="">Seleccionar...</option>';

    roles.forEach(rol => {
        select.innerHTML += `<option value="${rol.id_rol}">${rol.nombre_rol}</option>`;
    });
}

async function cargarUsuarios() {
    const res = await fetch('/api/usuarios', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    });

    const data = await res.json();
    allUsers = data;
    renderUsers();
}

function renderUsers() {
    const roleFilter = document.getElementById('role-filter').value;
    const statusFilter = document.getElementById('status-filter').value;
    const searchTerm = document.getElementById('user-search').value.toLowerCase();
    const usersTableBody = document.getElementById('users-table-body');

    const filtered = allUsers.filter(user => {
        return (roleFilter === 'all' || user.nombre_rol === roleFilter) &&
               (statusFilter === 'all' || (user.activo ? 'active' : 'inactive') === statusFilter) &&
               (user.nombre.toLowerCase().includes(searchTerm) || 
                user.numero_trabajador.toLowerCase().includes(searchTerm));
    });

    usersTableBody.innerHTML = '';
    filtered.forEach(user => {
        usersTableBody.innerHTML += `
            <tr>
                <td>${user.id_usuario}</td>
                <td>${user.nombre}</td>
                <td>${user.numero_trabajador}</td>
                <td>${user.nombre_rol}</td>
                <td>—</td>
                <td>
                    <span class="status-badge ${user.activo ? 'active' : 'inactive'}">
                        ${user.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn-icon btn-edit" onclick="editUser(${user.id_usuario})"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon btn-delete" onclick="deleteUser(${user.id_usuario})"><i class="fas fa-trash"></i></button>
                    <button class="btn-icon btn-reset" onclick="showResetPasswordModal(${user.id_usuario}, '${user.numero_trabajador}')"><i class="fas fa-key"></i></button>
                </td>
            </tr>
        `;
    });
}

function editUser(id) {
    const user = allUsers.find(u => u.id_usuario == id);
    if (!user) return;

    const [firstName, ...lastParts] = user.nombre.split(' ');
    document.getElementById('user-id').value = user.id_usuario;
    document.getElementById('first-name').value = firstName;
    document.getElementById('last-name').value = lastParts.join(' ');
    document.getElementById('email').value = user.numero_trabajador;
    document.getElementById('role').value = user.id_rol;
    document.getElementById('status').value = user.activo ? 'active' : 'inactive';
    document.getElementById('phone').value = user.telefono || '';
    document.getElementById('password-group').style.display = 'none';

    document.getElementById('modal-title').textContent = 'Editar Usuario';
    document.getElementById('user-modal').style.display = 'block';
}

function deleteUser(id) {
    if (!confirm('¿Seguro que quieres eliminar este usuario?')) return;

    fetch(`/api/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
    })
    .then(res => res.json())
    .then(data => {
        alert(data.mensaje);
        cargarUsuarios();
    });
}

function showResetPasswordModal(id, username) {
    document.getElementById('reset-user-id').value = id;
    document.getElementById('reset-password-modal').style.display = 'block';
}

document.getElementById('reset-password-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('reset-user-id').value;
    const nueva = document.getElementById('new-password').value;
    const confirm = document.getElementById('confirm-password').value;

    if (nueva !== confirm) return alert('Las contraseñas no coinciden');

    const res = await fetch(`/api/usuarios/${id}/reset-password`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify({ nuevaPassword: nueva })
    });

    const result = await res.json();
    alert(result.mensaje);
    document.getElementById('reset-password-modal').style.display = 'none';
});

document.getElementById('add-user-btn').addEventListener('click', () => {
    document.getElementById('user-id').value = '';
    document.getElementById('user-form').reset();
    document.getElementById('password-group').style.display = 'block';
    document.getElementById('modal-title').textContent = 'Nuevo Usuario';
    document.getElementById('user-modal').style.display = 'block';
});

document.getElementById('user-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const id = document.getElementById('user-id').value;
    const isNew = id === '';

    const data = {
        nombre: document.getElementById('first-name').value + ' ' + document.getElementById('last-name').value,
        numero_trabajador: document.getElementById('email').value,
        id_rol: parseInt(document.getElementById('role').value),
        activo: document.getElementById('status').value === 'active',
        telefono: document.getElementById('phone').value || null
    };

    if (isNew) {
        data.contrasena = document.getElementById('password').value;
    }

    const res = await fetch(isNew ? '/api/usuarios' : `/api/usuarios/${id}`, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('token')
        },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    alert(result.mensaje);
    document.getElementById('user-modal').style.display = 'none';
    cargarUsuarios();
});

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
    cargarRoles();
});

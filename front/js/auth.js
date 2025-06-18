// --- Constantes ---
const LOGIN_ENDPOINT = '/api/auth/login';
const PUBLIC_PAGES = ['login.html'];
const ADMIN_HOME = 'index.html';
const CASHIER_HOME = 'ventasCajero.html';

// --- Verificación al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split('/').pop();
    const isPublicPage = PUBLIC_PAGES.includes(currentPath);
    const token = localStorage.getItem('token');
    const currentUser = getCurrentUser();

    // Si no hay token y no es página pública, redirige a login
    /*if (!isPublicPage && !token) {
        redirectToLogin();
        return;
    }*/
    
        const isGuest = window.location.search.includes('guest=true');

    if (!isPublicPage && !token && !isGuest) {
        redirectToLogin();
        return;
    }


    // Si hay usuario logueado
    if (currentUser && token) {
        displayUserProfile(currentUser);

        // Redirigir automáticamente si está en página equivocada
        const isAdminPage = ['index.html', 'usuarios.html', 'inventario.html','reportes.html'].includes(currentPath);
        const isCashierPage = currentPath === 'ventasCajero.html';

        if (currentUser.rol === 'administrador' && !isAdminPage) {
            window.location.href = ADMIN_HOME;
        } else if (currentUser.rol === 'cajero' && !isCashierPage) {
            window.location.href = CASHIER_HOME;
        }
    }

    // Si estamos en login.html, limpiar cualquier sesión previa
    if (currentPath === 'login.html') {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rol');
    }
});

// --- Obtener usuario actual del localStorage ---
function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    try {
        return userData ? JSON.parse(userData) : null;
    } catch (err) {
        console.error('Error al parsear usuario:', err);
        return null;
    }
}

// --- Mostrar nombre del usuario en UI ---
function displayUserProfile(user) {
    const profileSpan = document.querySelector('.user-profile span');
    if (profileSpan && user.nombre) {
        profileSpan.textContent = user.nombre;
    }
}

// --- Redirigir al login ---
function redirectToLogin() {
    window.location.href = 'login.html';
}

// --- Manejador de login ---
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
    e.preventDefault();
    const numero_trabajador = document.getElementById('numero_trabajador').value.trim();
    const contrasena = document.getElementById('password').value.trim();
    const errorElement = document.getElementById('errorMessage');

    if (!numero_trabajador || !contrasena) {
        showError(errorElement, 'Número de trabajador y contraseña son requeridos');
        return;
    }

    try {
        const response = await fetch(LOGIN_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ numero_trabajador, contrasena })
        });

        const result = await response.json();

        if (response.ok) {
            processSuccessfulLogin(result);
        } else {
            throw new Error(result.error || 'Credenciales inválidas');
        }
    } catch (err) {
        console.error('Error de conexión:', err);
        showError(errorElement, err.message || 'Error de conexión con el servidor');
    }
}

function processSuccessfulLogin(result) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('currentUser', JSON.stringify(result.user));
    localStorage.setItem('rol', result.user.rol);

    if (result.user.rol === 'administrador') {
        window.location.href = ADMIN_HOME;
    } else if (result.user.rol === 'cajero') {
        window.location.href = CASHIER_HOME;
    } else {
        alert('Rol no reconocido. Contacta al administrador.');
    }
}

// --- Mostrar errores en pantalla ---
function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

// --- Cerrar sesión ---
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('rol');
    redirectToLogin();
}

// --- Redirección para botón de invitado ---
const guestBtn = document.getElementById('guestBtn');
if (guestBtn) {
    guestBtn.addEventListener('click', function () {
        window.location.href = 'ventas.html?guest=true';
    });
}

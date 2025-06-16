/**
 * Módulo de autenticación - Manejo de login, logout y protección de rutas
 */

// Constantes
const LOGIN_ENDPOINT = '/api/auth/login';
const PUBLIC_PAGES = ['login.html'];
const ADMIN_HOME = 'index.html';
const CASHIER_HOME = 'ventas.html';

// Verificación de autenticación al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    const currentPath = window.location.pathname.split('/').pop();
    const isPublicPage = PUBLIC_PAGES.includes(currentPath);
    const token = localStorage.getItem('token');
    const currentUser = getCurrentUser();

    // Redirecciones según el estado de autenticación
    if (!isPublicPage && !token) {
        redirectToLogin();
        return;
    }

    // Mostrar información del usuario logueado
    if (currentUser) {
        displayUserProfile(currentUser);
        
        // Redirigir según rol si está en página incorrecta
        const isAdminPage = currentPath === 'index.html' || currentPath === 'usuarios.html';
        const isCashierPage = currentPath === 'ventas.html';
        
        if (currentUser.rol === 'administrador' && !isAdminPage) {
            window.location.href = ADMIN_HOME;
        } else if (currentUser.rol === 'cajero' && !isCashierPage) {
            window.location.href = CASHIER_HOME;
        }
    }
});

// Manejador del formulario de login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Manejador del botón de logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
}

/**
 * Funciones auxiliares
 */

function getCurrentUser() {
    const userData = localStorage.getItem('currentUser');
    try {
        return userData ? JSON.parse(userData) : null;
    } catch (err) {
        console.error('Error al parsear usuario:', err);
        return null;
    }
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function displayUserProfile(user) {
    const profileSpan = document.querySelector('.user-profile span');
    if (profileSpan && user.nombre) {
        profileSpan.textContent = user.nombre;
    }
}

async function handleLogin(e) {
    e.preventDefault();

    const numero_trabajador = document.getElementById('numero_trabajador').value.trim();
    const contrasena = document.getElementById('password').value.trim();
    const errorElement = document.getElementById('errorMessage');

    // Validación de campos
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
            showError(errorElement, result.error || 'Credenciales inválidas');
        }
    } catch (err) {
        console.error('Error de conexión:', err);
        showError(errorElement, 'Error de conexión con el servidor');
    }
}

function processSuccessfulLogin(result) {
    localStorage.setItem('token', result.token);
    localStorage.setItem('currentUser', JSON.stringify(result.user));

    // Redirigir según rol
    if (result.user.rol === 'administrador') {
        window.location.href = ADMIN_HOME;
    } else if (result.user.rol === 'cajero') {
        window.location.href = CASHIER_HOME;
    }
}

function showError(element, message) {
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
    }
}

function handleLogout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    redirectToLogin();
}
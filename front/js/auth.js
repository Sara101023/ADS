// --- Constantes ---
const LOGIN_ENDPOINT = '/api/auth/login';
const PUBLIC_PAGES = ['login.html'];
const ADMIN_HOME = 'index.html';
const CASHIER_HOME = 'ventas.html';

// --- Verificación al cargar la página ---
document.addEventListener('DOMContentLoaded', () => {
    const currentPath = window.location.pathname.split('/').pop();
    const isPublicPage = PUBLIC_PAGES.includes(currentPath);
    const token = localStorage.getItem('token');
    const currentUser = getCurrentUser();
    const isGuest = window.location.search.includes('guest=true');

    // 🔒 Si no tiene token y no es invitado ni página pública → redirigir a login
    if (!isPublicPage && !token && !isGuest) {
        redirectToLogin();
        return;
    }

    // 🧼 Si estamos en login.html, limpiar sesión previa (y no redirigir)
    if (currentPath === 'login.html') {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('rol');
    }

    // Mostrar el nombre del usuario si está logueado y ya entró a una página autorizada
    if (currentUser && token) {
        displayUserProfile(currentUser);
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

// --- Botón de invitado ---
const guestBtn = document.getElementById('guestBtn');
if (guestBtn) {
    guestBtn.addEventListener('click', function () {
        window.location.href = 'ventas.html?guest=true';
    });
}

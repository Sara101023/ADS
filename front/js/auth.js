// Verificación de autenticación (solo si existe el formulario de login o si estamos en páginas protegidas)
document.addEventListener('DOMContentLoaded', function () {
  const isLoginPage = document.getElementById('loginForm') !== null;
  const isVentasPage = window.location.pathname.includes('ventas.html');

  const urlParams = new URLSearchParams(window.location.search);
  const isGuest = urlParams.has('guest');
  const currentUser = localStorage.getItem('currentUser');

  if (!isLoginPage && !isGuest && !currentUser) {
    // Si no está en login, ni es invitado, ni hay usuario logueado, redirige
    window.location.href = 'login.html';
    return;
  }

  if (isGuest && currentUser && isVentasPage) {
    // Si es invitado pero ya inició sesión, lo mandamos a la versión con login
    window.location.href = 'ventas.html';
    return;
  }

  if (isVentasPage && isGuest) {
    // Si es invitado, muestra el banner
    const guestBanner = document.getElementById('guestBanner');
    if (guestBanner) guestBanner.style.display = 'block';
  }

  // Mostrar nombre si está logueado
  if (currentUser) {
    try {
      const user = JSON.parse(currentUser);
      const span = document.querySelector('.user-profile span');
      if (span && user.nombre) span.textContent = user.nombre;
    } catch (err) {
      console.error('Error al cargar usuario:', err);
    }
  }
});

// Manejador del formulario de login (si existe)
const form = document.getElementById('loginForm');
if (form) {
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const numero_trabajador = document.getElementById('numero_trabajador').value.trim();
    const contrasena = document.getElementById('password').value.trim();

    if (!numero_trabajador || !contrasena) {
      document.getElementById('errorMessage').textContent = 'Número de trabajador y contraseña son requeridos';
      document.getElementById('errorMessage').style.display = 'block';
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_trabajador, contrasena })
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));

        const rol = result.user.rol?.toLowerCase();
        if (rol === 'administrador') {
          window.location.href = 'index.html';
        } else if (rol === 'cajero') {
          window.location.href = 'ventas.html';
        } else {
          alert('Rol no reconocido');
        }
      } else {
        document.getElementById('errorMessage').textContent = result.error || 'Credenciales inválidas';
        document.getElementById('errorMessage').style.display = 'block';
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      document.getElementById('errorMessage').textContent = 'Error de conexión con el servidor.';
      document.getElementById('errorMessage').style.display = 'block';
    }
  });
}

// Botón de logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
  });
}

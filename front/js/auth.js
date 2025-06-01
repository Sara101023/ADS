document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const numero_trabajador = document.getElementById('numero_trabajador').value.trim();
    const contrasena = document.getElementById('password').value;

    if (!numero_trabajador || !contrasena) {
      errorMessage.textContent = 'Número de trabajador y contraseña son requeridos';
      errorMessage.style.display = 'block';
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ numero_trabajador, contrasena })
      });

      const result = await response.json();

      if (response.ok) {
        // Guardar token y usuario
        localStorage.setItem('token', result.token);
        localStorage.setItem('currentUser', JSON.stringify(result.user));

        // Redirigir según el rol
        const rol = result.user.rol?.toLowerCase();
        if (rol === 'administrador') {
          window.location.href = 'index.html';
        } else if (rol === 'cajero') {
          window.location.href = 'ventasUSUARIO.html';
        } else {
          window.location.href = 'login.html';
        }
      } else {
        errorMessage.textContent = result.error || 'Usuario o contraseña incorrectos';
        errorMessage.style.display = 'block';
      }
    } catch (error) {
      console.error('Error en login:', error);
      errorMessage.textContent = 'Error de conexión con el servidor.';
      errorMessage.style.display = 'block';
    }
  });
});

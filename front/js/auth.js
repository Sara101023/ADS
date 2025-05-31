document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numero_trabajador, contrasena })
      });

      const data = await response.json();

      if (!response.ok) {
        errorMessage.style.display = 'block';
        errorMessage.textContent = data.error || 'Error en el inicio de sesión';
        return;
      }

      // Guardar token y usuario en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Redireccionar según el rol
      const role = data.user.role;
      if (role === 'administrador') {
        window.location.href = '/usuarios.html';
      } else if (role === 'cajero') {
        window.location.href = '/ventas.html';
      } else if (role === 'inventario') {
        window.location.href = '/inventario.html';
      } else {
        alert('Rol no reconocido');
      }

    } catch (error) {
      console.error('Error en login:', error);
      errorMessage.style.display = 'block';
      errorMessage.textContent = 'Error de conexión con el servidor';
    }
  });
});

document.getElementById('loginForm').addEventListener('submit', async function (e) {
  e.preventDefault(); // Evita que recargue la página

  const numero_trabajador = document.getElementById('numero_trabajador').value.trim();
  const contrasena = document.getElementById('password').value;

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
      // Login correcto
      console.log('Login exitoso:', result);

      // Guarda el token JWT para futuras peticiones
      localStorage.setItem('token', result.token);

      // Redirección por rol
      switch (result.user.role.toLowerCase()) {
        case 'administrador':
          window.location.href = 'index.html';
          break;
        case 'cajero':
          window.location.href = 'ventas.html';
          break;
        default:
          window.location.href = 'index.html';
      }
    } else {
      // Mostrar mensaje de error
      console.error('Error en login:', result);
      const errorMessage = document.getElementById('errorMessage');
      errorMessage.textContent = result.error || 'Usuario o contraseña incorrectos';
      errorMessage.style.display = 'block';
    }
  } catch (error) {
    console.error('Error de conexión:', error);
    const errorMessage = document.getElementById('errorMessage');
    errorMessage.textContent = 'Error de conexión al servidor.';
    errorMessage.style.display = 'block';
  }
});


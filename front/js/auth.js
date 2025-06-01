document.getElementById('loginForm').addEventListener('submit', async function (e) {
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ numero_trabajador, contrasena })
    });

    const result = await response.json();

    if (response.ok) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('currentUser', JSON.stringify(result.user));

      const rol = result.user.rol?.toLowerCase();
      switch (rol) {
        case 'administrador':
          window.location.href = 'index.html';
          break;
        case 'cajero':
          window.location.href = 'ventasUSUARIO.html';
          break;
        default:
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

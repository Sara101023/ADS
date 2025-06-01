// =============================================
// FUNCIÓN PARA ACTUALIZAR FECHA Y HORA
// =============================================
function updateDateTime() {
    const now = new Date();
    const dateOptions = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');

    if (dateEl) {
        dateEl.textContent = now.toLocaleDateString('es-MX', dateOptions);
    }
    
    if (timeEl) {
        timeEl.textContent = now.toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// Iniciar la actualización de fecha y hora
setInterval(updateDateTime, 1000);
updateDateTime(); // Llamada inicial

// =============================================
// INICIALIZACIÓN CUANDO EL DOM ESTÉ LISTO
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // =========================================
    // VERIFICACIÓN DE AUTENTICACIÓN
    // =========================================
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoginPage = window.location.pathname.endsWith('login.html');
    
    // Redirigir si no hay usuario y no está en página de login
    if (!currentUser && !isLoginPage) {
        window.location.href = 'login.html';
        return;
    }
    
    // Redirigir si hay usuario pero está en página de login
    if (currentUser && isLoginPage) {
        window.location.href = 'index.html';
        return;
    }

    // Si llegamos aquí, hay usuario y no es página de login
    // =========================================
    // CONFIGURACIÓN DE INTERFAZ DE USUARIO
    // =========================================
    const userProfile = document.querySelector('.user-profile span');
    if (userProfile) {
        userProfile.textContent = currentUser.name;
    }

    // =========================================
    // FILTRADO DE MÓDULOS SEGÚN ROL
    // =========================================
    const menuItems = document.querySelectorAll('.menu li');
    menuItems.forEach(item => {
        const link = item.querySelector('a')?.getAttribute('href');
        
        if (currentUser.role === 'cajero') {
            if (link && ['usuarios.html', 'reportes.html', 'promociones.html'].includes(link)) {
                item.style.display = 'none';
            }
        } else if (currentUser.role === 'facturador') {
            if (link && ['usuarios.html', 'inventario.html', 'promociones.html'].includes(link)) {
                item.style.display = 'none';
            }
        }
    });

    // =========================================
    // INICIALIZACIÓN DE GRÁFICOS
    // =========================================
    
    // Gráfico de Ventas
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
        new Chart(salesCtx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Ventas ($)',
                    data: [1800, 2200, 1500, 1900, 2300, 1700, 2600],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3498db',
                    pointBorderColor: '#fff',
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `$${context.raw.toLocaleString('es-MX')}`;
                            }
                        }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return `$${value}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Gráfico de Productos
    const productsCtx = document.getElementById('productsChart');
    if (productsCtx) {
        new Chart(productsCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Refrescos', 'Botanas', 'Lácteos', 'Panadería', 'Abarrotes'],
                datasets: [{
                    data: [35, 25, 15, 10, 15],
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#f39c12',
                        '#e74c3c',
                        '#9b59b6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            boxWidth: 15,
                            padding: 15
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}: ${context.raw}%`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }

    // =========================================
    // MANEJADOR DE CIERRE DE SESIÓN
    // =========================================
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
        });
    }
});
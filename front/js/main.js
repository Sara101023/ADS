// Actualizar fecha y hora
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = now.toLocaleDateString('es-MX', options);
    document.getElementById('current-time').textContent = now.toLocaleTimeString('es-MX');
}

setInterval(updateDateTime, 1000);
updateDateTime();

// Inicializar gráficos
document.addEventListener('DOMContentLoaded', function() {
    // Gráfico de ventas
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    const salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Ventas',
                data: [1200, 1900, 1500, 2000, 2500, 2200, 3000],
                backgroundColor: 'rgba(52, 152, 219, 0.2)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Gráfico de productos
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    const productsChart = new Chart(productsCtx, {
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
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });
});

// Verificar autenticación
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser) {
        window.location.href = 'login.html';
    } else {
        // Mostrar información del usuario
        document.querySelector('.user-profile span').textContent = currentUser.name;
        
        // Mostrar solo los módulos según el rol
        const menuItems = document.querySelectorAll('.menu li');
        
        menuItems.forEach(item => {
            const link = item.querySelector('a').getAttribute('href');
            
            // Ocultar módulos según el rol
            if (currentUser.role === 'cajero') {
                if (link === 'usuarios.html' || link === 'reportes.html' || link === 'promociones.html') {
                    item.style.display = 'none';
                }
            } else if (currentUser.role === 'facturador') {
                if (link === 'usuarios.html' || link === 'inventario.html' || link === 'promociones.html') {
                    item.style.display = 'none';
                }
            }
        });
    }
});

// Cerrar sesión
document.getElementById('logout-btn').addEventListener('click', function() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';

    // 🕒 Actualizar fecha y hora
function updateDateTime() {
    const now = new Date();
    const optionsDate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = now.toLocaleDateString('es-MX', optionsDate);
    const time = now.toLocaleTimeString('es-MX');

    document.getElementById('current-date').textContent = date;
    document.getElementById('current-time').textContent = time;
}

setInterval(updateDateTime, 1000);
updateDateTime();

// 📊 Gráfica de ventas por día
const ctxSales = document.getElementById('salesChart').getContext('2d');
const salesChart = new Chart(ctxSales, {
    type: 'line',
    data: {
        labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
        datasets: [{
            label: 'Ventas (MXN)',
            data: [1800, 2200, 1500, 1900, 2300, 1700, 2600],
            borderColor: '#00ff85',
            backgroundColor: 'rgba(0, 255, 133, 0.1)',
            tension: 0.4,
            fill: true,
            pointRadius: 5,
            pointBackgroundColor: '#00ff85',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                labels: {
                    color: '#333',
                    font: { weight: 'bold' }
                }
            }
        },
        scales: {
            x: {
                ticks: {
                    color: '#555'
                },
                grid: {
                    display: false
                }
            },
            y: {
                ticks: {
                    color: '#555',
                    beginAtZero: true
                },
                grid: {
                    color: '#eee'
                }
            }
        }
    }
});

});
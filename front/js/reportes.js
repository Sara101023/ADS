document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datepickers
    flatpickr(".datepicker", {
        locale: "es",
        dateFormat: "d/m/Y",
        allowInput: true
    });
    
    // Mostrar/ocultar rango de fechas personalizado
    document.querySelectorAll('.frequency-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.frequency-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const isCustom = this.dataset.frequency === 'custom';
            document.getElementById('custom-date-range').style.display = isCustom ? 'block' : 'none';
        });
    });
    
    // Generar gráficos
    const salesCtx = document.getElementById('topProductsChart').getContext('2d');
    const topProductsChart = new Chart(salesCtx, {
        type: 'bar',
        data: {
            labels: ['Refresco 600ml', 'Galletas', 'Agua 1L', 'Papas', 'Chocolate'],
            datasets: [{
                label: 'Unidades Vendidas',
                data: [150, 120, 90, 85, 60],
                backgroundColor: [
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(255, 99, 132, 0.7)',
                    'rgba(255, 159, 64, 0.7)',
                    'rgba(153, 102, 255, 0.7)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 159, 64, 1)',
                    'rgba(153, 102, 255, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    const paymentCtx = document.getElementById('paymentMethodsChart').getContext('2d');
    const paymentMethodsChart = new Chart(paymentCtx, {
        type: 'pie',
        data: {
            labels: ['Efectivo', 'Tarjeta', 'Transferencia'],
            datasets: [{
                data: [85, 43, 12],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.7)',
                    'rgba(54, 162, 235, 0.7)',
                    'rgba(255, 159, 64, 0.7)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
    
    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    const comparisonChart = new Chart(comparisonCtx, {
        type: 'line',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                {
                    label: '2023',
                    data: [12000, 19000, 15000, 18000, 21000, 24580],
                    borderColor: 'rgba(54, 162, 235, 1)',
                    backgroundColor: 'rgba(54, 162, 235, 0.1)',
                    fill: true,
                    tension: 0.3
                },
                {
                    label: '2022',
                    data: [10000, 12000, 14000, 15000, 18000, 20000],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Cambiar entre pestañas
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Generar reporte
    document.getElementById('generate-report').addEventListener('click', function() {
        // Aquí iría la lógica para generar el reporte con los filtros seleccionados
        const reportType = document.getElementById('report-type').value;
        const frequency = document.querySelector('.frequency-btn.active').dataset.frequency;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const branch = document.getElementById('branch-filter').value;
        const seller = document.getElementById('seller-filter').value;
        const category = document.getElementById('category-filter').value;
        const paymentMethod = document.getElementById('payment-filter').value;
        
        // Simulación: en una aplicación real harías una petición a tu API
        console.log('Generando reporte con filtros:', {
            reportType, frequency, startDate, endDate, branch, seller, category, paymentMethod
        });
        
        alert('Reporte generado con los filtros seleccionados');
    });
    
    // Exportar a PDF
    document.getElementById('export-pdf').addEventListener('click', function() {
        // Simulación: en una aplicación real usarías una librería como jsPDF
        alert('Exportando a PDF...');
        // Aquí iría la lógica para generar el PDF
    });
    
    // Exportar a CSV
    document.getElementById('export-csv').addEventListener('click', function() {
        // Simulación: en una aplicación real generarías el CSV
        alert('Exportando a CSV...');
        
        // Ejemplo de cómo generar un CSV
        const csvContent = "Folio,Fecha/Hora,Productos,Cantidad,P. Unitario,Subtotal,IVA,Total,Método Pago,Descuento,Categoría\n" +
                          "V-0001,15/06/2023 10:30,\"Refresco 600ml, Galletas\",\"2, 1\",\"18.00, 12.00\",48.00,9.60,57.60,Efectivo,2.40,\"Bebidas, Botanas\"";
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'reporte_ventas.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
    
    // Limpiar filtros
    document.getElementById('reset-filters').addEventListener('click', function() {
        document.getElementById('report-type').value = 'sales';
        document.querySelector('.frequency-btn').click();
        document.getElementById('branch-filter').value = 'all';
        document.getElementById('seller-filter').value = 'all';
        document.getElementById('category-filter').value = 'all';
        document.getElementById('payment-filter').value = 'all';
        document.getElementById('start-date').value = '';
        document.getElementById('end-date').value = '';
    });
});
document.addEventListener('DOMContentLoaded', function() {
    flatpickr(".datepicker", {
        locale: "es",
        dateFormat: "d/m/Y",
        allowInput: true
    });

    document.querySelectorAll('.frequency-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.frequency-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const isCustom = this.dataset.frequency === 'custom';
            document.getElementById('custom-date-range').style.display = isCustom ? 'block' : 'none';
        });
    });

    const salesCtx = document.getElementById('topProductsChart').getContext('2d');
    new Chart(salesCtx, { /* ... */ });

    const paymentCtx = document.getElementById('paymentMethodsChart').getContext('2d');
    new Chart(paymentCtx, { /* ... */ });

    const comparisonCtx = document.getElementById('comparisonChart').getContext('2d');
    new Chart(comparisonCtx, { /* ... */ });

    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });

    document.getElementById('generate-report').addEventListener('click', fetchAndRenderSalesReport);

    document.getElementById('export-pdf').addEventListener('click', function () {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const category = document.getElementById('category-filter').value;
        const paymentMethod = document.getElementById('payment-filter').value;

        const query = new URLSearchParams();
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);
        if (category && category !== 'all') query.append('category', category);
        if (paymentMethod && paymentMethod !== 'all') query.append('paymentMethod', paymentMethod);

        const token = localStorage.getItem('token');

        fetch(`/api/reports/sales/pdf?${query.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error('No autorizado o error al generar PDF');
            return res.blob();
        })
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'reporte_ventas.pdf';
            link.click();
        })
        .catch(err => {
            console.error('Error exportando PDF:', err);
            alert('No se pudo exportar el PDF');
        });
    });

    document.getElementById('export-csv').addEventListener('click', function () {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const category = document.getElementById('category-filter').value;
        const paymentMethod = document.getElementById('payment-filter').value;

        const query = new URLSearchParams();
        if (startDate) query.append('startDate', startDate);
        if (endDate) query.append('endDate', endDate);
        if (category && category !== 'all') query.append('category', category);
        if (paymentMethod && paymentMethod !== 'all') query.append('paymentMethod', paymentMethod);

        const token = localStorage.getItem('token');

        fetch(`/api/reports/sales/export?${query.toString()}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(res => {
            if (!res.ok) throw new Error('No autorizado o error al generar CSV');
            return res.blob();
        })
        .then(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'reporte_ventas.csv';
            link.click();
        })
        .catch(err => {
            console.error('Error exportando CSV:', err);
            alert('No se pudo exportar el reporte');
        });
    });

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

async function fetchAndRenderSalesReport() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const paymentMethod = document.getElementById('payment-filter').value;
    const category = document.getElementById('category-filter').value;

    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    if (paymentMethod && paymentMethod !== 'all') query.append('paymentMethod', paymentMethod);
    if (category && category !== 'all') query.append('category', category);

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/api/reports/sales?${query.toString()}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        renderSalesTable(data);
    } catch (err) {
        console.error('Error al obtener reporte de ventas:', err);
        alert('No se pudo generar el reporte');
    }
}

function renderSalesTable(data) {
    const tbody = document.querySelector('#sales-data .data-table tbody');
    tbody.innerHTML = '';

    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.folio}</td>
            <td>${row.fecha}</td>
            <td>${row.productos}</td>
            <td>${row.cantidades}</td>
            <td>${row.precios}</td>
            <td>${row.subtotal}</td>
            <td>${row.iva}</td>
            <td>${row.total}</td>
            <td>${row.metodo_pago}</td>
            <td>${row.descuento}</td>
            <td>${row.categorias}</td>
        `;
        tbody.appendChild(tr);
    });
}
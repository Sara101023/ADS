// Datos de productos
let inventoryProducts = [
    {
        id: 1,
        code: '7501055301007',
        name: 'Refresco Cola 600ml',
        category: 'Bebidas',
        price: 18.50,
        cost: 12.00,
        stock: 25,
        minStock: 5,
        supplier: 'Coca-Cola',
        unit: 'Pieza',
        status: 'active',
        description: 'Refresco de cola en presentación de 600ml',
        hasIVA: true,
        image: 'img/products/cola.jpg'
    },
    {
        id: 2,
        code: '7500435123456',
        name: 'Galletas Chocolate',
        category: 'Botanas',
        price: 12.00,
        cost: 8.00,
        stock: 15,
        minStock: 10,
        supplier: 'Sabritas',
        unit: 'Paquete',
        status: 'active',
        description: 'Galletas sabor chocolate',
        hasIVA: true,
        image: 'img/products/galletas.jpg'
    },
    {
        id: 3,
        code: '7501035911200',
        name: 'Leche Entera 1L',
        category: 'Lácteos',
        price: 22.50,
        cost: 18.00,
        stock: 8,
        minStock: 5,
        supplier: 'Lala',
        unit: 'Litro',
        status: 'active',
        description: 'Leche entera en presentación de 1 litro',
        hasIVA: false,
        image: 'img/products/leche.jpg'
    },
    {
        id: 4,
        code: '7501055302004',
        name: 'Pan Blanco',
        category: 'Panadería',
        price: 30.00,
        cost: 22.00,
        stock: 3,
        minStock: 5,
        supplier: 'Bimbo',
        unit: 'Pieza',
        status: 'active',
        description: 'Pan blanco fresco',
        hasIVA: false,
        image: 'img/products/pan.jpg'
    },
    {
        id: 5,
        code: '7501055303001',
        name: 'Arroz 1kg',
        category: 'Abarrotes',
        price: 25.00,
        cost: 18.00,
        stock: 12,
        minStock: 10,
        supplier: 'Soriana',
        unit: 'Kilogramo',
        status: 'active',
        description: 'Arroz grano largo 1kg',
        hasIVA: true,
        image: 'img/products/arroz.jpg'
    }
];

// Cargar inventario al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadInventory();
    setupEventListeners();
});

// Cargar productos en la tabla
function loadInventory() {
    const tableBody = document.getElementById('inventoryTableBody');
    tableBody.innerHTML = '';
    
    inventoryProducts.forEach(product => {
        const row = document.createElement('tr');
        row.dataset.id = product.id;
        
        const stockClass = product.stock <= product.minStock ? 'low-stock' : '';
        const statusClass = product.status === 'active' ? 'status-active' : 'status-inactive';
        const statusText = product.status === 'active' ? 'Activo' : 'Inactivo';
        
        row.innerHTML = `
            <td>${product.code}</td>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>$${product.price.toFixed(2)}</td>
            <td class="${stockClass}">${product.stock} ${product.unit}</td>
            <td>${product.supplier}</td>
            <td class="${statusClass}">${statusText}</td>
            <td class="action-btns">
                <button class="action-btn edit-btn">Editar</button>
                <button class="action-btn delete-btn">Eliminar</button>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Abrir modal para agregar producto
    document.getElementById('addProductBtn').addEventListener('click', function() {
        openProductModal();
    });
    
    // Exportar inventario a CSV
    document.getElementById('exportInventoryBtn').addEventListener('click', function() {
        exportInventoryToCSV();
    });
    
    // Cerrar modal
    document.querySelector('.close-btn').addEventListener('click', function() {
        closeProductModal();
    });
    
    // Cancelar en modal
    document.getElementById('cancelProductBtn').addEventListener('click', function() {
        closeProductModal();
    });
    
    // Guardar producto
    document.getElementById('productForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveProduct();
    });
    
    // Delegación de eventos para botones de editar/eliminar
    document.getElementById('inventoryTableBody').addEventListener('click', function(e) {
        const row = e.target.closest('tr');
        if (!row) return;
        
        const productId = parseInt(row.dataset.id);
        
        if (e.target.classList.contains('edit-btn')) {
            editProduct(productId);
        } else if (e.target.classList.contains('delete-btn')) {
            deleteProduct(productId);
        }
    });
}

// Abrir modal para agregar/editar producto
function openProductModal(product = null) {
    const modal = document.getElementById('productModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('productForm');
    
    if (product) {
        modalTitle.textContent = 'Editar Producto';
        document.getElementById('productId').value = product.id;
        document.getElementById('productCode').value = product.code;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productSupplier').value = product.supplier;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productCost').value = product.cost;
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productMinStock').value = product.minStock;
        document.getElementById('productUnit').value = product.unit;
        document.getElementById('productStatus').value = product.status;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productHasIVA').checked = product.hasIVA;
    } else {
        modalTitle.textContent = 'Agregar Producto';
        form.reset();
        document.getElementById('productId').value = '';
        document.getElementById('productStatus').value = 'active';
        document.getElementById('productUnit').value = 'Pieza';
    }
    
    modal.style.display = 'flex';
}

// Cerrar modal
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
}

// Guardar producto
function saveProduct() {
    const form = document.getElementById('productForm');
    const productId = document.getElementById('productId').value;
    
    const productData = {
        code: document.getElementById('productCode').value,
        name: document.getElementById('productName').value,
        category: document.getElementById('productCategory').value,
        supplier: document.getElementById('productSupplier').value,
        price: parseFloat(document.getElementById('productPrice').value),
        cost: parseFloat(document.getElementById('productCost').value),
        stock: parseInt(document.getElementById('productStock').value),
        minStock: parseInt(document.getElementById('productMinStock').value),
        unit: document.getElementById('productUnit').value,
        status: document.getElementById('productStatus').value,
        description: document.getElementById('productDescription').value,
        hasIVA: document.getElementById('productHasIVA').checked,
        image: 'img/products/default.jpg' // Imagen por defecto
    };
    
    // Validar código único
    const codeExists = inventoryProducts.some(p => 
        p.code === productData.code && 
        (!productId || p.id !== parseInt(productId))
    );
    
    if (codeExists) {
        alert('El código de barras/SKU ya está en uso');
        return;
    }
    
    if (productId) {
        // Editar producto existente
        const index = inventoryProducts.findIndex(p => p.id === parseInt(productId));
        if (index !== -1) {
            inventoryProducts[index] = { ...inventoryProducts[index], ...productData };
        }
    } else {
        // Agregar nuevo producto
        const newId = inventoryProducts.length > 0 
            ? Math.max(...inventoryProducts.map(p => p.id)) + 1 
            : 1;
        
        inventoryProducts.push({
            id: newId,
            ...productData
        });
    }
    
    closeProductModal();
    loadInventory();
}

// Editar producto
function editProduct(productId) {
    const product = inventoryProducts.find(p => p.id === productId);
    if (product) {
        openProductModal(product);
    }
}

// Eliminar producto
function deleteProduct(productId) {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
        inventoryProducts = inventoryProducts.filter(p => p.id !== productId);
        loadInventory();
    }
}

// Exportar inventario a CSV
function exportInventoryToCSV() {
    let csv = 'Código,Nombre,Categoría,Precio,Stock,Proveedor,Estado\n';
    
    inventoryProducts.forEach(product => {
        csv += `"${product.code}","${product.name}","${product.category}",${product.price},${product.stock},"${product.supplier}","${product.status === 'active' ? 'Activo' : 'Inactivo'}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `inventario_${new Date().toISOString().slice(0,10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
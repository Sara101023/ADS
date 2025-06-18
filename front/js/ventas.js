// --- Variables globales ---
let products = [];
let cart = [];
let currentCategory = 'Todos';
const urlParams = new URLSearchParams(window.location.search);
const isGuest = urlParams.get('guest') === 'true';
const user = JSON.parse(localStorage.getItem('currentUser'));

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupGuestMode();
    loadProducts();
    loadCart();
    setupEventListeners();
    updateDateTime();
    setInterval(updateDateTime, 60000);
});

window.onload = function() {
    loadProducts();
    loadCart();
};

// --- Autenticación ---
/*function checkAuth() {
    if (!user || (user.rol !== 'administrador' && user.rol !== 'cajero')) {
        window.location.href = 'login.html';
    }
}*/
function checkAuth() {
    const urlParams = new URLSearchParams(window.location.search);
    const isGuest = urlParams.get('guest') === 'true';

    if (!isGuest && (!user || (user.rol !== 'administrador' && user.rol !== 'cajero'))) {
        window.location.href = 'login.html';
    }
}


// --- Configuración de modo invitado ---
function setupGuestMode() {
    if(isGuest) {
        document.body.classList.add('guest-mode');
        if(document.getElementById('guestBanner')) {
            document.getElementById('guestBanner').style.display = 'block';
        }
        document.title = "Compra Rápida - Mi Tienda";
        
        const elementsToHide = document.querySelectorAll('.sidebar, .user-profile, .menu li:not(.active)');
        elementsToHide.forEach(el => el.style.display = 'none');
        
        if(document.querySelector('.main-content')) {
            document.querySelector('.main-content').style.marginLeft = '0';
        }
    }
}

// --- Funciones de fecha y hora ---
function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateEl = document.getElementById('current-date');
    const timeEl = document.getElementById('current-time');

    if (dateEl) dateEl.textContent = now.toLocaleDateString('es-MX', options);
    if (timeEl) timeEl.textContent = now.toLocaleTimeString('es-MX');
}

// --- Funciones de productos ---
/*async function loadProducts() {
    try {
        const response = await fetch('http://localhost:4000/api/inventory/products');

        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Respuesta cruda:', text);

        products = JSON.parse(text);
        renderProducts();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar productos');
    }
}
*/
async function loadProducts() {
    try {
        const token = localStorage.getItem('token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const response = await fetch('http://localhost:4000/api/inventory/products', {
            method: 'GET',
            headers
        });

        const text = await response.text();
        console.log('Respuesta cruda:', text);

        products = JSON.parse(text);
        renderProducts();
    } catch (error) {
        console.error('Error al cargar productos:', error);
        alert('Error al cargar productos');
    }
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    const filteredProducts = currentCategory === 'Todos'
        ? products
        : products.filter(p => (p.categoria || '').toLowerCase() === currentCategory.toLowerCase());

    filteredProducts.forEach(product => {
        const card = document.createElement('div');
        card.classList.add('product-card');
        card.setAttribute('data-category', (product.categoria || 'otros').toLowerCase());

        card.innerHTML = `
            <h4>${product.nombre}</h4>
            <p>Precio: $${product.precio}</p>
            <p>Stock: ${product.stock}</p>
            <p>Categoría: ${product.categoria}</p>
            <button onclick="addToCart(${product.id_producto})">Agregar</button>
        `;
        grid.appendChild(card);
    });
}

// --- Funciones del carrito ---
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const saved = localStorage.getItem('cart');
    cart = saved ? JSON.parse(saved) : [];
    renderCart();
}

function addToCart(productId) {
    const product = products.find(p => p.id_producto === productId);
    if (!product) return;

    const item = cart.find(i => i.id_producto === productId);
    if (item) {
        item.cantidad += 1;
    } else {
        cart.push({ ...product, cantidad: 1 });
    }

    saveCart();
    renderCart();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id_producto !== productId);
    saveCart();
    renderCart();
}



function renderCart() {
    const cartTable = document.getElementById('cartTable');
    cartTable.innerHTML = '';
    cart.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.nombre}</td>
            <td>${item.cantidad}</td>
            <td>${item.precio}</td>
            <td><button onclick="removeFromCart(${item.id_producto})">Quitar</button></td>
        `;
        cartTable.appendChild(row);
    });
    updateTotals();
}

function updateTotals() {
    let subtotal = 0;
    let itemsSummary = "";
    
    cart.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;
        itemsSummary += `${item.nombre} x ${item.cantidad} = $${itemTotal.toFixed(2)}\n`;
    });
    
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    if(document.getElementById('subtotal')) {
        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    }
    if(document.getElementById('iva')) {
        document.getElementById('iva').textContent = `$${iva.toFixed(2)}`;
    }
    if(document.getElementById('total')) {
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    }
}

function clearCart() {
    cart = [];
    saveCart();
    renderCart();
}

// --- Funciones de venta ---
async function procesarVenta() {
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

    // Obtener el token del almacenamiento local
    const token = localStorage.getItem('token');
    if (!token) {
        alert('No se encontró el token. Por favor, inicia sesión nuevamente.');
        return;
    }

    try {
        const response = await fetch('http://localhost:4000/api/ventas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // ✅ enviar token JWT
            },
            body: JSON.stringify({ productos: cart })
        });

        if (response.ok) {
            alert('✅ Venta procesada correctamente');
            clearCart();
            loadProducts(); // Actualiza inventario
        } else {
            const error = await response.json();
            alert(`❌ Error al procesar la venta: ${error?.error || 'desconocido'}`);
        }
    } catch (error) {
        console.error('Error al conectar con el servidor:', error);
        alert('Error de conexión al procesar la venta');
    }
}

function guestCheckout() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'efectivo';

    if (paymentMethod === 'card') {
        abrirModal();
        return;
    }

    const nombre = "Invitado";
    const correo = "noreply@ventas.com";
    procesarVenta(nombre, correo, paymentMethod);
}

// --- Funciones de modales ---
function abrirModal() {
    document.getElementById('emailModal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('emailModal').style.display = 'none';
}

// --- Event Listeners ---
function setupEventListeners() {
    // Filtrar por categoría
const categoryBtns = document.querySelectorAll('.category-btn');
categoryBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        categoryBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        currentCategory = this.textContent;
        renderProducts();
    });
});
    
    // Finalizar venta
    const checkoutBtn = document.getElementById('checkoutBtn');
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                if(isGuest) {
                    guestCheckout();
                } else {
                    procesarVenta();
                }
            } else {
                alert('El carrito está vacío');
            }
        });
    }
    
    // Búsqueda de productos
    const searchInput = document.querySelector('.search-bar input');
    if(searchInput) {
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            const productCards = document.querySelectorAll('.product-card');
            
            productCards.forEach(card => {
                const productName = card.querySelector('h4').textContent.toLowerCase();
                card.style.display = productName.includes(searchTerm) ? 'block' : 'none';
            });
        });
    }
    
    // Cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            localStorage.removeItem('userLoggedIn');
            window.location.href = 'login.html';
        });
    }

    // Modal de correo
    const emailForm = document.getElementById('emailForm');
    const enviarBtn = document.getElementById("enviarBtn");
    const cancelarBtn = document.getElementById("cancelarBtn");

    if (cancelarBtn) {
        cancelarBtn.addEventListener("click", cerrarModal);
    }

    if (enviarBtn) {
        enviarBtn.addEventListener("click", function (e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim();

            if (!nombre || !correo) {
                alert("Por favor completa todos los campos.");
                return;
            }

            const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
            if (!emailRegex.test(correo)) {
                alert("Por favor ingresa un correo electrónico válido.");
                return;
            }

            const metodoPago = document.querySelector('input[name="payment"]:checked')?.value || 'Efectivo';
            procesarVenta(nombre, correo, metodoPago);
        });
    }
}
// Datos de productos de prueba
const products = [
    {
        id: 1,
        name: 'Refresco Cola 600ml',
        price: 18.50,
        category: 'Bebidas',
        stock: 25,
        barcode: '7501055301007',
        hasPromotion: true,
        promotionType: '3x2'
    },
    {
        id: 2,
        name: 'Galletas Chocolate',
        price: 12.00,
        category: 'Botanas',
        stock: 15,
        barcode: '7500435123456',
        hasPromotion: false
    },
    {
        id: 3,
        name: 'Leche Entera 1L',
        price: 22.50,
        category: 'Lácteos',
        stock: 8,
        barcode: '7501035911200',
        hasPromotion: false
    },
    {
        id: 4,
        name: 'Pan Blanco',
        price: 30.00,
        category: 'Panadería',
        stock: 10,
        barcode: '7501055302004',
        hasPromotion: true,
        promotionType: '2x1'
    },
    {
        id: 5,
        name: 'Arroz 1kg',
        price: 25.00,
        category: 'Abarrotes',
        stock: 12,
        barcode: '7501055303001',
        hasPromotion: false
    },
    {
        id: 6,
        name: 'Aceite Vegetal 1L',
        price: 35.00,
        category: 'Abarrotes',
        stock: 7,
        barcode: '7501055304008',
        hasPromotion: false
    },
    {
        id: 7,
        name: 'Jabón en Polvo',
        price: 45.00,
        category: 'Abarrotes',
        stock: 5,
        barcode: '7501055305005',
        hasPromotion: false
    },
    {
        id: 8,
        name: 'Agua Mineral 1L',
        price: 15.00,
        category: 'Bebidas',
        stock: 20,

        barcode: '7501055306002',
        hasPromotion: true,
        promotionType: '3x1'
    }
];

let cart = [];
let currentCategory = 'Todos';
const urlParams = new URLSearchParams(window.location.search);
const isGuest = urlParams.get('guest') === 'true';



// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    setupGuestMode();
    loadProducts();
    setupEventListeners();
    loadCart();
    updateDateTime();
    setInterval(updateDateTime, 60000); // Actualizar cada minuto
});

// Verificar autenticación
function checkAuth() {
    if(!isGuest && !localStorage.getItem('userLoggedIn')) {
        window.location.href = 'login.html';
    }
}

// Configurar modo invitado
function setupGuestMode() {
    if(isGuest) {
        document.body.classList.add('guest-mode');
        if(document.getElementById('guestBanner')) {
            document.getElementById('guestBanner').style.display = 'block';
        }
        document.title = "Compra Rápida - Mi Tienda";
        
        // Ocultar elementos administrativos
        const elementsToHide = document.querySelectorAll('.sidebar, .user-profile, .menu li:not(.active)');
        elementsToHide.forEach(el => el.style.display = 'none');
        
        // Ajustar layout
        if(document.querySelector('.main-content')) {
            document.querySelector('.main-content').style.marginLeft = '0';
        }
    }
}

// Cargar carrito guardado
function loadCart() {
    const savedCart = isGuest ? localStorage.getItem('guestCart') : localStorage.getItem('userCart');
    if(savedCart) {
        cart = JSON.parse(savedCart);
        updateCartDisplay();
    }
}

// Actualizar fecha y hora
function updateDateTime() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateEl = document.getElementById('current-date');
  const timeEl = document.getElementById('current-time');

  if (dateEl) dateEl.textContent = now.toLocaleDateString('es-MX', options);
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('es-MX');
}
setInterval(updateDateTime, 1000);
updateDateTime();

// Cargar productos en la cuadrícula
function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if(!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    const filteredProducts = currentCategory === 'Todos' 
        ? products 
        : products.filter(p => p.category === currentCategory);
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        productCard.title = product.name;
        
        let promotionBadge = '';
        if (product.hasPromotion) {
            promotionBadge = `<span class="promotion-badge">${product.promotionType}</span>`;
        }
        
        productCard.innerHTML = `
            ${promotionBadge}
            <h4>${product.name}</h4>
            <div class="price">$${product.price.toFixed(2)}</div>
            <div class="stock">Disponibles: ${product.stock}</div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// Configurar event listeners
function setupEventListeners() {
    // Filtrar por categoría
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.textContent;
            loadProducts();
        });
    });
    
    // Agregar producto al carrito
    const productsGrid = document.querySelector('.products-grid');
    if(productsGrid) {
        productsGrid.addEventListener('click', function(e) {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const productId = parseInt(productCard.dataset.id);
                const product = products.find(p => p.id === productId);
                if(product) {
                    addToCart(product);
                }
            }
        });
    }
    
    // Finalizar venta
    const checkoutBtn = document.getElementById('checkoutBtn');
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.length > 0) {
                if(isGuest) {
                    guestCheckout();
                } else {
                    completeSale();
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
    
}

// Agregar producto al carrito
function addToCart(product) {
    const existingItem = cart.find(item => item.product.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('No hay suficiente stock disponible');
            return;
        }
    } else {
        if (product.stock > 0) {
            cart.push({
                product: product,
                quantity: 1
            });
        } else {
            alert('Producto agotado');
            return;
        }
    }
    
    updateCartDisplay();
    saveCart();
}

// Actualizar visualización del carrito
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    if(!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart-message">El carrito está vacío</p>';
    } else {
        cartItemsContainer.innerHTML = '';
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.product.id;
            
            let finalPrice = item.product.price * item.quantity;
            let promotionText = '';
            
            if (item.product.hasPromotion) {
                if (item.product.promotionType === '3x2' && item.quantity >= 3) {
                    const discountedItems = Math.floor(item.quantity / 3);
                    finalPrice = (item.quantity - discountedItems) * item.product.price;
                    promotionText = ` (Promo 3x2 aplicada)`;
                } else if (item.product.promotionType === '2x1' && item.quantity >= 2) {
                    const discountedItems = Math.floor(item.quantity / 2);
                    finalPrice = discountedItems * item.product.price;
                    promotionText = ` (Promo 2x1 aplicada)`;
                } else if (item.product.promotionType === '3x1' && item.quantity >= 3) {
                    const discountedItems = Math.floor(item.quantity / 3);
                    finalPrice = discountedItems * item.product.price;
                    promotionText = ` (Promo 3x1 aplicada)`;
                }
            }
            
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.product.name}</div>
                    <div class="cart-item-price">$${item.product.price.toFixed(2)} c/u${promotionText}</div>
                </div>
                <div class="cart-item-quantity">
                    <button class="decrease-btn">-</button>
                    <span>${item.quantity}</span>
                    <button class="increase-btn">+</button>
                </div>
                <div class="cart-item-total">$${finalPrice.toFixed(2)}</div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
            
            // Event listeners para botones de cantidad
            cartItem.querySelector('.decrease-btn').addEventListener('click', () => updateCartItemQuantity(item.product.id, -1));
            cartItem.querySelector('.increase-btn').addEventListener('click', () => updateCartItemQuantity(item.product.id, 1));
        });
    }
    
    updateTotals();
}

// Actualizar cantidad de un ítem en el carrito
function updateCartItemQuantity(productId, change) {
    const itemIndex = cart.findIndex(item => item.product.id === productId);
    
    if (itemIndex !== -1) {
        const newQuantity = cart[itemIndex].quantity + change;
        
        if (newQuantity <= 0) {
            cart.splice(itemIndex, 1);
        } else if (newQuantity > cart[itemIndex].product.stock) {
            alert('No hay suficiente stock disponible');
            return;
        } else {
            cart[itemIndex].quantity = newQuantity;
        }
        
        updateCartDisplay();
        saveCart();
    }
}

// Guardar carrito
function saveCart() {
    if(isGuest) {
        localStorage.setItem('guestCart', JSON.stringify(cart));
    } else {
        localStorage.setItem('userCart', JSON.stringify(cart));
    }
}

// Actualizar totales
function updateTotals() {
    let subtotal = 0;
    let itemsSummary = "";
    
    cart.forEach(item => {
        let itemTotal = item.product.price * item.quantity;
        
        if (item.product.hasPromotion) {
            if (item.product.promotionType === '3x2' && item.quantity >= 3) {
                const discountedItems = Math.floor(item.quantity / 3);
                itemTotal = (item.quantity - discountedItems) * item.product.price;
            } else if (item.product.promotionType === '2x1' && item.quantity >= 2) {
                const discountedItems = Math.floor(item.quantity / 2);
                itemTotal = discountedItems * item.product.price;
            } else if (item.product.promotionType === '3x1' && item.quantity >= 3) {
                const discountedItems = Math.floor(item.quantity / 3);
                itemTotal = discountedItems * item.product.price;
            }
        }
        
        subtotal += itemTotal;
        itemsSummary += `${item.product.name} x ${item.quantity} = $${itemTotal.toFixed(2)}\n`;
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



// Calcular total por ítem
function calculateItemTotal(item) {
    let itemTotal = item.product.price * item.quantity;
    
    if (item.product.hasPromotion) {
        if (item.product.promotionType === '3x2' && item.quantity >= 3) {
            const discountedItems = Math.floor(item.quantity / 3);
            itemTotal = (item.quantity - discountedItems) * item.product.price;
        } else if (item.product.promotionType === '2x1' && item.quantity >= 2) {
            const discountedItems = Math.floor(item.quantity / 2);
            itemTotal = discountedItems * item.product.price;
        } else if (item.product.promotionType === '3x1' && item.quantity >= 3) {
            const discountedItems = Math.floor(item.quantity / 3);
            itemTotal = discountedItems * item.product.price;
        }
    }
    
    return itemTotal;
}

// Limpiar carrito
function clearCart() {
    cart = [];
    if(isGuest) {
        localStorage.removeItem('guestCart');
    } else {
        localStorage.removeItem('userCart');
    }
    updateCartDisplay();
}

// Completar venta (para usuarios logueados)
function completeSale() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'efectivo';
    
    // Mostrar modal de facturación
    const invoiceModal = document.getElementById('invoiceModal');
    if(invoiceModal) {
        invoiceModal.style.display = 'block';
        
        // Cerrar modal
        const closeBtn = invoiceModal.querySelector('.close-btn');
        if(closeBtn) {
            closeBtn.addEventListener('click', function() {
                invoiceModal.style.display = 'none';
            });
        }
        
        // Enviar formulario de facturación
        const invoiceForm = invoiceModal.querySelector('form');
        if(invoiceForm) {
            invoiceForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validar formulario
                const customerName = invoiceForm.querySelector('#customerName').value;
                const customerEmail = invoiceForm.querySelector('#customerEmail').value;
                
                if(!customerName || !customerEmail) {
                    alert('Por favor completa todos los campos requeridos');
                    return;
                }
                
                // Calcular totales
                let subtotal = 0;
                cart.forEach(item => {
                    subtotal += calculateItemTotal(item);
                });
                const iva = subtotal * 0.16;
                const total = subtotal + iva;
                
                // Simular envío al servidor
                const invoiceData = {
                    customer: {
                        name: customerName,
                        rfc: invoiceForm.querySelector('#customerRFC').value,
                        email: customerEmail,
                        address: invoiceForm.querySelector('#customerAddress').value,
                        regimen: invoiceForm.querySelector('#customerRegimen').value
                    },
                    items: cart,
                    subtotal: subtotal,
                    iva: iva,
                    total: total,
                    paymentMethod: paymentMethod,
                    date: new Date().toISOString()
                };
                
                console.log('Datos de facturación:', invoiceData); // Solo para depuración
                
                alert(`Factura generada con éxito para ${customerName}\nSe ha enviado a ${customerEmail}`);
                
                // Limpiar carrito
                clearCart();
                
                // Cerrar modal
                invoiceModal.style.display = 'none';
            });
        }
    }
}
// Funciones para mostrar/ocultar el modal de correo
function abrirModal() {
    document.getElementById('emailModal').style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('emailModal').style.display = 'none';
}




document.addEventListener('DOMContentLoaded', function () {
    const emailForm = document.getElementById('emailForm');
    const enviarBtn = document.getElementById("enviarBtn");
    const cancelarBtn = document.getElementById("cancelarBtn");

    // Botón "Cancelar" cierra el modal
    if (cancelarBtn) {
        cancelarBtn.addEventListener("click", cerrarModal);
    }

    // Botón "Enviar" procesa la compra
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

            // Detectar método de pago seleccionado
            const metodoPago = document.querySelector('input[name="payment"]:checked')?.value || 'Efectivo';

            // Procesar venta con los datos
            procesarVenta(nombre, correo, metodoPago);
        });
    }
});



function abrirModal() {
  document.getElementById("emailModal").style.display = "flex";
}

function cerrarModal() {
  document.getElementById("emailModal").style.display = "none";
}

function enviarCorreo() {
  const nombre = document.getElementById("nombre").value.trim();
  const correo = document.getElementById("correo").value.trim();
  const metodoPago = document.querySelector('input[name="payment"]:checked')?.value || 'efectivo';

  const emailRegex = /^[\w.-]+@[\w.-]+\.\w{2,}$/;
  if (!nombre || !emailRegex.test(correo)) {
    alert("Datos inválidos.");
    return;
  }

  procesarVenta(nombre, correo, metodoPago);
}

function guestCheckout() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'efectivo';

    if (paymentMethod === 'card') {
        // Mostrar modal solo al hacer clic en "Finalizar Venta" con tarjeta
        abrirModal();
        return;
    }

    // Si el método es efectivo, se procesa la venta directo
    const nombre = "Invitado";
    const correo = "noreply@ventas.com";
    procesarVenta(nombre, correo, paymentMethod);
}
function abrirModal() {
    console.log("Se activó abrirModal()");
    document.getElementById("emailModal").style.display = "flex";
}


function procesarVenta(nombre, correo, metodoPago) {
  let subtotal = 0;
  let resumen = "";

  cart.forEach(item => {
    const itemTotal = calculateItemTotal(item);
    subtotal += itemTotal;
    resumen += `${item.product.name} x ${item.quantity} = $${itemTotal.toFixed(2)}\n`;
  });

  const total = (subtotal * 1.16).toFixed(2);

  fetch("/enviar-correo", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nombre, correo, resumen, total })
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === 'ok') {
      alert(`¡Gracias por tu compra, ${nombre}!\nSe envió el recibo a ${correo}`);
      cerrarModal();
      clearCart();
    } else {
      alert("Error al enviar el correo.");
    }
  })
  .catch(error => {
    console.error("Error:", error);
    alert("No se pudo enviar el correo.");
  });
}

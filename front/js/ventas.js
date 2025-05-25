// Datos de productos de prueba
const products = [
    {
        id: 1,
        name: 'Refresco Cola 600ml',
        price: 18.50,
        category: 'Bebidas',
        stock: 25,
        image: 'img/products/cola.jpg',
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
        image: 'img/products/galletas.jpg',
        barcode: '7500435123456',
        hasPromotion: false
    },
    {
        id: 3,
        name: 'Leche Entera 1L',
        price: 22.50,
        category: 'Lácteos',
        stock: 8,
        image: 'img/products/leche.jpg',
        barcode: '7501035911200',
        hasPromotion: false
    },
    {
        id: 4,
        name: 'Pan Blanco',
        price: 30.00,
        category: 'Panadería',
        stock: 10,
        image: 'img/products/pan.jpg',
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
        image: 'img/products/arroz.jpg',
        barcode: '7501055303001',
        hasPromotion: false
    },
    {
        id: 6,
        name: 'Aceite Vegetal 1L',
        price: 35.00,
        category: 'Abarrotes',
        stock: 7,
        image: 'img/products/aceite.jpg',
        barcode: '7501055304008',
        hasPromotion: false
    },
    {
        id: 7,
        name: 'Jabón en Polvo',
        price: 45.00,
        category: 'Abarrotes',
        stock: 5,
        image: 'img/products/jabon.jpg',
        barcode: '7501055305005',
        hasPromotion: false
    },
    {
        id: 8,
        name: 'Agua Mineral 1L',
        price: 15.00,
        category: 'Bebidas',
        stock: 20,
        image: 'img/products/agua.jpg',
        barcode: '7501055306002',
        hasPromotion: true,
        promotionType: '3x1'
    }
];

// Variables globales
let cart = [];
let currentCategory = 'Todos';

// Cargar productos al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
});

// Cargar productos en la cuadrícula
function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    productsGrid.innerHTML = '';
    
    const filteredProducts = currentCategory === 'Todos' 
        ? products 
        : products.filter(p => p.category === currentCategory);
    
    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.dataset.id = product.id;
        
        let promotionBadge = '';
        if (product.hasPromotion) {
            promotionBadge = `<span class="promotion-badge">${product.promotionType}</span>`;
        }
        
        productCard.innerHTML = `
            ${promotionBadge}
            <img src="${product.image}" alt="${product.name}">
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
    document.querySelector('.products-grid').addEventListener('click', function(e) {
        const productCard = e.target.closest('.product-card');
        if (productCard) {
            const productId = parseInt(productCard.dataset.id);
            const product = products.find(p => p.id === productId);
            addToCart(product);
        }
    });
    
    // Finalizar venta
    document.getElementById('checkoutBtn').addEventListener('click', function() {
        if (cart.length > 0) {
            completeSale();
        }
    });
    
    // Búsqueda de productos
    document.querySelector('.search-bar input').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            const productName = card.querySelector('h4').textContent.toLowerCase();
            if (productName.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
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
}

// Actualizar visualización del carrito
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = cartItemsContainer.querySelector('.empty-cart-message');
    
    if (cart.length === 0) {
        if (!emptyCartMessage) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">El carrito está vacío</p>';
        }
    } else {
        if (emptyCartMessage) {
            cartItemsContainer.innerHTML = '';
        } else {
            cartItemsContainer.innerHTML = '';
        }
        
        cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.product.id;
            
            // Aplicar promociones
            let finalPrice = item.product.price;
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
            const decreaseBtn = cartItem.querySelector('.decrease-btn');
            const increaseBtn = cartItem.querySelector('.increase-btn');
            
            decreaseBtn.addEventListener('click', function() {
                updateCartItemQuantity(item.product.id, -1);
            });
            
            increaseBtn.addEventListener('click', function() {
                updateCartItemQuantity(item.product.id, 1);
            });
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
    }
}

// Actualizar totales
function updateTotals() {
    let subtotal = 0;
    
    cart.forEach(item => {
        let itemTotal = item.product.price * item.quantity;
        
        // Aplicar promociones
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
    });
    
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('iva').textContent = `$${iva.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
}

// Completar venta
function completeSale() {
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Mostrar modal de facturación
    const invoiceModal = document.getElementById('invoiceModal');
    invoiceModal.style.display = 'block';
    
    // Cerrar modal
    document.querySelector('.close-btn').addEventListener('click', function() {
        invoiceModal.style.display = 'none';
    });
    
    // Enviar formulario de facturación
    document.getElementById('invoiceForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Aquí iría la lógica para generar la factura y procesar la venta
        // En un sistema real, esto enviaría los datos al backend
        
        // Simular procesamiento
        alert('Venta completada y factura generada con éxito');
        
        // Limpiar carrito
        cart = [];
        updateCartDisplay();
        
        // Cerrar modal
        invoiceModal.style.display = 'none';
    });
}
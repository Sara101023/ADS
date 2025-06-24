document.addEventListener('DOMContentLoaded', function () {
  const modal = document.getElementById('promo-modal');
  const openModalBtn = document.getElementById('add-promo-btn');
  const closeModalBtn = document.querySelector('.close-modal');
  const cancelBtn = document.querySelector('.btn-cancel');

  // Mostrar modal
  openModalBtn.addEventListener('click', () => {
    document.getElementById('modal-title').textContent = 'Nueva Promoción';
    modal.style.display = 'flex';
  });

  // Cerrar modal al hacer click en la X o Cancelar
  [closeModalBtn, cancelBtn].forEach(btn => {
    btn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  });

  // Cerrar modal al hacer click fuera del contenido
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });

  // Mostrar campos condicionales según tipo de promoción
  const promoType = document.getElementById('promo-type');
  const discountAmountGroup = document.getElementById('discount-amount-group');
  const buyXGetYGroup = document.getElementById('buyxgety-group');

  promoType.addEventListener('change', function () {
    if (this.value === 'buyxgety') {
      discountAmountGroup.style.display = 'none';
      buyXGetYGroup.style.display = 'block';
    } else if (this.value === 'free_shipping') {
      discountAmountGroup.style.display = 'none';
      buyXGetYGroup.style.display = 'none';
    } else {
      discountAmountGroup.style.display = 'block';
      buyXGetYGroup.style.display = 'none';
    }
  });

  // Mostrar categorías si se selecciona esa opción
  const promoProducts = document.getElementById('promo-products');
  const categoryGroup = document.getElementById('category-group');

  promoProducts.addEventListener('change', function () {
    categoryGroup.style.display = this.value === 'category' ? 'block' : 'none';
  });

  // Enviar formulario
  const promoForm = document.getElementById('promo-form');

  promoForm.addEventListener('submit', async function(e) {
  e.preventDefault();

  const data = {
    nombre: document.getElementById('promo-name').value,
    tipo: document.getElementById('promo-type').value,
    descuento: document.getElementById('discount-amount').value || null,
    buyX: document.getElementById('buy-quantity')?.value || null,
    getY: document.getElementById('get-quantity')?.value || null,
    aplicacion: document.getElementById('promo-products').value,
    categoria: document.getElementById('promo-category')?.value || null,
    fecha_inicio: document.getElementById('promo-start').value,
    fecha_fin: document.getElementById('promo-end').value,
    descripcion: document.getElementById('promo-description').value
  };

  try {
    const res = await fetch('/api/promociones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error('Error al guardar promoción');

    alert('Promoción guardada correctamente');
    modal.style.display = 'none';
    promoForm.reset();
    cargarPromociones(); // recarga la tabla
  } catch (error) {
    alert('Hubo un problema: ' + error.message);
  }
});


  // Botones de editar
  const editButtons = document.querySelectorAll('.btn-edit');
  editButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      const row = this.closest('tr');
      document.getElementById('modal-title').textContent = 'Editar Promoción';
      modal.style.display = 'flex';
    });
  });

  // Botones de eliminar
  const deleteButtons = document.querySelectorAll('.btn-delete');
  deleteButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      if (confirm('¿Estás seguro de eliminar esta promoción?')) {
        this.closest('tr').remove();
      }
    });
  });
});

const promoProducts = document.getElementById('promo-products');
const categoryGroup = document.getElementById('category-group');
const productsGroup = document.getElementById('products-group');

promoProducts.addEventListener('change', function () {
  categoryGroup.style.display = this.value === 'category' ? 'block' : 'none';
  productsGroup.style.display = this.value === 'products' ? 'block' : 'none';
});

// Autocompletado
const productSearch = document.getElementById('product-search');
const productSuggestions = document.getElementById('product-suggestions');
const selectedProducts = document.getElementById('selected-products');
let selectedProductIds = [];

productSearch.addEventListener('input', function () {
  const query = this.value;
  if (query.length < 2) {
    productSuggestions.innerHTML = '';
    return;
  }

  fetch(`/api/productos?search=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(productos => {
      productSuggestions.innerHTML = '';
      productos.forEach(p => {
        const div = document.createElement('div');
        div.textContent = p.nombre;
        div.dataset.id = p._id;
        productSuggestions.appendChild(div);
      });
    });
});

productSuggestions.addEventListener('click', function (e) {
  if (e.target.tagName === 'DIV') {
    const nombre = e.target.textContent;
    const id = e.target.dataset.id;

    if (!selectedProductIds.includes(id)) {
      selectedProductIds.push(id);

      const tag = document.createElement('span');
      tag.className = 'product-tag';
      tag.textContent = nombre;
      selectedProducts.appendChild(tag);
    }

    productSearch.value = '';
    productSuggestions.innerHTML = '';
  }
});
async function cargarPromociones() {
  const res = await fetch('/api/promociones');
  const promociones = await res.json();

  const tbody = document.querySelector('table.data-table tbody');
  tbody.innerHTML = ''; // Limpiar tabla

  promociones.forEach(promo => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${promo.nombre}</td>
      <td>${promo.tipo}</td>
      <td>${promo.descuento || `${promo.buy_x}x${promo.get_y}`}</td>
      <td>${promo.aplicacion === 'category' ? promo.categoria : promo.aplicacion}</td>
      <td>${promo.fecha_fin}</td>
      <td><span class="status-badge active">Activa</span></td>
      <td>
        <button class="btn-edit"><i class="fas fa-edit"></i></button>
        <button class="btn-delete"><i class="fas fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPromociones);

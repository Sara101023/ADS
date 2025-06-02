document.addEventListener('DOMContentLoaded', function() {
    // Mostrar/ocultar modal
    const addPromoBtn = document.getElementById('add-promo-btn');
    const modal = document.getElementById('promo-modal');
    const closeModal = document.querySelector('.close-modal');
    const cancelBtn = document.querySelector('.btn-cancel');
    
    addPromoBtn.addEventListener('click', () => {
        document.getElementById('modal-title').textContent = 'Nueva Promoción';
        modal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Mostrar campos condicionales según tipo de promoción
    const promoType = document.getElementById('promo-type');
    const discountAmountGroup = document.getElementById('discount-amount-group');
    const buyXGetYGroup = document.getElementById('buyxgety-group');
    
    promoType.addEventListener('change', function() {
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
    
    promoProducts.addEventListener('change', function() {
        categoryGroup.style.display = this.value === 'category' ? 'block' : 'none';
    });
    
    // Manejar envío del formulario
    const promoForm = document.getElementById('promo-form');
    
    promoForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Aquí iría la lógica para guardar la promoción
        alert('Promoción guardada correctamente');
        modal.style.display = 'none';
        promoForm.reset();
        
      
    });
    
    // Manejar botones de editar y eliminar (deberías implementar lógica real)
    const editButtons = document.querySelectorAll('.btn-edit');
    const deleteButtons = document.querySelectorAll('.btn-delete');
    
    editButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const row = this.closest('tr');
            // Aquí obtendrías los datos de la fila y los cargarías en el modal
            document.getElementById('modal-title').textContent = 'Editar Promoción';
            modal.style.display = 'block';
        });
    });
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('¿Estás seguro de eliminar esta promoción?')) {
                // Aquí iría la lógica para eliminar la promoción
                this.closest('tr').remove();
            }
        });
    });
});
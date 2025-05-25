// Datos de usuarios de prueba (en un sistema real esto vendría de una base de datos)
const users = [
    {
        id: 1,
        username: 'admin',
        password: 'admin123',
        name: 'Administrador Principal',
        role: 'admin',
        permissions: ['all']
    },
    {
        id: 2,
        username: 'cajero1',
        password: 'cajero123',
        employeeNumber: 'EMP001',
        name: 'Juan Pérez',
        role: 'cashier',
        permissions: ['sales', 'returns']
    },
    {
        id: 3,
        username: 'facturador1',
        password: 'factura123',
        name: 'María García',
        role: 'biller',
        permissions: ['billing', 'reports']
    }
];

// Selección de rol
document.addEventListener('DOMContentLoaded', function() {
    const roleBtns = document.querySelectorAll('.role-btn');
    const employeeNumberGroup = document.getElementById('employeeNumberGroup');
    
    roleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            roleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (this.dataset.role === 'cashier') {
                employeeNumberGroup.style.display = 'block';
                document.getElementById('employeeNumber').required = true;
            } else {
                employeeNumberGroup.style.display = 'none';
                document.getElementById('employeeNumber').required = false;
            }
        });
    });
    
    // Manejar el envío del formulario
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const selectedRole = document.querySelector('.role-btn.active').dataset.role;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const employeeNumber = selectedRole === 'cashier' ? document.getElementById('employeeNumber').value : null;
        
        let user = null;
        
        if (selectedRole === 'cashier') {
            user = users.find(u => 
                u.role === 'cashier' && 
                u.username === username && 
                u.password === password && 
                u.employeeNumber === employeeNumber
            );
        } else {
            user = users.find(u => 
                u.role === selectedRole && 
                u.username === username && 
                u.password === password
            );
        }
        
        if (user) {
            // Almacenar usuario en localStorage
            localStorage.setItem('currentUser', JSON.stringify(user));
            
            // Redirigir al dashboard
            window.location.href = 'index.html';
        } else {
            document.getElementById('errorMessage').style.display = 'block';
        }
    });
    
    // Si ya está autenticado, redirigir al dashboard
    if (localStorage.getItem('currentUser')) {
        window.location.href = 'index.html';
    }
});